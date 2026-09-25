import type { InsightSection } from './services/insightsService';

// Per-section admin settings. Legislation shares the Insight collection but has
// its own category vocabulary, labels and R2 folder (handled server-side).
export const SECTION_CONFIG: Record<InsightSection, { label: string; tabLabel: string; defaultCategories: string[] }> = {
  insight: {
    label: 'Insight',
    tabLabel: 'Insights',
    defaultCategories: ['Research Papers', 'Interests', 'Regulatory Reports'],
  },
  legislation: {
    label: 'Legislation',
    tabLabel: 'Legislation',
    defaultCategories: ['Acts', 'Rules & Regulations', 'Circulars', 'Notifications', 'Guidelines'],
  },
};
