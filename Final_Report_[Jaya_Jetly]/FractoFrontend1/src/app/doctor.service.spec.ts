import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DoctorService } from './doctor.service';

describe('DoctorService', () => {
  let service: DoctorService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DoctorService]
    });
    service = TestBed.inject(DoctorService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all doctors', () => {
    const mockDoctors = { '$values': [{ doctorId: 1, name: 'Dr. Test' }] };

    service.getDoctors().subscribe(doctors => {
      expect(doctors).toEqual(mockDoctors);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Doctor');
    expect(req.request.method).toEqual('GET');
    req.flush(mockDoctors);
  });

  it('should get a single doctor by id', () => {
    const mockDoctor = { doctorId: 1, name: 'Dr. Test' };
    const doctorId = 1;

    service.getDoctor(doctorId).subscribe(doctor => {
      expect(doctor).toEqual(mockDoctor);
    });

    const req = httpTestingController.expectOne(`http://localhost:5029/api/Doctor/${doctorId}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockDoctor);
  });

  it('should search doctors with all parameters', () => {
    const mockDoctors = { '$values': [{ doctorId: 1, name: 'Dr. Test' }] };
    const city = 'New York';
    const specializationId = 1;
    const minRating = 4;
    const date = '2025-01-01';

    service.searchDoctors(city, specializationId, minRating, date).subscribe(doctors => {
      expect(doctors).toEqual(mockDoctors);
    });

    const req = httpTestingController.expectOne(
      `http://localhost:5029/api/Doctor/search?city=${city}&specializationId=${specializationId}&minRating=${minRating}&date=${date}`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockDoctors);
  });

  it('should search doctors with partial parameters', () => {
    const mockDoctors = { '$values': [{ doctorId: 1, name: 'Dr. Test' }] };
    const city = 'New York';

    service.searchDoctors(city, 0, 0, '').subscribe(doctors => {
      expect(doctors).toEqual(mockDoctors);
    });

    const req = httpTestingController.expectOne(
      `http://localhost:5029/api/Doctor/search?city=${city}&specializationId=0&minRating=0&date=`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockDoctors);
  });
});