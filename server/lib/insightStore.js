const crypto = require("crypto");
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const {
  s3Client,
  R2_BUCKET,
  R2_PRIVATE_BUCKET,
  publicUrlFor,
} = require("../config/r2");
const FOLDERS = require("../config/pdfFolders");

// Insights live in two JSON files instead of a database:
//  - DB_KEY (private bucket): every insight, drafts included. Admin-only.
//  - MANIFEST_KEY (public bucket): published insights only. The website reads
//    this straight from R2, so it keeps working while this server is asleep.
const DB_KEY = "data/insights-db.json";
const MANIFEST_KEY = "insights.json";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80";

// Fields the public manifest exposes - everything else (content, admin flags,
// original filenames) stays in the private DB.
const PUBLIC_FIELDS = [
  "_id",
  "id",
  "section",
  "title",
  "slug",
  "excerpt",
  "author",
  "category",
  "tags",
  "readTime",
  "pdfUrl",
  "pdfPublicId",
  "featuredImage",
  "published",
  "featured",
  "publishDate",
  "publishedAt",
  "createdAt",
  "updatedAt",
];

class StoreError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const newId = () => crypto.randomBytes(12).toString("hex"); // ObjectId-shaped

const slugify = (text) =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/* ---------------------------- R2 file access ---------------------------- */

// Returns { insights, etag }. A missing DB file means "no insights yet"; any
// other failure is thrown, so a flaky read can never be mistaken for an empty
// DB and then written back over the real one.
const readDb = async () => {
  try {
    const res = await s3Client.send(
      new GetObjectCommand({ Bucket: R2_PRIVATE_BUCKET, Key: DB_KEY }),
    );
    const data = JSON.parse(await res.Body.transformToString());
    return { insights: data.insights || [], etag: res.ETag };
  } catch (error) {
    if (error.name === "NoSuchKey") return { insights: [], etag: null };
    throw error;
  }
};

const putJson = (bucket, key, data, extra = {}) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      ...extra,
    }),
  );

/* ------------------------------ Serializing ----------------------------- */

// Shape returned by the API: stored record plus derived public URLs.
const toApi = (record) => ({
  ...record,
  id: record._id,
  pdfUrl: record.pdfPublicId ? publicUrlFor(record.pdfPublicId) : record.pdfUrl,
  featuredImage: record.featuredImageKey
    ? publicUrlFor(record.featuredImageKey)
    : record.featuredImage || DEFAULT_IMAGE,
});

const toPublic = (record) => {
  const full = toApi(record);
  const out = {};
  for (const field of PUBLIC_FIELDS) {
    if (full[field] !== undefined) out[field] = full[field];
  }
  return out;
};

const isPubliclyListed = (record) => {
  if (!record.published) return false;
  // Legislation must come from its own R2 folder (mirrors the old API rule).
  if (record.section === "legislation") {
    return (record.pdfPublicId || "").startsWith(`${FOLDERS.legislation}/`);
  }
  return true;
};

const writeManifest = (insights) =>
  putJson(
    R2_BUCKET,
    MANIFEST_KEY,
    {
      generatedAt: new Date().toISOString(),
      insights: insights.filter(isPubliclyListed).map(toPublic),
    },
    // Browsers revalidate on every load, so admin changes show up immediately.
    { CacheControl: "no-cache" },
  );

/* ------------------------------- Mutations ------------------------------ */

// Writes are serialized inside this process, and guarded across processes
// (e.g. a local dev server pointed at the same bucket) with an ETag check:
// if someone else wrote the DB since we read it, re-read and re-apply.
let writeQueue = Promise.resolve();

