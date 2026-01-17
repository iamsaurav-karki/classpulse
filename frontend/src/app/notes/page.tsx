'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { noteService } from '@/services/note.service';
import { Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';
import { FiPlus, FiSearch, FiDownload, FiBook, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';
import SubjectFilter from '@/components/common/SubjectFilter';

export default function NotesPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  } | null>(null);
  const itemsPerPage = 12;

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadNotes();
  }, [isAuthenticated, router, filterSubject, currentPage]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        limit: itemsPerPage,
        offset,
        search: searchQuery || undefined,
        subject: filterSubject || undefined,
      };
      const result = await noteService.getNotes(filters);
      setNotes(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    loadNotes();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = async (noteId: string, fileName: string) => {
    try {
      const result = await noteService.downloadNote(noteId);
      
      // Ensure we have a valid URL
      let downloadUrl = result.downloadUrl;
      if (!downloadUrl) {
        toast.error('File URL not available');
        return;
      }
      
      // If it's a relative URL, construct full URL
      if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api';
        const backendBaseUrl = apiUrl.replace('/api', '');
        downloadUrl = `${backendBaseUrl}${downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`}`;
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'note.pdf';
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error: any) {
      console.error('❌ Download error:', error);
      toast.error(error.response?.data?.error || 'Failed to download note');
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Notes & Resources
            </h1>
            <p className="text-gray-600 text-lg">
              {isTeacher 
                ? 'Share learning materials with your students' 
                : 'Access notes and learning resources from teachers'}
            </p>
          </div>
          {isTeacher && (
            <Link
              href="/notes/new"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Upload Note
            </Link>
          )}
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
                placeholder="Search notes by title, description, or author..."
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
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
              >
                <FiSearch className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-4">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow border border-gray-100">
              <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No notes found.</p>
              {isTeacher && (
                <Link
                  href="/notes/new"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  Upload Your First Note
                </Link>
              )}
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-green-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  {note.fileUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(note.id, note.fileName || 'note');
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {note.title}
                </h3>
                {note.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {note.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 flex-wrap">
                  {note.subject && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      {note.subject}
                    </span>
                  )}
                  {note.chapter && (
                    <span className="text-gray-600">Chapter: {note.chapter}</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <span>{note.authorName}</span>
                  <span>{note.downloadCount} downloads</span>
                </div>
              </div>
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

