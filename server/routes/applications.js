const express = require("express");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, R2_BUCKET } = require("../config/r2");
const FOLDERS = require("../config/pdfFolders");

const router = express.Router();

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // matches the Careers form
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  fileFilter: (req, file, cb) =>
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Please upload a PDF file only."), false),
});

// Public endpoint, so keep it modest. (The server does not set `trust proxy`,
// so behind a proxy this bucket may be shared between visitors - the ceiling is
// deliberately high enough that legitimate applicants are never locked out.)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads. Please try again later." },
});

const looksLikePdf = (buffer) =>
  buffer.length > 5 && buffer.subarray(0, 5).toString("latin1") === "%PDF-";

// Keep only characters that are safe in an R2 key, a URL and a
// Content-Disposition header.
const sanitizeFilename = (name) => {
  const base = path
    .basename(String(name || ""))
    .replace(/\.pdf$/i, "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._ -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);
  return `${base || "resume"}.pdf`;
};

// @route   POST /api/applications/resume
// @desc    Store a job applicant's resume in R2 and return the pieces of its
//          permanent link (token + filename)
// @access  Public (rate limited)
router.post("/resume", uploadLimiter, (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File size should be less than 5MB."
          : err.message || "Invalid upload.";
      return res.status(400).json({ success: false, message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required." });
    }

    if (!looksLikePdf(req.file.buffer)) {
      return res
        .status(400)
        .json({ success: false, message: "The uploaded file is not a valid PDF." });
    }

    try {
      // 128-bit random token: the link is only known to whoever received it.
      const token = crypto.randomBytes(16).toString("hex");
      const filename = sanitizeFilename(req.file.originalname);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: `${FOLDERS.resumes}/${token}/${filename}`,
          Body: req.file.buffer,
          ContentType: "application/pdf",
        }),
      );

      res.status(201).json({ success: true, data: { token, filename } });
    } catch (error) {
      console.error("Resume upload error:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Could not store your resume. Please try again." });
    }
  });
});

// @route   GET /api/applications/resume/:token/:filename
// @desc    Permanent link to a resume. 302-redirects to a freshly signed R2 URL
//          on every request, so the link in the HR email never expires.
// @access  Public (unguessable link)
router.get("/resume/:token/:filename", async (req, res) => {
  const { token, filename } = req.params;

  if (!/^[a-f0-9]{32}$/.test(token) || !/^[A-Za-z0-9._-]{1,70}$/.test(filename)) {
    return res.status(400).send("Invalid link");
  }

  const key = `${FOLDERS.resumes}/${token}/${filename}`;

  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch {
    return res.status(404).send("Resume not found");
  }

  try {
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        ResponseContentType: "application/pdf",
        ResponseContentDisposition: `inline; filename="${filename}"`,
      }),
      { expiresIn: SIGNED_URL_EXPIRY_SECONDS },
    );

    // Personal data: keep it out of caches and search indexes.
    res.set({
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
    });
    res.redirect(302, url);
  } catch (error) {
    console.error("Resume link error:", error.message);
    res.status(500).send("Server error while serving resume");
  }
});

module.exports = router;
