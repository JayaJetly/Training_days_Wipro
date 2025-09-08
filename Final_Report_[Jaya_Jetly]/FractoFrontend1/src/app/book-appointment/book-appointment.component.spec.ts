import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookAppointmentComponent } from './book-appointment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../doctor.service';
import { AppointmentService } from '../appointment.service';
import { AuthService } from '../auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('BookAppointmentComponent', () => {
  let component: BookAppointmentComponent;
  let fixture: ComponentFixture<BookAppointmentComponent>;
  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockDoctorService: any;
  let mockAppointmentService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => '1' // Mock doctorId
        }
      }
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockDoctorService = {
      getDoctor: jasmine.createSpy('getDoctor').and.returnValue(of({ doctorId: 1, name: 'Dr. Test' }))
    };

    mockAppointmentService = {
      getAvailableTimeSlots: jasmine.createSpy('getAvailableTimeSlots').and.returnValue(of({ '$values': ['09:00', '10:00'] })),
      bookAppointment: jasmine.createSpy('bookAppointment').and.returnValue(of('Appointment booked successfully.'))
    };

    mockAuthService = {
      getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({ userId: '1', username: 'testuser' })
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, BookAppointmentComponent], // Import standalone component directly
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctor details on ngOnInit', () => {
    expect(mockDoctorService.getDoctor).toHaveBeenCalledWith(1);
    expect(component.doctor).toEqual({ doctorId: 1, name: 'Dr. Test' } as any);
  });

  it('should load available time slots', () => {
    component.doctor = { doctorId: 1, name: 'Dr. Test' } as any;
    component.appointmentDate = '2025-01-01';
    component.loadAvailableTimeSlots();
    expect(mockAppointmentService.getAvailableTimeSlots).toHaveBeenCalledWith(1, '2025-01-01');
    expect(component.availableTimeSlots).toEqual(['09:00', '10:00']);
  });

  it('should call loadAvailableTimeSlots on date change', () => {
    spyOn(component, 'loadAvailableTimeSlots');
    component.onDateChange();
    expect(component.loadAvailableTimeSlots).toHaveBeenCalled();
  });

  it('should book appointment successfully', async () => {
    component.doctor = { doctorId: 1, name: 'Dr. Test' } as any;
    component.selectedTimeSlot = '09:00';
    component.appointmentDate = '2025-01-01';

    await component.bookAppointment();

    expect(mockAppointmentService.bookAppointment).toHaveBeenCalled();
    expect(component.message).toBe('Appointment booked successfully.');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doctor-search']);
  });

  it('should show error if no time slot selected', () => {
    component.doctor = { doctorId: 1, name: 'Dr. Test' } as any;
    component.selectedTimeSlot = '';
    component.bookAppointment();
    expect(component.message).toBe('Please select a time slot and ensure you are logged in.');
    expect(mockAppointmentService.bookAppointment).not.toHaveBeenCalled();
  });

  it('should handle error during appointment booking', () => {
    mockAppointmentService.bookAppointment.and.returnValue(throwError(() => ({ error: 'Booking failed.' })));
    component.doctor = { doctorId: 1, name: 'Dr. Test' } as any;
    component.selectedTimeSlot = '09:00';
    component.appointmentDate = '2025-01-01';

    component.bookAppointment();

    expect(component.message).toBe('Booking failed.');
  });
});
