const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { body, validationResult } = require("express-validator");
const Insight = require("../models/Insight");
const { authenticateToken, requireEditor } = require("../middleware/auth");
const { s3Client, R2_BUCKET } = require("../config/r2");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const router = express.Router();

// Configure multer for PDF and image upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "pdf") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("PDF field must contain a PDF file"), false);
      }
    } else if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Image field must contain an image file"), false);
      }
    } else {
      cb(new Error("Unexpected field"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for both PDF and images
  },
});

// Validation for insight upload
const insightUploadValidation = [
  body("publishDate")
    .optional()
    .isISO8601()
    .withMessage("Publish date must be a valid date"),
  body("featuredImage")
    .optional()
    .isURL()
    .withMessage("Featured image must be a valid URL"),
  body("customTitle")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Custom title cannot exceed 200 characters"),
];

const TITLE_BLACKLIST_PATTERNS = [
  /proprietary\s*&\s*confidential/gi,
  /confidential/gi,
  /^page\s+\d+(?:\s+of\s+\d+)?$/i,
  /^prepared\s+by[:\s].*$/i,
  /^prepared\s+for[:\s].*$/i,
  /^for\s+internal\s+use\s+only$/i,
  /^draft$/i,
  /^table\s+of\s+contents$/i,
];

const cleanPdfTitle = (value) => {
  if (!value) return "";

  let cleaned = value
    .replace(/\.pdf$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of TITLE_BLACKLIST_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ").trim();
  }

  cleaned = cleaned
    .replace(/^\d+\.\s*/, "")
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[|:;,\-\s]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
};

// Helper function to extract a clean title from PDF text
const extractTitleFromPdf = (text) => {
  const lines = text
    .split("\n")
    .map((line) => cleanPdfTitle(line))
    .filter((line) => line.length >= 6 && line.length <= 200);

  for (const line of lines) {
    const looksLikeMetadata =
      /^by\s+/i.test(line) ||
      /^author[:\s]/i.test(line) ||
      /^www\./i.test(line) ||
      /^https?:\/\//i.test(line);

    if (!looksLikeMetadata) {
      return line;
    }
  }

  return "";
};

// Render a single PDF page to text (mirrors pdf-parse's default page renderer).
const renderPageToText = (pageData) =>
  pageData
    .getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false })
    .then((textContent) => {
      let lastY;
      let text = "";
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    });

// Parse a PDF once, keeping per-page text so the excerpt can be pulled from a
// specific page (page 1 is usually a boilerplate cover/branding page).
const parsePdf = async (buffer) => {
  const pages = [];
  const data = await pdfParse(buffer, {
    pagerender: (pageData) =>
      renderPageToText(pageData).then((text) => {
        pages.push(text);
        return text;
      }),
  });
  return { text: data.text || "", pages, numpages: data.numpages || pages.length };
};

// Lines we never want to see in an excerpt - running headers, contact strips,
// tables of contents, confidentiality notices, etc.
const EXCERPT_BOILERPLATE_PATTERNS = [
  /^page\s+\d+(?:\s+of\s+\d+)?$/i,
  /^contents?$/i,
  /^table\s+of\s+contents$/i,
  /^index$/i,
  /^introduction$/i,
  /[\w.+-]+@[\w-]+\.[\w.-]+/i, // email address
  /(?:^|\s)(?:www\.[\w.-]+|https?:\/\/\S+)/i, // URLs
  /universal\s+actuaries/i, // company name / branding
  /benefit\s+consultants?/i,
  /consulting\s+actuary/i,
  /\b(?:FIAI|FIA|IAI|IFoA)\b/, // actuarial credential lines
  /^proprietary\s*&?\s*confidential$/i,
  /^confidential$/i,
  /^\s*[-_.•]+\s*$/, // rule / bullet-only lines
  /\.{3,}\s*\d*$/, // dotted-leader TOC entries: "Introduction .......... 3"
];

const countMatches = (str, re) => (str.match(re) || []).length;

// Build a clean 2-3 line summary from a single PDF page.
const buildExcerptFromPage = (pageText, title) => {
  if (!pageText) return "";

  const titleNorm = (title || "").toLowerCase().replace(/\s+/g, " ").trim();

  const kept = pageText
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => {
      if (line.length < 3) return false;
      const lower = line.toLowerCase();
      if (titleNorm && titleNorm.length >= 6 && lower.includes(titleNorm)) return false;
      if (EXCERPT_BOILERPLATE_PATTERNS.some((re) => re.test(line))) return false;
      // Drop phone / date / reference clutter (digit-heavy, letter-light lines).
      if (countMatches(line, /\d/g) >= 7 && countMatches(line, /[a-z]/gi) < 15) return false;
      return true;
    });

  return kept
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/^[^A-Za-z0-9]+/, "")
    .trim();
};