const mutate = (fn) => {
  const run = async () => {
    for (let attempt = 1; ; attempt++) {
      const { insights, etag } = await readDb();
      const result = await fn(insights);
      try {
        await putJson(
          R2_PRIVATE_BUCKET,
          DB_KEY,
          { updatedAt: new Date().toISOString(), insights },
          etag ? { IfMatch: etag } : { IfNoneMatch: "*" },
        );
      } catch (error) {
        const conflict = error.$metadata?.httpStatusCode === 412;
        if (conflict && attempt < 3) continue;
        throw error;
      }
      await writeManifest(insights);
      return result;
    }
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => {});
  return next;
};

const findIndexOrThrow = (insights, id) => {
  const index = insights.findIndex((i) => i._id === id);
  if (index === -1) throw new StoreError(404, "Insight not found");
  return index;
};

const assertSlugFree = (insights, slug, exceptId) => {
  if (slug && insights.some((i) => i.slug === slug && i._id !== exceptId)) {
    throw new StoreError(
      400,
      "An insight with this title and date already exists. Try a different publish date or override the title.",
    );
  }
};

const create = (data) =>
  mutate((insights) => {
    const now = new Date().toISOString();
    const record = {
      section: "insight",
      author: "UABC Team",
      category: "General",
      tags: [],
      readTime: 5,
      published: false,
      featured: false,
      views: 0,
      likes: 0,
      ...data,
      _id: newId(),
      slug: data.slug || slugify(data.title) || `insight-${Date.now()}`,
      publishDate: toIso(data.publishDate) || now,
      createdAt: now,
      updatedAt: now,
    };
    if (record.published && !record.publishedAt) {
      record.publishedAt = record.publishDate;
    }
    assertSlugFree(insights, record.slug);
    insights.push(record);
    return toApi(record);
  });

// Returns { insight, removedKeys } - object keys the caller should delete from
// R2 because the update replaced them (e.g. an uploaded image swapped for a URL).
const update = (id, changes) =>
  mutate((insights) => {
    const index = findIndexOrThrow(insights, id);
    const current = insights[index];
    const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
    const removedKeys = [];

    if ("publishDate" in changes) {
      next.publishDate = toIso(changes.publishDate) || current.publishDate;
    }
    if (next.published && !next.publishedAt) {
      next.publishedAt = next.publishDate;
    }
    if ("featuredImage" in changes && current.featuredImageKey) {
      removedKeys.push(current.featuredImageKey);
      delete next.featuredImageKey;
    }

    insights[index] = next;
    return { insight: toApi(next), removedKeys };
  });

const remove = (id) =>
  mutate((insights) => {
    const index = findIndexOrThrow(insights, id);
    const [record] = insights.splice(index, 1);
    return toApi(record);
  });

/* -------------------------------- Reads --------------------------------- */

const list = async () => (await readDb()).insights.map(toApi);

const get = async (id) => {
  const record = (await readDb()).insights.find((i) => i._id === id);
  return record ? toApi(record) : null;
};

const slugExists = async (slug) =>
  (await readDb()).insights.some((i) => i.slug === slug);

// Re-publishes the public manifest from the DB (run on startup so a manifest
// write that failed after a DB write heals itself). Skipped while there is no
// DB yet, so a fresh deploy never publishes an empty list over a real one.
const rebuildManifest = async () => {
  const { insights, etag } = await readDb();
  if (etag) await writeManifest(insights);
};

/* -------------------------- Public bucket files ------------------------- */

const putPublicObject = (key, body, contentType) =>
  s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=3600",
    }),
  );

// Best effort - a leftover file must never fail the admin action.
const deletePublicObjects = async (keys) => {
  for (const key of keys.filter(Boolean)) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
      console.log("🗑️  Deleted from R2:", key);
    } catch (error) {
      console.error("⚠️  R2 deletion warning:", key, error.message);
    }
  }
};

module.exports = {
  StoreError,
  DB_KEY,
  MANIFEST_KEY,
  DEFAULT_IMAGE,
  slugify,
  list,
  get,
  slugExists,
  create,
  update,
  remove,
  rebuildManifest,
  putPublicObject,
  deletePublicObjects,
};
