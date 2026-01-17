export type TicketStatus = 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
export type TicketType = 'academic' | 'platform' | 'technical';

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  ticketType: TicketType;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  authorAvatar?: string;
  assignedToName?: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  ticketType: TicketType;
}

