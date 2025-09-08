import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SpecializationService } from './specialization.service';

describe('SpecializationService', () => {
  let service: SpecializationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SpecializationService]
    });
    service = TestBed.inject(SpecializationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get specializations', () => {
    const mockSpecializations = { '$values': [{ specializationId: 1, specializationName: 'Cardiology' }] };

    service.getSpecializations().subscribe(specializations => {
      expect(specializations).toEqual(mockSpecializations);
    });

    const req = httpTestingController.expectOne('http://localhost:5029/api/Specialization');
    expect(req.request.method).toEqual('GET');
    req.flush(mockSpecializations);
  });
});