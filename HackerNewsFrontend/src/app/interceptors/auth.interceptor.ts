import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * HTTP interceptor to add JWT token to API requests
 * Only applies to URLs in the allowedList configuration
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip if Auth0 is disabled
  if (!authService.isEnabled) {
    return next(req);
  }

  // Check if this URL should have the token attached
  const shouldAttachToken = environment.auth0.httpInterceptor.allowedList.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(req.url);
  });

  if (!shouldAttachToken) {
    return next(req);
  }

  // Get the access token and attach it to the request
  return authService.getAccessToken$().pipe(
    take(1),
    switchMap(token => {
      if (token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedRequest);
      }
      return next(req);
    }),
    catchError(error => {
      console.error('Error getting access token:', error);
      return next(req);
    })
  );
};
