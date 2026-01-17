import apiClient from './api';

export interface Subject {
  id: string;
  name: string;
  createdBy?: string;
  creatorName?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Subject[];
    }>('/subjects');
    return response.data.data;
  },

  async getPopularSubjects(limit: number = 10): Promise<Subject[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: Subject[];
    }>(`/subjects/popular?limit=${limit}`);
    return response.data.data;
  },

  async createSubject(name: string): Promise<Subject> {
    const response = await apiClient.post<{
      success: boolean;
      data: Subject;
    }>('/subjects', { name });
    return response.data.data;
  },
};

