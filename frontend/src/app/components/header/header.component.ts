import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- UNAUTHENTICATED PUBLIC HEADER (Horizontal Navbar) -->
    <nav *ngIf="!authService.isAuthenticated()" class="navbar navbar-expand-lg gov-navbar sticky-top">
      <div class="container">
        <!-- Logo Branding -->
        <a class="navbar-brand d-flex align-items-center text-decoration-none" routerLink="/">
          <div class="text-white rounded-2 d-flex align-items-center justify-content-center me-2" style="width: 36px; height: 36px; background-color: var(--gov-navy-primary);">
            <i class="fa-solid fa-shield-halved fs-6"></i>
          </div>
          <div class="d-flex align-items-center">
            <span class="fs-4 fw-bold me-1 brand-title" style="color: var(--gov-navy-primary);">PolicyGPT</span>
            <span class="brand-badge">GOV INTEL</span>
          </div>
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 fw-medium ms-lg-4">
            <li class="nav-item"><a class="nav-link" routerLink="/dashboards/public" routerLinkActive="active"><i class="fa-solid fa-house me-1 small"></i> Home</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/feedback" routerLinkActive="active"><i class="fa-solid fa-circle-question me-1 small"></i> Help / FAQs</a></li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <button (click)="themeService.toggleTheme()" class="btn btn-sm btn-gov-outline p-2 me-1 rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;" [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <i class="fa-solid" [ngClass]="themeService.isDarkMode() ? 'fa-sun text-warning' : 'fa-moon text-dark'"></i>
            </button>
            <a routerLink="/login" class="btn btn-gov-outline btn-sm px-3">
              <i class="fa-solid fa-right-to-bracket me-1"></i> Sign In
            </a>
            <a routerLink="/register" class="btn btn-gov-saffron btn-sm px-3">
              <i class="fa-solid fa-user-plus me-1"></i> Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- AUTHENTICATED USER LEFT SIDEBAR NAVIGATION -->
    <aside *ngIf="authService.currentUser() as user" class="gov-sidebar">
      <div class="sidebar-top">
        <!-- Sidebar Brand Header -->
        <div class="sidebar-header">
          <a class="d-flex align-items-center text-decoration-none" routerLink="/">
            <div class="text-white rounded-2 d-flex align-items-center justify-content-center me-2" style="width: 34px; height: 34px; background-color: var(--gov-navy-primary);">
              <i class="fa-solid fa-shield-halved fs-6"></i>
            </div>
            <div class="d-flex align-items-center">
              <span class="fs-5 fw-bold me-1 brand-title" style="color: var(--gov-navy-primary);">PolicyGPT</span>
              <span class="brand-badge">GOV</span>
            </div>
          </a>
        </div>

        <!-- User Identity Card -->
        <div class="sidebar-user-card">
          <div class="d-flex align-items-center gap-3">
            <div class="sidebar-user-avatar position-relative">
              {{ user.full_name.charAt(0).toUpperCase() }}
            </div>
            <div class="overflow-hidden">
              <h6 class="fw-bold text-truncate mb-0 user-name" style="color: var(--gov-navy-primary);">{{ user.full_name }}</h6>
              <span class="badge bg-secondary-subtle text-dark fs-7 px-2 py-0.5 border mt-1 role-badge">{{ user.role }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vertical Sidebar Menu (Scrollable Middle Section) -->
      <div class="sidebar-menu">
        <div class="sidebar-menu-title">Main Menu</div>

        <!-- Role Dashboard Link -->
        <a [routerLink]="getDashboardRoute(user.role)" routerLinkActive="active" class="sidebar-link d-flex justify-content-between align-items-center">
          <div>
            <i class="fa-solid fa-gauge"></i>
            <span>Dashboard</span>
          </div>
          <span *ngIf="unreadCount > 0" class="badge bg-danger rounded-pill px-2 py-1 fs-8">{{ unreadCount }}</span>
        </a>

        <!-- Feature Modules Links -->
        <a routerLink="/policy-search" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Policy Search</span>
        </a>

        <a routerLink="/schemes" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-hand-holding-hand"></i>
          <span>Public Schemes</span>
        </a>

        <a routerLink="/eligibility" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-user-check"></i>
          <span>Eligibility Checker</span>
        </a>

        <a routerLink="/compare" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-code-compare"></i>
          <span>Compare Schemes</span>
        </a>

        <a routerLink="/reports" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-file-invoice"></i>
          <span>Reports & Export</span>
        </a>

        <div class="sidebar-menu-title mt-3">Support</div>

        <a routerLink="/feedback" routerLinkActive="active" class="sidebar-link">
          <i class="fa-solid fa-circle-question"></i>
          <span>Help & FAQs</span>
        </a>
      </div>

      <!-- Sidebar Footer Controls (Permanently Pinned at Bottom) -->
      <div class="sidebar-footer d-flex align-items-center justify-content-between">
        <button (click)="themeService.toggleTheme()" class="btn btn-sm btn-gov-outline p-2 rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;" [title]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <i class="fa-solid" [ngClass]="themeService.isDarkMode() ? 'fa-sun text-warning' : 'fa-moon text-dark'"></i>
        </button>

        <button (click)="authService.logout()" class="btn btn-outline-danger btn-sm rounded-2 px-3">
          <i class="fa-solid fa-sign-out-alt me-1"></i> Logout
        </button>
      </div>
    </aside>
  `
})
export class HeaderComponent implements OnInit {
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private apiService = inject(ApiService);

  public unreadCount = 0;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.apiService.getUnreadNotificationCount().subscribe({
        next: (res) => this.unreadCount = res.unread_count,
        error: () => {}
      });
    }
  }

  getDashboardRoute(role: string): string {
    switch (role) {
      case 'Administrator':
        return '/dashboards/admin';
      case 'Government Official':
        return '/dashboards/official';
      case 'Citizen':
        return '/dashboards/citizen';
      case 'Researcher':
        return '/dashboards/researcher';
      case 'Organization':
        return '/dashboards/organization';
      default:
        return '/dashboards/public';
    }
  }
}

