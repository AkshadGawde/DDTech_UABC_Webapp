/**
 * One-time migration: copy every insight from MongoDB into the R2 JSON store
 * (lib/insightStore.js) and publish the public insights.json.
 *
 * Usage:
 *   node scripts/migrateMongoToR2.js            # dry run - prints what it would do
 *   node scripts/migrateMongoToR2.js --apply    # write the DB + insights.json
 *   node scripts/migrateMongoToR2.js --apply --overwrite   # replace an existing R2 DB
 *
 * Needs MONGODB_URI plus the new R2_* variables (read from .env). Mongo is only
 * read, never modified, so it stays a complete backup.
 */
require("dotenv").config();

const crypto = require("crypto");
const mongoose = require("mongoose");
const {
  HeadObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { s3Client, R2_BUCKET, R2_PRIVATE_BUCKET } = require("../config/r2");
const store = require("../lib/insightStore");

const APPLY = process.argv.includes("--apply");
const OVERWRITE = process.argv.includes("--overwrite");

const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const toIso = (value) => (value ? new Date(value).toISOString() : undefined);

const objectExists = async (bucket, key) => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
};

// Mongo document -> store record (see lib/insightStore.js for the shape).
const convert = (doc) => {
  const { _id, __v, id, formattedDate, ...rest } = doc;
  const record = {
    ...rest,
    _id: String(_id),
    publishDate: toIso(doc.publishDate) || toIso(doc.createdAt),
    publishedAt: toIso(doc.publishedAt) || null,
    createdAt: toIso(doc.createdAt) || new Date().toISOString(),
    updatedAt: toIso(doc.updatedAt) || new Date().toISOString(),
    section: doc.section || "insight",
  };

  // Stored pdfUrls were short-lived signed URLs - the public URL is now
  // derived from pdfPublicId. Only keep pdfUrl for records with no R2 key.
  if (record.pdfPublicId) delete record.pdfUrl;

  return record;
};

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!process.env.R2_PUBLIC_URL) throw new Error("R2_PUBLIC_URL is not set");

  console.log(APPLY ? "🚀 APPLY mode" : "🔍 DRY RUN (pass --apply to write)");
  console.log(`   public bucket: ${R2_BUCKET}, private bucket: ${R2_PRIVATE_BUCKET}\n`);

  if (await objectExists(R2_PRIVATE_BUCKET, store.DB_KEY)) {
    if (!OVERWRITE) {
      throw new Error(
        `${store.DB_KEY} already exists in ${R2_PRIVATE_BUCKET}. Re-run with --overwrite to replace it (any admin changes made since the last migration will be lost).`,
      );
    }
    console.log(`⚠️  ${store.DB_KEY} exists and will be overwritten\n`);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const docs = await mongoose.connection.collection("insights").find({}).toArray();
  console.log(`📦 ${docs.length} insights in MongoDB (${mongoose.connection.name})\n`);

  const insights = [];
  const problems = [];
  let imagesMoved = 0;

  for (const doc of docs) {
    const record = convert(doc);
    const label = `${record.published ? "✅" : "📝"} [${record.section}] ${record.title}`;

    if (record.pdfPublicId && !(await objectExists(R2_BUCKET, record.pdfPublicId))) {
      problems.push(`PDF missing in ${R2_BUCKET}: ${record.pdfPublicId} (${record.title})`);
    }
    if (!record.pdfPublicId && record.pdfUrl) {
      problems.push(`No R2 key, keeping old pdfUrl as-is: ${record.title}`);
    }

    // Uploaded poster images were stored inline as base64 data URLs - move
    // them into R2 so insights.json stays small.
    const match = /^data:([^;]+);base64,(.+)$/s.exec(record.featuredImage || "");
    if (match) {
      const [, mimeType, base64] = match;
      const ext = IMAGE_EXTENSIONS[mimeType] || "img";
      const base = record.slug || record._id;
      const key = `insight-images/${base}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
      if (APPLY) {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: Buffer.from(base64, "base64"),
            ContentType: mimeType,
            CacheControl: "public, max-age=3600",
          }),
        );
      }
      delete record.featuredImage;
      record.featuredImageKey = key;
      imagesMoved++;
    }

    insights.push(record);
    console.log(`   ${label}`);
  }

  const published = insights.filter((i) => i.published).length;
  console.log(`\n📊 ${insights.length} total, ${published} published, ${insights.length - published} drafts`);
  console.log(`🖼️  ${imagesMoved} inline images ${APPLY ? "moved" : "would be moved"} to R2`);

  if (problems.length) {
    console.log(`\n⚠️  ${problems.length} problem(s):`);
    problems.forEach((p) => console.log(`   - ${p}`));
  }

  if (!APPLY) {
    console.log("\nDry run only - nothing was written.");
    return;
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_PRIVATE_BUCKET,
      Key: store.DB_KEY,
      Body: JSON.stringify({ updatedAt: new Date().toISOString(), insights }),
      ContentType: "application/json",
    }),
  );
  console.log(`\n💾 Wrote ${R2_PRIVATE_BUCKET}/${store.DB_KEY}`);

  await store.rebuildManifest();
  console.log(`🌐 Wrote ${R2_BUCKET}/${store.MANIFEST_KEY} (${process.env.R2_PUBLIC_URL}/${store.MANIFEST_KEY})`);
};

run()
  .catch((error) => {
    console.error("\n❌ Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
