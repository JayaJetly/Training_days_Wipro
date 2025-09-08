import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorSearchComponent } from './doctor-search.component';
import { DoctorService } from '../doctor.service';
import { SpecializationService } from '../specialization.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('DoctorSearchComponent', () => {
  let component: DoctorSearchComponent;
  let fixture: ComponentFixture<DoctorSearchComponent>;
  let mockDoctorService: any;
  let mockSpecializationService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockDoctorService = {
      searchDoctors: jasmine.createSpy('searchDoctors').and.returnValue(of({ '$values': [] })),
      getDoctors: jasmine.createSpy('getDoctors').and.returnValue(of({ '$values': [] }))
    };

    mockSpecializationService = {
      getSpecializations: jasmine.createSpy('getSpecializations').and.returnValue(of({ '$values': [] }))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, DoctorSearchComponent], // Import standalone component directly
      providers: [
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: SpecializationService, useValue: mockSpecializationService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load specializations and initial doctor data on ngOnInit', () => {
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalled();
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledWith('', 0, 0, '');
  });

  it('should handle successful specialization loading', () => {
    const specializations = [{ specializationId: 1, specializationName: 'Test' }];
    mockSpecializationService.getSpecializations.and.returnValue(of({ '$values': specializations }));
    component.loadSpecializations();
    expect(component.specializations).toEqual(specializations);
  });

  it('should handle successful initial doctor data loading', () => {
    const doctors = [{ doctorId: 1, name: 'Dr. Test', city: 'TestCity', specializationId: 1 }];
    mockDoctorService.searchDoctors.and.returnValue(of({ '$values': doctors }));
    component.loadInitialDoctorData();
    expect(component.allDoctors).toEqual(doctors);
    expect(component.doctors).toEqual(doctors);
    expect(component.availableCities).toEqual(['TestCity']);
  });

  it('should search doctors with provided criteria', () => {
    component.searchCity = 'New York';
    component.searchSpecializationId = 1;
    component.searchMinRating = 4;
    component.searchDate = '2025-01-01';
    component.searchDoctors();
    expect(mockDoctorService.searchDoctors).toHaveBeenCalledWith(
      'New York',
      1,
      4,
      '2025-01-01'
    );
  });

  it('should navigate to book-appointment on selectDoctor', () => {
    const doctor = { doctorId: 1 } as any;
    component.selectDoctor(doctor);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/book-appointment', 1]);
  });

  it('should return correct specialization name', () => {
    component.specializations = [{ specializationId: 1, specializationName: 'Cardiology' }];
    const doctor = { specializationId: 1 } as any;
    expect(component.getSpecializationName(doctor)).toBe('Cardiology');
  });

  it('should return Unknown for invalid specialization', () => {
    component.specializations = [];
    const doctor = { specializationId: 999 } as any;
    expect(component.getSpecializationName(doctor)).toBe('Unknown');
  });
});
