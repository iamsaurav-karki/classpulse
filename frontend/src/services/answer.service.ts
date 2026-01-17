import apiClient from './api';
import { Answer, CreateAnswerData } from '@/types/answer';

export const answerService = {
  async getAnswersByQuestion(questionId: string): Promise<Answer[]> {
    const response = await apiClient.get<{ success: boolean; data: Answer[] }>(
      `/answers/question/${questionId}`
    );
    return response.data.data;
  },

  async getAnswerById(id: string): Promise<Answer> {
    const response = await apiClient.get<{ success: boolean; data: Answer }>(`/answers/${id}`);
    return response.data.data;
  },

  async createAnswer(data: CreateAnswerData): Promise<Answer> {
    const formData = new FormData();
    formData.append('questionId', data.questionId);
    formData.append('content', data.content);
    if (data.files) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.postFormData<{ success: boolean; data: Answer }>(
      '/answers',
      formData
    );
    return response.data.data;
  },

  async updateAnswer(id: string, content: string): Promise<Answer> {
    const response = await apiClient.put<{ success: boolean; data: Answer }>(`/answers/${id}`, {
      content,
    });
    return response.data.data;
  },

  async deleteAnswer(id: string): Promise<void> {
    await apiClient.delete(`/answers/${id}`);
  },

  async voteAnswer(id: string, voteType: 'upvote' | 'downvote'): Promise<Answer> {
    const response = await apiClient.post<{ success: boolean; data: Answer }>(
      `/answers/${id}/vote`,
      { voteType }
    );
    return response.data.data;
  },

  async acceptAnswer(answerId: string, questionId: string): Promise<Answer> {
    const response = await apiClient.post<{ success: boolean; data: Answer }>(
      `/answers/${answerId}/accept`,
      { questionId }
    );
    return response.data.data;
  },

  async pinAnswer(id: string): Promise<Answer> {
    const response = await apiClient.post<{ success: boolean; data: Answer }>(`/answers/${id}/pin`);
    return response.data.data;
  },
};

