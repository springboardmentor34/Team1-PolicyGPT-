import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string; role: string }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  signup(userData: {
    full_name: string;
    phone_number?: string;
    email: string;
    password: string;
    confirm_password: string;
    role: string;
  }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/signup`, userData).pipe(
      tap((res) => this.saveSession(res))
    );
  }

  saveSession(response: TokenResponse): void {
    if (typeof window !== 'undefined' && window.localStorage && response && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem('access_token');
  }

  getUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getUserRole(): string {
    const user = this.getUser();
    return user ? user.role : '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }
}
