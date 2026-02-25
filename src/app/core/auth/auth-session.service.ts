import { Injectable, Injector, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

import { AuthService, AuthResult, LoginCommand } from '../../shared/service-proxies';
import { API_VERSION } from '../config/api.config';
import { AuthState } from './auth-state.model';

const AUTH_STORAGE_KEY = 'restaurant-admin.auth';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  readonly authState = signal<AuthState | null>(null);

  constructor(
    private readonly injector: Injector,
    private readonly router: Router
  ) {
    this.restoreSession();
  }

  login(credentials: LoginCommand): Observable<AuthState> {
    return this.getAuthService().apiAuthLoginPost(API_VERSION, credentials).pipe(
      map((result) => this.mapAuthResult(result)),
      map((state) => {
        this.setAuthState(state);
        return state;
      })
    );
  }

  refreshToken(): Observable<AuthState> {
    const refreshToken = this.authState()?.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.getAuthService().apiAuthRefreshPost(API_VERSION, { refreshToken }).pipe(
      map((result) => this.mapAuthResult(result)),
      map((state) => {
        this.setAuthState(state);
        return state;
      })
    );
  }

  logout(navigate = true): Observable<void> {
    const refreshToken = this.authState()?.refreshToken;

    const request$ = refreshToken
      ? this.getAuthService().apiAuthLogoutPost(API_VERSION, { refreshToken }).pipe(
          map(() => undefined),
          catchError(() => of(undefined))
        )
      : of(undefined);

    return request$.pipe(
      switchMap(() => {
        this.clearAuthState();
        if (navigate) {
          void this.router.navigate(['/login']);
        }
        return of(undefined);
      })
    );
  }

  isAuthenticated(): boolean {
    const state = this.authState();
    if (!state?.accessToken || !state.expiresAt) {
      return false;
    }

    return new Date(state.expiresAt).getTime() > Date.now();
  }

  getAccessToken(): string | null {
    return this.authState()?.accessToken ?? null;
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthState;
      this.authState.set(parsed);
      if (!this.isAuthenticated()) {
        this.clearAuthState();
      }
    } catch {
      this.clearAuthState();
    }
  }

  private mapAuthResult(result: AuthResult): AuthState {
    if (!result.accessToken || !result.refreshToken || !result.expiresAt) {
      throw new Error('Auth response is missing required token fields');
    }

    return {
      userId: result.userId,
      email: result.email,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      roles: result.roles
    };
  }

  private setAuthState(state: AuthState): void {
    this.authState.set(state);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  }

  private clearAuthState(): void {
    this.authState.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  private getAuthService(): AuthService {
    return this.injector.get(AuthService);
  }
}
