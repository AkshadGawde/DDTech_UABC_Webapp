const express = require("express");
const { body, validationResult } = require("express-validator");
const Insight = require("../models/Insight");
const { authenticateToken, requireEditor } = require("../middleware/auth");

const router = express.Router();

/* -------------------------------- */
/* Helper - calculate read time     */
/* -------------------------------- */

const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

/* -------------------------------- */
/* GET /api/insights/admin/:id       */
/* Get single insight (admin view)   */
/* @access Private (Editor+)         */
/* -------------------------------- */

router.get("/admin/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🔍 Fetching admin insight:", id);

    const insight = await Insight.findById(id).lean();

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    console.log("✅ Found insight:", insight.title);

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error("❌ Get admin insight error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching insight",
    });
  }
});

/* -------------------------------- */
/* GET /api/insights/admin          */
/* @access Private (Editor+)        */
/* -------------------------------- */

router.get("/admin", authenticateToken, requireEditor, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    let limit = parseInt(req.query.limit || 10);
    // Cap the limit to a reasonable maximum (e.g., 1000 for admin bulk loading)
    limit = Math.min(limit, 1000);
    const skip = (page - 1) * limit;
    const status = req.query.status || "all";

    // Build query based on status filter
    let query = {};
    if (status === "published") {
      query.published = true;
    } else if (status === "draft") {
      query.published = false;
    }
    // status === "all" means no filter

    console.log("🔍 Admin insights query:", { page, limit, status, query });

    const insights = await Insight.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Insight.countDocuments(query);

    console.log(`✅ Found ${insights.length} insights (${total} total)`);

    res.json({
      success: true,
      data: {
        insights,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get admin insights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching insights",
    });
  }
});

/* -------------------------------- */
/* GET /api/insights                */
/* -------------------------------- */

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'newest';

    const query = { published: true };

    // Add category filter if provided and not 'All'
    if (category && category !== 'All') {
      const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.category = { $regex: `^${escapedCategory}$`, $options: 'i' };
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Determine sort order
    let sortObj = {};
    if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'updated') {
      sortObj = { updatedAt: -1 };
    } else if (sort === 'popular') {
      sortObj = { views: -1 };
    } else {
      sortObj = { createdAt: -1 }; // 'newest' is default
    }

    const insights = await Insight.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select("-content")
      .lean();

    const total = await Insight.countDocuments(query);

    res.json({
      success: true,
      data: {
        insights,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get insights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching insights",
    });
  }
});

/* -------------------------------- */
/* GET SINGLE INSIGHT               */
/* -------------------------------- */

router.get("/:id", async (req, res) => {
  try {
    const insight = await Insight.findOne({
      _id: req.params.id,
      published: true,
    }).lean();

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: "Insight not found",
      });
    }

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error("Get insight error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* -------------------------------- */
/* CREATE INSIGHT                   */
/* -------------------------------- */

router.post("/", authenticateToken, requireEditor, async (req, res) => {
  try {
    const insightData = {
      ...req.body,
      readTime: calculateReadTime(req.body.content || ""),
    };

    const insight = new Insight(insightData);
    await insight.save();

    res.status(201).json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error("Create insight error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating insight",
    });
  }
});

/* -------------------------------- */
/* UPDATE INSIGHT                   */
/* -------------------------------- */

router.put("/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    const insight = await Insight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error("Update insight error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

/* -------------------------------- */
/* DELETE INSIGHT                   */
/* -------------------------------- */

router.delete("/:id", authenticateToken, requireEditor, async (req, res) => {
  try {
    await Insight.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Insight deleted",
    });
  } catch (error) {
    console.error("Delete insight error:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

/* -------------------------------- */
/* PATCH /api/insights/:id/publish  */
/* Toggle published status          */
/* -------------------------------- */

router.patch(
  "/:id/publish",
  authenticateToken,
  requireEditor,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { published } = req.body;

      if (typeof published !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Published must be a boolean",
        });
      }

      console.log(`📝 Toggling published status for ${id} to ${published}`);

      const insight = await Insight.findByIdAndUpdate(
        id,
        { published },
        { new: true },
      );

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Insight not found",
        });
      }

      res.json({
        success: true,
        message: `Insight ${published ? "published" : "unpublished"} successfully`,
        data: insight,
      });
    } catch (error) {
      console.error("Toggle publish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle publish status",
      });
    }
  },
);

/* -------------------------------- */
/* PATCH /api/insights/:id/featured */
/* Toggle featured status           */
/* -------------------------------- */

router.patch(
  "/:id/featured",
  authenticateToken,
  requireEditor,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { featured } = req.body;

      if (typeof featured !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Featured must be a boolean",
        });
      }

      console.log(`⭐ Toggling featured status for ${id} to ${featured}`);

      const insight = await Insight.findByIdAndUpdate(
        id,
        { featured },
        { new: true },
      );

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Insight not found",
        });
      }

      res.json({
        success: true,
        message: `Insight ${featured ? "featured" : "unfeatured"} successfully`,
        data: insight,
      });
    } catch (error) {
      console.error("Toggle featured error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle featured status",
      });
    }
  },
);

module.exports = router;
