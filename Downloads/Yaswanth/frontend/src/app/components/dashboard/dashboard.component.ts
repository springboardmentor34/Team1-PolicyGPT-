import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ApiService, Policy, Scheme, UserProfile } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: User | UserProfile | null = null;
  searchQuery: string = '';
  isLoadingData: boolean = false;

  schemes: Scheme[] = [
    { id: '1', policy_id: '1', title: 'PM Kisan Samman Nidhi', code: 'PM-KISAN', summary: 'Direct benefit transfer', benefits_summary: '₹6,000 / year direct benefit transfer', budget_allocation: 60000, status: 'Active' },
    { id: '2', policy_id: '1', title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana', code: 'PM-JAY', summary: 'Health insurance', benefits_summary: '₹5 Lakh per family per year health cover', budget_allocation: 120000, status: 'Active' },
    { id: '3', policy_id: '2', title: 'National Higher Education Subsidy', code: 'NHES', summary: 'Tuition subsidy', benefits_summary: 'Up to 50% tuition fee waiver', budget_allocation: 45000, status: 'Active' }
  ];

  policies: Policy[] = [
    { id: '1', title: 'National Green Hydrogen Mission 2026', description: 'Promoting clean energy', sector: 'Energy', ministry_or_department: 'Ministry of New & Renewable Energy', effective_date: '2026-01-01', status: 'Active' },
    { id: '2', title: 'Digital India Artificial Intelligence Framework', description: 'AI Governance', sector: 'Technology', ministry_or_department: 'Ministry of Electronics & IT', effective_date: '2026-03-15', status: 'Active' },
    { id: '3', title: 'National Education Quality Directive', description: 'Standardizing education', sector: 'Education', ministry_or_department: 'Ministry of Education', effective_date: '2026-05-10', status: 'Active' }
  ];

  auditLogs = [
    { timestamp: 'Just now', action: 'User Login', user: 'System', details: 'Authenticated via JWT Bearer Token' },
    { timestamp: '10 mins ago', action: 'Policy Synchronization', user: 'PostgreSQL DB', details: 'Fetched active policy models' },
    { timestamp: '1 hour ago', action: 'Scheme Check', user: 'API Gateway', details: 'Verified public scheme parameters' }
  ];

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (!this.currentUser && typeof window !== 'undefined') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoadingData = true;

    // 1. Fetch current user profile from protected endpoint /users/me
    this.apiService.getCurrentUser().subscribe({
      next: (profile) => {
        this.currentUser = profile;
        this.isLoadingData = false;
      },
      error: (err) => {
        console.warn('Could not refresh profile from /users/me:', err?.status);
        this.isLoadingData = false;
      }
    });

    // 2. Fetch policies from /policies/
    this.apiService.getPolicies().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.policies = data;
        }
      },
      error: (err) => {
        console.warn('Could not fetch policies from /policies/:', err?.status);
      }
    });

    // 3. Fetch schemes from /schemes/
    this.apiService.getSchemes().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.schemes = data;
        }
      },
      error: (err) => {
        console.warn('Could not fetch schemes from /schemes/:', err?.status);
      }
    });
  }

  get userRoleDisplay(): string {
    if (!this.currentUser) return 'User';
    const r = (this.currentUser.role || '').toLowerCase();
    if (r === 'admin') return 'Administrator';
    if (r === 'policy_officer' || r === 'officer') return 'Government Officer';
    return 'Citizen';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
