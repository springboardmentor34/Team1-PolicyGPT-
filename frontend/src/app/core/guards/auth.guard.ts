import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const allowedRoles = route.data?.['roles'] as Array<string>;

  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    authService.redirectUserByRole(currentUser.role);
    return false;
  }

  return true;
};
