'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Question } from '@/types/question';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { FiLock, FiUnlock, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [search]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getQuestions({ search: search || undefined, limit: 50 });
      setQuestions(data);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
      await adminService.lockQuestion(id);
      toast.success('Question locked');
      loadQuestions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to lock question');
    }
  };

  const handleUnlock = async (id: string) => {
    try {
      await adminService.unlockQuestion(id);
      toast.success('Question unlocked');
      loadQuestions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to unlock question');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ id, isOpen: true });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setIsDeleting(true);
    try {
      await adminService.deleteQuestion(deleteConfirm.id);
      toast.success('Question deleted');
      loadQuestions();
      setDeleteConfirm({ id: null, isOpen: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Question Moderation</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage and moderate all questions</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          No questions found
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 ${
                question.isLocked ? 'border-red-300 bg-red-50/30' : 'border-gray-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <Link
                      href={`/questions/${question.id}`}
                      className="text-base sm:text-lg font-semibold text-gray-900 hover:text-green-600 line-clamp-2"
                    >
                      {question.title}
                    </Link>
                    {question.isLocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold flex-shrink-0">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">{question.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{question.authorName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{question.views} views</span>
                    {question.subject && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {question.subject}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {question.isLocked ? (
                    <button
                      onClick={() => handleUnlock(question.id)}
                      className="flex-1 sm:flex-none px-3 sm:p-2 text-green-600 border border-green-300 sm:border-0 sm:hover:bg-green-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 sm:gap-0"
                      title="Unlock"
                    >
                      <FiUnlock className="w-4 h-4" />
                      <span className="sm:hidden">Unlock</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLock(question.id)}
                      className="flex-1 sm:flex-none px-3 sm:p-2 text-orange-600 border border-orange-300 sm:border-0 sm:hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 sm:gap-0"
                      title="Lock"
                    >
                      <FiLock className="w-4 h-4" />
                      <span className="sm:hidden">Lock</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="flex-1 sm:flex-none px-3 sm:p-2 text-red-600 border border-red-300 sm:border-0 sm:hover:bg-red-50 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 sm:gap-0"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ id: null, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isDeleting}
      />
    </div>
  );
}

