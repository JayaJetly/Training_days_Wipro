import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({ token: 'mockToken' }))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, LoginComponent], // Import standalone component directly
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.login and navigate on successful login', () => {
    component.username = 'testuser';
    component.password = 'password';
    component.onSubmit();
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doctor-search']);
    expect(component.message).toBe('');
  });

  it('should display error message on failed login', () => {
    const errorMessage = 'Invalid credentials.';
    mockAuthService.login.and.returnValue(throwError(() => ({ error: errorMessage })));
    component.username = 'testuser';
    component.password = 'wrongpassword';
    component.onSubmit();
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'wrongpassword' });
    expect(component.message).toBe(errorMessage);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
