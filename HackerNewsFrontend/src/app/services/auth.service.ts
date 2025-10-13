import { inject, Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Auth service wrapper for Auth0 SDK
 * Provides a clean interface for authentication operations with feature flag support
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0 = environment.auth0.enabled ? inject(Auth0Service) : null;

  /**
   * Check if Auth0 is enabled via feature flag
   */
  get isEnabled(): boolean {
    return environment.auth0.enabled;
  }

  /**
   * Observable of authentication state
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.auth0?.isAuthenticated$ ?? new Observable(observer => observer.next(false));
  }

  /**
   * Observable of user profile
   */
  get user$(): Observable<any> {
    return this.auth0?.user$ ?? new Observable(observer => observer.next(null));
  }

  /**
   * Observable of ID token
   */
  get idTokenClaims$(): Observable<any> {
    return this.auth0?.idTokenClaims$ ?? new Observable(observer => observer.next(null));
  }

  /**
   * Observable of loading state
   */
  get isLoading$(): Observable<boolean> {
    return this.auth0?.isLoading$ ?? new Observable(observer => observer.next(false));
  }

  /**
   * Observable of error state
   */
  get error$(): Observable<any> {
    return this.auth0?.error$ ?? new Observable(observer => observer.next(null));
  }

  /**
   * Initiate login flow
   */
  login(): void {
    if (this.auth0) {
      this.auth0.loginWithRedirect();
    }
  }

  /**
   * Initiate logout flow
   */
  logout(): void {
    if (this.auth0) {
      this.auth0.logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    }
  }

  /**
   * Get access token for API calls
   */
  getAccessToken$(): Observable<string> {
    return this.auth0?.getAccessTokenSilently() ?? new Observable(observer => observer.next(''));
  }
}
