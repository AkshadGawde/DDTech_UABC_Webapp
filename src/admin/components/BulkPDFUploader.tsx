import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { authService } from '../services/authService';

interface PDFEntry {
  file: File;
  customTitle: string;
  showTitleInput: boolean;
  publishDate: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

interface BulkPDFUploaderProps {
  initialCategories?: string[];
  onComplete?: (successCount: number, errorCount: number) => void;
  onCancel?: () => void;
}

const DEFAULT_CATEGORIES = ['Research Papers', 'Interests', 'Regulatory Reports'];

const buildCategoryOptions = (categories: string[] = []) =>
  Array.from(
    new Set([...DEFAULT_CATEGORIES, ...categories].map(c => c.trim()).filter(Boolean))
  );

const today = () => new Date().toISOString().split('T')[0];

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08',
  sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
};

const extractDateFromFilename = (filename: string): string => {
  const name = filename.replace(/\.pdf$/i, '');

  // Pattern 1: "18th February 2025", "5th March 2020", "31st December 2024"
  const fullDate = name.match(/\b(\d{1,2})(?:st|nd|rd|th)\s+([A-Za-z]+)\s+(\d{4})\b/i);
  if (fullDate) {
    const month = MONTH_MAP[fullDate[2].toLowerCase()];
    if (month) return `${fullDate[3]}-${month}-${fullDate[1].padStart(2, '0')}`;
  }

  // Pattern 2: "September 2018", "March 2020", "Aug 2019"
  const monthYear = name.match(/\b([A-Za-z]+)\s+(\d{4})\b/i);
  if (monthYear) {
    const month = MONTH_MAP[monthYear[1].toLowerCase()];
    if (month) return `${monthYear[2]}-${month}-01`;
  }

  // Pattern 3: bare year "...Study 2024", "...Reports 2020"
  const yearOnly = name.match(/\b(20\d{2})\b/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  return today();
};

const BulkPDFUploader: React.FC<BulkPDFUploaderProps> = ({
  initialCategories = [],
  onComplete,
  onCancel,
}) => {
  const [entries, setEntries] = useState<PDFEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [categoryOptions] = useState<string[]>(() =>
    buildCategoryOptions(initialCategories)
  );
  const [sharedCategory, setSharedCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://uabc-pkg3.onrender.com/api';

  const addFiles = (files: FileList | File[]) => {
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) return;
    setEntries(prev => [
      ...prev,
      ...pdfs.map(file => ({
        file,
        customTitle: '',
        showTitleInput: false,
        publishDate: extractDateFromFilename(file.name),
        status: 'pending' as const,
      })),
    ]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, patch: Partial<PDFEntry>) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const handleUpload = async () => {
    const token = authService.getToken();
    if (!token) return;

    const category = showCustomCategory && customCategory.trim()
      ? customCategory.trim()
      : sharedCategory;

    setUploading(true);
    setProgress(0);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.status === 'done') {
        setProgress(i + 1);
        continue;
      }

      updateEntry(i, { status: 'uploading' });

      try {
        const formData = new FormData();
        formData.append('pdf', entry.file);
        formData.append('category', category);
        formData.append('publishDate', entry.publishDate);
        if (entry.customTitle.trim()) {
          formData.append('customTitle', entry.customTitle.trim());
        }

        const res = await fetch(`${apiUrl}/pdf-insights/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || `Upload failed (${res.status})`);
        }

        updateEntry(i, { status: 'done' });
      } catch (err) {
        updateEntry(i, {
          status: 'error',
          errorMsg: err instanceof Error ? err.message : 'Upload failed',
        });
      }

      setProgress(i + 1);
    }

    setUploading(false);

    const done = entries.filter((_, i) => {
      const updated = entries[i];
      return updated.status !== 'error';
    }).length;

    // Re-read final state for accurate counts via callback
    setEntries(prev => {
      const successCount = prev.filter(e => e.status === 'done').length;
      const errorCount = prev.filter(e => e.status === 'error').length;
      onComplete?.(successCount, errorCount);
      return prev;
    });
  };

  const pendingCount = entries.filter(e => e.status === 'pending' || e.status === 'error').length;
  const doneCount = entries.filter(e => e.status === 'done').length;
  const allDone = entries.length > 0 && doneCount === entries.length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Category selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={showCustomCategory ? '' : sharedCategory}
            onChange={e => setSharedCategory(e.target.value)}
            disabled={showCustomCategory || uploading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-700"
          >
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              setShowCustomCategory(s => !s);
              setCustomCategory('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
              showCustomCategory
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showCustomCategory ? 'Cancel' : '+ New'}
          </button>
        </div>
        {showCustomCategory && (
          <input
            type="text"
            value={customCategory}
            onChange={e => setCustomCategory(e.target.value)}
            placeholder="Enter new category name"
            disabled={uploading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
          disabled={uploading}
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600">
          <span className="text-blue-600 font-medium">Choose PDFs</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">Multiple files supported · Max 10MB each</p>
      </div>

      {/* PDF list */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {entries.length} PDF{entries.length > 1 ? 's' : ''} selected
              {doneCount > 0 && ` · ${doneCount} uploaded`}
            </p>
            {!uploading && (
              <button
                type="button"
                onClick={() => setEntries([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {entries.map((entry, i) => (
              <div
                key={`${entry.file.name}-${i}`}
                className={`p-4 ${
                  entry.status === 'done' ? 'bg-green-50' :
                  entry.status === 'error' ? 'bg-red-50' :
                  entry.status === 'uploading' ? 'bg-blue-50' :
                  'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="mt-1 shrink-0">
                    {entry.status === 'done' && <Check className="w-4 h-4 text-green-600" />}
                    {entry.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {entry.status === 'uploading' && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {entry.status === 'pending' && <FileText className="w-4 h-4 text-gray-400" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Filename */}
                    <p className="text-sm font-medium text-gray-800 truncate" title={entry.file.name}>
                      {entry.file.name}
                    </p>

                    {entry.status === 'error' && entry.errorMsg && (
                      <p className="text-xs text-red-600">{entry.errorMsg}</p>
                    )}

                    {entry.status !== 'done' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Date */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Publish Date</label>
                          <input
                            type="date"
                            value={entry.publishDate}
                            onChange={e => updateEntry(i, { publishDate: e.target.value })}
                            disabled={uploading}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-gray-700"
                          />
                        </div>

                        {/* Title override */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Title Override</label>
                          {!entry.showTitleInput ? (
                            <button
                              type="button"
                              disabled={uploading}
                              onClick={() => updateEntry(i, { showTitleInput: true })}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                              + Override extracted title
                            </button>
                          ) : (
                            <div className="flex gap-1">
                              <input
                                type="text"
                                value={entry.customTitle}
                                onChange={e => updateEntry(i, { customTitle: e.target.value })}
                                placeholder="Custom title..."
                                maxLength={200}
                                disabled={uploading}
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                              <button
                                type="button"
                                disabled={uploading}
                                onClick={() => updateEntry(i, { showTitleInput: false, customTitle: '' })}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  {entry.status !== 'uploading' && entry.status !== 'done' && (
                    <button
                      type="button"
                      onClick={() => removeEntry(i)}
                      disabled={uploading}
                      className="shrink-0 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading...</span>
            <span>{progress} / {entries.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress / entries.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {allDone ? 'Close' : 'Cancel'}
        </button>
        {!allDone && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || pendingCount === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload {pendingCount > 0 ? `${pendingCount} PDF${pendingCount > 1 ? 's' : ''}` : ''}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkPDFUploader;
