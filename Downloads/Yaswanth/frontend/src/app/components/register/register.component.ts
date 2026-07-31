import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  username: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'Citizen';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(): void {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and Confirm Password do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signup({
      full_name: this.username,
      phone_number: this.phone,
      email: this.email,
      password: this.password,
      confirm_password: this.confirmPassword,
      role: this.role
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && err.error.detail) {
          this.errorMessage = err.error.detail;
        } else {
          this.errorMessage = 'Registration failed. Please check your details and try again.';
        }
      }
    });
  }
}