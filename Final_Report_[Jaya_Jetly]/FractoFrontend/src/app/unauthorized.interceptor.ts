import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Handle unauthorized error, e.g., redirect to login page
        console.error('Unauthorized request:', error);
      }
      return throwError(() => error);
    })
  );
};
