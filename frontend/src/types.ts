export interface LecturerLink {
  label: string;
  url: string;
}

export interface Professor {
  id: number;
  name: string;
  title: string;
  bio: string;
  biography: string;
  photo_url: string;
  specialties: string;
  email: string;
  books: string[];
  links: LecturerLink[];
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  summary: string;
  description: string;
  level: string;
  duration: string;
  price: number | null;
  icon: string;
  image_url: string;
  aim: string;
  target_audience: string;
  prerequisites: string;
  what_you_learn: string[];
  schedule: string;
  start_date: string;
  language: string;
  format: string;
  min_age: number | null;
  max_age: number | null;
  max_students: number | null;
  certificate: boolean;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "enrolled";
  course_id: number | null;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type SiteContent = Record<string, string>;

export interface EmailSettings {
  enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  use_tls: boolean;
  username: string;
  from_email: string;
  from_name: string;
  admin_email: string;
  has_password: boolean;
}

export interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
}

export interface EmailEvent {
  key: string;
  name: string;
  recipient: string;
  variables: string[];
}
