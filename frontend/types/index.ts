export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  tokens?: number;
  cost?: number;
  ragUsed?: boolean;
  createdAt?: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  total_tokens: number;
  total_cost_usd: number;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

