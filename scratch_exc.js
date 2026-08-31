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


module.exports = { generateExcerpt };