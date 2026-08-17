import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, ArrowLeft, Upload, X, FileText, Calendar, Tag, Globe } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { insightsService, CreateInsightData, Insight } from '../services/insightsService';

const categories = [
  'Technology',
  'Business',
  'Innovation',
  'Industry',
  'Research',
  'Analysis'
];

export const InsightEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== 'new';

  const [formData, setFormData] = useState<CreateInsightData>({
    category: 'Technology',
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    featured: false,
    published: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfInsight, setPdfInsight] = useState<any>(null);
  const [pdfEditData, setPdfEditData] = useState({
    title: '',
    image: '',
    category: '',
    publishDate: ''
  });

  useEffect(() => {
    if (isEdit) {
      loadInsight();
    }
  }, [id, isEdit]);

  const loadInsight = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const insight = await insightsService.getInsight(id, true);

      if (!insight) return;

      if (insight.pdfUrl) {
        // This is a PDF insight - show PDF details UI
        setPdfInsight(insight);
        setPdfEditData({
          title: insight.title || '',
          image: insight.featuredImage || '',
          category: insight.category || 'Technology',
          publishDate: insight.publishDate
            ? new Date(insight.publishDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        });
        return;
      }

      setFormData({
        category: insight.category,
        title: insight.title,
        excerpt: insight.excerpt,
        content: insight.content || '',
        image: insight.image || insight.featuredImage || '',
        author: insight.author,
        featured: insight.featured,
        published: insight.published
      });
    } catch (error) {
      console.error('Failed to load insight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      if (isEdit && id) {
        const res = await insightsService.updateInsight(id, formData);
        if (!res.success) {
          alert(res.message || 'Failed to update insight');
          return;
        }
      } else {
        const res = await insightsService.createInsight(formData);
        if (!res.success) {
          alert(res.message || 'Failed to create insight');
          return;
        }
      }
      navigate('/admin');
    } catch (error) {
      console.error('Failed to save insight:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handlePdfEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPdfEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSavePdfEdit = async () => {
    if (!id || !pdfInsight) return;

    if (!pdfEditData.title.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      setSaving(true);

      const res = await insightsService.updateInsight(id, {
        title: pdfEditData.title.trim(),
        category: pdfEditData.category,
        publishDate: new Date(pdfEditData.publishDate).toISOString(),
        featuredImage: pdfEditData.image || undefined
      });

      if (res.success) {
        alert('PDF insight updated successfully!');
        navigate('/admin');
      } else {
        alert(res.message || 'Failed to update PDF insight');
      }
    } catch (error) {
      console.error('Failed to save PDF insight:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfEditData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  // If this is a PDF insight, show PDF details UI
  if (pdfInsight) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://uabc-backend.onrender.com/api';
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Edit PDF Insight
                  </h1>
                </div>
              </div>
              <button
                onClick={handleSavePdfEdit}
                disabled={saving}
                className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pdfEditData.title || pdfInsight.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  PDF Document
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Editable Fields */}
              <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-accent-200 dark:border-accent-900">
                <div className="mb-4">
                  <p className="text-sm font-medium text-accent-600 dark:text-accent-400 mb-3">
                    ✏️ Editable Fields
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={pdfEditData.title}
                    onChange={handlePdfEditChange}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Insight title..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category
                  </label>
                  <select
                    name="category"
                    value={pdfEditData.category}
                    onChange={handlePdfEditChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Publish Date
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={pdfEditData.publishDate}
                    onChange={handlePdfEditChange}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Image (for preview card)
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="url"
                      name="image"
                      value={pdfEditData.image}
                      onChange={handlePdfEditChange}
                      placeholder="Image URL or upload file..."
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePdfImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 h-full"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                    </div>
                  </div>
                  {pdfEditData.image && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={pdfEditData.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setPdfEditData(prev => ({ ...prev, image: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Read-only Fields */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  📄 Document Information (Read-only)
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Status
                    </div>
                    <p className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      pdfInsight.published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {pdfInsight.published ? 'Published' : 'Draft'}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      File Name
                    </div>
                    <p className="text-slate-900 dark:text-white font-mono text-sm bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded">
                      {pdfInsight.pdfOriginalFilename || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      File Size
                    </div>
                    <p className="text-slate-900 dark:text-white">
                      {pdfInsight.pdfSize ? (pdfInsight.pdfSize / 1024).toFixed(2) + ' KB' : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Document ID
                    </div>
                    <p className="text-slate-900 dark:text-white font-mono text-xs bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded truncate">
                      {pdfInsight._id || pdfInsight.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Note:</strong> You can edit the title, category, publish date, and preview image. To update the PDF content itself, delete this insight and re-upload a new PDF file.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.open(`${apiUrl}/pdf-insights/${pdfInsight._id || pdfInsight.id}/pdf`, '_blank')}
                    className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View PDF
                  </button>
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isEdit ? 'Edit Insight' : 'New Insight'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="submit"
                form="insight-form"
                disabled={saving}
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
          {/* Editor */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <form id="insight-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Enter insight title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Author name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
                  placeholder="Brief description of the insight..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Featured Image
                </label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                    placeholder="Image URL or upload file..."
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                </div>
                {formData.image && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={20}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent font-mono text-sm"
                  placeholder="Write your content in HTML format..."
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Supports HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                </p>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-accent-600 border-slate-300 rounded focus:ring-accent-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Featured insight
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="published"
                    id="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-accent-600 border-slate-300 rounded focus:ring-accent-500"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    Publish immediately
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Preview</h3>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent-100 text-accent-800 text-xs rounded">
                      {formData.category}
                    </span>
                    {formData.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {formData.title || 'Insight Title'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {formData.excerpt || 'Insight excerpt will appear here...'}
                  </p>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: formData.content || '<p>Content will appear here...</p>' }} />
                  </div>
                  {formData.author && (
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        By {formData.author}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};