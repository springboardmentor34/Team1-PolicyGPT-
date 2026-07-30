import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  selectedRole = 'citizen';
  email = '';
  password = '';
  rememberMe = false;
  hidePassword = true;

  togglePasswordVisibility(event: MouseEvent): void {
    this.hidePassword = !this.hidePassword;
    event.stopPropagation();
  }

  onSignIn(): void {
    console.log('Signing in with:', { role: this.selectedRole, email: this.email, rememberMe: this.rememberMe });
    // Add authentication service call here
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    console.log('Forgot Password clicked');
    // Navigate to forgot password screen or open dialog
  }

  onGuestLogin(event: Event): void {
    event.preventDefault();
    console.log('Continuing as Guest User');
    // Navigate to guest dashboard
  }

  onRegister(event: Event): void {
    event.preventDefault();
    console.log('Register clicked');
    // Navigate to registration page
  }
}