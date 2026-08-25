import type { Insight } from '../admin/services/insightsService';

export const formatInsightDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const getInsightDate = (insight: Insight): string =>
  insight.publishDate || insight.publishedAt || insight.createdAt;

// Newest first, oldest last. Insights with a missing/unparseable date sort to the end
// rather than being treated as "newest" (which a raw string/lexical sort would do).
export const sortInsightsByDateDesc = (insights: Insight[]): Insight[] =>
  [...insights].sort((a, b) => {
    const aTime = new Date(getInsightDate(a)).getTime();
    const bTime = new Date(getInsightDate(b)).getTime();
    const aValid = !isNaN(aTime);
    const bValid = !isNaN(bTime);
    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;
    return bTime - aTime;
  });

// Converts a category display name (e.g. "Regulatory Reports") to the URL
// slug used by the /insights/:category route (e.g. "regulatory-reports").
export const categoryToSlug = (category: string): string =>
  category.trim().toLowerCase().replace(/\s+/g, '-');

// Converts a /insights/:category URL slug back to a display name
// (e.g. "regulatory-reports" -> "Regulatory Reports").
export const slugToCategoryName = (slug: string | undefined): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
