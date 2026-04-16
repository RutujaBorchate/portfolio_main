export type UserRole = 'student' | 'teacher' | 'admin' | 'institution'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  is_approved: boolean
  institution_id?: string
  created_at: string
  updated_at: string
}

export interface Institution {
  id: string
  name: string
  logo_url?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  teacher_id: string
  grade_level: string
  is_approved: boolean
  created_at: string
  updated_at: string
  teacher_name?: string
  enrollment_count?: number
  module_count?: number
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  video_url?: string
  content?: string
  order_index: number
  duration_minutes?: number
  created_at: string
}

export interface ModuleProgress {
  id: string
  user_id: string
  module_id: string
  completed: boolean
  watched_seconds: number
  completed_at?: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'pending' | 'approved' | 'rejected'
  progress_percent: number
  enrolled_at: string
  completed_at?: string
  course_title?: string
  course_thumbnail?: string
  student_name?: string
  student_email?: string
}

export interface Quiz {
  id: string
  module_id: string
  title: string
  max_attempts: number
  passing_score: number
  created_at: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_option: number
  order_index: number
}

export interface QuizSubmission {
  id: string
  quiz_id: string
  user_id: string
  score: number
  answers: Record<string, number>
  passed: boolean
  submitted_at: string
}

export interface Assignment {
  id: string
  module_id: string
  title: string
  description: string
  due_date?: string
  max_score: number
  created_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  user_id: string
  content?: string
  file_url?: string
  score?: number
  feedback?: string
  submitted_at: string
  graded_at?: string
  student_name?: string
  assignment_title?: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  pdf_url?: string
  course_title?: string
  student_name?: string
}

export interface DashboardStats {
  totalStudents?: number
  totalTeachers?: number
  totalCourses?: number
  totalEnrollments?: number
  pendingApprovals?: number
  completionRate?: number
}
