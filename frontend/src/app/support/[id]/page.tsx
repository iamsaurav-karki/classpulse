'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { useAuthStore } from '@/store/auth.store';
import { supportService } from '@/services/support.service';
import { SupportTicket } from '@/types/support';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiClock, FiCheckCircle, FiXCircle, FiHelpCircle, FiSend, FiUser, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';

export default function SupportTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, loadAuth } = useAuthStore();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseContent, setResponseContent] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [reopenConfirm, setReopenConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []); // Only run once on mount

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadTicket();
  }, [isAuthenticated, router, params.id]);

  const loadTicket = async () => {
    try {
      const data = await supportService.getTicketById(params.id as string);
      setTicket(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view this ticket');
      } else {
        toast.error('Failed to load ticket');
      }
      router.push('/support');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseContent.trim()) return;

    setSubmittingResponse(true);
    try {
      await supportService.addResponse(params.id as string, responseContent);
      toast.success('Response added successfully!');
      setResponseContent('');
      loadTicket();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleCloseTicket = () => {
    setCloseConfirm(true);
  };

  const confirmCloseTicket = async () => {
    setIsProcessing(true);
    try {
      await supportService.updateTicketStatus(params.id as string, 'closed');
      toast.success('Ticket closed successfully!');
      loadTicket();
      setCloseConfirm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to close ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReopenTicket = () => {
    setReopenConfirm(true);
  };

  const confirmReopenTicket = async () => {
    setIsProcessing(true);
    try {
      await supportService.reopenTicket(params.id as string);
      toast.success('Ticket reopened successfully!');
      loadTicket();
      setReopenConfirm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reopen ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true);
    try {
      await supportService.updateTicketStatus(params.id as string, newStatus as any);
      toast.success('Ticket status updated successfully!');
      loadTicket();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an assignee');
      return;
    }
    try {
      await supportService.assignTicket(params.id as string, selectedAssignee);
      toast.success('Ticket assigned successfully!');
      setShowAssignModal(false);
      setSelectedAssignee('');
      loadTicket();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign ticket');
    }
  };

  const handleReassign = async () => {
    if (!selectedAssignee) {
      toast.error('Please select an assignee');
      return;
    }
    try {
      await supportService.reassignTicket(params.id as string, selectedAssignee);
      toast.success('Ticket reassigned successfully!');
      setShowAssignModal(false);
      setSelectedAssignee('');
      loadTicket();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reassign ticket');
    }
  };

  const handleEscalate = async () => {
    try {
      await supportService.escalateTicket(params.id as string, selectedAssignee || undefined);
      toast.success('Ticket escalated successfully!');
      setShowAssignModal(false);
      setSelectedAssignee('');
      loadTicket();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to escalate ticket');
    }
  };

  const loadAssignees = async () => {
    if (!ticket) return;
    try {
      const data = await supportService.getAssignees(ticket.ticketType);
      setAssignees(data);
    } catch (error) {
      console.error('Failed to load assignees:', error);
    }
  };

  useEffect(() => {
    if (showAssignModal && ticket && (user?.role === 'admin')) {
      loadAssignees();
    }
  }, [showAssignModal, ticket, user]);

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

  if (!isAuthenticated || loading) return null;
  if (!ticket) return null;

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isTicketOwner = user?.id === ticket.userId;
  const canRespond = isTeacher || isAdmin || isTicketOwner;
  
  // Permission checks
  const canClose = isStudent && isTicketOwner;
  const canReopen = isTicketOwner || isAdmin;
  const canChangeStatus = (isTeacher && ticket.ticketType === 'academic' && ticket.assignedTo === user?.id) || isAdmin;
  const canAssign = isAdmin;
  const canReassign = isAdmin && ticket.assignedTo;
  const canEscalate = isAdmin;

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/support"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
        >
          <FiArrowLeft className="mr-2" />
          Back to Support
        </Link>

        {/* Ticket */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border-2 ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
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
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {/* Student Actions */}
              {canClose && ticket.status !== 'closed' && (
                <button
                  onClick={handleCloseTicket}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiXCircle className="w-4 h-4" />
                  Close Ticket
                </button>
              )}
              
              {canReopen && ticket.status === 'closed' && (
                <button
                  onClick={handleReopenTicket}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reopen Ticket
                </button>
              )}

              {/* Teacher Actions */}
              {canChangeStatus && !isAdmin && ticket.status !== 'closed' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Change Status:</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={changingStatus}
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 disabled:opacity-50"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_user">Waiting for User</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  {!ticket.assignedTo && (
                    <button
                      onClick={() => {
                        setShowAssignModal(true);
                        setSelectedAssignee('');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <FiUser className="w-4 h-4" />
                      Assign
                    </button>
                  )}
                  
                  {ticket.assignedTo && (
                    <button
                      onClick={() => {
                        setShowAssignModal(true);
                        setSelectedAssignee(ticket.assignedTo || '');
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <FiUser className="w-4 h-4" />
                      Reassign
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowAssignModal(true);
                      setSelectedAssignee('');
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    Escalate
                  </button>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={changingStatus}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_for_user">Waiting for User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Assign/Reassign/Escalate Modal */}
        {showAssignModal && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {!ticket.assignedTo ? 'Assign Ticket' : 'Reassign or Escalate Ticket'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Assignee
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                >
                  <option value="">Select an assignee...</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.name} ({assignee.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                {!ticket.assignedTo ? (
                  <button
                    onClick={handleAssign}
                    disabled={!selectedAssignee}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleReassign}
                      disabled={!selectedAssignee}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reassign
                    </button>
                    <button
                      onClick={handleEscalate}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Escalate
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedAssignee('');
                  }}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Response Form */}
        {canRespond && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Response</h2>
            <form onSubmit={handleSubmitResponse}>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900 resize-none mb-4"
                placeholder="Write your response here..."
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
              />
              <button
                type="submit"
                disabled={submittingResponse || !responseContent.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSend className="w-5 h-5" />
                {submittingResponse ? 'Sending...' : 'Send Response'}
              </button>
            </form>
          </div>
        )}

        {/* Responses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {ticket.responses?.length || 0} {ticket.responses?.length === 1 ? 'Response' : 'Responses'}
          </h2>

          {!ticket.responses || ticket.responses.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              No responses yet.
            </div>
          ) : (
            ticket.responses.map((response) => (
              <div
                key={response.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {response.authorName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{response.authorName}</span>
                      {response.authorRole && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                          {response.authorRole}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {response.createdAt ? formatDistanceToNow(new Date(response.createdAt), { addSuffix: true }) : 'Recently'}
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={closeConfirm}
        onClose={() => setCloseConfirm(false)}
        onConfirm={confirmCloseTicket}
        title="Close Ticket"
        message="Are you sure you want to close this ticket? You can reopen it later if needed."
        confirmText="Close Ticket"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={reopenConfirm}
        onClose={() => setReopenConfirm(false)}
        onConfirm={confirmReopenTicket}
        title="Reopen Ticket"
        message="Are you sure you want to reopen this ticket?"
        confirmText="Reopen"
        cancelText="Cancel"
        confirmColor="green"
        isLoading={isProcessing}
      />
    </div>
  );
}

