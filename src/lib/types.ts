export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface HealthResponse {
  status: string;
}

export interface ChatRequest {
  query: string;
  top_k?: number;
  max_tokens?: number;
  temperature?: number;
  include_sources?: boolean;
}

export interface ChatResponse {
  response_text: string;
  used_docs: Array<{ content: string; source: string; score: number }>;
  has_knowledge_base: boolean;
  total_indexed_documents: number;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  created_at: string;
  category: string;
}

export interface UploadResponse {
  files: FileInfo[];
  count: number;
  total_size: number;
}

export interface SoulStatus {
  owner_id: string;
  soul_id: string;
  storage: { total_files: number; total_size: number };
  rag: { has_index: boolean; document_count: number };
}

export interface UserInfo {
  user_id: string;
  owner_id: string;
  role: string;
}

export interface TrainResponse {
  success: boolean;
  documents_added: number;
  total_documents: number;
}

export interface TranscribeRequest {
  file_path: string;
  model?: string;
  language?: string;
}

export interface TranscribeResponse {
  text: string;
  segments: Array<{ start: number; end: number; text: string }>;
  text_path: string;
}