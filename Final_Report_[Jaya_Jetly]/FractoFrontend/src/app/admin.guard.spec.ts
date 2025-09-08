import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('adminGuard', () => {
  let authService: AuthService;
  let router: Router;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { isAdmin: jasmine.createSpy('isAdmin') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow activation if user is admin', () => {
    (authService.isAdmin as jasmine.Spy).and.returnValue(true);
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not allow activation and navigate to login if user is not admin', () => {
    (authService.isAdmin as jasmine.Spy).and.returnValue(false);
    const result = executeGuard({} as any, {} as any);
    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});