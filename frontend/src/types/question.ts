export interface Question {
  id: string;
  userId: string;
  title: string;
  description: string;
  subject?: string;
  category?: string;
  views: number;
  isSolved: boolean;
  isLocked?: boolean;
  acceptedAnswerId?: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  answerCount?: number;
  totalVotes?: number;
  images?: QuestionImage[];
}

export interface QuestionImage {
  id: string;
  questionId: string;
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface CreateQuestionData {
  title: string;
  description: string;
  subject?: string;
  category?: string;
  images?: File[];
}

