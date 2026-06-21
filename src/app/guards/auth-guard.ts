import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log('guard checking, currentUser:', authService.currentUser);

  if (authService.currentUser) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
