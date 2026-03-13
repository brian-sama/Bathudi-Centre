// types.ts - COMPLETE FIXED VERSION

export enum Page {
  Home = 'Home',
  CourseDetail = 'course-detail',
  Courses = 'Courses',
  About = 'About',
  Gallery = 'Gallery',
  Team = 'Our Team',
  Apply = 'Apply',
  // Admin Pages
  AdminDashboard = 'AdminDashboard',
  AdminStudents = 'AdminStudents',
  AdminApplications = 'AdminApplications',
  AdminCMS = 'AdminCMS',
  AdminSettings = 'AdminSettings',
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
  name: string;
  role: string;
  image: string;
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
  education_level: string;
  previous_school: string;
  course: number; // Course ID
  course_title: string; // Course name from serializer
  status: ApplicationStatus;
  date_submitted: string;
  formatted_date: string;
  id_document: string; // File path
  matric_certificate: string; // File path
  proof_of_payment: string; // File path
  fee_verified: boolean;
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
  };
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
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Contacted = 'Contacted'
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
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

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