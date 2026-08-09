import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
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
        <p class="text-muted">Submit policy inquiries, report issues, or search common portal questions.</p>
      </div>

      <div class="row g-4 mb-5">
        <!-- FAQ Accordion -->
        <div class="col-lg-7 col-xl-8">
          <div class="gov-card p-4">
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
          <div class="gov-card p-4">
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
  public userName = '';
  public email = '';
  public category = 'General Enquiry';
  public subject = '';
  public message = '';

  public loading = false;
  private apiService = inject(ApiService);

  ngOnInit() {
    this.apiService.getFAQs().subscribe(data => this.faqs = data);
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
      },
      error: () => this.loading = false
    });
  }
}
