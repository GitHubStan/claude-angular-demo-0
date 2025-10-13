import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard to protect routes requiring authentication
 * If Auth0 is disabled, this guard always allows access
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If Auth0 is disabled, allow access
  if (!authService.isEnabled) {
    return true;
  }

  // Check authentication status
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Redirect to login
        authService.login();
        return false;
      }
    })
  );
};
