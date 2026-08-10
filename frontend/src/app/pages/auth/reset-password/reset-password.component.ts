import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
          <div class="gov-card p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="text-white rounded-2 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: var(--gov-navy-primary);">
                <i class="fa-solid fa-lock fs-4"></i>
              </div>
              <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Set New Password</h3>
              <p class="text-muted small">Choose a secure new password for your PolicyGPT account.</p>
            </div>

            <!-- Email Link Sent Banner -->
            <div *ngIf="infoMessage" class="alert alert-info small py-3 mb-3 border-0 shadow-sm" role="alert" style="background-color: #e8f4fd; border-left: 4px solid #0288d1 !important; color: #014361;">
              <div class="d-flex align-items-start">
                <i class="fa-solid fa-envelope-circle-check fs-5 me-2 mt-0.5 text-primary"></i>
                <div>
                  <strong>Check Your Email Inbox!</strong>
                  <div class="mt-1">{{ infoMessage }}</div>
                </div>
              </div>
            </div>

            <!-- Success Banner -->
            <div *ngIf="successMessage" class="alert alert-success small py-3 mb-3" role="alert">
              <div class="d-flex align-items-start">
                <i class="fa-solid fa-circle-check fs-5 me-2 mt-0.5"></i>
                <div>
                  <strong>Password Reset Successful!</strong>
                  <div class="mt-1">{{ successMessage }}</div>
                </div>
              </div>
              <a routerLink="/login" class="btn btn-gov-navy btn-sm w-100 mt-3">
                <i class="fa-solid fa-right-to-bracket me-1"></i> Proceed to Sign In
              </a>
            </div>

            <!-- Error Banner -->
            <div *ngIf="errorMessage" class="alert alert-danger small py-2 mb-3" role="alert">
              <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onReset()" *ngIf="!successMessage">
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark"><i class="fa-solid fa-key me-1 text-muted"></i> Reset Token *</label>
                <input type="text" [(ngModel)]="token" name="token" class="form-control" placeholder="Paste reset token..." required>
                <div *ngIf="!token" class="form-text text-muted fs-7">Token is automatically populated when you click the link in your email.</div>
              </div>

              <!-- Password with Show/Hide Eye Toggle -->
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark"><i class="fa-solid fa-lock me-1 text-muted"></i> New Password *</label>
                <div class="password-group">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" class="form-control pe-5" placeholder="Minimum 6 characters" required autocomplete="new-password">
                  <button type="button" (click)="showPassword = !showPassword" class="password-toggle-btn" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                    <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Confirm Password with Show/Hide Eye Toggle -->
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark"><i class="fa-solid fa-check-double me-1 text-muted"></i> Confirm New Password *</label>
                <div class="password-group">
                  <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="form-control pe-5" placeholder="Re-enter new password" required autocomplete="new-password">
                  <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="password-toggle-btn" [attr.aria-label]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'">
                    <i class="fa-solid" [ngClass]="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-saffron w-100 py-2.5 mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fa-solid fa-shield-cat me-2"></i> Update Password
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
export class ResetPasswordComponent implements OnInit {
  public token = '';
  public newPassword = '';
  public confirmPassword = '';
  public showPassword = false;
  public showConfirmPassword = false;
  public loading = false;
  public errorMessage = '';
  public successMessage = '';
  public infoMessage = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'].trim();
      }
      if (params['sent'] === 'true') {
        this.infoMessage = 'Password reset instructions have been sent to your email! Please check your inbox for the email link, or enter your reset token below to update your password.';
      }
    });
  }

  onReset() {
    if (!this.token) {
      this.errorMessage = 'Password reset token is missing. Please check your reset link or paste your token.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please re-enter.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.infoMessage = '';
        this.successMessage = res.message || 'Your password has been successfully updated. You may now sign in.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Password reset failed. The token may be invalid or expired.';
      }
    });
  }
}
