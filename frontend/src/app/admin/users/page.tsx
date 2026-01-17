'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { AdminUser } from '@/types/admin';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { FiSearch, FiUserX, FiUserCheck, FiShield, FiMoreVertical } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
  });
  const [suspendConfirm, setSuspendConfirm] = useState<{ id: string | null; isOpen: boolean }>({ id: null, isOpen: false });
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{ id: string | null; newRole: string | null; isOpen: boolean }>({ id: null, newRole: null, isOpen: false });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({
        role: filters.role || undefined,
        isActive: filters.isActive ? filters.isActive === 'true' : undefined,
        search: filters.search || undefined,
        limit: 50,
      });
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = (userId: string) => {
    setSuspendConfirm({ id: userId, isOpen: true });
  };

  const confirmSuspend = async () => {
    if (!suspendConfirm.id) return;
    setIsProcessing(true);
    try {
      await adminService.suspendUser(suspendConfirm.id);
      toast.success('User suspended');
      loadUsers();
      setSuspendConfirm({ id: null, isOpen: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to suspend user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await adminService.activateUser(userId);
      toast.success('User activated');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to activate user');
    }
  };

  const handleRoleChange = (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    setRoleChangeConfirm({ id: userId, newRole, isOpen: true });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeConfirm.id || !roleChangeConfirm.newRole) return;
    setIsProcessing(true);
    try {
      await adminService.changeUserRole(roleChangeConfirm.id, roleChangeConfirm.newRole as any);
      toast.success('User role updated');
      loadUsers();
      setRoleChangeConfirm({ id: null, newRole: null, isOpen: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 placeholder-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
            value={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users - Desktop Table / Mobile Cards */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">No users found</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : user.role === 'teacher'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <button
                              onClick={() => handleSuspend(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <FiUserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activate"
                            >
                              <FiUserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value as 'student' | 'teacher' | 'admin';
                              if (newRole !== user.role) {
                                handleRoleChange(user.id, newRole);
                              }
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{user.name}</div>
                      <div className="text-sm text-gray-500 mb-3">{user.email}</div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : user.role === 'teacher'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FiUserX className="w-4 h-4" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="flex-1 px-3 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FiUserCheck className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as 'student' | 'teacher' | 'admin';
                        if (newRole !== user.role) {
                          handleRoleChange(user.id, newRole);
                        }
                      }}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white text-gray-900"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={suspendConfirm.isOpen}
        onClose={() => setSuspendConfirm({ id: null, isOpen: false })}
        onConfirm={confirmSuspend}
        title="Suspend User"
        message="Are you sure you want to suspend this user? They will not be able to access the platform."
        confirmText="Suspend"
        cancelText="Cancel"
        confirmColor="red"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={roleChangeConfirm.isOpen}
        onClose={() => setRoleChangeConfirm({ id: null, newRole: null, isOpen: false })}
        onConfirm={confirmRoleChange}
        title="Change User Role"
        message={`Are you sure you want to change this user's role to ${roleChangeConfirm.newRole}?`}
        confirmText="Change Role"
        cancelText="Cancel"
        confirmColor="blue"
        isLoading={isProcessing}
      />
    </div>
  );
}

