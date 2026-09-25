/**
 * Regenerate the excerpt/brief for existing PDF insights using the current
 * page-2-aware logic in routes/pdfInsights.js.
 *
 * Usage:
 *   node scripts/regenerateExcerpts.js            # dry run - prints old vs new
 *   node scripts/regenerateExcerpts.js --apply    # write the new excerpts
 *
 * Requires MONGODB_URI (read from .env) and outbound network access to fetch
 * each PDF from its stored URL. Needs Node 18+ for the global fetch().
 */
require("dotenv").config();

const mongoose = require("mongoose");
const Insight = require("../models/Insight");
const { parsePdf, generateExcerpt } = require("../routes/pdfInsights");

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/uabc";
const APPLY = process.argv.includes("--apply");

const fetchPdfBuffer = async (url) => {
  if (typeof fetch !== "function") {
    throw new Error("global fetch() unavailable - run with Node 18+");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching PDF`);
  return Buffer.from(await res.arrayBuffer());
};

const run = async () => {
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Skip descriptions an admin wrote/edited by hand (excerptCustom) - those
  // must never be overwritten by the auto-generated version.
  const insights = await Insight.find({
    pdfUrl: { $exists: true, $ne: null },
    excerptCustom: { $ne: true },
  });

  console.log(
    `Found ${insights.length} auto-described PDF insights. Mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`,
  );

  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (const insight of insights) {
    try {
      const buffer = await fetchPdfBuffer(insight.pdfUrl);
      const parsed = await parsePdf(buffer);
      const excerpt = generateExcerpt(parsed, insight.title);

      if (!excerpt) {
        console.log(`⚠️  ${insight.title}: could not build an excerpt, skipping`);
        failed++;
        continue;
      }

      console.log(`• ${insight.title}`);
      console.log(`   old: ${insight.excerpt ? insight.excerpt.slice(0, 140) : "(none)"}`);
      console.log(`   new: ${excerpt.slice(0, 140)}\n`);

      if (excerpt === insight.excerpt) {
        unchanged++;
        continue;
      }

      if (APPLY) {
        insight.excerpt = excerpt;
        await insight.save();
        updated++;
      }
    } catch (err) {
      failed++;
      console.error(`❌ ${insight.title}: ${err.message}`);
    }
  }

  console.log(
    `\nDone. ${APPLY ? `Updated ${updated}` : `Would update ${insights.length - unchanged - failed}`}, ${unchanged} unchanged, ${failed} failed.`,
  );

  await mongoose.connection.close();
};

run().catch((err) => {
  console.error("❌ regenerateExcerpts failed:", err);
  process.exit(1);
});
