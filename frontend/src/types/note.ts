export interface Note {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  classGrade?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface CreateNoteData {
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  classGrade?: string;
  file?: File;
}

