'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import { Question } from '@/types/question';
import { formatDistanceToNow } from 'date-fns';
import { FiPlus, FiSearch, FiFilter, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';
import SubjectFilter from '@/components/common/SubjectFilter';

export default function QuestionsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSolved, setFilterSolved] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  } | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadQuestions();
  }, [isAuthenticated, router, filterSubject, filterSolved, currentPage]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        limit: itemsPerPage,
        offset,
        search: searchQuery || undefined,
        subject: filterSubject || undefined,
        isSolved: filterSolved,
      };
      const result = await questionService.getQuestions(filters);
      setQuestions(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    loadQuestions();
  };

  // Teachers should not see "Ask Question" button - they can post sample questions instead
  const canAskQuestion = user?.role === 'student';

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Questions & Answers
          </h1>
          <p className="text-gray-600 text-lg">
            {user?.role === 'teacher' 
              ? 'Browse student questions and help them learn' 
              : 'Ask questions, get answers, and learn together'}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions by title, description, or author..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-3">
              <SubjectFilter
                value={filterSubject}
                onChange={(value) => {
                  setFilterSubject(value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
              />
              <select
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={filterSolved === undefined ? '' : filterSolved ? 'solved' : 'unsolved'}
                onChange={(e) => {
                  if (e.target.value === '') setFilterSolved(undefined);
                  else setFilterSolved(e.target.value === 'solved');
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <option value="">All Questions</option>
                <option value="unsolved">Unsolved</option>
                <option value="solved">Solved</option>
              </select>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
              >
                <FiSearch className="w-5 h-5" />
                Search
              </button>
              {canAskQuestion && (
                <Link
                  href="/questions/new"
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                >
                  <FiPlus className="w-5 h-5" />
                  Ask Question
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Teacher Notice */}
        {user?.role === 'teacher' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
            <p className="text-blue-800">
              <strong>Note:</strong> As a teacher, you can answer student questions and post sample questions for practice. 
              For regular academic questions, please use the support ticket system.
            </p>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-4">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
              <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No questions found.</p>
              {canAskQuestion && (
                <Link
                  href="/questions/new"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  Ask Your First Question
                </Link>
              )}
            </div>
          ) : (
            questions.map((question) => (
              <Link
                key={question.id}
                href={`/questions/${question.id}`}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-green-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors">
                        {question.title}
                      </h3>
                      {question.isSolved && (
                        <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="font-medium">{question.authorName}</span>
                      <span>•</span>
                      <span>{question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 'Recently'}</span>
                      {question.subject && (
                        <>
                          <span>•</span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            {question.subject}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right text-sm">
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <FiTrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{question.answerCount || 0}</span>
                    </div>
                    <div className="text-gray-500">{question.views} views</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

