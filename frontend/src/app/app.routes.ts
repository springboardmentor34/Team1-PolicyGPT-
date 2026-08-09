import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { PublicDashboardComponent } from './pages/dashboards/public-dashboard/public-dashboard.component';
import { AdminDashboardComponent } from './pages/dashboards/admin-dashboard/admin-dashboard.component';
import { OfficialDashboardComponent } from './pages/dashboards/official-dashboard/official-dashboard.component';
import { CitizenDashboardComponent } from './pages/dashboards/citizen-dashboard/citizen-dashboard.component';
import { ResearcherDashboardComponent } from './pages/dashboards/researcher-dashboard/researcher-dashboard.component';
import { OrganizationDashboardComponent } from './pages/dashboards/organization-dashboard/organization-dashboard.component';

import { PolicySearchComponent } from './pages/policy-search/policy-search.component';
import { SchemeDirectoryComponent } from './pages/scheme-directory/scheme-directory.component';
import { EligibilityCheckerComponent } from './pages/eligibility-checker/eligibility-checker.component';
import { PolicyComparisonComponent } from './pages/policy-comparison/policy-comparison.component';
import { ReportsAnalyticsComponent } from './pages/reports-analytics/reports-analytics.component';
import { FeedbackHelpComponent } from './pages/feedback-help/feedback-help.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboards/public', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Public Landing Page & Help Page
  { path: 'dashboards/public', component: PublicDashboardComponent },
  { path: 'feedback', component: FeedbackHelpComponent },

  // Role Dashboards (Protected)
  { path: 'dashboards/admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { roles: ['Administrator'] } },
  { path: 'dashboards/official', component: OfficialDashboardComponent, canActivate: [authGuard], data: { roles: ['Government Official'] } },
  { path: 'dashboards/citizen', component: CitizenDashboardComponent, canActivate: [authGuard], data: { roles: ['Citizen'] } },
  { path: 'dashboards/researcher', component: ResearcherDashboardComponent, canActivate: [authGuard], data: { roles: ['Researcher'] } },
  { path: 'dashboards/organization', component: OrganizationDashboardComponent, canActivate: [authGuard], data: { roles: ['Organization'] } },

  // Protected Feature Modules
  { path: 'policy-search', component: PolicySearchComponent, canActivate: [authGuard] },
  { path: 'schemes', component: SchemeDirectoryComponent, canActivate: [authGuard] },
  { path: 'eligibility', component: EligibilityCheckerComponent, canActivate: [authGuard] },
  { path: 'compare', component: PolicyComparisonComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsAnalyticsComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'dashboards/public' }
];
