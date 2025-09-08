import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyAppointmentsComponent } from './my-appointments.component';
import { AppointmentService } from '../appointment.service';
import { RatingService } from '../rating.service';
import { SpecializationService } from '../specialization.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('MyAppointmentsComponent', () => {
  let component: MyAppointmentsComponent;
  let fixture: ComponentFixture<MyAppointmentsComponent>;
  let mockAppointmentService: any;
  let mockRatingService: any;
  let mockSpecializationService: any;

  beforeEach(async () => {
    mockAppointmentService = {
      getUserAppointments: jasmine.createSpy('getUserAppointments').and.returnValue(of({ '$values': [] })),
      cancelAppointment: jasmine.createSpy('cancelAppointment').and.returnValue(of({}))
    };

    mockRatingService = {
      postRating: jasmine.createSpy('postRating').and.returnValue(of({}))
    };

    mockSpecializationService = {
      getSpecializations: jasmine.createSpy('getSpecializations').and.returnValue(of({ '$values': [] }))
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, MyAppointmentsComponent], // Import standalone component directly
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: RatingService, useValue: mockRatingService },
        { provide: SpecializationService, useValue: mockSpecializationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load specializations and user appointments on ngOnInit', () => {
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalled();
    expect(mockAppointmentService.getUserAppointments).toHaveBeenCalled();
  });

  it('should handle successful user appointments loading', () => {
    const appointments = [{ appointmentId: 1, status: 'Booked' }];
    mockAppointmentService.getUserAppointments.and.returnValue(of({ '$values': appointments }));
    component.loadUserAppointments();
    expect(component.appointments).toEqual(appointments);
    expect(component.message).toBe('');
  });

  it('should handle error during user appointments loading', () => {
    const errorMsg = 'Failed to load appointments.';
    mockAppointmentService.getUserAppointments.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.loadUserAppointments();
    expect(component.appointments).toEqual([]);
    expect(component.message).toBe(errorMsg);
  });

  it('should cancel appointment and reload', () => {
    component.cancelAppointment(1);
    expect(mockAppointmentService.cancelAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Appointment cancelled successfully.');
    expect(mockAppointmentService.getUserAppointments).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during appointment cancellation', () => {
    const errorMsg = 'Failed to cancel appointment.';
    mockAppointmentService.cancelAppointment.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.cancelAppointment(1);
    expect(mockAppointmentService.cancelAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should select appointment for rating', () => {
    const appointment = { appointmentId: 1 } as any;
    component.selectAppointmentForRating(appointment);
    expect(component.selectedAppointment).toEqual(appointment);
    expect(component.ratingValue).toBe(5);
  });

  it('should submit rating successfully', () => {
    component.selectedAppointment = { doctor: { doctorId: 1 } } as any;
    component.ratingValue = 4;
    component.submitRating();
    expect(mockRatingService.postRating).toHaveBeenCalledWith({ doctorId: 1, ratingValue: 4 });
    expect(component.message).toBe('Rating submitted successfully.');
    expect(component.selectedAppointment).toBeNull();
  });

  it('should show error if no appointment selected for rating', () => {
    component.selectedAppointment = null;
    component.submitRating();
    expect(component.message).toBe('Please select an appointment to rate.');
    expect(mockRatingService.postRating).not.toHaveBeenCalled();
  });

  it('should handle error during rating submission', () => {
    const errorMsg = 'Failed to submit rating.';
    mockRatingService.postRating.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.selectedAppointment = { doctor: { doctorId: 1 } } as any;
    component.ratingValue = 4;
    component.submitRating();
    expect(component.message).toBe(errorMsg);
  });

  it('should cancel rating', () => {
    component.selectedAppointment = { appointmentId: 1 } as any;
    component.cancelRating();
    expect(component.selectedAppointment).toBeNull();
  });

  it('should return specialization name', () => {
    component.specializations = [{ specializationId: 1, specializationName: 'Cardiology' }];
    const doctor = { specializationId: 1 } as any;
    expect(component.getSpecializationName(doctor)).toBe('Cardiology');
  });

  it('should return N/A for unknown specialization', () => {
    component.specializations = [];
    const doctor = { specializationId: 999 } as any;
    expect(component.getSpecializationName(doctor)).toBe('N/A');
  });
});
