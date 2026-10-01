const express = require("express");
const store = require("../lib/insightStore");
const { authenticateToken, requireEditor } = require("../middleware/auth");

const router = express.Router();

/* -------------------------------- */
/* Helpers                          */
/* -------------------------------- */

const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// Fields an admin may set through the JSON API. Storage fields (pdfPublicId,
// section, slug, ...) are server-controlled and can't be changed after upload.
const EDITABLE_FIELDS = [
  "title",
  "excerpt",
  "content",
  "author",
  "category",
  "tags",
  "featuredImage",
  "image",
  "published",
  "featured",
  "publishDate",
  "seoTitle",
  "seoDescription",
];

const pickEditable = (source) => {
  const out = {};
  for (const field of EDITABLE_FIELDS) {
    if (source[field] !== undefined) out[field] = source[field];
  }
  return out;
};

const sendError = (res, error, fallbackMessage) => {
  if (error instanceof store.StoreError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(`❌ ${fallbackMessage}:`, error);
  res.status(500).json({ success: false, message: fallbackMessage });
};

const paginate = (items, pageParam, limitParam, maxLimit) => {
  const page = Math.max(1, parseInt(pageParam || 1));
  const limit = Math.min(Math.max(1, parseInt(limitParam || 10)), maxLimit);
  const total = items.length;
  const pages = Math.ceil(total / limit);
  return {
    insights: items.slice((page - 1) * limit, page * limit),
    pagination: {
      current: page,
      pages,
      total,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
};

const byNewest = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt));

/* -------------------------------- */
/* GET /api/insights/admin/:id       */
/* Get single insight (admin view)   */
/* @access Private (Editor+)         */
/* -------------------------------- */

router.get("/admin/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const insight = await store.get(req.params.id);

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    res.json({ success: true, data: insight });
  } catch (error) {
    sendError(res, error, "Server error while fetching insight");
  }
});

/* -------------------------------- */
/* GET /api/insights/admin          */
/* @access Private (Editor+)        */
/* -------------------------------- */

router.get("/admin", authenticateToken, requireEditor, async (req, res) => {
  try {
    const status = req.query.status || "all";
    let insights = await store.list();

    if (status === "published") {
      insights = insights.filter((i) => i.published);
    } else if (status === "draft") {
      insights = insights.filter((i) => !i.published);
    }

    insights.sort(byNewest);
    res.json({
      success: true,
      data: paginate(insights, req.query.page, req.query.limit, 1000),
    });
  } catch (error) {
    sendError(res, error, "Server error while fetching insights");
  }
});

/* -------------------------------- */
/* GET /api/insights                */
/* Kept for older frontends - the   */
/* site now reads insights.json     */
/* straight from R2 instead.        */
/* -------------------------------- */

router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let insights = (await store.list()).filter((i) => i.published);

    insights =
      req.query.section === "legislation"
        ? insights.filter((i) => i.section === "legislation")
        : insights.filter((i) => i.section !== "legislation");

    if (category && category !== "All") {
      const wanted = category.toLowerCase();
      insights = insights.filter((i) => (i.category || "").toLowerCase() === wanted);
    }

    if (search) {
      const needle = search.toLowerCase();
      insights = insights.filter((i) =>
        [i.title, i.excerpt, i.author, ...(i.tags || [])].some((v) =>
          (v || "").toLowerCase().includes(needle),
        ),
      );
    }

    insights.sort(byNewest);
    if (req.query.sort === "oldest") insights.reverse();

    const result = paginate(insights, req.query.page, req.query.limit, 1000);
    result.insights = result.insights.map(({ content, ...rest }) => rest);
    res.json({ success: true, data: result });
  } catch (error) {
    sendError(res, error, "Server error while fetching insights");
  }
});

/* -------------------------------- */
/* GET SINGLE INSIGHT               */
/* -------------------------------- */

router.get("/:id", async (req, res) => {
  try {
    const insight = await store.get(req.params.id);

    if (!insight || !insight.published) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    res.json({ success: true, data: insight });
  } catch (error) {
    sendError(res, error, "Server error");
  }
});

/* -------------------------------- */
/* CREATE INSIGHT                   */
/* -------------------------------- */

router.post("/", authenticateToken, requireEditor, async (req, res) => {
  try {
    const data = pickEditable(req.body);

    if (!data.title || !String(data.title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const insight = await store.create({
      ...data,
      readTime: calculateReadTime(data.content || ""),
    });

    res.status(201).json({ success: true, data: insight });
  } catch (error) {
    sendError(res, error, "Error creating insight");
  }
});

/* -------------------------------- */
/* UPDATE INSIGHT                   */
/* -------------------------------- */

router.put("/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const update = pickEditable(req.body);

    if (typeof update.excerpt === "string") {
      const excerpt = update.excerpt.trim();
      if (excerpt.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 500 characters",
        });
      }
      if (excerpt) {
        update.excerpt = excerpt;
        update.excerptCustom = true;
      } else {
        // Never blank out what the website displays.
        delete update.excerpt;
      }
    }

    if (typeof update.content === "string") {
      update.readTime = calculateReadTime(update.content);
    }

    const { insight, removedKeys } = await store.update(req.params.id, update);
    await store.deletePublicObjects(removedKeys);

    res.json({ success: true, data: insight });
  } catch (error) {
    sendError(res, error, "Update failed");
  }
});

/* -------------------------------- */
/* DELETE INSIGHT                   */
/* -------------------------------- */

router.delete("/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const insight = await store.remove(req.params.id);
    await store.deletePublicObjects([insight.pdfPublicId, insight.featuredImageKey]);

    res.json({
      success: true,
      message: "Insight deleted",
    });
  } catch (error) {
    sendError(res, error, "Delete failed");
  }
});

/* -------------------------------- */
/* PATCH /api/insights/:id/publish  */
/* PATCH /api/insights/:id/featured */
/* Toggle a boolean flag            */
/* -------------------------------- */

const toggleFlag = (flag, onLabel, offLabel) => async (req, res) => {
  try {
    const value = req.body[flag];

    if (typeof value !== "boolean") {
      return res.status(400).json({
        success: false,
        message: `${flag[0].toUpperCase()}${flag.slice(1)} must be a boolean`,
      });
    }

    const { insight } = await store.update(req.params.id, { [flag]: value });

    res.json({
      success: true,
      message: `Insight ${value ? onLabel : offLabel} successfully`,
      data: insight,
    });
  } catch (error) {
    sendError(res, error, `Failed to toggle ${flag} status`);
  }
};

router.patch(
  "/:id/publish",
  authenticateToken,
  requireEditor,
  toggleFlag("published", "published", "unpublished"),
);

router.patch(
  "/:id/featured",
  authenticateToken,
  requireEditor,
  toggleFlag("featured", "featured", "unfeatured"),
);

module.exports = router;
