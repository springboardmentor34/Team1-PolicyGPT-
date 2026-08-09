export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'Administrator' | 'Government Official' | 'Citizen' | 'Researcher' | 'Organization' | 'Guest User';
  department?: string;
  state?: string;
  occupation?: string;
  income_annual?: number;
  age?: number;
  gender?: string;
  education_level?: string;
  social_category?: string;
  disability_status?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Policy {
  id: number;
  title: string;
  code: string;
  description: string;
  summary?: string;
  category: string;
  ministry: string;
  department: string;
  state: string;
  sector: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED' | 'Draft' | 'Pending Approval' | 'Published' | 'Archived' | string;
  rejection_reason?: string;
  effective_date?: string;
  created_by_id?: number;
  approved_by_id?: number;
  document_url?: string;
  view_count: number;
  created_at: string;
}

export interface EligibilityRule {
  id?: number;
  scheme_id?: number;
  min_age: number;
  max_age: number;
  gender: string;
  max_income: number;
  occupation: string;
  education_level: string;
  location_type: string;
  social_category: string;
  disability_required: boolean;
  additional_notes?: string;
}

export interface Scheme {
  id: number;
  name: string;
  code: string;
  policy_id?: number;
  description: string;
  category: string;
  benefits: string;
  financial_assistance?: string;
  budget_allocated?: number;
  target_group?: string;
  application_process?: string;
  application_link?: string;
  deadline?: string;
  status: 'Active' | 'Under Review' | 'Closed' | 'Archived' | string;
  created_at: string;
  eligibility_rules?: EligibilityRule;
}

export interface EligibilityCheckInput {
  age: number;
  gender: string;
  income_annual: number;
  occupation: string;
  education_level: string;
  location_type: string;
  social_category: string;
  disability_status: boolean;
  category?: string;
}

export interface SchemeEligibilityResult {
  scheme: Scheme;
  match_score: number;
  is_eligible: boolean;
  reasons: string[];
  missing_criteria: string[];
  application_guidance: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface FeedbackItem {
  id: number;
  user_id?: number;
  user_name?: string;
  email?: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
}

export interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}
