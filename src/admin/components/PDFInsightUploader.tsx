import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Calendar, FileText, Image, AlertCircle, Check } from 'lucide-react';
import { authService } from '../services/authService';
import { insightsService, type InsightSection } from '../services/insightsService';
import { SECTION_CONFIG } from '../sections';

interface PDFInsightUploaderProps {
  onUploadSuccess?: (insight: any) => void;
  onUploadError?: (error: string) => void;
  initialCategories?: string[];
  section?: InsightSection;
}

const buildCategoryOptions = (defaults: string[], categories: string[] = []) => {
  return Array.from(
    new Set(
      [...defaults, ...categories]
        .map(category => category.trim())
        .filter(Boolean)
    )
  );
};

const PDFInsightUploader: React.FC<PDFInsightUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  initialCategories = [],
  section = 'insight',
}) => {
  const sectionConfig = SECTION_CONFIG[section];
  const DEFAULT_CATEGORIES = sectionConfig.defaultCategories;
  const [categoryOptions, setCategoryOptions] = useState<string[]>(() => buildCategoryOptions(DEFAULT_CATEGORIES, initialCategories));
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<{
    title?: string;
    excerpt?: string;
  } | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showCustomTitleInput, setShowCustomTitleInput] = useState(false);

  useEffect(() => {
    setCategoryOptions((currentOptions) => buildCategoryOptions(DEFAULT_CATEGORIES, [...currentOptions, ...initialCategories]));
  }, [initialCategories]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        onUploadError?.('Please select a PDF file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        onUploadError?.('Please select a PDF file');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        // Clear URL if file is selected
        setFeaturedImage('');
      } else {
        onUploadError?.('Please select an image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfFile) {
      onUploadError?.('Please select a PDF file');
      return;
    }

    // Debug auth state
    const isAuth = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    console.log('Auth Debug:', { isAuth, user, hasToken: !!token });
    
    if (!isAuth || !token) {
      onUploadError?.('You must be logged in to upload PDFs. Please refresh and log in again.');
      return;
    }

    const trimmedCustomCategory = customCategory.trim();
    const selectedCategory = showCustomCategory && trimmedCustomCategory ? trimmedCustomCategory : category;

    if (!selectedCategory) {
      onUploadError?.('Please select or add a category');
      return;
    }

    if (showCustomCategory && trimmedCustomCategory) {
      setCategoryOptions((currentOptions) => buildCategoryOptions(DEFAULT_CATEGORIES, [...currentOptions, trimmedCustomCategory]));
      setCategory(trimmedCustomCategory);
      setShowCustomCategory(false);
      setCustomCategory('');
    }

    setLoading(true);
    
    try {
      if (section === 'legislation' && !(await insightsService.isLegislationSupported())) {
        throw new Error('The server is running an older version that does not support Legislation yet, so this upload was blocked to avoid publishing it under Insights. Deploy the latest backend and try again.');
      }

      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('category', selectedCategory);
      formData.append('section', section);
      formData.append('publishDate', publishDate);
      
      // Include custom title if provided
      if (customTitle.trim()) {
        formData.append('customTitle', customTitle.trim());
      }

      // Include description if provided (otherwise the server auto-generates one)
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      
      // Handle image - either file upload or URL
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (featuredImage.trim()) {
        formData.append('featuredImage', featuredImage.trim());
      }

      // API URL configuration
      const apiUrl = import.meta.env.VITE_API_URL || 'https://uabc-pkg3.onrender.com/api';
      
      console.log('Uploading to:', `${apiUrl}/pdf-insights/upload`);
      
      const token = authService.getToken();

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Starting PDF upload...');
      console.log('- File:', pdfFile.name, `(${formatFileSize(pdfFile.size)})`);
      console.log('- Has image:', imageFile ? imageFile.name : featuredImage || 'default');
      console.log('- Auth token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${apiUrl}/pdf-insights/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it for FormData with boundary
        },
        body: formData,
      });

      console.log('Upload response status:', response.status, response.statusText);

      let result;
      try {
        result = await response.json();
        console.log('Upload result:', result);
      } catch (jsonError) {
        // If JSON parsing fails, get the raw text to see what the server returned
        const textResponse = await response.text();
        console.error('Server returned non-JSON response:', textResponse);
        throw new Error(`Server error: ${response.status} - ${textResponse.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(result.message || `Upload failed with status ${response.status}`);
      }

      console.log('✅ PDF uploaded successfully:', result.data?.title);

      // Reset form
      setPdfFile(null);
      setFeaturedImage('');
      setImageFile(null);
      setImageMode('url');
      setPublishDate(new Date().toISOString().split('T')[0]);
      setCategory(selectedCategory);
      setCustomCategory('');
      setShowCustomCategory(false);
      setCustomTitle('');
      setDescription('');
      setShowCustomTitleInput(false);
      setPreview(null);

      onUploadSuccess?.(result.data);
    } catch (error) {
      console.error('❌ Upload error:', error);
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload PDF {sectionConfig.label}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {section === 'legislation'
              ? 'Upload a legislation PDF to publish it on the Legislation page'
              : 'Upload a PDF document to create a new insight with automatic metadata extraction'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PDF Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              PDF Document *
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : pdfFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              
              {pdfFile ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(pdfFile.size)} • PDF Document
                  </p>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Choose a PDF file
                    </label>
                    <p className="text-gray-500"> or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Title Field */}
          {pdfFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <label className="block text-sm font-medium text-gray-700">
                PDF Title (optional)
              </label>
              <p className="text-xs text-gray-600 mb-3">
                The title will be automatically extracted from the PDF. You can override it here if needed.
              </p>
              {!showCustomTitleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomTitleInput(true)}
                  className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                >
                  + Override extracted title
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title for this PDF..."
                    maxLength={200}
                    className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    {customTitle.length}/200 characters
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomTitleInput(false);
                        setCustomTitle('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Description Field */}
          {pdfFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <p className="text-xs text-gray-600">
                Shown below this PDF on the website. Leave blank to use a summary generated from the PDF. You can edit it any time later.
              </p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description for this PDF..."
                maxLength={500}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">{description.length}/500 characters</p>
            </motion.div>
          )}

          {/* Featured Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Featured Image
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setImageMode('url');
                    setImageFile(null);
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    imageMode === 'url'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageMode('upload');
                    setFeaturedImage('');
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    imageMode === 'upload'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {imageMode === 'url' ? (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="featuredImage"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://example.com/image.jpg (optional)"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter a URL to an image for the insight card
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="sr-only"
                    />
                  </label>
                  {imageFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{imageFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload an image file (JPG, PNG, GIF, WebP)
                </p>
                {imageFile && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="h-20 w-32 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">
              Publish Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
              />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <div className="flex gap-2">
              <select
                id="category"
                value={showCustomCategory ? '' : category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={showCustomCategory}
                required={!showCustomCategory}
                className="block flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => {
                  setShowCustomCategory(!showCustomCategory);
                  if (showCustomCategory) {
                    setCustomCategory('');
                    setCategory(categoryOptions[0] || DEFAULT_CATEGORIES[0]);
                  }
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showCustomCategory
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showCustomCategory ? 'Cancel' : '+ New'}
              </button>
            </div>
            
            {showCustomCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </motion.div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-1">Automatic Processing</h4>
                <p>
                  The PDF will be automatically processed to extract the title and generate an excerpt. 
                  The document will be stored securely and made available for download by readers.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || !pdfFile}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                loading || !pdfFile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing PDF...
                </div>
              ) : (
                `Upload ${sectionConfig.tabLabel}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFInsightUploader;