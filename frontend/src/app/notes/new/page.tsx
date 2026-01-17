'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import SubjectSelect from '@/components/common/SubjectSelect';
import { useAuthStore } from '@/store/auth.store';
import { noteService } from '@/services/note.service';
import { FiArrowLeft, FiUpload, FiFile, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NewNotePage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    classGrade: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadAuth();
    // Set authLoading to false after auth is loaded
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [loadAuth]);

  // Refresh user data periodically to get updated verification status
  useEffect(() => {
    if (user?.role === 'teacher') {
      const interval = setInterval(() => {
        refreshUser();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, refreshUser]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      // Only teachers and admins can upload notes
      if (user?.role !== 'teacher' && user?.role !== 'admin') {
        toast.error('Only teachers can upload notes');
        router.push('/notes');
        return;
      }
    }
  }, [isAuthenticated, user, router, authLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      await noteService.createNote({
        title: formData.title,
        description: formData.description || undefined,
        subject: formData.subject || undefined,
        chapter: formData.chapter || undefined,
        classGrade: formData.classGrade || undefined,
        file: selectedFile || undefined,
      });
      toast.success('Note uploaded successfully!');
      router.push('/notes');
    } catch (error: any) {
      console.error('Failed to upload note:', error);
      toast.error(error.response?.data?.error || 'Failed to upload note');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a teacher/admin
  if (!isAuthenticated) return null;
  if (user?.role !== 'teacher' && user?.role !== 'admin') return null;

  // Check if teacher is rejected (not active)
  const isRejected = user?.role === 'teacher' && user?.isActive === false;
  const isPending = user?.role === 'teacher' && !user?.isVerified && user?.isActive !== false;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Rejection Warning for Teachers */}
      {isRejected && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  <strong>Account Rejected:</strong> Your teacher account has been rejected. You cannot upload notes or perform teacher operations. Please contact an administrator for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Verification Warning for Teachers */}
      {isPending && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Account Pending Verification:</strong> Your teacher account is pending admin approval. 
                  You will be able to upload notes once your account is verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/notes"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Notes
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Note</h1>
          <p className="text-gray-600 mb-8">Share learning materials with your students</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                placeholder="e.g., Introduction to Calculus"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 resize-none"
                placeholder="Brief description of the note content..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Subject, Chapter, Class Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-2">
                  Subject
                </label>
                <SubjectSelect
                  value={formData.subject || ''}
                  onChange={(value) => setFormData({ ...formData, subject: value })}
                  placeholder="Select or add a subject"
                />
              </div>

              <div>
                <label htmlFor="chapter" className="block text-sm font-semibold text-gray-800 mb-2">
                  Chapter
                </label>
                <input
                  type="text"
                  id="chapter"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                  placeholder="e.g., Chapter 1"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="classGrade" className="block text-sm font-semibold text-gray-800 mb-2">
                  Class/Grade
                </label>
                <input
                  type="text"
                  id="classGrade"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                  placeholder="e.g., Grade 10"
                  value={formData.classGrade}
                  onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                File (PDF, DOC, DOCX) - Optional
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                {!selectedFile ? (
                  <>
                    <input
                      type="file"
                      id="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="cursor-pointer flex flex-col items-center justify-center py-4"
                    >
                      <FiUpload className="w-10 h-10 text-gray-400 mb-3" />
                      <span className="text-sm text-gray-600 mb-1">
                        Click to upload a file (max 20MB)
                      </span>
                      <span className="text-xs text-gray-500">PDF, DOC, DOCX</span>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FiFile className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedFile.name}</div>
                        <div className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || (user?.role === 'teacher' && (!user?.isVerified || user?.isActive === false))}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiUpload className="w-5 h-5" />
                {loading ? 'Uploading...' : 
                 user?.role === 'teacher' && user?.isActive === false ? 'Account Rejected' :
                 user?.role === 'teacher' && !user?.isVerified ? 'Verification Required' : 
                 'Upload Note'}
              </button>
              <Link
                href="/notes"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

