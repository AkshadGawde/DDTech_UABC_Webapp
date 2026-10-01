import { useCallback, useEffect, useState } from 'react';
import { insightsService, type Insight } from '../admin/services/insightsService';

export interface PdfViewerState {
  open: boolean;
  loading: boolean;
  error: string | null;
  url: string | null;
  insight: Insight | null;
}

const CLOSED_STATE: PdfViewerState = {
  open: false,
  loading: false,
  error: null,
  url: null,
  insight: null,
};

// Shared PDF viewer behavior (open/close/copy-link + escape key + scroll lock)
// used by every /insights page so they all open PDFs the same way.
export const usePdfViewer = () => {
  const [pdfViewer, setPdfViewer] = useState<PdfViewerState>(CLOSED_STATE);
  const [showToast, setShowToast] = useState(false);

  const closePdfViewer = useCallback(() => setPdfViewer(CLOSED_STATE), []);

  // pdfUrl is the PDF's permanent public R2 URL, so it opens directly - no
  // round trip to the API server.
  const openPdfViewer = useCallback((insight: Insight) => {
    if (!insight.pdfUrl) return;
    setPdfViewer({ open: true, loading: false, error: null, url: insight.pdfUrl, insight });
  }, []);

  const handleInsightClick = useCallback((insight: Insight) => {
    if (insight.pdfUrl) {
      openPdfViewer(insight);
    }
  }, [openPdfViewer]);

  const copyPdfLink = useCallback(async (e: React.MouseEvent, insight: Insight) => {
    e.stopPropagation();
    const url = insightsService.getPermanentPdfUrl(insight);
    if (!url) return;
    try {
      // Permanent link - safe to send to clients/government agencies.
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pdfViewer.open) closePdfViewer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pdfViewer.open, closePdfViewer]);

  useEffect(() => {
    document.body.style.overflow = pdfViewer.open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [pdfViewer.open]);

  return {
    pdfViewer,
    showToast,
    openPdfViewer,
    closePdfViewer,
    handleInsightClick,
    copyPdfLink,
  };
};
