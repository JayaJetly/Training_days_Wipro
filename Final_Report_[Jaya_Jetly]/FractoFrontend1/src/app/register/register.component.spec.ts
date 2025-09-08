import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jasmine.createSpy('register').and.returnValue(of('Registration successful.'))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, RegisterComponent], // Import standalone component directly
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.register and navigate on successful registration', () => {
    component.username = 'newuser';
    component.password = 'password';
    component.onSubmit();
    expect(mockAuthService.register).toHaveBeenCalledWith({ username: 'newuser', password: 'password' });
    expect(component.message).toBe('Registration successful.');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should display error message on failed registration', () => {
    const errorMessage = 'Username already exists.';
    mockAuthService.register.and.returnValue(throwError(() => ({ error: errorMessage })));
    component.username = 'existinguser';
    component.password = 'password';
    component.onSubmit();
    expect(mockAuthService.register).toHaveBeenCalledWith({ username: 'existinguser', password: 'password' });
    expect(component.message).toBe(errorMessage);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
