export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  bio?: string;
  profilePictureUrl?: string;
  subjects?: string[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnalytics {
  users: {
    total: number;
    active: number;
  };
  teachers: {
    total: number;
    verified: number;
    pending: number;
  };
  content: {
    questions: number;
    answers: number;
  };
  support: {
    openTickets: number;
  };
  recentActivity: {
    questions7d: number;
    answers7d: number;
    users7d: number;
  };
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  adminName?: string;
  adminEmail?: string;
}

