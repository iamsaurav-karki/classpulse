import apiClient from './api';
import { Question, CreateQuestionData } from '@/types/question';
import { PaginationMeta } from '@/types/pagination';

export const questionService = {
  async getQuestions(filters?: {
    subject?: string;
    category?: string;
    isSolved?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Question[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isSolved !== undefined) params.append('isSolved', String(filters.isSolved));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<{
      success: boolean;
      data: { items: Question[]; pagination: PaginationMeta };
    }>(`/questions?${params.toString()}`);
    return response.data.data;
  },

  async getQuestionById(id: string): Promise<Question> {
    const response = await apiClient.get<{ success: boolean; data: Question }>(`/questions/${id}`);
    return response.data.data;
  },

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.subject) formData.append('subject', data.subject);
    if (data.category) formData.append('category', data.category);
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.postFormData<{ success: boolean; data: Question }>(
      '/questions',
      formData
    );
    return response.data.data;
  },

  async updateQuestion(id: string, data: Partial<CreateQuestionData>): Promise<Question> {
    const response = await apiClient.put<{ success: boolean; data: Question }>(
      `/questions/${id}`,
      data
    );
    return response.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`);
  },

  async markAsSolved(questionId: string, answerId: string): Promise<Question> {
    const response = await apiClient.patch<{ success: boolean; data: Question }>(
      `/questions/${questionId}/solve`,
      { answerId }
    );
    return response.data.data;
  },
};

