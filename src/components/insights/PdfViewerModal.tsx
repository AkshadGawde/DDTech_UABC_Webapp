import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Download, ExternalLink, AlertCircle, Link as LinkIcon } from 'lucide-react';
import type { PdfViewerState } from '../../utils/usePdfViewer';
import { formatInsightDate, getInsightDate } from '../../utils/insightsHelpers';

interface PdfViewerModalProps {
  pdfViewer: PdfViewerState;
  onClose: () => void;
  onRetry: () => void;
  onCopyLink: (e: React.MouseEvent) => void;
}

export const PdfViewerModal = ({ pdfViewer, onClose, onRetry, onCopyLink }: PdfViewerModalProps) => {
  return (
    <AnimatePresence>
      {pdfViewer.open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

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
                {(pdfViewer.insight?.publishDate || pdfViewer.insight?.publishedAt) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Posted on{' '}
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {formatInsightDate(getInsightDate(pdfViewer.insight!))}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pdfViewer.url && (
                  <>
                    <button
                      onClick={onCopyLink}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400"
                      title="Copy shareable link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
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
                  onClick={onClose}
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
                    onClick={onRetry}
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
  );
};
