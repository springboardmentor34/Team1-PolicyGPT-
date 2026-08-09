import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Policy, Scheme, SchemeEligibilityResult, EligibilityCheckInput, NotificationItem, FeedbackItem, FAQItem, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  // --- Auth & Password Reset ---
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, { token, new_password: newPassword });
  }

  // --- Categories Management ---
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/`);
  }

  createCategory(name: string, description?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories/`, { name, description });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
  }

  // --- User Management ---
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/`, userData);
  }

  getUsers(role?: string, search?: string, isActive?: boolean): Observable<User[]> {
    let params = new HttpParams();
    if (role) params = params.append('role', role);
    if (search) params = params.append('search', search);
    if (isActive !== undefined) params = params.append('is_active', String(isActive));
    return this.http.get<User[]>(`${this.baseUrl}/users/`, { params });
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, userData);
  }

  updateUserStatus(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/status`, { is_active: isActive });
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/users/${id}`);
  }


  // --- Policies ---
  getPolicies(filters?: any): Observable<Policy[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.append(key, filters[key]);
      });
    }
    return this.http.get<Policy[]>(`${this.baseUrl}/policies/`, { params });
  }

  getPolicyById(id: number): Observable<Policy> {
    return this.http.get<Policy>(`${this.baseUrl}/policies/${id}`);
  }

  createPolicy(policy: any): Observable<Policy> {
    return this.http.post<Policy>(`${this.baseUrl}/policies/`, policy);
  }

  updatePolicy(id: number, policy: any): Observable<Policy> {
    return this.http.patch<Policy>(`${this.baseUrl}/policies/${id}`, policy);
  }

  updatePolicyStatus(id: number, status: string, rejectionReason?: string): Observable<Policy> {
    return this.http.post<Policy>(`${this.baseUrl}/policies/${id}/status`, { status, rejection_reason: rejectionReason });
  }

  approvePolicy(id: number): Observable<Policy> {
    return this.updatePolicyStatus(id, 'PUBLISHED');
  }

  archivePolicy(id: number): Observable<Policy> {
    return this.updatePolicyStatus(id, 'ARCHIVED');
  }

  deletePolicy(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/policies/${id}`);
  }

  // --- Schemes ---
  getSchemes(filters?: any): Observable<Scheme[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.append(key, filters[key]);
      });
    }
    return this.http.get<Scheme[]>(`${this.baseUrl}/schemes/`, { params });
  }

  getSchemeById(id: number): Observable<Scheme> {
    return this.http.get<Scheme>(`${this.baseUrl}/schemes/${id}`);
  }

  createScheme(scheme: any): Observable<Scheme> {
    return this.http.post<Scheme>(`${this.baseUrl}/schemes/`, scheme);
  }

  updateScheme(id: number, scheme: any): Observable<Scheme> {
    return this.http.patch<Scheme>(`${this.baseUrl}/schemes/${id}`, scheme);
  }

  archiveScheme(id: number): Observable<Scheme> {
    return this.http.post<Scheme>(`${this.baseUrl}/schemes/${id}/archive`, {});
  }

  deleteScheme(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/schemes/${id}`);
  }

  // --- Intelligent Search ---
  search(query: string, filters?: any): Observable<any> {
    let params = new HttpParams();
    if (query) params = params.append('q', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params = params.append(key, filters[key]);
      });
    }
    return this.http.get<any>(`${this.baseUrl}/search/`, { params });
  }

  // --- Eligibility Checker ---
  checkEligibility(input: EligibilityCheckInput): Observable<SchemeEligibilityResult[]> {
    return this.http.post<SchemeEligibilityResult[]>(`${this.baseUrl}/eligibility/check`, input);
  }

  // --- Policy & Scheme Comparison ---
  comparePolicies(policyIds: number[]): Observable<any> {
    let params = new HttpParams();
    policyIds.forEach(id => params = params.append('policy_ids', id));
    return this.http.get<any>(`${this.baseUrl}/compare/policies`, { params });
  }

  compareSchemes(schemeIds: number[]): Observable<any> {
    let params = new HttpParams();
    schemeIds.forEach(id => params = params.append('scheme_ids', id));
    return this.http.get<any>(`${this.baseUrl}/compare/schemes`, { params });
  }

  // --- Notifications ---
  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/notifications/`);
  }

  markNotificationRead(id: number): Observable<NotificationItem> {
    return this.http.put<NotificationItem>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  sendTestAlert(title: string, message: string, alertType: string = 'Policy Alert'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/send-test-alert`, null, {
      params: { title, message, alert_type: alertType }
    });
  }

  // --- Analytics ---
  getAnalyticsSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/summary`);
  }

  // --- Reports & Downloads ---
  downloadPoliciesPdf(): void {
    window.open(`${this.baseUrl}/reports/policies/pdf`, '_blank');
  }

  downloadSchemesExcel(): void {
    window.open(`${this.baseUrl}/reports/schemes/excel`, '_blank');
  }

  // --- Feedback & FAQs ---
  submitFeedback(feedback: any): Observable<FeedbackItem> {
    return this.http.post<FeedbackItem>(`${this.baseUrl}/feedback/`, feedback);
  }

  getFeedbackList(search?: string, statusFilter?: string, category?: string): Observable<FeedbackItem[]> {
    let params = new HttpParams();
    if (search) params = params.append('search', search);
    if (statusFilter) params = params.append('status', statusFilter);
    if (category) params = params.append('category', category);
    return this.http.get<FeedbackItem[]>(`${this.baseUrl}/feedback/`, { params });
  }

  respondFeedback(id: number, responseText: string, statusUpdate: string = 'RESOLVED'): Observable<FeedbackItem> {
    let params = new HttpParams().set('status_update', statusUpdate);
    if (responseText) params = params.set('response_text', responseText);
    return this.http.put<FeedbackItem>(`${this.baseUrl}/feedback/${id}/respond`, null, { params });
  }

  updateFeedbackStatus(id: number, statusUpdate: string): Observable<FeedbackItem> {
    return this.respondFeedback(id, '', statusUpdate);
  }

  deleteFeedback(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/feedback/${id}`);
  }

  getFAQs(): Observable<FAQItem[]> {
    return this.http.get<FAQItem[]>(`${this.baseUrl}/feedback/faqs`);
  }
}
