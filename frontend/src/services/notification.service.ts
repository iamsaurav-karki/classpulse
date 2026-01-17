import apiClient from './api';
import { Notification } from '@/types/notification';

export const notificationService = {
  async getNotifications(unreadOnly?: boolean): Promise<Notification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>(
      `/notifications${params}`
    );
    return response.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ success: boolean; data: { count: number } }>(
      '/notifications/unread'
    );
    return response.data.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<{ success: boolean; data: Notification }>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<number> {
    const response = await apiClient.patch<{ success: boolean; data: { count: number } }>(
      '/notifications/read-all'
    );
    return response.data.data.count;
  },
};

