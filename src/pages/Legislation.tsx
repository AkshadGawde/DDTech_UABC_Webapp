import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Link as LinkIcon,
  Share2,
  Mail,
  MessageCircle,
  Check,
  Star,
  AlertCircle,
  RotateCw,
  ChevronDown,
  Calendar,
  Eye,
  Download,
} from 'lucide-react';
import { insightsService, type Insight } from '../admin/services/insightsService';
import { formatInsightDate, getInsightDate } from '../utils/insightsHelpers';
import { usePdfViewer } from '../utils/usePdfViewer';
import { PdfViewerModal } from '../components/insights/PdfViewerModal';

const PAGE_SIZE = 12;
const ALL = 'All';

type SortKey = 'relevance' | 'newest' | 'oldest' | 'az';
const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'Best match',
  newest: 'Newest first',
  oldest: 'Oldest first',
  az: 'Title A–Z',
};

/* ------------------------------ helpers ------------------------------ */

const getId = (i: Insight) => (i._id || i.id || '') as string;

const normalize = (v: string) =>
  v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const escapeRegExp = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface IndexedDoc {
  item: Insight;
  id: string;
  title: string;
  desc: string;
  cat: string;
  meta: string;
  time: number;
  featured: boolean;
}

const buildIndex = (items: Insight[]): IndexedDoc[] =>
  items.map((item) => {
    const date = getInsightDate(item);
    const t = new Date(date).getTime();
    return {
      item,
      id: getId(item),
      title: normalize(item.title || ''),
      desc: normalize(item.excerpt || ''),
      cat: normalize(item.category || ''),
      meta: normalize(`${formatInsightDate(date)} ${new Date(date).getFullYear() || ''}`),
      time: Number.isNaN(t) ? 0 : t,
      featured: !!item.featured,
    };
  });

// Every word must match somewhere (AND). Title hits weigh most, then category,
// then description/date. Returns 0 when any word has no match at all.
const scoreDoc = (d: IndexedDoc, tokens: string[]) => {
  let score = 0;
  for (const t of tokens) {
    let s = 0;
    if (d.title.includes(t)) s += d.title.startsWith(t) || d.title.includes(` ${t}`) ? 9 : 6;
    if (d.cat.includes(t)) s += 4;
    if (d.desc.includes(t)) s += 2;
    if (d.meta.includes(t)) s += 2;
    if (!s) return 0;
    score += s;
  }
  if (tokens.length > 1) {
    const phrase = tokens.join(' ');
    if (d.title.includes(phrase)) score += 10;
    else if (d.desc.includes(phrase)) score += 4;
  }
  return score;
};

