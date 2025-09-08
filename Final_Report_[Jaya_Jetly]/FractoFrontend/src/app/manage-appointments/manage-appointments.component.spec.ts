import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAppointmentsComponent } from './manage-appointments.component';
import { AppointmentService } from '../appointment.service';
import { NotificationService } from '../notification.service';
import { of, throwError } from 'rxjs';

describe('ManageAppointmentsComponent', () => {
  let component: ManageAppointmentsComponent;
  let fixture: ComponentFixture<ManageAppointmentsComponent>;
  let mockAppointmentService: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockAppointmentService = {
      getAllAppointments: jasmine.createSpy('getAllAppointments').and.returnValue(of({ '$values': [] })),
      approveAppointment: jasmine.createSpy('approveAppointment').and.returnValue(of({})),
      adminCancelAppointment: jasmine.createSpy('adminCancelAppointment').and.returnValue(of({}))
    };

    mockNotificationService = {
      startConnection: jasmine.createSpy('startConnection').and.returnValue(Promise.resolve()),
      addNotificationListener: jasmine.createSpy('addNotificationListener'),
      notification$: of('Test Notification'),
      stopConnection: jasmine.createSpy('stopConnection')
    };

    await TestBed.configureTestingModule({
      imports: [ManageAppointmentsComponent],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on ngOnInit', () => {
    expect(mockAppointmentService.getAllAppointments).toHaveBeenCalled();
    expect(mockNotificationService.startConnection).toHaveBeenCalled();
    expect(mockNotificationService.addNotificationListener).toHaveBeenCalled();
  });

  it('should handle successful appointment loading', () => {
    const appointments = [{ appointmentId: 1, status: 'Booked' }];
    mockAppointmentService.getAllAppointments.and.returnValue(of({ '$values': appointments }));
    component.loadAppointments();
    expect(component.appointments).toEqual(appointments);
    expect(component.message).toBe('');
  });

  it('should handle error during appointment loading', () => {
    const errorMsg = 'Failed to load appointments.';
    mockAppointmentService.getAllAppointments.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.loadAppointments();
    expect(component.appointments).toEqual([]);
    expect(component.message).toBe(errorMsg);
  });

  it('should approve appointment and reload', () => {
    component.approveAppointment(1);
    expect(mockAppointmentService.approveAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Appointment approved successfully.');
    expect(mockAppointmentService.getAllAppointments).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during appointment approval', () => {
    const errorMsg = 'Failed to approve appointment.';
    mockAppointmentService.approveAppointment.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.approveAppointment(1);
    expect(mockAppointmentService.approveAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should cancel appointment and reload', () => {
    component.cancelAppointment(1);
    expect(mockAppointmentService.adminCancelAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Appointment cancelled successfully.');
    expect(mockAppointmentService.getAllAppointments).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during appointment cancellation', () => {
    const errorMsg = 'Failed to cancel appointment.';
    mockAppointmentService.adminCancelAppointment.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.cancelAppointment(1);
    expect(mockAppointmentService.adminCancelAppointment).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should unsubscribe from notifications and stop connection on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockNotificationService.stopConnection).toHaveBeenCalled();
  });
});
