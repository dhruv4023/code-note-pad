import { storage } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function getToken(): Promise<string | null> {
  return storage.get("authToken");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
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
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, email }),
  });
}

export async function forgotPassword(userName: string) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ userName }),
  });
}

export async function changePassword(newPassword: string) {
  return request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export async function logout() {
  await storage.remove("authToken");
}

// Notes
export interface CodeNote {
  id: number;
  permanentLink: string;
  note: string;
  title: string;
  aiTags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface NotesResponse {
  data: CodeNote[];
  total?: number;
  page?: number;
  size?: number;
}

export async function addNote(note: {
  permanentLink: string;
  note: string;
  title: string;
  aiTags: string[];
}) {
  return request<{ data: CodeNote }>("/code-note/add", {
    method: "POST",
    body: JSON.stringify(note),
  });
}

export async function updateNote(
  id: number,
  note: {
    permanentLink: string;
    note: string;
    title: string;
    aiTags: string[];
  }
) {
  return request<{ data: CodeNote }>(`/code-note/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, ...note }),
  });
}

export async function getAllNotes(page = 1, size = 10) {
  return request<NotesResponse>(
    `/code-note/getAll?page=${page}&size=${size}`
  );
}

export async function getNote(id: number) {
  return request<{ data: CodeNote }>(`/code-note/get/${id}`);
}

export async function deleteNote(id: number) {
  return request(`/code-note/delete/${id}`, { method: "DELETE" });
}
