/**
 * Thin API client for the Abuladze Academy backend.
 * In dev, requests to /api are proxied to the FastAPI server (see vite.config.ts).
 */
import type {
  ContactMessage,
  Course,
  EmailEvent,
  EmailSettings,
  EmailTemplate,
  Professor,
  SiteContent,
  Student,
} from "./types";

const TOKEN_KEY = "abuladze_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  // Default to JSON only when the caller hasn't already set a content type
  // (e.g. the login endpoint sends application/x-www-form-urlencoded).
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // ---- Auth ----
  async login(username: string, password: string): Promise<string> {
    const body = new URLSearchParams({ username, password });
    const data = await request<{ access_token: string }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    setToken(data.access_token);
    return data.access_token;
  },
  me: () => request<{ id: number; username: string }>("/auth/me"),

  // ---- Content (CMS) ----
  getContent: (lang = "ka") => request<SiteContent>(`/content?lang=${lang}`),
  updateContent: (key: string, value: string, lang = "ka") =>
    request(`/content/${key}?lang=${lang}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),

  // ---- Courses ----
  getCourses: (includeInactive = false) =>
    request<Course[]>(`/courses${includeInactive ? "?include_inactive=true" : ""}`),
  getCourse: (id: number) => request<Course>(`/courses/${id}`),
  createCourse: (data: Partial<Course>) =>
    request<Course>("/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (id: number, data: Partial<Course>) =>
    request<Course>(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCourse: (id: number) => request<void>(`/courses/${id}`, { method: "DELETE" }),

  // ---- Professors ----
  getProfessors: (includeInactive = false) =>
    request<Professor[]>(`/professors${includeInactive ? "?include_inactive=true" : ""}`),
  getProfessor: (id: number) => request<Professor>(`/professors/${id}`),
  createProfessor: (data: Partial<Professor>) =>
    request<Professor>("/professors", { method: "POST", body: JSON.stringify(data) }),
  updateProfessor: (id: number, data: Partial<Professor>) =>
    request<Professor>(`/professors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProfessor: (id: number) =>
    request<void>(`/professors/${id}`, { method: "DELETE" }),

  // ---- Students (enrollment) ----
  createStudent: (data: {
    full_name: string;
    email: string;
    phone?: string;
    message?: string;
    course_id?: number | null;
  }) => request<Student>("/students", { method: "POST", body: JSON.stringify(data) }),
  getStudents: () => request<Student[]>("/students"),
  updateStudentStatus: (id: number, status: Student["status"]) =>
    request<Student>(`/students/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteStudent: (id: number) => request<void>(`/students/${id}`, { method: "DELETE" }),

  // ---- Contact ----
  createContact: (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) => request<ContactMessage>("/contact", { method: "POST", body: JSON.stringify(data) }),
  getMessages: () => request<ContactMessage[]>("/contact"),
  markMessageRead: (id: number) =>
    request<ContactMessage>(`/contact/${id}/read`, { method: "PATCH" }),
  deleteMessage: (id: number) => request<void>(`/contact/${id}`, { method: "DELETE" }),

  // ---- Email (admin) ----
  getEmailSettings: () => request<EmailSettings>("/email/settings"),
  updateEmailSettings: (data: Partial<EmailSettings> & { password?: string }) =>
    request<EmailSettings>("/email/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getEmailEvents: () => request<EmailEvent[]>("/email/events"),
  getEmailTemplates: () => request<EmailTemplate[]>("/email/templates"),
  updateEmailTemplate: (key: string, data: Partial<EmailTemplate>) =>
    request<EmailTemplate>(`/email/templates/${key}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  sendTestEmail: (to: string) =>
    request<{ detail: string }>("/email/test", {
      method: "POST",
      body: JSON.stringify({ to }),
    }),
};

export { ApiError };
