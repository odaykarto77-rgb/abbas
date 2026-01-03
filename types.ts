
export type UserRole = 'investor' | 'owner' | 'admin' | 'standard';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  rating: number;
  bio?: string;
  country?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

export type IdeaVisibility = 'public' | 'private';
export type IdeaStatus = 'draft' | 'published' | 'archived' | 'sold';

export interface BusinessIdea {
  id: string;
  user_id: string;
  title: string;
  category: string;
  short_summary: string;
  full_description: string;
  required_budget: number;
  expected_profit_share: number;
  monetization_model?: string;
  deal_type?: string;
  visibility: IdeaVisibility;
  status: IdeaStatus;
  created_at: string;
  tags: string[];
  image_data?: string; 
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  idea_id: string;
  message_text: string;
  timestamp: string;
  is_blocked?: boolean;
  is_reported?: boolean;
  report_reason?: string;
}

export interface Agreement {
  id: string;
  ideaId: string;
  ownerId: string;
  investorId: string;
  terms: string;
  status: 'DRAFT' | 'PENDING_OWNER' | 'PENDING_INVESTOR' | 'SIGNED';
  createdAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  event: string;
  userId?: string;
  details?: string;
}
