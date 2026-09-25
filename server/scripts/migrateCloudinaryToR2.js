/**
 * One-off migration: copy every insight's PDF from Cloudinary into R2, then
 * repoint that insight's pdfPublicId/pdfUrl at the new R2 object.
 *
 * Safe to re-run: insights already migrated (pdfPublicId already looks like
 * an R2 key, i.e. "insights-pdfs/<slug>.pdf") are skipped. Nothing is deleted
 * from Cloudinary - do that manually once you've verified the site works.
 *
 * Usage: npm run migrate:r2   (from the server/ directory)
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Insight = require("../models/Insight");
const { s3Client, R2_BUCKET } = require("../config/r2");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

const mongoUri = process.env.MONGODB_URI;

const isAlreadyOnR2 = (publicId) =>
  Boolean(publicId) &&
  publicId.startsWith("insights-pdfs/") &&
  publicId.endsWith(".pdf");

const buildPdfObjectKey = (slug) => `insights-pdfs/${slug}.pdf`;

const migrate = async () => {
  if (!mongoUri) {
    console.error("❌ MONGODB_URI not set");
    process.exit(1);
  }
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET) {
    console.error("❌ R2 credentials not set (check server/.env)");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB\n");

  const insights = await Insight.find({ pdfUrl: { $exists: true, $ne: null } });
  console.log(`Found ${insights.length} insights with a PDF\n`);

  let migrated = 0;
  let skipped = 0;
  const failed = [];

  for (const [i, insight] of insights.entries()) {
    const label = `[${i + 1}/${insights.length}] "${insight.title}"`;

    if (isAlreadyOnR2(insight.pdfPublicId)) {
      console.log(`${label} - already on R2, skipping`);
      skipped += 1;
      continue;
    }

    if (!insight.slug) {
      console.log(`${label} - ⚠️  no slug, skipping (needs manual fix)`);
      failed.push({ title: insight.title, id: insight._id, reason: "no slug" });
      continue;
    }

    try {
      console.log(`${label} - downloading from Cloudinary...`);
      const response = await fetch(insight.pdfUrl);
      if (!response.ok) {
        throw new Error(`Cloudinary returned HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const objectKey = buildPdfObjectKey(insight.slug);
      console.log(`  uploading ${(buffer.length / 1024).toFixed(0)} KB to R2 at ${objectKey}...`);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: objectKey,
          Body: buffer,
          ContentType: "application/pdf",
        }),
      );

      // Informational only - the live site always re-signs from pdfPublicId,
      // this stored value just makes the DB record self-explanatory.
      const signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey }),
        { expiresIn: 3600 },
      );

      insight.pdfPublicId = objectKey;
      insight.pdfUrl = signedUrl;
      insight.pdfVersion = undefined;
      await insight.save();

      console.log(`  ✅ migrated`);
      migrated += 1;
    } catch (error) {
      console.log(`  ❌ failed: ${error.message}`);
      failed.push({ title: insight.title, id: insight._id, reason: error.message });
    }
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Total:     ${insights.length}`);
  console.log(`Migrated:  ${migrated}`);
  console.log(`Skipped (already on R2): ${skipped}`);
  console.log(`Failed:    ${failed.length}`);
  if (failed.length) {
    console.log("\nFailed insights (fix manually or re-run this script):");
    for (const f of failed) {
      console.log(`  - ${f.title} (${f.id}): ${f.reason}`);
    }
  }
  console.log("\nNote: nothing was deleted from Cloudinary. Verify the site");
  console.log("works end-to-end, then clean up the Cloudinary account manually.");

  await mongoose.connection.close();
  process.exit(failed.length ? 1 : 0);
};

migrate().catch((error) => {
  console.error("❌ Migration script crashed:", error);
  process.exit(1);
});
