'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminUser } from '@/types/admin';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { FiCheck, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectConfirm, setRejectConfirm] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    loadPendingTeachers();
  }, []);

  const loadPendingTeachers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      toast.error('Failed to load pending teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (teacherId: string) => {
    try {
      await adminService.approveTeacher(teacherId);
      toast.success('Teacher approved');
      loadPendingTeachers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve teacher');
    }
  };

  const handleReject = (teacherId: string) => {
    setRejectConfirm({ id: teacherId, isOpen: true });
  };

  const confirmReject = async () => {
    if (!rejectConfirm.id) return;
    setIsRejecting(true);
    try {
      await adminService.rejectTeacher(rejectConfirm.id);
      toast.success('Teacher rejected');
      loadPendingTeachers();
      setRejectConfirm({ id: null, isOpen: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject teacher');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Verification</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Review and approve teacher applications</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          Loading pending teachers...
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center text-gray-500">
          No pending teacher applications
        </div>
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{teacher.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{teacher.email}</p>
                    </div>
                  </div>
                  {teacher.bio && (
                    <p className="text-sm sm:text-base text-gray-700 mb-3 mt-2 line-clamp-2">{teacher.bio}</p>
                  )}
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {teacher.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Applied: {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(teacher.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(teacher.id)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiX className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={rejectConfirm.isOpen}
        onClose={() => setRejectConfirm({ id: null, isOpen: false })}
        onConfirm={confirmReject}
        title="Reject Teacher Application"
        message="Are you sure you want to reject this teacher application? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isRejecting}
      />
    </div>
  );
}

