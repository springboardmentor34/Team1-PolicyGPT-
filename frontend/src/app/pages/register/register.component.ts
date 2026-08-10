import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-9 col-lg-7">
          <div class="gov-card p-4 p-md-5 auth-card-enter">
            <div class="text-center mb-4">
              <span class="badge bg-info text-dark px-3 py-1.5 rounded-pill mb-2">
                <i class="fa-solid fa-user-shield me-1"></i> PUBLIC CITIZEN PORTAL
              </span>
              <h3 class="fw-bold mb-1" style="color: var(--gov-navy-primary);">Citizen Registration</h3>
              <p class="text-muted small mb-0">Create a Citizen account to explore public schemes and run automated eligibility evaluations.</p>
              <div class="alert alert-light border small text-secondary mt-3 mb-0">
                <i class="fa-solid fa-circle-info text-info me-1"></i>
                <strong>Notice:</strong> Accounts for <em>Government Officials, Organizations, and Researchers</em> are provisioned exclusively by System Administrators.
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger small py-2" role="alert">
              <i class="fa-solid fa-circle-exclamation me-1"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onRegister()">
              <div class="row g-3">

                <!-- Full Name -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Full Name *</label>
                  <input type="text" [(ngModel)]="fullName" name="fullName" class="form-control" placeholder="e.g. Priya Sharma" required>
                </div>

                <!-- Email Address -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Email Address *</label>
                  <input type="email" [(ngModel)]="email" name="email" class="form-control" placeholder="name@example.com" required>
                </div>

                <!-- Mobile Number Field -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Mobile Number</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light text-muted border-end-0 fs-7">+91</span>
                    <input type="text" [(ngModel)]="mobileNumber" name="mobileNumber" class="form-control border-start-0" placeholder="9876543210" maxlength="10">
                  </div>
                </div>

                <!-- Account Role Display (Fixed to Citizen) -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Account Role</label>
                  <input type="text" value="Citizen (Public Beneficiary)" class="form-control bg-light" readonly disabled>
                </div>

                <!-- Password with Show/Hide Eye Toggle -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Password *</label>
                  <div class="password-group">
                    <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="form-control pe-5" placeholder="Minimum 6 characters" required>
                    <button type="button" (click)="showPassword = !showPassword" class="password-toggle-btn" [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                      <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Confirm Password *</label>
                  <div class="password-group">
                    <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="form-control pe-5" placeholder="Re-enter password" required>
                    <button type="button" (click)="showConfirmPassword = !showConfirmPassword" class="password-toggle-btn" [attr.aria-label]="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'">
                      <i class="fa-solid" [ngClass]="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Citizen Demographics Section -->
                <div class="col-12 mt-4">
                  <h6 class="fw-bold text-dark border-bottom pb-2 mb-3">Optional Demographic Profile (For Instant Eligibility Matching)</h6>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium small text-dark">Age (Years)</label>
                  <input type="number" [(ngModel)]="age" name="age" class="form-control" placeholder="e.g. 28">
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium small text-dark">Gender</label>
                  <select [(ngModel)]="gender" name="gender" class="form-select">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label fw-medium small text-dark">Annual Income (₹)</label>
                  <input type="number" [(ngModel)]="income" name="income" class="form-control" placeholder="e.g. 180000">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">State / Region</label>
                  <input type="text" [(ngModel)]="state" name="state" class="form-control" placeholder="e.g. Uttar Pradesh">
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-medium small text-dark">Occupation</label>
                  <input type="text" [(ngModel)]="occupation" name="occupation" class="form-control" placeholder="e.g. Farmer / Student">
                </div>

              </div>

              <button type="submit" [disabled]="loading" class="btn btn-gov-saffron w-100 py-2.5 mt-4 mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="fa-solid fa-user-check me-2"></i> Register Citizen Account
              </button>
            </form>

            <div class="text-center pt-2 border-top">
              <span class="text-muted small">Already have an account? </span>
              <a routerLink="/login" class="fw-bold text-decoration-none" style="color: var(--gov-navy-primary);">Sign In Here</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  public fullName = '';
  public email = '';
  public mobileNumber = '';
  public password = '';
  public confirmPassword = '';
  public showPassword = false;
  public showConfirmPassword = false;
  public role = 'Citizen';
  public state = '';
  public occupation = '';
  public age: number | null = null;
  public gender = 'Female';
  public income: number | null = null;

  public loading = false;
  public errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onRegister() {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and Confirm Password do not match.';
      return;
    }

    if (this.mobileNumber && (!/^\d{10}$/.test(this.mobileNumber))) {
      this.errorMessage = 'Please enter a valid 10-digit mobile number.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      full_name: this.fullName,
      email: this.email,
      password: this.password,
      role: 'Citizen', // PUBLIC REGISTRATION FORCED TO CITIZEN ROLE
      state: this.state || null,
      occupation: this.occupation || null,
      age: this.age,
      gender: this.gender,
      income_annual: this.income
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        alert('Citizen registration successful! Please sign in with your credentials.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.detail || 'Registration failed. Please check your information.';
      }
    });
  }
}
