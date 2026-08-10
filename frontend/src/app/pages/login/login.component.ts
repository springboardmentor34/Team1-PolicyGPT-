import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
          <div class="gov-card p-4 p-md-5 auth-card-enter">
            <div class="text-center mb-4">
              <div class="text-white rounded-2 d-inline-flex align-items-center justify-content-center mb-3" style="width: 52px; height: 52px; background-color: var(--gov-navy-primary);">
                <i class="fa-solid fa-shield-halved fs-4"></i>
              </div>
              <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Sign In to PolicyGPT</h3>
              <p class="text-muted small">Access official government policy directives, public schemes, and role dashboards.</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show small py-2" role="alert">
              <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onLogin()">
              <div class="mb-3">
                <label class="form-label fw-medium text-dark small"><i class="fa-solid fa-envelope me-1 text-muted"></i> Email Address *</label>
                <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="name@policygpt.gov.in" required autocomplete="email">
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label fw-medium text-dark small mb-0"><i class="fa-solid fa-lock me-1 text-muted"></i> Password *</label>
                  <a routerLink="/forgot-password" class="small text-decoration-none fw-semibold" style="color: var(--gov-navy-secondary);">Forgot Password?</a>
                </div>
                <div class="password-group">
                  <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="form-control pe-5" placeholder="••••••••" required autocomplete="current-password">
                  <button type="button" (click)="showPassword = !showPassword" class="password-toggle-btn" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                    <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-navy w-100 py-2.5 mt-2 mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fa-solid fa-right-to-bracket me-2"></i> Sign In
              </button>
            </form>

            <div class="border-top pt-3 text-center">
              <span class="text-muted small">Don't have an account? </span>
              <a routerLink="/register" class="fw-bold text-decoration-none" style="color: var(--gov-saffron);">Create Account</a>
            </div>

            <!-- Quick Development Test Accounts Helper -->
            <div class="mt-4 pt-3 border-top">
              <span class="badge bg-light text-dark border mb-2">Test Development Accounts</span>
              <div class="d-flex flex-wrap gap-1">
                <button type="button" (click)="fillCreds('admin@policygpt.gov.in', 'Admin@123456')" class="btn btn-light btn-sm border fs-7">Admin</button>
                <button type="button" (click)="fillCreds('official@policygpt.gov.in', 'Official@123456')" class="btn btn-light btn-sm border fs-7">Official</button>
                <button type="button" (click)="fillCreds('citizen@policygpt.gov.in', 'Citizen@123456')" class="btn btn-light btn-sm border fs-7">Citizen</button>
                <button type="button" (click)="fillCreds('researcher@policygpt.gov.in', 'Researcher@123456')" class="btn btn-light btn-sm border fs-7">Researcher</button>
                <button type="button" (click)="fillCreds('org@policygpt.gov.in', 'Org@123456')" class="btn btn-light btn-sm border fs-7">Org</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  public email = '';
  public password = '';
  public showPassword = false;
  public loading = false;
  public errorMessage = '';

  private authService = inject(AuthService);

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email address and password.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Authentication failed. Please verify your credentials.';
      }
    });
  }

  fillCreds(e: string, p: string) {
    this.email = e;
    this.password = p;
  }
}
