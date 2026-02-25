import { HttpInterceptorFn } from '@angular/common/http';

import { API_VERSION } from '../config/api.config';

export const apiVersionInterceptor: HttpInterceptorFn = (req, next) => {
  // Append api-version only for backend API calls.
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  if (req.params.has('api-version')) {
    return next(req);
  }

  return next(
    req.clone({
      params: req.params.set('api-version', API_VERSION)
    })
  );
};
