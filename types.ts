// types.ts - COMPLETE FIXED VERSION

export enum Page {
  Home = 'Home',
  CourseDetail = 'course-detail',
  Courses = 'Courses',
  About = 'About',
  Gallery = 'Gallery',
  Team = 'Our Team',
  Apply = 'Apply',
  PrivacyPolicy = 'privacy-policy',
  // Admin Pages
  AdminDashboard = 'AdminDashboard',
  AdminStudents = 'AdminStudents',
  AdminApplications = 'AdminApplications',
  AdminCMS = 'AdminCMS',
  AdminStaff = 'AdminStaff',
  AdminSettings = 'AdminSettings',
  AdminAccount = 'AdminAccount',
  StudentContent = 'StudentContent',
  StudentNotifications = 'StudentNotifications',
  BroadcastMessages = 'BroadcastMessages',
  NewsDetail = 'NewsDetail',
  // Student Pages
  StudentDashboard = 'StudentDashboard',
  StudentProfile = 'StudentProfile',
  StudentCourses = 'StudentCourses',
  StudentAnnouncements = 'StudentAnnouncements',
  StudentDocuments = 'StudentDocuments',
  StudentFees = 'StudentFees',
  //PayFast
  PaymentSuccess = 'payment-success',
  PaymentCancel = 'payment-cancel',
}

export type ViewMode = 'public' | 'admin' | 'student';

// Backend Course Model - COMPLETE with all frontend fields
export interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  saqa_id?: string;
  nqf_level?: string;
  credits?: number;
  is_visible?: boolean;
  // Frontend display fields
  short_title: string;
  short_description: string;
  deposit_amount: number;
  monthly_payment: number;
  total_payment: number;
  assessment_fee: number;
  fee: number;
  registration_fee: number;
  level: string;
  curriculum: string;
  prerequisites: string;
  requirements: string;
  career_opportunities: string;
  course_pdf_url: string;
  image_url: string;
  is_math_required: boolean;
  is_featured: boolean;
}

// Frontend Course (for display)
export interface CourseCard {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  isVisible?: boolean;
}

export interface Value {
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  image: string;
  order: number;
  is_active: boolean;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  // Frontend backward compatibility
  role?: string; 
}

export interface NewsletterPost {
  id: number;
  title: string;
  date: string;
  preview_text: string;
  content: string;
  date_published: string;
  is_published: boolean;
}

export interface NewsPost {
  id: number;
  title: string;
  preview_text: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export enum StudentStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Graduated = 'Graduated',
  Suspended = 'Suspended'
}

export enum FeeStatus {
  Paid = 'Paid',
  Partial = 'Partial',
  Outstanding = 'Outstanding',
  Pending = 'Pending'
}

// Backend Student Model - COMPLETE with backward compatibility
export interface Student {
  id: number;
  name: string;
  surname: string;
  student_id: string;
  course: number; // Course ID
  course_title?: string; // Course name
  status: StudentStatus;
  fees_status: FeeStatus;
  date_registered: string;
  email: string;
  phone: string;
  address?: string;
  profile_image?: string;
  application?: number; // Application ID
  
  // New fields
  age?: number;
  id_number?: string;
  country?: string;
  education_level?: string;
  previous_school?: string;
  user?: number; // User ID
  
  // Backward compatibility fields
  feesStatus?: FeeStatus;
  dateRegistered?: string;
  profileImage?: string;
}

// Student Login Credentials
export interface StudentLoginCredentials {
  student_id: string;
  email: string;
}

// Backend Application Model
export interface Application {
  id: number;
  name: string;
  surname: string;
  age: number;
  country: string;
  mobile: string;
  email: string;
  address: string;
  id_number: string;
  education_level: string;
  previous_school: string;
  course: number; // Course ID
  course_title: string; // Course name from serializer
  status: ApplicationStatus;
  date_submitted: string;
  created_at: string;
  formatted_date: string;
  id_document: string; // File path
  matric_certificate: string; // File path
  proof_of_payment: string; // File path
  fee_verified: boolean;
  funding_type?: 'self_funded' | 'funding_needed'; // Funding type
  documents_status: {
    id: boolean;
    matric: boolean;
    pop: boolean;
  };
}

// Student Document
export interface StudentDocument {
  id: number;
  name: string;
  type: string;
  file_url: string;
  upload_date: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Student Fee
export interface StudentFee {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: FeeStatus;
  balance: number;
}

// Student Announcement
export interface StudentAnnouncement {
  id: number;
  title: string;
  content: string;
  date: string;
  is_important: boolean;
  target?: 'all' | 'course' | 'specific';
  course_id?: number;
  read_count?: number;
  total_students?: number;
}

// Student Notification
export interface StudentNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  created_at: string;
  is_read: boolean;
  target?: 'all' | 'course' | 'specific';
  course_id?: number;
}

// Broadcast Message
export interface BroadcastMessage {
  id: number;
  title: string;
  message: string;
  sender: string;
  sent_at: string;
  recipients: number;
  read_count: number;
  target?: 'all' | 'course' | 'specific';
  course_id?: number;
}

// Application Documents Info
export interface ApplicationDocuments {
  id_document: {
    url: string;
    name: string;
    size: number | null;
  };
  matric_certificate: {
    url: string;
    name: string;
    size: number | null;
  };
  proof_of_payment: {
    url: string;
    name: string;
    size: number | null;
  } | null;
}

// Application Form Data
export interface ApplicationFormData {
  name: string;
  surname: string;
  age: number;
  country: string;
  mobile: string;
  education_level: string;
  previous_school: string;
  course: number;
  id_document: File;
  matric_certificate: File;
  proof_of_payment: File;
}

