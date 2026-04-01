import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/config/api.config';
import { AuthSessionService } from './core/auth/auth-session.service';
import { apiVersionInterceptor } from './core/http/api-version.interceptor';
import { authErrorInterceptor } from './core/http/auth-error.interceptor';
import { authTokenInterceptor } from './core/http/auth-token.interceptor';
import { Configuration } from './shared/service-proxies';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    provideHttpClient(withInterceptors([apiVersionInterceptor, authTokenInterceptor, authErrorInterceptor])),
    {
      provide: Configuration,
      useFactory: (authSession: AuthSessionService) =>
        new Configuration({
          basePath: API_BASE_URL,
          withCredentials: true,
          credentials: {
            Bearer: () => authSession.getAccessToken() ?? undefined
          }
        }),
      deps: [AuthSessionService]
    },
    IconSetService,
    provideAnimationsAsync()
  ]
};
