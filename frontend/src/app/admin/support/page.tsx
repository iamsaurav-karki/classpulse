'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { SupportTicket } from '@/types/support';
import { FiHelpCircle, FiClock, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSupportTickets({
        status: statusFilter || undefined,
        limit: 50,
      });
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'closed':
        return <FiXCircle className="w-5 h-5" />;
      case 'in_progress':
        return <FiClock className="w-5 h-5" />;
      case 'waiting_for_user':
        return <FiUser className="w-5 h-5" />;
      default:
        return <FiHelpCircle className="w-5 h-5" />;
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

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Support Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage all support tickets</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
        <select
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_for_user">Waiting for User</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          Loading tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          No tickets found
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/support/${ticket.id}`}
              className="block bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all border border-gray-100 hover:border-green-300"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1 min-w-0">{ticket.title}</h3>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border flex-shrink-0 ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      <span className="hidden sm:inline">{ticket.status.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="sm:hidden">{ticket.status.replace(/_/g, ' ').split(' ')[0].toUpperCase()}</span>
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{ticket.authorName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs capitalize">
                      {ticket.ticketType}
                    </span>
                    {ticket.assignedToName && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-green-600">Assigned: {ticket.assignedToName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

