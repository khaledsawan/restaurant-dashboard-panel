import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AuthResult,
  AuthService,
  ChangePasswordCommand,
  ConfirmEmailChangeCommand,
  ConfirmEmailCommand,
  CurrentUserDto,
  ForgotPasswordCommand,
  LoginCommand,
  RegisterCommand,
  RegisterResponseDto,
  RequestEmailChangeCommand,
  ResendConfirmationCommand,
  ResetPasswordCommand,
  TokenValidationDto,
  ValidateTokenQuery
} from '../../shared/service-proxies';
import { API_VERSION } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  constructor(private readonly authService: AuthService) {}

  login(command: LoginCommand): Observable<AuthResult> {
    return this.authService.apiAuthLoginPost(API_VERSION, this.normalize(command));
  }

  logout(refreshToken?: string | null): Observable<unknown> {
    return this.authService.apiAuthLogoutPost(API_VERSION, refreshToken ? { refreshToken } : {});
  }

  refresh(refreshToken?: string | null): Observable<AuthResult> {
    return this.authService.apiAuthRefreshPost(API_VERSION, refreshToken ? { refreshToken } : {});
  }

  register(command: RegisterCommand): Observable<RegisterResponseDto> {
    return this.authService.apiAuthRegisterPost(API_VERSION, this.normalize(command));
  }

  forgotPassword(command: ForgotPasswordCommand): Observable<unknown> {
    return this.authService.apiAuthForgotPasswordPost(API_VERSION, this.normalize(command));
  }

  resetPassword(command: ResetPasswordCommand): Observable<unknown> {
    return this.authService.apiAuthResetPasswordPost(API_VERSION, this.normalize(command));
  }

  confirmEmail(command: ConfirmEmailCommand): Observable<unknown> {
    return this.authService.apiAuthConfirmEmailPost(API_VERSION, this.normalize(command));
  }

  resendConfirmation(command: ResendConfirmationCommand): Observable<unknown> {
    return this.authService.apiAuthResendConfirmationPost(API_VERSION, this.normalize(command));
  }

  validateToken(query: ValidateTokenQuery): Observable<TokenValidationDto> {
    return this.authService.apiAuthValidateTokenPost(API_VERSION, this.normalize(query));
  }

  me(): Observable<CurrentUserDto> {
    return this.authService.apiAuthMeGet(API_VERSION);
  }

  changePassword(command: ChangePasswordCommand): Observable<unknown> {
    return this.authService.apiAuthChangePasswordPost(API_VERSION, this.normalize(command));
  }

  requestEmailChange(command: RequestEmailChangeCommand): Observable<unknown> {
    return this.authService.apiAuthChangeEmailRequestPost(API_VERSION, this.normalize(command));
  }

  confirmEmailChange(command: ConfirmEmailChangeCommand): Observable<unknown> {
    return this.authService.apiAuthChangeEmailConfirmPost(API_VERSION, this.normalize(command));
  }

  deleteAccount(): Observable<unknown> {
    return this.authService.apiAuthDeleteAccountPost(API_VERSION);
  }

  private normalize<T extends object>(payload: T): T {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        normalized[key] = trimmed.length > 0 ? trimmed : null;
      } else {
        normalized[key] = value;
      }
    }
    return normalized as T;
  }
}
