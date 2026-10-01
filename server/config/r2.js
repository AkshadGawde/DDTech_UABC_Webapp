const { S3Client } = require("@aws-sdk/client-s3");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.warn(
    "⚠️  R2 is not fully configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET in .env",
  );
}

if (!R2_PUBLIC_URL) {
  console.warn(
    "⚠️  R2_PUBLIC_URL is not set (e.g. https://files.uabc.co.in) - public PDF links cannot be built",
  );
}

// R2 speaks the S3 API, so the regular AWS S3 SDK works against it - just point
// it at the account's R2 endpoint instead of an AWS region.
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// R2_BUCKET is served publicly through its custom domain (R2_PUBLIC_URL), so
// anything that must stay private (resumes, the admin database with drafts)
// goes to R2_PRIVATE_BUCKET - a second bucket with no public access.
const R2_PRIVATE_BUCKET = process.env.R2_PRIVATE_BUCKET || R2_BUCKET;
if (!process.env.R2_PRIVATE_BUCKET) {
  console.warn(
    "⚠️  R2_PRIVATE_BUCKET is not set - resumes and the admin database will be stored in the public bucket",
  );
}

const publicBaseUrl = (R2_PUBLIC_URL || "").replace(/\/+$/, "");

// Permanent public URL of an object in the public bucket.
const publicUrlFor = (key) =>
  `${publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

module.exports = { s3Client, R2_BUCKET, R2_PRIVATE_BUCKET, publicUrlFor };
