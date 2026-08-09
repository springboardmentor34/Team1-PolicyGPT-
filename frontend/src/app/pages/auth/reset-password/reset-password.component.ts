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
              <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Set New Password</h3>
              <p class="text-muted small">Enter your reset token and new secure password.</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger small py-2" role="alert">
              <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onReset()">
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark">Reset Token *</label>
                <input type="text" [(ngModel)]="token" name="token" class="form-control" placeholder="Paste reset token..." required>
              </div>

              <!-- Password with Show/Hide Eye Toggle -->
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark">New Password *</label>
                <div class="password-group">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" class="form-control pe-5" placeholder="Minimum 6 characters" required>
                  <button type="button" (click)="showPassword = !showPassword" class="password-toggle-btn" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                    <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Confirm Password with Show/Hide Eye Toggle -->
              <div class="mb-3">
                <label class="form-label fw-medium small text-dark">Confirm New Password *</label>
                <div class="password-group">
                  <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="form-control pe-5" placeholder="Re-enter password" required>
                  <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="password-toggle-btn" [attr.aria-label]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'">
                    <i class="fa-solid" [ngClass]="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-saffron w-100 py-2.5 mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fa-solid fa-lock me-2"></i> Update Password & Sign In
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  onReset() {
    if (!this.token || !this.newPassword) {
      this.errorMessage = 'Please provide both token and new password.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.apiService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        alert('Password successfully reset! You may now sign in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Password reset failed. Check token validity.';
      }
    });
  }
}
