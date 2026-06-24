import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Trash2, Star, Globe, Clock, LogOut, Upload, CheckSquare, Square } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { insightsService, Insight } from '../services/insightsService';
import { authService } from '../services/authService';
import { AdminSetup } from '../components/AdminSetup';
import PDFInsightUploader from '../components/PDFInsightUploader';
import BulkPDFUploader from '../components/BulkPDFUploader';
import { getApiUrl } from '../../config/apiConfig';

export const AdminDashboard = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'drafts'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploader, setShowUploader] = useState(false);
  const [showBulkUploader, setShowBulkUploader] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsService.getAllInsights();
      setInsights(data.insights || []); // Extract insights array from response
      setAuthError(null);
    } catch (error) {
      console.error('Failed to load insights:', error);
      const message = error instanceof Error ? error.message : 'Failed to load insights';
      setAuthError(message);
      if (message === 'Insufficient permissions') {
        try {
          const pub = await insightsService.getPublicInsights({ limit: 20 });
          setInsights(pub.insights || []);
        } catch (e) {
          setInsights([]);
        }
      } else {
        setInsights([]); // Set empty array on other errors
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleTogglePublished = async (id: string) => {
    setTogglingId(id);
    try {
      console.log('🔄 Toggling published status for:', id);
      const result = await insightsService.togglePublished(id);
      if (!result.success) {
        setErrorMessage(result.message || 'Failed to toggle published status');
        setTimeout(() => setErrorMessage(null), 3000);
      } else {
        console.log('✅ Toggle successful:', result.message);
        await loadInsights(); // Wait for reload to complete
      }
    } catch (error) {
      console.error('Failed to toggle published status:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to toggle published status';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    setTogglingId(id);
    try {
      console.log('⭐ Toggling featured status for:', id);
      const result = await insightsService.toggleFeatured(id);
      if (!result.success) {
        setErrorMessage(result.message || 'Failed to toggle featured status');
        setTimeout(() => setErrorMessage(null), 3000);
      } else {
        console.log('✅ Toggle successful:', result.message);
        await loadInsights(); // Wait for reload to complete
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to toggle featured status';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, isPDF: boolean = false) => {
    if (window.confirm('Are you sure you want to delete this insight? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        if (isPDF) {
          // Delete PDF insight
          const apiUrl = getApiUrl();
          const token = authService.getToken();
          
          if (!token) {
            throw new Error('Authentication token not found. Please log in again.');
          }
          
          const response = await fetch(`${apiUrl}/pdf-insights/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            // Parse error response for more details
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete PDF insight');
          }
        } else {
          // Delete regular insight
          const result = await insightsService.deleteInsight(id);
          if (!result.success) {
            throw new Error(result.message || 'Failed to delete insight');
          }
        }
        
        setSuccessMessage('Insight deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Update UI immediately by removing the deleted insight
        setInsights(insights.filter(insight => (insight._id || insight.id) !== id));
      } catch (error) {
        console.error('Failed to delete insight:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to delete insight. Please try again.';
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(null), 5000);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const toggleSelectInsight = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedInsights.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedInsights.map(i => i._id || i.id || '')));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} insight${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;

    setBulkDeleting(true);
    const apiUrl = getApiUrl();
    const token = authService.getToken();
    const errors: string[] = [];

    for (const id of selectedIds) {
      const insight = insights.find(i => (i._id || i.id) === id);
      const isPDF = !!insight?.pdfUrl;
      try {
        if (isPDF) {
          const response = await fetch(`${apiUrl}/pdf-insights/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Delete failed');
          }
        } else {
          const result = await insightsService.deleteInsight(id);
          if (!result.success) throw new Error(result.message || 'Delete failed');
        }
      } catch (e) {
        errors.push(id);
      }
    }

    if (errors.length === 0) {
      setSuccessMessage(`${selectedIds.size} insight${selectedIds.size > 1 ? 's' : ''} deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(`${errors.length} deletion${errors.length > 1 ? 's' : ''} failed. Please try again.`);
      setTimeout(() => setErrorMessage(null), 5000);
    }

    setSelectedIds(new Set());
    setIsSelecting(false);
    setBulkDeleting(false);
    await loadInsights();
  };

  const handleUploadSuccess = (insight: any) => {
    setSuccessMessage(`PDF insight "${insight.title}" uploaded successfully!`);
    setShowUploader(false);
    loadInsights();
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    // Clear error message after 5 seconds
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const handleViewPDF = async (id: string) => {
    // Find the insight with the matching ID
    const insight = insights.find(i => (i._id || i.id) === id);
    if (insight && (insight.pdfUrl || insight.pdfFilename)) {
      try {
        const pdfUrl = await insightsService.getPdfViewerUrl(id);
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'PDF URL not found';
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } else {
      setErrorMessage('PDF not found');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleEditPDF = (insight: any) => {
    // Navigate to edit page which will show proper PDF editing interface
    const id = insight._id || insight.id;
    window.location.href = `/admin/insights/${id}/edit`;
  };

  const ITEMS_PER_PAGE = 20;

  const filteredInsights = insights.filter(insight => {
    // Filter by status tab
    const statusMatch = selectedTab === 'all' || 
      (selectedTab === 'published' && insight.published) ||
      (selectedTab === 'drafts' && !insight.published);
    
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || insight.category === selectedCategory;
    
    return statusMatch && categoryMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredInsights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedInsights = filteredInsights.slice(startIndex, endIndex);

  // Extract unique categories from insights
  const categories = ['all', ...Array.from(new Set(insights.map(i => i.category).filter(Boolean)))];

  const stats = {
    total: insights.length,
    published: insights.filter(i => i.published).length,
    drafts: insights.filter(i => !i.published).length,
    featured: insights.filter(i => i.featured).length
  };

  // Inline setup flow if needed
  if (showSetup) {
    return (
      <AdminSetup onSetupComplete={() => {
        setShowSetup(false);
        loadInsights();
      }} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Insights CMS</h1>
              <p className="text-slate-600 dark:text-slate-400">Welcome back, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsSelecting(s => !s);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isSelecting
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                {isSelecting ? 'Cancel' : 'Select'}
              </button>
              <button
                onClick={() => setShowBulkUploader(true)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowUploader(true)}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload PDF
              </button>
              <a
                href="/admin/insights/new"
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manual Entry
              </a>
              <button
                onClick={logout}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
          >
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600"
          >
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </motion.div>
        )}

        {/* PDF Uploader Modal */}
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload PDF Insight</h2>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
              <PDFInsightUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                initialCategories={categories.filter(category => category !== 'all')}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Bulk PDF Uploader Modal */}
        {showBulkUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Bulk Upload PDFs</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Upload multiple PDFs at once with individual titles and dates</p>
                </div>
                <button
                  onClick={() => setShowBulkUploader(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
              <BulkPDFUploader
                initialCategories={categories.filter(c => c !== 'all')}
                onCancel={() => setShowBulkUploader(false)}
                onComplete={(successCount, errorCount) => {
                  if (successCount > 0) {
                    setSuccessMessage(`${successCount} PDF${successCount > 1 ? 's' : ''} uploaded successfully!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
                    setTimeout(() => setSuccessMessage(null), 5000);
                    loadInsights();
                  }
                  if (errorCount > 0 && successCount === 0) {
                    setErrorMessage(`All ${errorCount} uploads failed. Please try again.`);
                    setTimeout(() => setErrorMessage(null), 5000);
                  }
                  if (successCount > 0) setShowBulkUploader(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Permission notice */}
        {authError === 'Insufficient permissions' && (
          <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600">
            <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
              Admin or Editor access required
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
              You are logged in as <span className="font-semibold">{user?.role}</span>. To access the admin insights, you need an account with the <span className="font-semibold">admin</span> or <span className="font-semibold">editor</span> role.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors"
              >
                Create Admin User
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Insights', value: stats.total, color: 'bg-blue-500' },
            { label: 'Published', value: stats.published, color: 'bg-green-500' },
            { label: 'Drafts', value: stats.drafts, color: 'bg-yellow-500' },
            { label: 'Featured', value: stats.featured, color: 'bg-purple-500' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-20`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'published', label: 'Published' },
              { key: 'drafts', label: 'Drafts' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedTab(tab.key as any);
                  setCurrentPage(1); // Reset to first page
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTab === tab.key
                    ? 'bg-accent-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <label htmlFor="category-select" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1); // Reset to first page
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Pagination Info */}
          {filteredInsights.length > 0 && (
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredInsights.length)} of {filteredInsights.length}
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-accent-600 text-white'
                              : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk action bar */}
        {isSelecting && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-5 py-3 shadow-sm mb-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {selectedIds.size === paginatedInsights.length && paginatedInsights.length > 0
                  ? <CheckSquare className="w-4 h-4 text-accent-600" />
                  : <Square className="w-4 h-4" />
                }
                {selectedIds.size === paginatedInsights.length && paginatedInsights.length > 0
                  ? 'Deselect all'
                  : 'Select all on page'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedIds.size} selected
                </span>
              )}
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || bulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {bulkDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {bulkDeleting ? 'Deleting...' : `Delete${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
        )}

        {/* Insights List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm transition-colors ${
                  isSelecting && selectedIds.has(insight._id || insight.id || '') ? 'ring-2 ring-accent-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  {isSelecting && (
                    <button
                      className="mr-4 mt-1 flex-shrink-0"
                      onClick={() => toggleSelectInsight(insight._id || insight.id || '')}
                    >
                      {selectedIds.has(insight._id || insight.id || '')
                        ? <CheckSquare className="w-5 h-5 text-accent-600" />
                        : <Square className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                      }
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {insight.title}
                      </h3>
                      {(insight.pdfUrl || insight.pdfFilename) && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          📄 PDF
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.category === 'Market Analysis' ? 'bg-blue-100 text-blue-800' :
                        insight.category === 'Technology' ? 'bg-green-100 text-green-800' :
                        insight.category === 'Regulatory' ? 'bg-purple-100 text-purple-800' :
                        insight.category === 'Risk Management' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.category}
                      </span>
                      {insight.featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {insight.published ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Globe className="w-4 h-4" />
                          <span className="text-xs">Published</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Draft</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                      {insight.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>By {insight.author}</span>
                      {insight.readTime && <span>{insight.readTime} min read</span>}
                      {insight.views && <span>{insight.views} views</span>}
                      <span>{new Date(insight.publishDate || insight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {(insight.pdfUrl || insight.pdfFilename) ? (
                      // PDF insight actions
                      <>
                        <button
                          onClick={() => handleViewPDF(insight._id || insight.id || '')}
                          disabled={deletingId === (insight._id || insight.id)}
                          className="p-2 text-slate-400 hover:text-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(insight._id || insight.id || '')}
                          disabled={deletingId === (insight._id || insight.id) || togglingId === (insight._id || insight.id)}
                          className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            insight.featured 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-slate-400 hover:text-yellow-500'
                          }`}
                          title="Toggle Featured"
                        >
                          {togglingId === (insight._id || insight.id) ? (
                            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Star className={`w-4 h-4 ${insight.featured ? 'fill-current' : ''}`} />
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePublished(insight._id || insight.id || '')}
                          disabled={deletingId === (insight._id || insight.id) || togglingId === (insight._id || insight.id)}
                          className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            insight.published 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-slate-400 hover:text-green-600'
                          }`}
                          title={insight.published ? 'Unpublish' : 'Publish'}
                        >
                          {togglingId === (insight._id || insight.id) ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(insight._id || insight.id || '', true)}
                          disabled={deletingId === (insight._id || insight.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === (insight._id || insight.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      // Regular insight actions
                      <>
                        <a
                          href={`/admin/insights/${insight.id}/preview`}
                          className="p-2 text-slate-400 hover:text-accent-600 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={`/admin/insights/${insight.id}/edit`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleToggleFeatured(insight.id || '')}
                          disabled={deletingId === insight.id || togglingId === insight.id}
                          className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            insight.featured 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-slate-400 hover:text-yellow-500'
                          }`}
                          title="Toggle Featured"
                        >
                          {togglingId === insight.id ? (
                            <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Star className={`w-4 h-4 ${insight.featured ? 'fill-current' : ''}`} />
                          )}
                        </button>
                        <button
                          onClick={() => handleTogglePublished(insight.id || '')}
                          disabled={deletingId === insight.id || togglingId === insight.id}
                          className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            insight.published 
                              ? 'text-green-600 hover:text-green-700' 
                              : 'text-slate-400 hover:text-green-600'
                          }`}
                          title={insight.published ? 'Unpublish' : 'Publish'}
                        >
                          {togglingId === insight.id ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(insight.id || '', false)}
                          disabled={deletingId === insight.id}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingId === insight.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredInsights.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedTab === 'all' ? 'No insights found' : 
                   selectedTab === 'published' ? 'No published insights' : 'No drafts found'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};