import type { TokenResponse, HealthResponse, ChatRequest, ChatResponse, FileInfo, UploadResponse, SoulStatus, TrainResponse, TranscribeRequest, TranscribeResponse } from './types';
import type { ModelsResponse } from './models';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const TOKEN_KEY = 'cyberseed_token';
const REFRESH_TOKEN_KEY = 'cyberseed_refresh_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      throw new Error('Unauthorized - please login again');
    }
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setTokens(response.access_token, response.refresh_token);
  return response;
}

export async function refreshToken(): Promise<TokenResponse> {
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refresh) throw new Error('No refresh token');
  const response = await apiFetch<TokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  });
  setTokens(response.access_token, response.refresh_token);
  return response;
}

export function logout(): void {
  clearToken();
}

export async function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/health');
}

export async function getModels(): Promise<ModelsResponse> {
  return apiFetch<ModelsResponse>('/models');
}

export async function getSoulStatus(ownerId: string, soulId: string): Promise<SoulStatus> {
  return apiFetch<SoulStatus>(`/status/soul/${ownerId}/${soulId}`);
}

export async function chat(ownerId: string, soulId: string, request: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(`/souls/${ownerId}/${soulId}/chat`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function uploadFiles(ownerId: string, soulId: string, files: File[]): Promise<UploadResponse> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await fetch(`${API_BASE_URL}/souls/${ownerId}/${soulId}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  return response.json();
}

export async function listFiles(ownerId: string, soulId: string, category?: string): Promise<FileInfo[]> {
  const url = category ? `/souls/${ownerId}/${soulId}/files?category=${category}` : `/souls/${ownerId}/${soulId}/files`;
  return apiFetch<FileInfo[]>(url);
}

export async function deleteFile(ownerId: string, soulId: string, filename: string): Promise<void> {
  await apiFetch<void>(`/souls/${ownerId}/${soulId}/files/${filename}`, { method: 'DELETE' });
}

export async function trainSoul(ownerId: string, soulId: string): Promise<TrainResponse> {
  return apiFetch<TrainResponse>(`/souls/${ownerId}/${soulId}/train`, { method: 'POST' });
}

export async function transcribe(ownerId: string, soulId: string, request: TranscribeRequest): Promise<TranscribeResponse> {
  return apiFetch<TranscribeResponse>(`/souls/${ownerId}/${soulId}/transcribe`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export const api = {
  login,
  logout,
  refreshToken,
  getHealth,
  getModels,
  getSoulStatus,
  chat,
  uploadFiles,
  listFiles,
  deleteFile,
  trainSoul,
  transcribe,
  getToken,
  setTokens,
  clearToken,
};

export default api;