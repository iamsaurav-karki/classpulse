'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { supportService } from '@/services/support.service';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiHelpCircle, FiBook, FiSettings, FiTool } from 'react-icons/fi';

export default function NewSupportTicketPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth, isLoading: authLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketType: 'academic' as 'academic' | 'platform' | 'technical',
  });
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
      router.push('/support');
    }
  }, [isAuthenticated, user, router, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supportService.createTicket(formData);
      toast.success('Support ticket created successfully!');
      router.push('/support');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create support ticket');
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

  const ticketTypes = [
    {
      value: 'academic',
      label: 'Academic',
      description: 'Questions about course content, assignments, or grades',
      icon: FiBook,
      color: 'bg-green-600',
    },
    {
      value: 'platform',
      label: 'Platform',
      description: 'Issues with using the ClassPulse platform',
      icon: FiSettings,
      color: 'bg-green-600',
    },
    {
      value: 'technical',
      label: 'Technical',
      description: 'Technical problems, bugs, or errors',
      icon: FiTool,
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/support"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Support
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Support Ticket</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                Ticket Type *
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {ticketTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ticketType: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.ticketType === type.value
                          ? `border-green-500 bg-green-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                placeholder="Brief description of your issue"
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
                placeholder="Provide detailed information about your issue or question..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Ticket...' : 'Create Ticket'}
              </button>
              <Link
                href="/support"
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

