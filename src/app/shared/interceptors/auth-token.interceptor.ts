import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '../../features/auth/services/login-service';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const token = loginService.getToken();

  if (!token) {
    return next(request);
  }

  const authRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        loginService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
