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

  const handleInsightClick = useCallback((insight: Insight) => {
    if (insight.pdfUrl) {
      openPdfViewer(insight);
    }
  }, [openPdfViewer]);

  const copyPdfLink = useCallback(async (e: React.MouseEvent, insight: Insight) => {
    e.stopPropagation();
    const id = insight._id || insight.id;
    if (!insight.pdfUrl || !id) return;
    try {
      // Permanent link - safe to send to clients/government agencies, unlike
      // the short-lived signed URL used for in-page viewing.
      const url = insightsService.getPermanentPdfUrl(id);
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
