import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
  id: string;
  title: string;
  description: string;
  sector: string;
  ministry_or_department: string;
  effective_date: string;
  status: string;
}

export interface Scheme {
  id: string;
  policy_id: string;
  title: string;
  code: string;
  summary: string;
  benefits_summary: string;
  budget_allocation: number;
  status: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone_number?: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/me`);
  }

  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(`${this.baseUrl}/policies/`);
  }

  getSchemes(): Observable<Scheme[]> {
    return this.http.get<Scheme[]>(`${this.baseUrl}/schemes/`);
  }
}