// Generate the excerpt from the PDF, preferring page 2 (real content) over the
// branding-heavy first page, with sensible fallbacks.
const generateExcerpt = (parsed, title) => {
  const pages = parsed.pages || [];
  const candidates = [pages[1], pages[2], pages[0], parsed.text].filter(Boolean);

  let chosen = "";
  for (const candidate of candidates) {
    const built = buildExcerptFromPage(candidate, title);
    if (!chosen && built) chosen = built;
    if (built && built.length >= 40) {
      chosen = built;
      break;
    }
  }

  // Last-resort fallback: lightly cleaned raw text so the brief is never blank
  // (e.g. a single-page PDF that is all branding/contact info).
  if (!chosen) {
    const titleNorm = (title || "").toLowerCase().replace(/\s+/g, " ").trim();
    let raw = (parsed.text || pages[0] || "").replace(/\s+/g, " ").trim();
    if (titleNorm && raw.toLowerCase().startsWith(titleNorm)) {
      raw = raw.slice(titleNorm.length).trim();
    }
    chosen = raw.replace(/^[^A-Za-z0-9]+/, "").trim();
  }

  if (!chosen) return "";

  const LIMIT = 280;
  if (chosen.length <= LIMIT) return chosen;

  const slice = chosen.slice(0, LIMIT);
  const lastStop = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );
  if (lastStop > 140) return slice.slice(0, lastStop + 1).trim();

  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 140 ? slice.slice(0, lastSpace) : slice).trim() + "…";
};

// Helper function to create a URL-safe slug from text
const slugify = (text) => {
  const slug = (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return slug || `pdf-${Date.now()}`;
};

// The R2 object key an insight's PDF is stored under, e.g. "insights-pdfs/foo.pdf".
const buildPdfObjectKey = (slug) => `insights-pdfs/${slug}.pdf`;

// R2 buckets are kept private; every view/download gets a freshly-signed URL
// rather than a permanently public one. 1 hour is comfortably long enough for
// someone to view or download a PDF in one sitting.
const PDF_URL_EXPIRY_SECONDS = 60 * 60;

const getSignedPdfUrl = (objectKey) => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: "inline",
  });
  return getSignedUrl(s3Client, command, { expiresIn: PDF_URL_EXPIRY_SECONDS });
};

// Helper function to extract author from PDF text
const extractAuthorFromPdf = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Common author patterns to look for
  const authorPatterns = [
    /^(?:by|author|written by|authored by)[:]\s*(.+)$/i,
    /^author[:]\s*(.+)$/i,
    /^by\s+(.+)$/i,
    /^(.+)\s*-\s*author$/i,
    /^dr\.?\s+(.+)$/i,
    /^prof\.?\s+(.+)$/i,
    /^(.+),\s*(?:phd|md|dr|prof)\.?$/i,
  ];

  // Check first few lines for author patterns
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];

    for (const pattern of authorPatterns) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const author = match[1]
          .trim()
          .replace(/[^\w\s.-]/g, "") // Remove special characters except dots and hyphens
          .replace(/\s+/g, " ")
          .trim();

        // Validate author name (should be reasonable length)
        if (
          author.length >= 2 &&
          author.length <= 50 &&
          /[a-zA-Z]/.test(author)
        ) {
          return author;
        }
      }
    }
  }

  // Look for potential author names in first paragraph
  // Names often appear as "FirstName LastName" patterns
  const firstParagraph = lines.slice(0, 5).join(" ");
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;
  const matches = firstParagraph.match(namePattern);

  if (matches && matches.length > 0) {
    // Return the first reasonable name found
    for (const match of matches) {
      if (
        match.length <= 50 &&
        !match.includes("PDF") &&
        !match.includes("Document")
      ) {
        return match.trim();
      }
    }
  }

  return null; // No author found
};