// Application Stats
export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  fee_verified: number;
}

export enum ApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Contacted = 'contacted'
}

// Content Management Stats
export interface ContentStats {
  total_announcements: number;
  important_announcements: number;
  recent_announcements: number;
  unread_by_students: number;
  notification_count: number;
  broadcast_count: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface GalleryImage {
  id: number;
  image: string;
  caption: string;
  uploaded_at: string;
}

export interface DirectorMessage {
  id: number;
  quote: string;
  video_url: string | null;
  video_file: string | null;
  last_updated: string;
}

export interface Slogan {
  id: number;
  text: string;
  highlight: string;
  order: number;
  is_active: boolean;
}

// Admin Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  activeLearners: number;
  newApplications: number;
  pendingApplications: number;
  revenue: string;
  totalAnnouncements: number;
  recentContent: number;
}

// Recent Application Preview
export interface RecentApplication {
  id?: number;
  name: string;
  course: string;
  date: string;
  status: ApplicationStatus;
  avatarLetter: string;
}

// System Notification
export interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  isRead: boolean;
}

// Admin User
/**
 * Shared helper for talking to the Django admin authentication API.
 *
 * The admin portal uses Django session authentication (no JWT / tokens stored in
 * the browser). Every unsafe request therefore needs the CSRF token that the
 * backend sets on the `csrftoken` cookie.
 */

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Read the CSRF token from the `csrftoken` cookie. */
export const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.substring(0, name.length + 1) === `${name}=`) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  last_login?: string | null;
}

export class AdminApiError extends Error {
  status: number;
  /** Field-level validation errors keyed by field name. */
  fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Converts a DRF error payload into a flat map of field -> messages.
 */
export const parseApiErrors = (payload: any): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};

  const collect = (key: string, value: any) => {
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map((v) => String(v));
    } else if (typeof value === 'string') {
      fieldErrors[key] = [value];
    }
  };

  if (payload && typeof payload === 'object') {
    Object.entries(payload).forEach(([key, value]) => collect(key, value));
  }

  return fieldErrors;
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Performs an authenticated request against the Django API.
 *
 * Always sends the session cookie and, for unsafe methods, the CSRF token.
 */
export const adminRequest = async <T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fieldErrors = parseApiErrors(payload);
    const detail =
      (payload && (payload.detail as string)) ||
      fieldErrors.detail?.[0] ||
      (fieldErrors && Object.values(fieldErrors)[0]?.[0]) ||
      `Request failed (${response.status})`;
    throw new AdminApiError(response.status, detail, fieldErrors);
  }

  return payload as T;
};

/** Authenticate an admin and start a Django session. */
export const adminLogin = async (email: string, password: string) => {
  // Make sure we hold a CSRF token before the (unsafe) login request.
  await ensureCsrfToken();
  return adminRequest<{ user: AdminUser }>('/auth/login/', {
    method: 'POST',
    body: { email, password },
  });
};

/**
 * Ensure a CSRF token is present in the `csrftoken` cookie.
 *
 * Django's CSRF middleware protects every unsafe request, including the
 * login POST, so the token has to be fetched before the first login attempt.
 */
export const ensureCsrfToken = async (): Promise<void> => {
  if (getCsrfToken()) return;
  await adminRequest<{ csrf_token: string }>('/auth/csrf/');
};

/** End the current admin session. */
export const adminLogout = async () => {
  await ensureCsrfToken();
  return adminRequest<{ message: string }>('/auth/logout/', { method: 'POST' });
};

/** Fetch the currently signed-in admin. */
export const adminMe = () => adminRequest<{ user: AdminUser }>('/auth/me/');

/** Change the signed-in admin's own password. */
export const adminChangePassword = async (payload: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  await ensureCsrfToken();
  return adminRequest<{ message: string }>('/auth/change-password/', {
    method: 'POST',
    body: payload,
  });
};


// File Upload Progress
export interface UploadProgress {
  id_document: number;
  matric_certificate: number;
  proof_of_payment: number;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filter Options
export interface ApplicationFilter {
  status?: ApplicationStatus;
  course?: number;
  date_from?: string;
  date_to?: string;
  fee_verified?: boolean;
}

export interface StudentFilter {
  status?: StudentStatus;
  fees_status?: FeeStatus;
  course?: number;
  search?: string;
}

// Content Filter Options
export interface ContentFilter {
  type?: 'announcement' | 'notification' | 'broadcast';
  date_from?: string;
  date_to?: string;
  important?: boolean;
  target?: 'all' | 'course' | 'specific';
  course_id?: number;
}

// Sort Options
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SortOption {
  field: string;
  order: SortOrder;
}

// Content Analytics
export interface ContentAnalytics {
  total_students: number;
  active_readers: number;
  average_read_time: number;
  engagement_rate: number;
  popular_content: StudentAnnouncement[];
}

// Content Creation Form
export interface ContentCreationForm {
  title: string;
  content: string;
  type: 'announcement' | 'notification' | 'broadcast';
  is_important: boolean;
  target: 'all' | 'course' | 'specific';
  course_id?: number;
  schedule_date?: string;
  sender?: string;
}

// Announcement Stats
export interface AnnouncementStats {
  id: number;
  title: string;
  sent_date: string;
  total_students: number;
  read_count: number;
  read_percentage: number;
  important: boolean;
}

// Course Selection Option
export interface CourseOption {
  id: number;
  title: string;
  student_count: number;
}