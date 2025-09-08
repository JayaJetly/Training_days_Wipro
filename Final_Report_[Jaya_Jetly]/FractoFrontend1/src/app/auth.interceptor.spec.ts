import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthInterceptor', () => {
  let httpTestingController: HttpTestingController;
  let authService: AuthService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor,
        { provide: AuthService, useValue: { getToken: () => null } }, // Mock AuthService
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add an Authorization header if a token exists', () => {
    spyOn(authService, 'getToken').and.returnValue('test-token');

    httpClient.get('/api/data').subscribe();

    const req = httpTestingController.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toEqual(true);
    expect(req.request.headers.get('Authorization')).toEqual('Bearer test-token');
    req.flush({});
  });

  it('should not add an Authorization header if no token exists', () => {
    spyOn(authService, 'getToken').and.returnValue(null);

    httpClient.get('/api/data').subscribe();

    const req = httpTestingController.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toEqual(false);
    req.flush({});
  });
});