// @route   POST /api/insights/upload
// @desc    Upload PDF and create new insight
// @access  Private (Editor+)
router.post(
  "/upload",
  authenticateToken,
  requireEditor,
  upload.fields([
    { name: "pdf", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  insightUploadValidation,
  async (req, res) => {
    try {
      console.log("📄 PDF Upload Request Started");
      console.log("- User:", req.user?.username, "Role:", req.user?.role);
      console.log(
        "- Files received:",
        req.files ? Object.keys(req.files) : "none",
      );

      if (req.files) {
        if (req.files.pdf)
          console.log(
            "  - PDF:",
            req.files.pdf[0].originalname,
            `(${req.files.pdf[0].size} bytes)`,
          );
        if (req.files.image)
          console.log("  - Image:", req.files.image[0].originalname);
      }

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      if (!req.files || !req.files.pdf || !req.files.pdf[0]) {
        console.log("❌ No PDF file provided");
        return res.status(400).json({
          success: false,
          message: "PDF file is required",
        });
      }

      const { featuredImage, publishDate, category, customTitle } = req.body;
      const pdfFile = req.files.pdf[0];
      const imageFile = req.files.image ? req.files.image[0] : null;

      console.log("📖 Parsing PDF content...");

      // Parse PDF to extract text (keeping per-page text for the excerpt)
      let pdfText = "";
      let parsedPdf = { text: "", pages: [] };
      try {
        parsedPdf = await parsePdf(pdfFile.buffer);
        pdfText = parsedPdf.text;
        console.log(
          "✅ PDF parsed successfully:",
          pdfText.length,
          "characters,",
          parsedPdf.pages.length,
          "pages",
        );
      } catch (pdfError) {
        console.error("❌ PDF parsing error:", pdfError);
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file or corrupted content",
        });
      }

      if (!pdfText.trim()) {
        console.log("❌ PDF appears empty");
        return res.status(400).json({
          success: false,
          message: "PDF appears to be empty or contains no readable text",
        });
      }

      const providedTitle = cleanPdfTitle(customTitle);
      const extractedTitle = extractTitleFromPdf(pdfText);
      const fallbackFilenameTitle = cleanPdfTitle(pdfFile.originalname);
      const title = providedTitle || extractedTitle || fallbackFilenameTitle || "Untitled Insight";
      const excerpt = generateExcerpt(parsedPdf, title);
      const author = extractAuthorFromPdf(pdfText);

      console.log("📝 Extracted metadata:");
      console.log("  - Title:", title);
      console.log("  - Custom title provided:", Boolean(providedTitle));
      console.log("  - Author:", author || "Unknown");
      console.log("  - Excerpt length:", excerpt.length);

      // Include publish date in slug so PDFs with identical titles get unique slugs
      const dateForSlug = publishDate
        ? new Date(publishDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const pdfSlug = slugify(`${title}-${dateForSlug}`);
      console.log("  - PDF Slug/Filename:", pdfSlug);

      // Upload to R2 with deterministic naming.
      const pdfPublicId = buildPdfObjectKey(pdfSlug);
      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: pdfPublicId,
            Body: pdfFile.buffer,
            ContentType: "application/pdf",
          }),
        );
      } catch (uploadError) {
        console.error("❌ R2 upload error:", uploadError.message);
        throw new Error(`Failed to upload PDF to R2: ${uploadError.message}`);
      }

      // Stored only as the initial value shown in the admin response - the
      // site always re-derives a fresh signed URL from pdfPublicId on view,
      // since signed URLs expire (see GET /:id/pdf below).
      const pdfUrl = await getSignedPdfUrl(pdfPublicId);

      console.log("🔗 PDF stored in R2 at:", pdfPublicId);
      console.log("✅ PDF will download as:", `${pdfSlug}.pdf`);

      // Handle image - either uploaded file or URL
      let finalImageUrl;
      if (imageFile) {
        // Convert uploaded image to base64 data URL
        const imageBase64 = imageFile.buffer.toString("base64");
        finalImageUrl = `data:${imageFile.mimetype};base64,${imageBase64}`;
        console.log("🖼️  Using uploaded image");
      } else if (featuredImage) {
        finalImageUrl = featuredImage;
        console.log("🖼️  Using image URL:", featuredImage);
      } else {
        finalImageUrl =
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80";
        console.log("🖼️  Using default image");
      }

      // Create insight document
      const insightData = {
        title,
        slug: pdfSlug,
        excerpt,
        author: author || "Unknown Author",
        category: category || "General",
        pdfUrl: pdfUrl,
        pdfPublicId,
        pdfOriginalFilename: pdfFile.originalname,
        featuredImage: finalImageUrl,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        published: true,
      };

      console.log("💾 Saving to database...");
      const insight = new Insight(insightData);
      await insight.save();
      console.log("✅ Insight saved successfully:", insight._id);

      res.status(201).json({
        success: true,
        message: "PDF insight created successfully",
        data: insight.toObject(),
      });
    } catch (error) {
      console.error("❌ Upload insight error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "An insight with this title and date already exists. Try a different publish date or override the title.",
        });
      }

      if (error.message === "Only PDF files are allowed") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed",
        });
      }

      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 10MB",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error while uploading PDF",
      });
    }
  },
);

