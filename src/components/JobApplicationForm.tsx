import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, Mail, Phone, User, Upload, FileText } from 'lucide-react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { getApiUrl } from '../config/apiConfig';

// Errors from the resume upload step; their message is safe to show to the applicant.
class ResumeUploadError extends Error {}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

/**
 * Job Application Form Component
 * Uploads the resume to our backend (R2) and sends the application via EmailJS with a link to it
 */
export const JobApplicationForm: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus>({ type: 'idle', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setFormStatus({
          type: 'error',
          message: 'Please upload a PDF file only.'
        });
        setResumeFile(null);
        setResumeFileName('');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormStatus({
          type: 'error',
          message: 'File size should be less than 5MB.'
        });
        setResumeFile(null);
        setResumeFileName('');
        return;
      }

      setResumeFile(file);
      setResumeFileName(file.name);
      setFormStatus({ type: 'idle', message: '' });
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send application via EmailJS
  const sendApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !resumeFile) {
      setFormStatus({
        type: 'error',
        message: 'Please fill in all required fields and upload your resume.'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    // Validate phone format (basic)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 7) {
      setFormStatus({
        type: 'error',
        message: 'Please enter a valid phone number.'
      });
      return;
    }

    setFormStatus({ type: 'loading', message: 'Uploading resume...' });

    try {
      // Upload the resume to our own storage; the response is used to build a
      // permanent link that goes into the email to HR.
      const apiUrl = getApiUrl();
      const uploadData = new FormData();
      uploadData.append('resume', resumeFile);

      let uploadResponse: Response;
      try {
        uploadResponse = await fetch(`${apiUrl}/applications/resume`, {
          method: 'POST',
          body: uploadData,
        });
      } catch {
        throw new ResumeUploadError('Could not upload your resume. Please check your connection and try again.');
      }

      const uploadResult = await uploadResponse.json().catch(() => null);
      if (!uploadResponse.ok || !uploadResult?.success) {
        throw new ResumeUploadError(uploadResult?.message || 'Failed to upload your resume. Please try again.');
      }

      const { token, filename } = uploadResult.data;
      const resumeUrl = `${apiUrl}/applications/resume/${token}/${encodeURIComponent(filename)}`;

      setFormStatus({ type: 'loading', message: 'Sending your application...' });

      // Send email using EmailJS with resume URL
      const emailData = {
        applicant_name: formData.name,
        applicant_email: formData.email,
        applicant_phone: formData.phone,
        resume_filename: resumeFileName,
        resume_url: resumeUrl,
      };
      console.log('📧 Sending to EmailJS with data:', emailData);

      await emailjs.send(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAIL_APPLICATION_TEMPLATE_ID,
        emailData,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY
      );

      // Success
      toast.success('Application submitted successfully! We\'ll review your resume soon.');
      setFormStatus({
        type: 'success',
        message: 'Application submitted successfully! We\'ll review your resume and get back to you soon.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
      handleRemoveFile();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ type: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Upload/Email Error:', error);
      const uploadMessage = error instanceof ResumeUploadError ? error.message : '';
      toast.error(uploadMessage || 'Failed to submit application. Please try again.');
      setFormStatus({
        type: 'error',
        message: uploadMessage || 'Failed to submit application. Please try again or contact us directly.'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Apply for an Opportunity
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Submit your resume and let us know more about you. We'd love to hear from you!
          </p>
        </div>

        {/* Status Messages */}
        {formStatus.type !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 sm:p-5 rounded-lg flex items-start gap-3 ${
              formStatus.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : formStatus.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}
          >
            {formStatus.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            )}
            {formStatus.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            {formStatus.type === 'loading' && (
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 animate-spin" />
            )}
            <p
              className={`text-sm sm:text-base ${
                formStatus.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : formStatus.type === 'error'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}
            >
              {formStatus.message}
            </p>
          </motion.div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={sendApplication} className="space-y-5 sm:space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume (PDF) <span className="text-red-500">*</span>
              </span>
            </label>
            
            {!resumeFile ? (
              <label className="w-full px-4 py-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <div className="text-center">
                  <p className="font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">PDF file (max 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
              </label>
            ) : (
              <div className="w-full px-4 py-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-grow">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{resumeFileName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={formStatus.type === 'loading'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-6 py-3 sm:py-4 font-bold text-white rounded-lg text-base sm:text-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              formStatus.type === 'loading'
                ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            }`}
          >
            {formStatus.type === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </motion.button>

          {/* Required Fields Note */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
            <span className="text-red-500">*</span> Indicates required fields
          </p>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            We respect your privacy. Your information will only be used for recruitment purposes.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
