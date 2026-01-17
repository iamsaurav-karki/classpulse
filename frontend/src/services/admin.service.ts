import apiClient from './api';
import { AdminUser, AdminAnalytics, AdminLog } from '@/types/admin';
import { Question } from '@/types/question';
import { Answer } from '@/types/answer';
import { SupportTicket } from '@/types/support';

export const adminService = {
  // User Management
  async getUsers(filters?: {
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.isVerified !== undefined) params.append('isVerified', String(filters.isVerified));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<{ success: boolean; data: AdminUser[] }>(
      `/admin/users?${params.toString()}`
    );
    return response.data.data;
  },

  async getUserById(id: string): Promise<AdminUser> {
    const response = await apiClient.get<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`);
    return response.data.data;
  },

  async suspendUser(id: string, reason?: string): Promise<AdminUser> {
    const response = await apiClient.patch<{ success: boolean; data: AdminUser }>(
      `/admin/users/${id}/suspend`,
      { reason }
    );
    return response.data.data;
  },

  async activateUser(id: string): Promise<AdminUser> {
    const response = await apiClient.patch<{ success: boolean; data: AdminUser }>(
      `/admin/users/${id}/activate`
    );
    return response.data.data;
  },

  async changeUserRole(id: string, role: 'student' | 'teacher' | 'admin'): Promise<AdminUser> {
    const response = await apiClient.patch<{ success: boolean; data: AdminUser }>(
      `/admin/users/${id}/role`,
      { role }
    );
    return response.data.data;
  },

  // Teacher Verification
  async getPendingTeachers(): Promise<AdminUser[]> {
    const response = await apiClient.get<{ success: boolean; data: AdminUser[] }>(
      '/admin/teachers/pending'
    );
    return response.data.data;
  },

  async approveTeacher(id: string): Promise<AdminUser> {
    const response = await apiClient.post<{ success: boolean; data: AdminUser }>(
      `/admin/teachers/${id}/approve`
    );
    return response.data.data;
  },

  async rejectTeacher(id: string, reason?: string): Promise<AdminUser> {
    const response = await apiClient.post<{ success: boolean; data: AdminUser }>(
      `/admin/teachers/${id}/reject`,
      { reason }
    );
    return response.data.data;
  },

  // Content Moderation
  async getQuestions(filters?: {
    isLocked?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Question[]> {
    const params = new URLSearchParams();
    if (filters?.isLocked !== undefined) params.append('isLocked', String(filters.isLocked));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<{ success: boolean; data: Question[] }>(
      `/admin/questions?${params.toString()}`
    );
    return response.data.data;
  },

  async lockQuestion(id: string): Promise<Question> {
    const response = await apiClient.post<{ success: boolean; data: Question }>(
      `/admin/questions/${id}/lock`
    );
    return response.data.data;
  },

  async unlockQuestion(id: string): Promise<Question> {
    const response = await apiClient.post<{ success: boolean; data: Question }>(
      `/admin/questions/${id}/unlock`
    );
    return response.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/admin/questions/${id}`);
  },

  async getAnswers(filters?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Answer[]> {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<{ success: boolean; data: Answer[] }>(
      `/admin/answers?${params.toString()}`
    );
    return response.data.data;
  },

  async deleteAnswer(id: string): Promise<void> {
    await apiClient.delete(`/admin/answers/${id}`);
  },

  // Support Management
  async getSupportTickets(filters?: {
    status?: string;
    ticketType?: string;
    limit?: number;
    offset?: number;
  }): Promise<SupportTicket[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ticketType) params.append('ticketType', filters.ticketType);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<{ success: boolean; data: SupportTicket[] }>(
      `/admin/support?${params.toString()}`
    );
    return response.data.data;
  },

  // Analytics
  async getAnalytics(): Promise<AdminAnalytics> {
    const response = await apiClient.get<{ success: boolean; data: AdminAnalytics }>(
      '/admin/analytics'
    );
    return response.data.data;
  },

  // Admin Logs
  async getLogs(filters?: {
    adminId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdminLog[]> {
    const params = new URLSearchParams();
    if (filters?.adminId) params.append('adminId', filters.adminId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<{ success: boolean; data: AdminLog[] }>(
      `/admin/logs?${params.toString()}`
    );
    return response.data.data;
  },
};