// @route   DELETE /api/pdf-insights/:id
// @desc    Delete a PDF insight (removes from MongoDB and R2)
// @access  Private (Editor+)
router.delete("/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️  Delete PDF Insight Request");
    console.log("- Insight ID:", id);
    console.log("- User:", req.user?.username, "Role:", req.user?.role);

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid insight ID format",
      });
    }

    // Find the insight first to get the R2 object key
    const insight = await Insight.findById(id);

    if (!insight) {
      console.log("❌ Insight not found:", id);
      return res.status(404).json({
        success: false,
        message: "PDF insight not found",
      });
    }

    // Delete from R2 if PDF metadata exists
    if (insight.pdfPublicId) {
      try {
        console.log("📤 Deleting from R2:", insight.pdfPublicId);

        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: insight.pdfPublicId,
          }),
        );

        console.log("✅ Deleted from R2:", insight.pdfPublicId);
      } catch (r2Error) {
        console.error("⚠️  R2 deletion warning:", r2Error.message);
        // Don't fail the entire operation if R2 deletion fails
        // Continue with MongoDB deletion
      }
    }

    // Delete from MongoDB
    await Insight.findByIdAndDelete(id);

    console.log("✅ Insight deleted from MongoDB:", id);

    res.json({
      success: true,
      message: "PDF insight deleted successfully",
      data: { id: insight._id },
    });
  } catch (error) {
    console.error("❌ Delete insight error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting PDF insight",
    });
  }
});

// @route   GET /api/pdf-insights/:id/pdf
// @desc    Get clean PDF URL for viewing in browser
// @access  Public (for published insights)
router.get("/:id/pdf", async (req, res) => {
  try {
    const { id } = req.params;

    const insight = await Insight.findById(id).select(
      "pdfUrl pdfPublicId published title",
    );

    if (!insight || !insight.published) {
      return res.status(404).json({
        success: false,
        message: "PDF not found",
      });
    }

    if (!insight.pdfPublicId && !insight.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: "PDF URL not found for this insight",
      });
    }

    // Always mint a fresh signed URL from the stored R2 key rather than trust
    // insight.pdfUrl, since signed URLs expire (see PDF_URL_EXPIRY_SECONDS).
    const pdfUrl = insight.pdfPublicId
      ? await getSignedPdfUrl(insight.pdfPublicId)
      : insight.pdfUrl;

    console.log("📄 Serving inline PDF URL:", pdfUrl);

    res.json({
      success: true,
      pdfUrl,
      title: insight.title,
    });
  } catch (error) {
    console.error("PDF serve error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while serving PDF",
    });
  }
});

// @route   GET /api/pdf-insights/:id/download
// @desc    Permanent, never-expiring link to a PDF - safe to send to clients
//          and government agencies. It never returns the signed URL itself;
//          it 302-redirects to a freshly-signed one on every request, so the
//          link people save/share stays valid forever even though the actual
//          R2 URL underneath it rotates and expires.
// @access  Public (for published insights)
router.get("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send("Invalid link");
    }

    const insight = await Insight.findById(id).select(
      "pdfUrl pdfPublicId published title slug",
    );

    if (!insight || !insight.published) {
      return res.status(404).send("PDF not found");
    }

    if (!insight.pdfPublicId && !insight.pdfUrl) {
      return res.status(404).send("PDF not found");
    }

    const pdfUrl = insight.pdfPublicId
      ? await getSignedPdfUrl(insight.pdfPublicId)
      : insight.pdfUrl;

    res.redirect(302, pdfUrl);
  } catch (error) {
    console.error("PDF download redirect error:", error);
    res.status(500).send("Server error while serving PDF");
  }
});

module.exports = router;

// Exported for reuse by maintenance scripts (e.g. scripts/regenerateExcerpts.js)
module.exports.parsePdf = parsePdf;
module.exports.generateExcerpt = generateExcerpt;
module.exports.extractTitleFromPdf = extractTitleFromPdf;
module.exports.cleanPdfTitle = cleanPdfTitle;
