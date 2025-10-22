// types/index.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  goal: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

export interface ApiResponse {
  response?: string;
  error?: string;
  fallback?: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}