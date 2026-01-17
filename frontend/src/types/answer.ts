export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  files?: AnswerFile[];
}

export interface AnswerFile {
  id: string;
  answerId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface CreateAnswerData {
  questionId: string;
  content: string;
  files?: File[];
}

