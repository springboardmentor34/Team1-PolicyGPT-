import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CitizenDashboard } from './pages/citizen-dashboard/citizen-dashboard';
import { GovernmentDashboard } from './pages/government-dashboard/government-dashboard';
import { PolicySearch } from './pages/policy-search/policy-search';
import { PolicyDetails } from './pages/policy-details/policy-details';
import { SchemeDetails } from './pages/scheme-details/scheme-details';
import { EligibilityChecker } from './pages/eligibility-checker/eligibility-checker';
import { Reports } from './pages/reports/reports';
import { Notifications } from './pages/notifications/notifications';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'citizen-dashboard', component: CitizenDashboard },
  { path: 'government-dashboard', component: GovernmentDashboard },

  { path: 'policy-search', component: PolicySearch },
  { path: 'policy-details', component: PolicyDetails },
  { path: 'scheme-details', component: SchemeDetails },

  { path: 'eligibility-checker', component: EligibilityChecker },

  { path: 'reports', component: Reports },

  { path: 'notifications', component: Notifications },

  { path: '**', redirectTo: 'login' }
];
