import { Injectable, Injector, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { AuthResult, LoginCommand } from '../../shared/service-proxies';
import { AuthState } from './auth-state.model';
import { AuthFacade } from './auth.facade';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  readonly authState = signal<AuthState | null>(null);
  private refreshInFlight$?: Observable<AuthState>;

  constructor(
    private readonly injector: Injector,
    private readonly router: Router,
  ) {
  }

  login(credentials: LoginCommand): Observable<AuthState> {
    return this.getAuthFacade().login(credentials).pipe(
      map((result) => this.mapAuthResult(result)),
      map((state) => {
        this.setAuthState(state);
        return state;
      }),
    );
  }

  refreshToken(): Observable<AuthState> {
    return this.getAuthFacade().refresh().pipe(
      map((result) => this.mapAuthResult(result)),
      map((state) => {
        this.setAuthState(state);
        return state;
      }),
    );
  }

  logout(navigate = true): Observable<void> {
    const request$ = this.getAuthFacade().logout().pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
    );

    return request$.pipe(
      switchMap(() => {
        this.clearAuthState();
        if (navigate) {
          void this.router.navigate(['/login']);
        }
        return of(undefined);
      }),
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

  private mapAuthResult(result: AuthResult): AuthState {
    if (!result.accessToken || !result.expiresAt) {
      throw new Error('Auth response is missing required token fields');
    }

    return {
      userId: result.userId,
      email: result.email,
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
      roles: result.roles,
    };
  }

  private setAuthState(state: AuthState): void {
    this.authState.set(state);
  }

  private clearAuthState(): void {
    this.authState.set(null);
  }

  private getAuthFacade(): AuthFacade {
    return this.injector.get(AuthFacade);
  }

  refreshTokenShared(): Observable<AuthState> {
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.refreshToken().pipe(
        shareReplay(1),
        finalize(() => {
          this.refreshInFlight$ = undefined;
        }),
      );
    }

    return this.refreshInFlight$;
  }
}
