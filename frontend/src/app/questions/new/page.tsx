'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import SubjectSelect from '@/components/common/SubjectSelect';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiX, FiImage } from 'react-icons/fi';

export default function NewQuestionPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth, isLoading: authLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    category: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== 'student') {
      router.push('/questions');
    }
  }, [isAuthenticated, user, router, authLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await questionService.createQuestion({
        ...formData,
        images: images.length > 0 ? images : undefined,
      });
      toast.success('Question posted successfully!');
      router.push('/questions');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isAuthenticated || user?.role !== 'student') return null;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/questions"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Questions
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ask a Question</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                Question Title *
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                placeholder="What is your question about?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                required
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 resize-none"
                placeholder="Provide details about your question. You can use markdown formatting."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="mt-2 text-sm text-gray-500">Markdown is supported</p>
            </div>

            {/* Subject and Category */}
            <div className="grid md:grid-cols-2 gap-4">
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
                <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                  placeholder="e.g., Algebra, Calculus"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Attach Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload images (max 5)
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </span>
                </label>
              </div>

              {/* Preview Images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting Question...' : 'Post Question'}
              </button>
              <Link
                href="/questions"
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
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

