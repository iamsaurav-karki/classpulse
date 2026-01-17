export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  subjects?: string[];
  profilePictureUrl?: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

