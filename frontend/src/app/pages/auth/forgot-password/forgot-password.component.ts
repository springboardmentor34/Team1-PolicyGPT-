import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
          <div class="gov-card p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="text-white rounded-2 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: var(--gov-saffron);">
                <i class="fa-solid fa-key fs-4"></i>
              </div>
              <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Forgot Password</h3>
              <p class="text-muted small">Enter your registered email address to receive password reset instructions via email.</p>
            </div>

            <div *ngIf="successMessage" class="alert alert-success small py-3 mb-3" role="alert">
              <div class="d-flex align-items-start">
                <i class="fa-solid fa-circle-check fs-5 me-2 mt-0.5"></i>
                <div>
                  <strong>Email Sent Successfully!</strong>
                  <div class="mt-1">{{ successMessage }}</div>
                </div>
              </div>
              <a routerLink="/reset-password" class="btn btn-gov-saffron btn-sm w-100 mt-3 text-white fw-bold">
                <i class="fa-solid fa-lock me-1"></i> Go to Update Password Page <i class="fa-solid fa-arrow-right ms-1"></i>
              </a>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger small py-2 mb-3" role="alert">
              <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark"><i class="fa-solid fa-envelope me-1 text-muted"></i> Registered Email Address *</label>
                <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="name@domain.gov.in" required autocomplete="email" [disabled]="loading">
              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-navy w-100 py-2.5 mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span *ngIf="loading">Sending...</span>
                <span *ngIf="!loading"><i class="fa-solid fa-paper-plane me-2"></i> Send Password Reset Link</span>
              </button>
            </form>

            <div class="text-center pt-2 border-top">
              <a routerLink="/login" class="small fw-bold text-decoration-none" style="color: var(--gov-navy-primary);"><i class="fa-solid fa-arrow-left me-1"></i> Back to Sign In</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  public email = '';
  public loading = false;
  public successMessage = '';
  public errorMessage = '';

  private apiService = inject(ApiService);

  onSubmit() {
    if (this.loading) {
      return;
    }
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid registered email address.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.forgotPassword(this.email.trim())
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          this.successMessage = res.message || 'Password reset instructions have been sent to your email address.';
        },
        error: (err) => {
          this.errorMessage = err?.error?.detail || 'Request failed. Please check network connection and try again.';
        }
      });
  }
}
