import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FAQItem, FeedbackItem } from '../../core/models/models';

@Component({
  selector: 'app-feedback-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <div class="mb-4">
        <span class="badge bg-warning text-dark px-3 py-1.5 rounded-pill mb-2"><i class="fa-solid fa-comments me-1"></i> CITIZEN SUPPORT & HELP DESK</span>
        <h2 class="fw-bold" style="color: var(--gov-navy-primary);">Feedback & Frequently Asked Questions</h2>
        <p class="text-muted">Submit policy inquiries, report issues, track live query resolution progress, or search portal FAQs.</p>
      </div>

      <!-- Live Query Progress Tracker Board (For Logged-in Users) -->
      <div *ngIf="authService.isAuthenticated()" class="gov-card p-4 mb-5">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
          <div>
            <h4 class="fw-bold mb-1" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-bars-progress me-2"></i> My Submitted Inquiries & Live Progress Tracker Board</h4>
            <p class="text-muted small mb-0">Real-time status tracking for inquiries submitted across Citizen, Official, Researcher, and Enterprise accounts.</p>
          </div>
          <button (click)="fetchMyQueries()" class="btn btn-outline-primary btn-sm">
            <i class="fa-solid fa-rotate-right me-1"></i> Refresh Board
          </button>
        </div>

        <div *ngIf="loadingQueries" class="p-4 text-center text-muted">
          <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
          <span>Syncing query progress with PostgreSQL database...</span>
        </div>

        <div *ngIf="!loadingQueries && myQueries.length === 0" class="p-4 text-center text-muted bg-light rounded-3 border">
          <i class="fa-solid fa-inbox fs-3 text-secondary mb-2 d-block"></i>
          <span>No support inquiries submitted yet. Use the form on the right to log your query.</span>
        </div>

        <!-- Query Cards List -->
        <div *ngIf="!loadingQueries && myQueries.length > 0" class="row g-4">
          <div *ngFor="let q of myQueries" class="col-12">
            <div class="p-4 border rounded-3 bg-white shadow-sm">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center border-bottom pb-3 mb-3 gap-2">
                <div>
                  <span class="badge bg-secondary me-2">Ticket #{{ q.id }}</span>
                  <span class="badge bg-light text-dark border me-2">{{ q.category }}</span>
                  <span class="text-muted small"><i class="fa-solid fa-calendar-day me-1"></i> {{ q.created_at | date:'mediumDate' }}</span>
                </div>
                <div>
                  <span class="badge px-3 py-1.5 fs-7 fw-bold" [ngClass]="{
                    'bg-danger': q.status === 'OPEN' || q.status === 'Pending',
                    'bg-warning text-dark': q.status === 'IN_PROGRESS',
                    'bg-success': q.status === 'RESOLVED' || q.status === 'CLOSED'
                  }">
                    <i class="fa-solid" [ngClass]="{
                      'fa-clock': q.status === 'OPEN' || q.status === 'Pending',
                      'fa-spinner fa-spin': q.status === 'IN_PROGRESS',
                      'fa-circle-check': q.status === 'RESOLVED' || q.status === 'CLOSED'
                    }"></i> Status: {{ q.status }}
                  </span>
                </div>
              </div>

              <h5 class="fw-bold text-dark mb-1">{{ q.subject }}</h5>
              <p class="text-secondary small mb-3">{{ q.message }}</p>

              <!-- Live Resolution Stepper Progress Bar -->
              <div class="p-3 bg-light rounded-3 border mb-3">
                <span class="fs-8 fw-bold text-uppercase text-muted d-block mb-2"><i class="fa-solid fa-timeline me-1"></i> Live Resolution Stepper</span>
                <div class="row text-center g-2 small">
                  <div class="col-4">
                    <div class="p-2 rounded fw-semibold" [ngClass]="'bg-primary text-white'">
                      <i class="fa-solid fa-file-circle-check me-1"></i> 1. Submitted
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded fw-semibold" [ngClass]="q.status === 'IN_PROGRESS' || q.status === 'RESOLVED' || q.status === 'CLOSED' ? 'bg-warning text-dark' : 'bg-secondary-subtle text-muted'">
                      <i class="fa-solid fa-magnifying-glass me-1"></i> 2. Under Review
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="p-2 rounded fw-semibold" [ngClass]="q.status === 'RESOLVED' || q.status === 'CLOSED' ? 'bg-success text-white' : 'bg-secondary-subtle text-muted'">
                      <i class="fa-solid fa-circle-check me-1"></i> 3. Completed
                    </div>
                  </div>
                </div>
              </div>

              <!-- Official Government Response Box -->
              <div *ngIf="q.admin_response" class="p-3 bg-success-subtle border border-success-subtle rounded-3">
                <strong class="text-success d-block mb-1"><i class="fa-solid fa-reply me-1"></i> Official Government Resolution Response:</strong>
                <p class="mb-0 text-dark small">{{ q.admin_response }}</p>
              </div>
              <div *ngIf="!q.admin_response" class="p-2 bg-light rounded border text-muted fs-8 fst-italic">
                <i class="fa-solid fa-hourglass-half me-1 text-warning"></i> Awaiting official response from government desk.
              </div>

            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <!-- FAQ Accordion -->
        <div class="col-lg-7 col-xl-8">
          <div class="gov-card p-4 h-100">
            <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-circle-question me-2"></i> Portal FAQs</h4>

            <div class="accordion" id="faqAccordion">
              <div *ngFor="let faq of faqs; let i = index" class="accordion-item mb-2 border rounded">
                <h2 class="accordion-header" [id]="'heading' + i">
                  <button class="accordion-button collapsed fw-semibold text-dark" type="button" data-bs-toggle="collapse" [attr.data-bs-target]="'#collapse' + i">
                    <span class="badge bg-secondary me-2">{{ faq.category }}</span> {{ faq.question }}
                  </button>
                </h2>
                <div [id]="'collapse' + i" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                  <div class="accordion-body text-secondary small">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Feedback Form -->
        <div class="col-lg-5 col-xl-4">
          <div class="gov-card p-4 h-100">
            <h4 class="fw-bold mb-3" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-paper-plane me-2"></i> Submit Inquiry</h4>

            <form (ngSubmit)="onSubmitFeedback()">
              <div class="mb-3">
                <label class="form-label fw-medium">Your Full Name</label>
                <input type="text" [(ngModel)]="userName" name="userName" class="form-control" placeholder="e.g. Priya Sharma" required>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Email Address</label>
                <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="priya@example.com" required>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Inquiry Category</label>
                <select [(ngModel)]="category" name="category" class="form-select">
                  <option value="Eligibility Inquiry">Eligibility Inquiry</option>
                  <option value="Policy Clarification">Policy Clarification</option>
                  <option value="Technical Bug Report">Technical Bug Report</option>
                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Subject</label>
                <input type="text" [(ngModel)]="subject" name="subject" class="form-control" placeholder="Short description of your query" required>
              </div>

              <div class="mb-3">
                <label class="form-label fw-medium">Message / Query Details</label>
                <textarea [(ngModel)]="message" name="message" class="form-control" rows="4" placeholder="Explain your inquiry in detail..." required></textarea>
              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-saffron w-100 py-2.5">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fa-solid fa-paper-plane me-2"></i> Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  `
})
export class FeedbackHelpComponent implements OnInit {
  public faqs: FAQItem[] = [];
  public myQueries: FeedbackItem[] = [];
  public loadingQueries = false;

  public userName = '';
  public email = '';
  public category = 'General Enquiry';
  public subject = '';
  public message = '';

  public loading = false;

  public apiService = inject(ApiService);
  public authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.apiService.getFAQs().subscribe(data => this.faqs = data);

    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.full_name;
      this.email = user.email;
      this.fetchMyQueries();
    }
  }

  fetchMyQueries() {
    this.loadingQueries = true;
    this.apiService.getMyQueries().subscribe({
      next: (data) => {
        this.myQueries = data || [];
        this.loadingQueries = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingQueries = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitFeedback() {
    if (!this.subject || !this.message) {
      alert('Please fill in subject and message.');
      return;
    }
    this.loading = true;
    const payload = {
      user_name: this.userName,
      email: this.email,
      category: this.category,
      subject: this.subject,
      message: this.message
    };

    this.apiService.submitFeedback(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Thank you! Your feedback inquiry ticket has been logged and assigned to official desk.');
        this.subject = '';
        this.message = '';
        if (this.authService.isAuthenticated()) {
          this.fetchMyQueries();
        }
      },
      error: () => this.loading = false
    });
  }
}

