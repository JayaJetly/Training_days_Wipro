import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';
import { unauthorizedInterceptor } from './unauthorized.interceptor'; // Import the new interceptor
import { JsonDecycleInterceptor } from './json-decycle.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, unauthorizedInterceptor])), // Add the new interceptor here
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JsonDecycleInterceptor,
      multi: true,
    },
  ]
};