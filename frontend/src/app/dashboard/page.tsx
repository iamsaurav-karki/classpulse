'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { questionService } from '@/services/question.service';
import { Question } from '@/types/question';
import { formatDistanceToNow } from 'date-fns';
import { FiPlus, FiSearch, FiBook, FiHelpCircle, FiTrendingUp } from 'react-icons/fi';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadQuestions();
  }, [isAuthenticated, router]);

  const loadQuestions = async () => {
    try {
      const result = await questionService.getQuestions({ limit: 10 });
      setQuestions(result.items);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await questionService.getQuestions({ search: searchQuery, limit: 20 });
      setQuestions(result.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  // Determine role-based background and accent colors
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  // Determine colors based on role - using full class names for Tailwind JIT
  // Consistent green branding across all roles
  let bgColor = 'bg-slate-50';
  let primaryText = 'text-slate-700';
  let primaryBg = 'bg-slate-700';
  let primaryHover = 'hover:bg-slate-800';
  let primaryHoverBorder = 'hover:border-slate-300';
  let primaryHoverText = 'hover:text-slate-700';
  let primaryFocusRing = 'focus:ring-slate-500 focus:border-slate-500';
  let primaryLightBg = 'bg-slate-100';
  let primaryLightText = 'text-slate-700';
  let primaryBorder = 'border-slate-700';

  if (isStudent) {
    bgColor = 'bg-green-50';
    primaryText = 'text-green-600';
    primaryBg = 'bg-green-600';
    primaryHover = 'hover:bg-green-700';
    primaryHoverBorder = 'hover:border-green-300';
    primaryHoverText = 'hover:text-green-600';
    primaryFocusRing = 'focus:ring-green-500 focus:border-green-500';
    primaryLightBg = 'bg-green-100';
    primaryLightText = 'text-green-700';
    primaryBorder = 'border-green-600';
  } else if (isTeacher) {
    bgColor = 'bg-green-50';
    primaryText = 'text-green-600';
    primaryBg = 'bg-green-600';
    primaryHover = 'hover:bg-green-700';
    primaryHoverBorder = 'hover:border-green-300';
    primaryHoverText = 'hover:text-green-600';
    primaryFocusRing = 'focus:ring-green-500 focus:border-green-500';
    primaryLightBg = 'bg-green-100';
    primaryLightText = 'text-green-700';
    primaryBorder = 'border-green-600';
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className={primaryText}>{user?.name}</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            {isTeacher 
              ? 'Help students learn and share your knowledge' 
              : isAdmin
              ? 'Manage the platform and ensure smooth operations'
              : 'Ask questions, learn together, and grow your knowledge'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {isStudent ? (
            <>
              <Link
                href="/questions/new"
                className="bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1"
              >
                <FiPlus className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-bold mb-1">Ask Question</h3>
                <p className="text-blue-50">Get help from the community</p>
              </Link>
              <Link
                href="/notes"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiBook className="w-8 h-8 mb-3 text-green-600" />
                <h3 className="text-xl font-bold mb-1">Browse Notes</h3>
                <p className="text-gray-600">Access learning resources</p>
              </Link>
              <Link
                href="/support/new"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiHelpCircle className="w-8 h-8 mb-3 text-green-600" />
                <h3 className="text-xl font-bold mb-1">Get Support</h3>
                <p className="text-gray-600">Raise a support ticket</p>
              </Link>
            </>
          ) : isTeacher ? (
            <>
              <Link
                href="/notes/new"
                className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1"
              >
                <FiPlus className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-bold mb-1">Upload Note</h3>
                <p className="text-green-50">Share learning materials</p>
              </Link>
              <Link
                href="/questions"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiHelpCircle className="w-8 h-8 mb-3 text-green-600" />
                <h3 className="text-xl font-bold mb-1">Answer Questions</h3>
                <p className="text-gray-600">Help students learn</p>
              </Link>
              <Link
                href="/support"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiHelpCircle className="w-8 h-8 mb-3 text-green-600" />
                <h3 className="text-xl font-bold mb-1">Support Tickets</h3>
                <p className="text-gray-600">Manage student requests</p>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/support/new"
                className="bg-slate-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-1"
              >
                <FiPlus className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-bold mb-1">Support Ticket</h3>
                <p className="text-slate-200">Raise a support request</p>
              </Link>
              <Link
                href="/notes"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiBook className="w-8 h-8 mb-3 text-slate-700" />
                <h3 className="text-xl font-bold mb-1">Browse Notes</h3>
                <p className="text-gray-600">Access learning resources</p>
              </Link>
              <Link
                href="/support"
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-200"
              >
                <FiHelpCircle className="w-8 h-8 mb-3 text-slate-700" />
                <h3 className="text-xl font-bold mb-1">Get Support</h3>
                <p className="text-gray-600">Raise a support ticket</p>
              </Link>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions by title, description, or author..."
                className={`w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 transition-all bg-white text-gray-900 ${primaryFocusRing}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className={`px-6 py-3 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 ${primaryBg} ${primaryHover}`}
            >
              <FiSearch className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Questions Feed */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className={primaryText} />
              {user?.role === 'teacher' ? 'Student Questions' : 'Recent Questions'}
            </h2>
            {user?.role === 'teacher' && (
              <p className="text-sm text-gray-600">
                Answer questions to help students learn
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${primaryBorder}`}></div>
              <p className="text-gray-500 mt-4">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
              <FiHelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {user?.role === 'teacher'
                  ? 'No student questions yet. Questions will appear here when students ask.'
                  : 'No questions found. Be the first to ask!'}
              </p>
              {user?.role === 'student' && (
                <Link
                  href="/questions/new"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
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
                className={`block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-1 ${primaryHoverBorder}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-colors ${primaryHoverText}`}>
                      {question.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="font-medium">{question.authorName}</span>
                      <span>•</span>
                      <span>{question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 'Recently'}</span>
                      {question.subject && (
                        <>
                          <span>•</span>
                          <span className={`px-3 py-1 rounded-full font-medium ${primaryLightBg} ${primaryLightText}`}>
                            {question.subject}
                          </span>
                        </>
                      )}
                      {question.isSolved && (
                        <span className={`px-3 py-1 rounded-full font-medium ${primaryLightBg} ${primaryLightText}`}>
                          ✓ Solved
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right text-sm">
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <FiHelpCircle className="w-4 h-4" />
                      <span className="font-semibold">{question.answerCount || 0}</span>
                    </div>
                    <div className="text-gray-500">{question.views} views</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
