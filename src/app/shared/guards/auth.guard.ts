import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../features/auth/services/login-service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  if (loginService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
