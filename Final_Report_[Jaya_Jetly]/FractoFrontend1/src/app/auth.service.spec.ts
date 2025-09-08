import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]) // Provide an empty array of routes
      ],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear(); // Clear localStorage before each test
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const mockRegisterData = { username: 'testuser', password: 'password' };
    const mockResponse = 'Registration successful.';

    service.register(mockRegisterData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Auth/register');
    expect(req.request.method).toEqual('POST');
    req.flush(mockResponse);
  });

  it('should log in a user and store token', () => {
    const mockLoginData = { username: 'testuser', password: 'password' };
    const mockLoginResponse = { username: 'testuser', token: 'mockToken', role: 'User', userId: '1' };

    service.login(mockLoginData).subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(localStorage.getItem('jwtToken')).toEqual('mockToken');
      expect(localStorage.getItem('currentUser')).toEqual(JSON.stringify({ username: 'testuser', role: 'User', userId: '1' }));
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Auth/login');
    expect(req.request.method).toEqual('POST');
    req.flush(mockLoginResponse);
  });

  it('should log out a user and clear storage', () => {
    spyOn(router, 'navigate');
    localStorage.setItem('jwtToken', 'someToken');
    localStorage.setItem('currentUser', JSON.stringify({ username: 'testuser' }));

    service.logout();

    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return current user', () => {
    const user = { username: 'testuser', role: 'User', userId: '1' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    expect(service.getCurrentUser()).toEqual(user);
  });

  it('should return null if no current user', () => {
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should return token', () => {
    localStorage.setItem('jwtToken', 'testToken');
    expect(service.getToken()).toEqual('testToken');
  });

  it('should return null if no token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return true if logged in', () => {
    localStorage.setItem('jwtToken', 'testToken');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should return false if not logged in', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should return true if user is admin', () => {
    const user = { username: 'admin', role: 'Admin', userId: '1' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    expect(service.isAdmin()).toBeTrue();
  });

  it('should return false if user is not admin', () => {
    const user = { username: 'user', role: 'User', userId: '1' };
    localStorage.setItem('currentUser', JSON.stringify(user));
    expect(service.isAdmin()).toBeFalse();
  });

  it('should return false if no user is logged in for isAdmin', () => {
    expect(service.isAdmin()).toBeFalse();
  });
});