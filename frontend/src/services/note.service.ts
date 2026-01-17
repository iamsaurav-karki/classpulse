import apiClient from './api';
import { Note, CreateNoteData } from '@/types/note';
import { PaginationMeta } from '@/types/pagination';

export const noteService = {
  async getNotes(filters?: {
    subject?: string;
    chapter?: string;
    classGrade?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Note[]; pagination: PaginationMeta }> {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.chapter) params.append('chapter', filters.chapter);
    if (filters?.classGrade) params.append('classGrade', filters.classGrade);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await apiClient.get<{
      success: boolean;
      data: { items: Note[]; pagination: PaginationMeta };
    }>(`/notes?${params.toString()}`);
    return response.data.data;
  },

  async getNoteById(id: string): Promise<Note> {
    const response = await apiClient.get<{ success: boolean; data: Note }>(`/notes/${id}`);
    return response.data.data;
  },

  async createNote(data: CreateNoteData): Promise<Note> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.subject) formData.append('subject', data.subject);
    if (data.chapter) formData.append('chapter', data.chapter);
    if (data.classGrade) formData.append('classGrade', data.classGrade);
    if (data.file) formData.append('file', data.file);

    const response = await apiClient.postFormData<{ success: boolean; data: Note }>(
      '/notes',
      formData
    );
    return response.data.data;
  },

  async updateNote(id: string, data: Partial<CreateNoteData>): Promise<Note> {
    const response = await apiClient.put<{ success: boolean; data: Note }>(`/notes/${id}`, data);
    return response.data.data;
  },

  async deleteNote(id: string): Promise<void> {
    await apiClient.delete(`/notes/${id}`);
  },

  async downloadNote(id: string): Promise<{ downloadUrl: string; fileName: string }> {
    const response = await apiClient.get<{
      success: boolean;
      data: { downloadUrl: string; fileName: string };
    }>(`/notes/${id}/download`);
    return response.data.data;
  },
};

