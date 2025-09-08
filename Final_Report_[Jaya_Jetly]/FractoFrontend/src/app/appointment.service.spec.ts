import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all appointments', () => {
    const mockAppointments = { '$values': [{ appointmentId: 1, status: 'Booked' }] };

    service.getAllAppointments().subscribe(appointments => {
      expect(appointments).toEqual(mockAppointments);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Appointment/admin/all');
    expect(req.request.method).toEqual('GET');
    req.flush(mockAppointments);
  });

  it('should get user appointments', () => {
    const mockAppointments = { '$values': [{ appointmentId: 1, status: 'Booked' }] };

    service.getUserAppointments().subscribe(appointments => {
      expect(appointments).toEqual(mockAppointments);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Appointment/user');
    expect(req.request.method).toEqual('GET');
    req.flush(mockAppointments);
  });

  it('should get available time slots', () => {
    const mockTimeSlots = { '$values': ['09:00', '10:00'] };
    const doctorId = 1;
    const date = '2025-01-01';

    service.getAvailableTimeSlots(doctorId, date).subscribe(timeSlots => {
      expect(timeSlots).toEqual(mockTimeSlots);
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/Appointment/doctor/${doctorId}/date/${date}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockTimeSlots);
  });

  it('should book an appointment', () => {
    const mockAppointment = { doctorId: 1, appointmentDate: new Date(), timeSlot: '09:00' };

    service.bookAppointment(mockAppointment as any).subscribe(response => {
      expect(response).toEqual('Appointment booked successfully.');
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Appointment/book');
    expect(req.request.method).toEqual('POST');
    req.flush('Appointment booked successfully.');
  });

  it('should approve an appointment', () => {
    const appointmentId = 1;

    service.approveAppointment(appointmentId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/Appointment/admin/approve/${appointmentId}`);
    expect(req.request.method).toEqual('PUT');
    req.flush({});
  });

  it('should cancel an appointment', () => {
    const appointmentId = 1;

    service.cancelAppointment(appointmentId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/Appointment/cancel/${appointmentId}`);
    expect(req.request.method).toEqual('PUT');
    req.flush({});
  });

  it('should admin cancel an appointment', () => {
    const appointmentId = 1;

    service.adminCancelAppointment(appointmentId).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/Appointment/admin/cancel/${appointmentId}`);
    expect(req.request.method).toEqual('PUT');
    req.flush({});
  });
});
