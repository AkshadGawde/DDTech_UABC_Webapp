import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { insightsService } from '../admin/services/insightsService';
import { optimizeImage, getInsightImageUrl } from '../utils/imageUtils';
import {
  Loader2,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  X,
  Download,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface Insight {
  _id?: string;
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
  author?: string;
  category: string;
  tags?: string[];
  readTime?: number;
  image?: string;
  featuredImage?: string;
  published: boolean;
  featured?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  pdfUrl?: string;
  publishDate?: string;
}

interface PdfViewerState {
  open: boolean;
  loading: boolean;
  error: string | null;
  url: string | null;
  insight: Insight | null;
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const getInsightDate = (insight: Insight): string =>
  insight.publishDate || insight.publishedAt || insight.createdAt;

export const TestBlog = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [pdfViewer, setPdfViewer] = useState<PdfViewerState>({
    open: false,
    loading: false,
    error: null,
    url: null,
    insight: null,
  });

  useEffect(() => {
    loadInsights();
  }, []);

  // Close viewer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pdfViewer.open) closePdfViewer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pdfViewer.open]);

  // Prevent body scroll when viewer is open
  useEffect(() => {
    document.body.style.overflow = pdfViewer.open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [pdfViewer.open]);

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
        setInsights([]);
        return;
      }

      const published = response.insights.filter((i) => i.published);
      setInsights(published);

      const unique = ['All', ...new Set(published.map((i: Insight) => i.category))];
      setCategories(unique);
    } catch {
      setError('Failed to load insights. Please try again.');
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const openPdfViewer = useCallback(async (insight: Insight) => {
    if (!insight.pdfUrl) return;
    const id = insight._id || insight.id;
    if (!id) return;

    setPdfViewer({ open: true, loading: true, error: null, url: null, insight });

    try {
      const url = await insightsService.getPdfViewerUrl(id);
      setPdfViewer((prev) => ({ ...prev, loading: false, url }));
    } catch (err: any) {
      setPdfViewer((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Failed to load PDF from Cloudinary.',
      }));
    }
  }, []);

  const closePdfViewer = () =>
    setPdfViewer({ open: false, loading: false, error: null, url: null, insight: null });

  const handleInsightClick = (insight: Insight) => {
    if (insight.pdfUrl) {
      openPdfViewer(insight);
    }
  };

  const copyPdfLink = async (e: React.MouseEvent, insight: Insight) => {
    e.stopPropagation();
    const id = insight._id || insight.id;
    if (!insight.pdfUrl || !id) return;
    try {
      const url = await insightsService.getPdfViewerUrl(id);
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // silently fail
    }
  };

  const filteredInsights = insights.filter((insight) => {
    const matchesCategory =
      selectedCategory === 'All' || insight.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredInsights.length / ITEMS_PER_PAGE);
  const paginatedInsights = filteredInsights.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const recentPosts = [...insights].slice(0, 12);

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
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-dark-bg py-10 md:py-14 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px, 40px 40px',
          }}
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-semibold tracking-widest uppercase text-sm">
              Insights
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide uppercase">
            Blog
          </h1>
          <div className="mt-3 w-16 h-1 bg-accent-500 rounded-full" />
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* ── LEFT: Blog Posts ── */}
          <main className="flex-1 min-w-0">
            {/* Search bar */}
            <div className="mb-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="mt-4 text-accent-600 dark:text-accent-400 underline text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            <div className="space-y-0">
              {paginatedInsights.map((insight, index) => {
                const isPDF = !!insight.pdfUrl;
                const insightDate = formatDate(getInsightDate(insight));
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
                      {insight.author && (
                        <>
                          Posted by{' '}
                          <span className="text-accent-600 dark:text-accent-400 font-medium">
                            {insight.author}
                          </span>{' '}
                        </>
                      )}
                      {insightDate && (
                        <>
                          on{' '}
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
                          <button
                            onClick={() => { setSelectedCategory(insight.category); setCurrentPage(1); }}
                            className="text-accent-600 dark:text-accent-400 hover:underline font-medium"
                          >
                            {insight.category}
                          </button>
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
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-8">
            {/* Subscribe */}
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-1">
                Subscribe to Email Updates
              </p>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-4">
                Subscribe to our blog
              </h3>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-dark-bg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all mb-3"
              />
              <button className="w-full py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Subscribe
              </button>
            </div>

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                  Recent Posts
                </h3>
                <ul className="space-y-2.5">
                  {recentPosts.map((post) => (
                    <li key={post._id || post.id} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                      <button
                        onClick={() => handleInsightClick(post)}
                        className="text-sm text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors text-left leading-snug"
                      >
                        {post.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Topics / Categories */}
            {categories.length > 1 && (
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                  Topics
                </h3>
                <ul className="space-y-2">
                  {categories.filter((c) => c !== 'All').map((category) => (
                    <li key={category} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 shrink-0" />
                      <button
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category ? 'All' : category);
                          setCurrentPage(1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`text-sm transition-colors font-medium ${
                          selectedCategory === category
                            ? 'text-accent-600 dark:text-accent-400 underline'
                            : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => { setSelectedCategory('All'); setCurrentPage(1); }}
                    className="mt-4 text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── PDF Viewer Modal ── */}
      <AnimatePresence>
        {pdfViewer.open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={closePdfViewer}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-4 md:inset-8 z-50 bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-xs font-bold rounded uppercase tracking-wide">
                      {pdfViewer.insight?.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">PDF</span>
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {pdfViewer.insight?.title}
                  </h2>
                  {(pdfViewer.insight?.author || pdfViewer.insight?.publishDate || pdfViewer.insight?.publishedAt) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {pdfViewer.insight?.author && (
                        <span className="font-medium text-accent-600 dark:text-accent-400">
                          {pdfViewer.insight.author}
                        </span>
                      )}
                      {pdfViewer.insight?.author && (pdfViewer.insight?.publishDate || pdfViewer.insight?.publishedAt) && ' · '}
                      {formatDate(getInsightDate(pdfViewer.insight!))}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {pdfViewer.url && (
                    <>
                      <a
                        href={pdfViewer.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <a
                        href={pdfViewer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </>
                  )}
                  <button
                    onClick={closePdfViewer}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Excerpt strip */}
              {pdfViewer.insight?.excerpt && (
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 shrink-0">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {pdfViewer.insight.excerpt}
                  </p>
                </div>
              )}

              {/* PDF content area */}
              <div className="flex-1 min-h-0 relative">
                {pdfViewer.loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white dark:bg-dark-card">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Fetching PDF from Cloudinary…
                    </p>
                  </div>
                )}

                {pdfViewer.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <div>
                      <p className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                        Could not load PDF
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {pdfViewer.error}
                      </p>
                    </div>
                    <button
                      onClick={() => pdfViewer.insight && openPdfViewer(pdfViewer.insight)}
                      className="px-5 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {pdfViewer.url && !pdfViewer.loading && (
                  <iframe
                    src={`${pdfViewer.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    title={pdfViewer.insight?.title || 'PDF Viewer'}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl z-60 flex items-center gap-3"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Link Copied!</span>
        </motion.div>
      )}
    </div>
  );
};
