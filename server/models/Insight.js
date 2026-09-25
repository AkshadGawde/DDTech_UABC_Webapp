const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema(
  {
    // Which area of the site this document belongs to. Legislation PDFs live in
    // the same collection (so all admin tooling is shared) but are kept out of
    // every public /insights listing and stored under their own R2 folder.
    section: {
      type: String,
      enum: ["insight", "legislation"],
      default: "insight",
    },
    // Auto-extracted from PDF
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    // True once an admin has written/edited the description by hand, so the
    // auto-generated excerpt logic (e.g. regenerateExcerpts.js) never overwrites it.
    excerptCustom: {
      type: Boolean,
      default: false,
    },
    // PDF URL (optional - only for PDF insights)
    pdfUrl: {
      type: String,
      required: false,
      trim: true,
    },
    pdfPublicId: {
      type: String,
      required: false,
      trim: true,
    },
    pdfVersion: {
      type: String,
      required: false,
      trim: true,
    },
    pdfOriginalFilename: {
      type: String,
      required: false,
      trim: true,
    },
    // Regular insight fields (optional - only for text insights)
    content: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      default: "UABC Team",
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    readTime: {
      type: Number, // in minutes
      default: 5,
    },
    // Admin sets publication date
    publishDate: {
      type: Date,
      required: [true, "Publication date is required"],
      default: Date.now,
    },
    // Featured image for the insight poster
    featuredImage: {
      type: String, // URL to poster image
      default:
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for formatted date
insightSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Pre-save middleware to generate slug
insightSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  // Set publishedAt when published status changes to true
  if (this.isModified("published") && this.published && !this.publishedAt) {
    this.publishedAt = this.publishDate || new Date();
  }

  next();
});

// Index for better query performance
insightSchema.index({ published: 1, createdAt: -1 });
insightSchema.index({ category: 1, published: 1 });
insightSchema.index({ tags: 1 });
insightSchema.index({ pdfPublicId: 1 });
insightSchema.index({ section: 1, published: 1, createdAt: -1 });
// Slug index handled by unique: true above

// Static methods
insightSchema.statics.findPublished = function () {
  return this.find({ published: true }).sort({ publishedAt: -1 });
};

insightSchema.statics.findByCategory = function (category) {
  return this.find({ category, published: true }).sort({ publishedAt: -1 });
};

// Instance methods
insightSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

insightSchema.methods.toggleLike = function () {
  this.likes += 1;
  return this.save();
};

module.exports = mongoose.model("Insight", insightSchema);
