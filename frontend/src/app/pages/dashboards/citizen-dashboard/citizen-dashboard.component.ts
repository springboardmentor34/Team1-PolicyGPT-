import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { SchemeEligibilityResult, NotificationItem, FeedbackItem } from '../../../core/models/models';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-0">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <span class="badge bg-success text-white px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-user-check me-1"></i> CITIZEN BENEFICIARY PORTAL</span>
          <h2 class="fw-bold mb-0" style="color: var(--gov-navy-primary);">Welcome, {{ authService.currentUser()?.full_name }}</h2>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/feedback" class="btn btn-outline-primary btn-sm">
            <i class="fa-solid fa-paper-plane me-1"></i> Submit Query
          </a>
          <a routerLink="/eligibility" class="btn btn-gov-saffron btn-sm">
            <i class="fa-solid fa-sliders me-1"></i> Re-check Eligibility
          </a>
        </div>
      </div>

      <!-- Citizen Profile & Summary Row -->
      <div class="row g-4 mb-4">
        <div class="col-lg-4">
          <div class="gov-card p-4 h-100">
            <h5 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-id-card me-2"></i> Citizen Demographic Profile</h5>
            <ul class="list-unstyled mb-0 fs-7 text-secondary">
              <li class="mb-2"><strong>Email:</strong> {{ authService.currentUser()?.email }}</li>
              <li class="mb-2"><strong>State:</strong> {{ authService.currentUser()?.state || 'Maharashtra' }}</li>
              <li class="mb-2"><strong>Occupation:</strong> {{ authService.currentUser()?.occupation || 'Farmer' }}</li>
              <li class="mb-2"><strong>Annual Income:</strong> ₹{{ authService.currentUser()?.income_annual || 180000 | number }}</li>
              <li class="mb-0"><strong>Social Category:</strong> {{ authService.currentUser()?.social_category || 'OBC' }}</li>
            </ul>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="gov-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-bell me-2"></i> Notifications & Reminders</h5>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-danger">{{ unreadCount }} Unread Alerts</span>
                <button *ngIf="unreadCount > 0" (click)="markAllRead()" class="btn btn-link btn-sm text-decoration-none p-0">Mark All Read</button>
              </div>
            </div>
            <div *ngIf="notifications.length === 0" class="text-muted small py-3"><i class="fa-solid fa-circle-check me-1 text-success"></i> You have no new notifications.</div>
            <div class="list-group list-group-flush" style="max-height: 220px; overflow-y: auto;">
              <div *ngFor="let notif of notifications" class="list-group-item px-0 d-flex justify-content-between align-items-start" [ngClass]="{'bg-light': notif.is_read}">
                <div>
                  <span class="badge bg-warning text-dark me-2">{{ notif.type }}</span>
                  <strong class="text-dark d-block">{{ notif.title }}</strong>
                  <p class="text-secondary small mb-0">{{ notif.message }}</p>
                </div>
                <button *ngIf="!notif.is_read" (click)="markRead(notif.id)" class="btn btn-link btn-sm text-decoration-none text-muted">
                  <i class="fa-solid fa-check me-1"></i> Read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Matched Schemes for Citizen -->
      <div class="gov-card p-4 mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-wand-magic-sparkles me-2"></i> High-Match Public Welfare Schemes for You</h4>
          <span class="badge bg-success">Automated Demographic Match</span>
        </div>

        <div class="row g-4">
          <div *ngFor="let match of matchedSchemes" class="col-md-6">
            <div class="p-3 border rounded-3 bg-light">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-navy text-white" style="background-color: var(--gov-navy-primary);">{{ match.scheme.category }}</span>
                <span class="badge" [ngClass]="match.match_score > 70 ? 'bg-success' : 'bg-warning text-dark'">{{ match.match_score }}% Match</span>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ match.scheme.name }}</h5>
              <p class="text-secondary small mb-2">{{ match.scheme.benefits }}</p>
              <div class="p-2 bg-white rounded border small mb-2">
                <strong class="text-success"><i class="fa-solid fa-circle-check me-1"></i> Application Guidance:</strong>
                <p class="mb-0 text-muted fs-7">{{ match.application_guidance }}</p>
              </div>
              <a [href]="match.scheme.application_link || '#'" target="_blank" class="btn btn-gov-saffron btn-sm w-100">
                <i class="fa-solid fa-external-link me-1"></i> Apply Direct at {{ match.scheme.code }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- My Queries & Support Tickets Status Section -->
      <div class="gov-card p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-comments me-2"></i> My Support Inquiries & Tickets</h4>
          <a routerLink="/feedback" class="btn btn-gov-navy btn-sm"><i class="fa-solid fa-plus me-1"></i> Submit New Query</a>
        </div>
        <div *ngIf="myQueries.length === 0" class="p-4 text-center text-muted bg-light rounded">
          <i class="fa-solid fa-inbox fs-3 text-secondary mb-2 d-block"></i>
          <span>You haven't submitted any support inquiries yet.</span>
        </div>
        <div *ngIf="myQueries.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Ticket ID</th><th>Category</th><th>Subject</th><th>Status</th><th>Submitted</th><th>Official Admin Response</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let q of myQueries">
                <td><span class="badge bg-secondary">#{{ q.id }}</span></td>
                <td><span class="badge bg-light text-dark border">{{ q.category }}</span></td>
                <td class="fw-semibold">{{ q.subject }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-danger': q.status === 'OPEN' || q.status === 'Pending',
                    'bg-warning text-dark': q.status === 'IN_PROGRESS',
                    'bg-success': q.status === 'RESOLVED',
                    'bg-secondary': q.status === 'CLOSED'
                  }">{{ q.status }}</span>
                </td>
                <td>{{ q.created_at | date:'shortDate' }}</td>
                <td>
                  <span *ngIf="q.admin_response" class="text-dark bg-light p-2 rounded d-block border small">
                    <i class="fa-solid fa-reply text-success me-1"></i> {{ q.admin_response }}
                  </span>
                  <span *ngIf="!q.admin_response" class="text-muted fst-italic">Awaiting official response...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class CitizenDashboardComponent implements OnInit {
  public matchedSchemes: SchemeEligibilityResult[] = [];
  public notifications: NotificationItem[] = [];
  public myQueries: FeedbackItem[] = [];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  public authService = inject(AuthService);
  private apiService = inject(ApiService);

  ngOnInit() {
    const user = this.authService.currentUser();
    const payload = {
      age: user?.age || 28,
      gender: user?.gender || 'Female',
      income_annual: user?.income_annual || 180000,
      occupation: user?.occupation || 'Farmer',
      education_level: user?.education_level || 'Graduate',
      location_type: 'All',
      social_category: user?.social_category || 'OBC',
      disability_status: user?.disability_status || false
    };

    this.apiService.checkEligibility(payload).subscribe(data => {
      this.matchedSchemes = data.slice(0, 4);
    });

    this.fetchNotifications();
    this.fetchMyQueries();
  }

  fetchNotifications() {
    this.apiService.getNotifications().subscribe(data => {
      this.notifications = data || [];
    });
  }

  fetchMyQueries() {
    this.apiService.getMyQueries().subscribe(data => {
      this.myQueries = data || [];
    });
  }

  markRead(id: number) {
    this.apiService.markNotificationRead(id).subscribe({
      next: () => {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.is_read = true;
      }
    });
  }

  markAllRead() {
    this.apiService.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
      }
    });
  }
}

