import { storage } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let onAuthExpired: (() => void) | null = null;

export function setOnAuthExpired(cb: () => void) {
  onAuthExpired = cb;
}

async function getToken(): Promise<string | null> {
  return storage.get("authToken");
}

async function refreshToken(): Promise<string | null> {
  try {
    const token = await getToken();
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.data?.[0]?.token || data?.token;
    if (newToken) {
      await storage.set("authToken", newToken);
      return newToken;
    }
    return null;
  } catch {
    return null;
  }
}

async function getRefreshedToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = refreshToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });
  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestInit = {}, _retry = false): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && !_retry) {
    const newToken = await getRefreshedToken();
    if (newToken) return request<T>(endpoint, options, true);
    await storage.remove("authToken");
    onAuthExpired?.();
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  data: { token: string }[];
}

export async function login(username: string, password: string) {
  const res = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const token = res.data[0].token;
  await storage.set("authToken", token);
  return token;
}

export async function signup(username: string, email: string) {
  return request("/auth/signup", { method: "POST", body: JSON.stringify({ username, email }) });
}

export async function forgotPassword(userName: string) {
  return request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ userName }) });
}

export async function changePassword(newPassword: string) {
  return request("/auth/change-password", { method: "POST", body: JSON.stringify({ newPassword }) });
}

export async function logout() {
  await storage.remove("authToken");
}

// ─── Notebooks ───────────────────────────────────────────────────────────────

export interface Notebook {
  id: number;
  name: string;
  description: string;
  notebookType?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface NotebooksResponse {
  data: Notebook[];
  total?: number;
  page?: number;
  size?: number;
}

export async function addNotebook(payload: { name: string; description: string }) {
  return request<{ data: Notebook }>("/notebook/add", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateNotebook(id: number, payload: { name: string; description: string }) {
  return request<{ data: Notebook }>(`/notebook/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getNotebook(id: number) {
  return request<{ data: Notebook }>(`/notebook/get/${id}`);
}

export async function getAllNotebooks(page = 0, size = 50) {
  return request<NotebooksResponse>(`/notebook/getAll?page=${page}&size=${size}`);
}

// ─── Code Notes ──────────────────────────────────────────────────────────────

export interface CodeNote {
  id: number;
  notebookId: number;
  permanentLink: string;
  description: string;
  title: string;
  aiTags: string[];
  aiSummary?: string;
  aiExplanation?: string;
  aiImprovements?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface NotesResponse {
  data: CodeNote[];
  total?: number;
  page?: number;
  size?: number;
}

export async function addNote(payload: {
  afterId?: number | null;
  beforeId?: number | null;
  entry: {
    permanentLink: string;
    description: string;
    title: string;
    notebookId: number;
    aiTags?: string[];
  };
}) {
  return request<{ data: CodeNote }>("/code-note/add-by-position", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateNote(
  id: number,
  note: { permanentLink: string; description: string; title: string; aiTags: string[] }
) {
  return request<{ data: CodeNote }>(`/code-note/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...note }),
  });
}

export async function getNotesByNotebook(notebookId: number, page = 0, size = 20) {
  return request<NotesResponse>(`/code-note/notebook/${notebookId}?page=${page}&size=${size}`);
}

export async function getAllNotes(page = 0, size = 20) {
  return request<NotesResponse>(`/code-note/getAll?page=${page}&size=${size}`);
}

export async function getNote(id: number) {
  return request<{ data: CodeNote }>(`/code-note/get/${id}`);
}

export async function deleteNote(id: number) {
  return request(`/code-note/delete/${id}`, { method: "DELETE" });
}
