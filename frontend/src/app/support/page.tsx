'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/store/auth.store';
import { supportService } from '@/services/support.service';
import { SupportTicket } from '@/types/support';
import { formatDistanceToNow } from 'date-fns';
import { FiPlus, FiSearch, FiHelpCircle, FiClock, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Pagination from '@/components/common/Pagination';

export default function SupportPage() {
  const router = useRouter();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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
    loadTickets();
  }, [isAuthenticated, router, filterStatus, currentPage]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        limit: itemsPerPage,
        offset,
        status: filterStatus || undefined,
        search: searchQuery || undefined,
      };
      const result = await supportService.getTickets(filters);
      setTickets(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    loadTickets();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <FiXCircle className="w-5 h-5 text-gray-500" />;
      case 'in_progress':
        return <FiClock className="w-5 h-5 text-blue-500" />;
      case 'waiting_for_user':
        return <FiHelpCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <FiHelpCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in_progress':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'waiting_for_user':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-orange-100 text-orange-700 border-orange-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'waiting_for_user':
        return 'Waiting for User';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const canCreateTicket = user?.role === 'student';

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Support Tickets
            </h1>
            <p className="text-gray-600 text-lg">
              {isTeacher 
                ? 'Manage and respond to student support requests' 
                : 'Get help with academic or technical issues'}
            </p>
          </div>
          {canCreateTicket && (
            <Link
              href="/support/new"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              New Ticket
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
                placeholder="Search tickets by title, description, or author..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_user">Waiting for User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
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

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-4">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-100">
              <FiHelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No support tickets found.</p>
              {canCreateTicket && (
                <Link
                  href="/support/new"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
                >
                  Create Your First Ticket
                </Link>
              )}
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/${ticket.id}`}
                className="block bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-green-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors">
                        {ticket.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="font-medium">{ticket.authorName}</span>
                      <span>•</span>
                      <span>{ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : 'Recently'}</span>
                      <span>•</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium capitalize">
                        {ticket.ticketType}
                      </span>
                      {ticket.assignedToName && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Assigned to: {ticket.assignedToName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {ticket.responses && ticket.responses.length > 0 && (
                    <div className="ml-4 text-right text-sm">
                      <div className="text-gray-600 font-semibold">
                        {ticket.responses.length} {ticket.responses.length === 1 ? 'response' : 'responses'}
                      </div>
                    </div>
                  )}
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

