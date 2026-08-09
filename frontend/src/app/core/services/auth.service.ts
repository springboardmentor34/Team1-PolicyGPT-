import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { User, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1/auth';
  
  public currentUser = signal<User | null>(this.getUserFromStorage());
  public token = signal<string | null>(localStorage.getItem('policygpt_token'));

  constructor(private http: HttpClient, private router: Router) {}

  private getUserFromStorage(): User | null {
    const data = localStorage.getItem('policygpt_user');
    return data ? JSON.parse(data) : null;
  }

  public register(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  public login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.setSession(res);
        this.redirectUserByRole(res.user.role);
      })
    );
  }

  public setSession(authResult: AuthResponse): void {
    localStorage.setItem('policygpt_token', authResult.access_token);
    localStorage.setItem('policygpt_user', JSON.stringify(authResult.user));
    this.token.set(authResult.access_token);
    this.currentUser.set(authResult.user);
  }

  public logout(): void {
    localStorage.removeItem('policygpt_token');
    localStorage.removeItem('policygpt_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  public redirectUserByRole(role: string): void {
    switch (role) {
      case 'Administrator':
        this.router.navigate(['/dashboards/admin']);
        break;
      case 'Government Official':
        this.router.navigate(['/dashboards/official']);
        break;
      case 'Citizen':
        this.router.navigate(['/dashboards/citizen']);
        break;
      case 'Researcher':
        this.router.navigate(['/dashboards/researcher']);
        break;
      case 'Organization':
        this.router.navigate(['/dashboards/organization']);
        break;
      case 'Guest User':
      default:
        this.router.navigate(['/dashboards/public']);
        break;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token();
  }

  public getRole(): string {
    return this.currentUser()?.role || 'Guest User';
  }
}