// Stable per-category colour so badges/tiles are consistent across the page.
const TONES = [
  { badge: 'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-900/20 dark:text-accent-300 dark:border-accent-800' },
  { badge: 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-800' },
  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' },
  { badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800' },
  { badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800' },
];
const toneFor = (category: string) => {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
};

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

const pageLinkFor = (id: string) => `${window.location.origin}/legislation?doc=${id}`;

/* --------------------------- small components --------------------------- */

const Highlight = ({ text, tokens }: { text: string; tokens: string[] }) => {
  if (!tokens.length || !text) return <>{text}</>;
  const sorted = [...tokens].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const parts = text.split(new RegExp(`(${sorted.join('|')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-accent-200/70 dark:bg-accent-500/30 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

interface ShareMenuProps {
  item: Insight;
  onCopy: (text: string, label: string, key: string) => void;
}

const ShareMenu = ({ item, onCopy }: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = getId(item);
  const pageLink = pageLinkFor(id);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rowClass =
    'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share ${item.title}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">Share</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-30 w-64 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card shadow-xl"
          >
            <button
              role="menuitem"
              className={rowClass}
              onClick={() => { onCopy(pageLink, 'Page link copied', `${id}:page`); setOpen(false); }}
            >
              <LinkIcon className="w-4 h-4 text-accent-600" /> Copy page link
            </button>
            <button
              role="menuitem"
              className={rowClass}
              onClick={() => { onCopy(insightsService.getPermanentPdfUrl(id), 'PDF link copied', `${id}:pdf`); setOpen(false); }}
            >
              <Download className="w-4 h-4 text-accent-600" /> Copy direct PDF link
            </button>
            <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
            <a
              role="menuitem"
              className={rowClass}
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(`${item.title}\n${pageLink}`)}`}
              onClick={() => setOpen(false)}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" /> Share on WhatsApp
            </a>
            <a
              role="menuitem"
              className={rowClass}
              href={`mailto:?subject=${encodeURIComponent(item.title)}&body=${encodeURIComponent(`${item.excerpt ? item.excerpt + '\n\n' : ''}${pageLink}`)}`}
              onClick={() => setOpen(false)}
            >
              <Mail className="w-4 h-4 text-sky-600" /> Share via email
            </a>
            {canNativeShare && (
              <button
                role="menuitem"
                className={rowClass}
                onClick={() => {
                  navigator.share({ title: item.title, text: item.excerpt || item.title, url: pageLink }).catch(() => {});
                  setOpen(false);
                }}
              >
                <Share2 className="w-4 h-4 text-brand-600" /> More options…
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DocCardProps {
  doc: IndexedDoc;
  index: number;
  tokens: string[];
  flash: boolean;
  copiedKey: string | null;
  onOpen: (item: Insight) => void;
  onCopy: (text: string, label: string, key: string) => void;
}

const DocCard = ({ doc, index, tokens, flash, copiedKey, onOpen, onCopy }: DocCardProps) => {
  const { item, id } = doc;
  const [expanded, setExpanded] = useState(false);
  const tone = toneFor(item.category || '');
  const description = item.excerpt || '';
  const long = description.length > 120;
  const pageCopied = copiedKey === `${id}:page`;

  return (
    <motion.article
      id={`doc-${id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className={`group relative flex flex-col rounded-xl border bg-white dark:bg-dark-card p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        flash
          ? 'border-accent-500 ring-4 ring-accent-500/20 shadow-xl'
          : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-accent-300 dark:hover:border-accent-700'
      }`}
    >
      <span className="pointer-events-none absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-accent-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mb-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${tone.badge}`}>
              <Highlight text={item.category || 'General'} tokens={tokens} />
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {formatInsightDate(getInsightDate(item))}
            </span>
            {item.featured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" /> Featured
              </span>
            )}
          </div>
          <h3 className="text-[15px] md:text-base font-bold leading-snug text-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="text-left hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
            >
              <Highlight text={item.title} tokens={tokens} />
            </button>
          </h3>
        </div>
      </div>

      {description && (
        <div className="mt-2.5">
          <p className={`text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line ${expanded ? '' : 'line-clamp-2'}`}>
            <Highlight text={description} tokens={tokens} />
          </p>
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1.5 text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      <div className="mt-auto pt-3.5">
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/70 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors"
          >
            <Eye className="w-4 h-4" /> View PDF
          </button>
          <button
            type="button"
            onClick={() => onCopy(pageLinkFor(id), 'Page link copied', `${id}:page`)}
            aria-label={`Copy link to ${item.title}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-medium rounded-lg border transition-colors ${
              pageCopied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
          >
            {pageCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">{pageCopied ? 'Copied' : 'Copy link'}</span>
          </button>
          <div className="ml-auto">
            <ShareMenu item={item} onCopy={onCopy} />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const SkeletonCard = () => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card p-4 md:p-5 animate-pulse">
    <div className="space-y-2.5">
      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="h-3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="mt-5 h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700" />
  </div>
);

/* --------------------------------- page --------------------------------- */

export const Legislation = () => {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState(params.get('q') || '');
  const category = params.get('cat') || ALL;
  const sortParam = params.get('sort') as SortKey | null;
  const sortChoice: SortKey | 'auto' =
    sortParam && sortParam in SORT_LABELS ? sortParam : 'auto';
  const docParam = params.get('doc');

  const [page, setPage] = useState(1);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const handledDoc = useRef(false);

  const { pdfViewer, showToast, openPdfViewer, closePdfViewer, copyPdfLink } = usePdfViewer();

  const setParam = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await insightsService.getPublicLegislation());
    } catch {
      setError('We could not load the legislation library. Please check your connection and try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep the URL in sync with the search box so a search itself is shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = input.trim();
      if (trimmed !== (params.get('q') || '')) setParam({ q: trimmed || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // "/" focuses search, Esc clears it - the usual power-user shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing && !pdfViewer.open) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pdfViewer.open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const index = useMemo(() => buildIndex(items), [items]);
  const tokens = useMemo(() => normalize(input).split(/\s+/).filter(Boolean), [input]);
  const rawTokens = useMemo(() => input.trim().toLowerCase().split(/\s+/).filter(Boolean), [input]);
  const hasQuery = tokens.length > 0;

  // Documents matching the search (before the category filter) - drives chip counts.
  const scored = useMemo(() => {
    if (!hasQuery) return index.map((d) => ({ d, score: 0 }));
    return index.map((d) => ({ d, score: scoreDoc(d, tokens) })).filter((x) => x.score > 0);
  }, [index, tokens, hasQuery]);

  const categories = useMemo(() => {
    const names = Array.from(new Set(index.map((d) => d.item.category).filter(Boolean)));
    return names.sort((a, b) => a.localeCompare(b));
  }, [index]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    scored.forEach(({ d }) => {
      map[d.item.category] = (map[d.item.category] || 0) + 1;
    });
    return map;
  }, [scored]);

  const effectiveSort: SortKey =
    sortChoice === 'auto'
      ? hasQuery ? 'relevance' : 'newest'
      : sortChoice === 'relevance' && !hasQuery ? 'newest' : sortChoice;

  const results = useMemo(() => {
    let list = scored;
    if (category !== ALL) list = list.filter((x) => x.d.item.category === category);
    const sorted = [...list];
    sorted.sort((a, b) => {
      switch (effectiveSort) {
        case 'relevance':
          return b.score - a.score || b.d.time - a.d.time;
        case 'oldest':
          return a.d.time - b.d.time;
        case 'az':
          return a.d.item.title.localeCompare(b.d.item.title);
        default:
          // Default browse view pins featured documents first.
          if (sortChoice === 'auto' && a.d.featured !== b.d.featured) return a.d.featured ? -1 : 1;
          return b.d.time - a.d.time;
      }
    });
    return sorted.map((x) => x.d);
  }, [scored, category, effectiveSort, sortChoice]);

  useEffect(() => {
    setPage(1);
  }, [input, category, sortChoice]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageDocs = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCopy = useCallback(async (text: string, label: string, key: string) => {
    const ok = await copyToClipboard(text);
    setToast(ok ? { text: label } : { text: 'Could not copy — please copy the link manually', error: true });
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
    }
  }, []);

  const handleOpen = useCallback(
    (item: Insight) => {
      setParam({ doc: getId(item) });
      openPdfViewer(item);
    },
    [openPdfViewer, setParam]
  );

  // Drop ?doc= whenever the viewer goes from open to closed, however it was
  // closed (X button, backdrop, or the hook's own Escape handler).
  const viewerWasOpen = useRef(false);
  useEffect(() => {
    if (viewerWasOpen.current && !pdfViewer.open) setParam({ doc: null });
    viewerWasOpen.current = pdfViewer.open;
  }, [pdfViewer.open, setParam]);

  // Deep link: /legislation?doc=<id> opens that document straight away.
  useEffect(() => {
    if (handledDoc.current || loading || !docParam) return;
    handledDoc.current = true;
    const item = items.find((i) => getId(i) === docParam);
    if (!item) {
      setToast({ text: 'That document is no longer available', error: true });
      setParam({ doc: null });
      return;
    }
    openPdfViewer(item);
    const idx = results.findIndex((d) => d.id === docParam);
    if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE) + 1);
    setFlashId(docParam);
    setTimeout(() => setFlashId(null), 3500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, docParam, items]);

  const goToPage = (p: number) => {
    setPage(p);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAll = () => {
    setInput('');
    setParam({ q: null, cat: null, sort: null });
    searchRef.current?.focus();
  };

  const filtersActive = hasQuery || category !== ALL;
  const sortOptions: SortKey[] = hasQuery ? ['relevance', 'newest', 'oldest', 'az'] : ['newest', 'oldest', 'az'];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16">
      {/* Hero */}
      <section className="pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full text-xs font-semibold tracking-widest uppercase text-accent-700 dark:text-accent-400 bg-white/80 dark:bg-white/5 border border-accent-200 dark:border-accent-800">
              Legislation Library
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Acts, Rules &amp;{' '}
              <span className="text-accent-600 dark:text-accent-500">Government Circulars</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Search the legislation and government notifications that shape actuarial, employee
              benefit and insurance practice — then share any document with a single link.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-9 max-w-2xl mx-auto"
          >
            <label htmlFor="legislation-search" className="sr-only">Search legislation</label>
            <div className="relative flex items-center rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/5 focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/15 transition-all">
              <Search className="absolute left-5 w-5 h-5 text-slate-400" />
              <input
                id="legislation-search"
                ref={searchRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    if (input) setInput('');
                    else (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Search title, topic or year…"
                autoComplete="off"
                className="w-full bg-transparent pl-14 pr-24 py-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <div className="absolute right-3 flex items-center gap-2">
                {input ? (
                  <button
                    type="button"
                    onClick={() => { setInput(''); searchRef.current?.focus(); }}
                    aria-label="Clear search"
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-slate-400 border border-slate-200 dark:border-slate-600 rounded-md">/</kbd>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section ref={resultsRef} className="container mx-auto px-4 md:px-6 py-10 md:py-12 scroll-mt-20">
        {/* Category chips */}
        {!loading && !error && categories.length > 0 && (
          <div className="-mx-4 px-4 md:mx-0 md:px-0 mb-6 overflow-x-auto">
            <div className="flex gap-2 md:flex-wrap min-w-max md:min-w-0">
              {[ALL, ...categories].map((name) => {
                const active = category === name;
                const count = name === ALL ? scored.length : counts[name] || 0;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setParam({ cat: name === ALL ? null : name })}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-accent-600 border-accent-600 text-white shadow-sm'
                        : 'bg-white dark:bg-dark-card border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-accent-400 hover:text-accent-700 dark:hover:text-accent-400'
                    } ${!active && count === 0 ? 'opacity-50' : ''}`}
                  >
                    {name}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Toolbar */}
        {!loading && !error && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
              <span className="font-semibold text-slate-900 dark:text-white">{results.length}</span>{' '}
              {results.length === 1 ? 'document' : 'documents'}
              {hasQuery && <> for &ldquo;<span className="font-medium">{input.trim()}</span>&rdquo;</>}
              {category !== ALL && <> in <span className="font-medium">{category}</span></>}
              {filtersActive && (
                <button type="button" onClick={clearAll} className="ml-3 text-accent-600 dark:text-accent-400 font-medium hover:underline">
                  Clear filters
                </button>
              )}
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              Sort
              <select
                value={effectiveSort}
                onChange={(e) => setParam({ sort: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                {sortOptions.map((k) => (
                  <option key={k} value={k}>{SORT_LABELS[k]}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto text-center py-16">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-slate-700 dark:text-slate-300 mb-5">{error}</p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Nothing published yet */}
        {!loading && !error && items.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Library coming soon</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We&rsquo;re preparing this collection. Legislation and government circulars will appear here as soon as they&rsquo;re published.
            </p>
          </div>
        )}

        {/* No matches */}
        {!loading && !error && items.length > 0 && results.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching documents</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Try fewer or different keywords, check the spelling, or browse all categories.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="px-5 py-2.5 rounded-lg bg-accent-600 text-white font-semibold hover:bg-accent-700 transition-colors"
            >
              Clear search &amp; filters
            </button>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pageDocs.map((doc, i) => (
              <DocCard
                key={doc.id}
                doc={doc}
                index={i}
                tokens={rawTokens}
                flash={flashId === doc.id}
                copiedKey={copiedKey}
                onOpen={handleOpen}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-400">…</span>}
                  <button
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={page === p ? 'page' : undefined}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      page === p
                        ? 'bg-accent-600 text-white shadow'
                        : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
            >
              Next
            </button>
          </nav>
        )}
      </section>

      <PdfViewerModal
        pdfViewer={pdfViewer}
        onClose={closePdfViewer}
        onRetry={() => pdfViewer.insight && openPdfViewer(pdfViewer.insight)}
        onCopyLink={(e) => pdfViewer.insight && copyPdfLink(e, pdfViewer.insight)}
      />

      <AnimatePresence>
        {(toast || showToast) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-lg text-white shadow-xl ${
              toast?.error ? 'bg-red-600' : 'bg-emerald-600'
            }`}
          >
            {toast?.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast?.text || 'Link copied!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
