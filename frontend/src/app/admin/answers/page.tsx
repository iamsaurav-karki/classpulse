'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Answer } from '@/types/answer';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminAnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAnswers();
  }, [search]);

  const loadAnswers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnswers({ search: search || undefined, limit: 50 });
      setAnswers(data);
    } catch (error) {
      console.error('Failed to load answers:', error);
      toast.error('Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ id, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      await adminService.deleteAnswer(deleteConfirm.id);
      toast.success('Answer deleted');
      loadAnswers();
      setDeleteConfirm({ id: null, isOpen: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete answer');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Answer Moderation</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage and moderate all answers</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search answers..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          Loading answers...
        </div>
      ) : answers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          No answers found
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <Link
                      href={`/questions/${answer.questionId}`}
                      className="text-xs sm:text-sm text-green-600 hover:underline"
                    >
                      View Question
                    </Link>
                    {answer.isAccepted && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        Accepted
                      </span>
                    )}
                    {answer.isPinned && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 line-clamp-3">{answer.content}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{answer.authorName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{answer.upvotes} upvotes</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{answer.downvotes} downvotes</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(answer.id)}
                  className="w-full sm:w-auto px-4 py-2 sm:p-2 text-red-600 border border-red-300 sm:border-0 sm:hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 sm:gap-0"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="sm:hidden">Delete Answer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ id: null, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isDeleting}
      />
    </div>
  );
}

