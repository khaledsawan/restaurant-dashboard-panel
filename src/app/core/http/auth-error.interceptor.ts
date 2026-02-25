import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthSessionService } from '../auth/auth-session.service';

const HAS_REFRESH_RETRY = new HttpContextToken<boolean>(() => false);

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authSession = inject(AuthSessionService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const httpError = error as HttpErrorResponse;
      const isUnauthorized = httpError.status === 401;
      const isApiRequest = req.url.includes('/api/');
      const alreadyRetried = req.context.get(HAS_REFRESH_RETRY);
      const isAuthEndpoint = req.url.includes('/api/Auth/login') || req.url.includes('/api/Auth/refresh');

      if (!isUnauthorized || !isApiRequest || alreadyRetried || isAuthEndpoint) {
        return throwError(() => error);
      }

      return authSession.refreshToken().pipe(
        switchMap(() =>
          next(
            req.clone({
              context: req.context.set(HAS_REFRESH_RETRY, true)
            })
          )
        ),
        catchError((refreshError) => {
          return authSession.logout(true).pipe(
            switchMap(() => throwError(() => refreshError))
          );
        })
      );
    })
  );
};
