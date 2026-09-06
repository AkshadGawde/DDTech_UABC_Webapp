import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { insightsService, type Insight } from '../../admin/services/insightsService';
import { optimizeImage, getInsightImageUrl } from '../../utils/imageUtils';
import { formatInsightDate, getInsightDate, categoryToSlug, sortInsightsByDateDesc, sortCategoriesByCanonicalOrder } from '../../utils/insightsHelpers';
import { usePdfViewer } from '../../utils/usePdfViewer';
import { PdfViewerModal } from './PdfViewerModal';
import { InsightsSidebar } from './InsightsSidebar';
import {
  Loader2,
  FileText,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface InsightsPageTemplateProps {
  /** Page heading (H1) — e.g. "Insights" or a category name like "Regulatory Reports". */
  pageTitle: string;
  /**
   * When set, the page is locked to this category: the list is filtered to it and
   * the breadcrumb/topics sidebar reflect it. Category display names must match
   * the `category` field stored on insights (see slugToCategoryName).
   */
  category?: string;
}

export const InsightsPageTemplate = ({ pageTitle, category }: InsightsPageTemplateProps) => {
  const [allInsights, setAllInsights] = useState<Insight[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    pdfViewer,
    showToast,
    openPdfViewer,
    closePdfViewer,
    handleInsightClick,
    copyPdfLink,
  } = usePdfViewer();

  useEffect(() => {
    loadInsights();
  }, []);

  // Reset to page 1 whenever the locked category or search term changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await insightsService.getPublicInsights({
        page: 1,
        limit: 500,
        sort: 'newest',
      });

      if (!response?.insights) {
        setError('Failed to load insights.');
        setAllInsights([]);
        return;
      }

      setAllInsights(sortInsightsByDateDesc(response.insights.filter((i) => i.published)));
    } catch {
      setError('Failed to load insights. Please try again.');
      setAllInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(
    () => sortCategoriesByCanonicalOrder([...new Set(allInsights.map((i) => i.category))]),
    [allInsights]
  );

  const scopedInsights = useMemo(
    () => (category ? allInsights.filter((i) => i.category === category) : allInsights),
    [allInsights, category]
  );

  const filteredInsights = useMemo(
    () =>
      scopedInsights.filter((insight) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          insight.title.toLowerCase().includes(q) ||
          insight.excerpt.toLowerCase().includes(q)
        );
      }),
    [scopedInsights, searchQuery]
  );

  const totalPages = Math.ceil(filteredInsights.length / ITEMS_PER_PAGE);
  const paginatedInsights = filteredInsights.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const recentPosts = scopedInsights.slice(0, 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16">
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              {pageTitle}
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {category ? (
                `Expert analysis, research and regulatory updates on ${pageTitle.toLowerCase()}.`
              ) : (
                <>
                  Actuarial perspectives, Research papers and Regulatory updates from our team,
                  <br />
                  helping you stay ahead of what matters.
                </>
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* ── LEFT: Insights list ── */}
          <main className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search insights..."
                className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-dark-card text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
                <button onClick={loadInsights} className="ml-2 underline hover:no-underline">
                  Try again
                </button>
              </div>
            )}

            {paginatedInsights.length === 0 && !error && (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No insights found.</p>
                {(searchQuery || category) && (
                  <div className="mt-4 flex items-center justify-center gap-4">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-accent-600 dark:text-accent-400 underline text-sm"
                      >
                        Clear search
                      </button>
                    )}
                    {category && (
                      <Link to="/insights" className="text-accent-600 dark:text-accent-400 underline text-sm">
                        View all insights
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-0">
              {paginatedInsights.map((insight, index) => {
                const isPDF = !!insight.pdfUrl;
                const insightDate = formatInsightDate(getInsightDate(insight));
                const imgSrc = optimizeImage(getInsightImageUrl(insight));

                return (
                  <motion.article
                    key={insight._id || insight.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    className="border-b border-slate-200 dark:border-slate-700 py-8 first:pt-0"
                  >
                    {/* Title */}
                    <div className="mb-1">
                      <h2
                        className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-slate-800 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors cursor-pointer leading-snug"
                        onClick={() => handleInsightClick(insight)}
                      >
                        {insight.title}
                      </h2>
                      <div className="mt-1.5 w-10 h-[3px] bg-accent-600 rounded-full" />
                    </div>

                    {/* Meta */}
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                      {insightDate && (
                        <>
                          Posted on{' '}
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {insightDate}
                          </span>
                        </>
                      )}
                    </p>

                    <hr className="border-slate-200 dark:border-slate-700 mb-5" />

                    {/* Body: text + image */}
                    <div className="flex gap-5 items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                          {insight.excerpt}
                        </p>

                        <div className="mt-4 flex items-center gap-4">
                          <button
                            onClick={() => handleInsightClick(insight)}
                            className="text-sm font-semibold text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 hover:underline transition-colors inline-flex items-center gap-1.5"
                          >
                            {isPDF ? (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                Read PDF
                              </>
                            ) : (
                              'Read more'
                            )}
                          </button>

                          {isPDF && (
                            <button
                              onClick={(e) => copyPdfLink(e, insight)}
                              className="text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                              title="Copy shareable link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Category / Tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
                          <span className="text-slate-400 dark:text-slate-500">Topics:</span>
                          <Link
                            to={`/insights/${categoryToSlug(insight.category)}`}
                            className="text-accent-600 dark:text-accent-400 hover:underline font-medium"
                          >
                            {insight.category}
                          </Link>
                          {insight.tags?.map((tag) => (
                            <span key={tag} className="text-slate-400 dark:text-slate-500">
                              ,{' '}
                              <span className="text-accent-600 dark:text-accent-400 font-medium">
                                {tag}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Thumbnail */}
                      <div
                        className="shrink-0 w-36 h-24 md:w-44 md:h-28 rounded overflow-hidden cursor-pointer relative group"
                        onClick={() => handleInsightClick(insight)}
                      >
                        <img
                          src={imgSrc}
                          alt={insight.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80';
                          }}
                        />
                        {isPDF && (
                          <div className="absolute top-1.5 left-1.5">
                            <span className="px-1.5 py-0.5 bg-accent-600 text-white text-[10px] font-bold rounded uppercase tracking-wide">
                              PDF
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                  )
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-slate-400">…</span>
                      )}
                      <button
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                          currentPage === p
                            ? 'bg-accent-600 text-white shadow'
                            : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </main>

          {/* ── RIGHT: Sidebar ── */}
          <InsightsSidebar
            recentPosts={recentPosts}
            categories={categories}
            activeCategory={category}
            onSelectPost={handleInsightClick}
            onCopyLink={copyPdfLink}
          />
        </div>
      </div>

      <PdfViewerModal
        pdfViewer={pdfViewer}
        onClose={closePdfViewer}
        onRetry={() => pdfViewer.insight && openPdfViewer(pdfViewer.insight)}
        onCopyLink={(e) => pdfViewer.insight && copyPdfLink(e, pdfViewer.insight)}
      />

      {/* Toast */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl z-[60] flex items-center gap-3"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Link Copied!</span>
        </motion.div>
      )}
    </div>
  );
};
