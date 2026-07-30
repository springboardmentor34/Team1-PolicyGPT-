import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  // Redirect root path to login (optional)
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  
  // Define login route
  { path: 'login', component: LoginComponent },
  
  // Add other routes here (e.g., dashboard, chat, etc.)
];