import apiClient from './api';
import { SupportTicket, CreateTicketData, TicketResponse } from '@/types/support';
import { PaginationMeta } from '@/types/pagination';

export const supportService = {
  async getTickets(filters?: {
    status?: string;
    ticketType?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: SupportTicket[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ticketType) params.append('ticketType', filters.ticketType);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<{
      success: boolean;
      data: { items: SupportTicket[]; pagination: PaginationMeta };
    }>(`/support?${params.toString()}`);
    return response.data.data;
  },

  async getTicketById(id: string): Promise<SupportTicket> {
    const response = await apiClient.get<{ success: boolean; data: SupportTicket }>(
      `/support/${id}`
    );
    return response.data.data;
  },

  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    const response = await apiClient.post<{ success: boolean; data: SupportTicket }>(
      '/support',
      data
    );
    return response.data.data;
  },

  async updateTicketStatus(
    id: string,
    status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed',
    assignedTo?: string
  ): Promise<SupportTicket> {
    const response = await apiClient.patch<{ success: boolean; data: SupportTicket }>(
      `/support/${id}/status`,
      { status, assignedTo }
    );
    return response.data.data;
  },

  async getAssignees(ticketType: 'academic' | 'platform' | 'technical'): Promise<any[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(
      `/support/assignees?ticketType=${ticketType}`
    );
    return response.data.data;
  },

  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    const response = await apiClient.post<{ success: boolean; data: SupportTicket }>(
      `/support/${ticketId}/assign`,
      { assignedTo }
    );
    return response.data.data;
  },

  async addResponse(ticketId: string, content: string): Promise<TicketResponse> {
    const response = await apiClient.post<{ success: boolean; data: TicketResponse }>(
      `/support/${ticketId}/response`,
      { content }
    );
    return response.data.data;
  },

  async reopenTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.post<{ success: boolean; data: SupportTicket }>(
      `/support/${ticketId}/reopen`
    );
    return response.data.data;
  },

  async reassignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    const response = await apiClient.post<{ success: boolean; data: SupportTicket }>(
      `/support/${ticketId}/reassign`,
      { assignedTo }
    );
    return response.data.data;
  },

  async escalateTicket(ticketId: string, assignedTo?: string): Promise<SupportTicket> {
    const response = await apiClient.post<{ success: boolean; data: SupportTicket }>(
      `/support/${ticketId}/escalate`,
      { assignedTo }
    );
    return response.data.data;
  },
};

