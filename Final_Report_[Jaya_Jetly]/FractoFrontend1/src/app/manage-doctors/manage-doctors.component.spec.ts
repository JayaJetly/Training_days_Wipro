import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageDoctorsComponent } from './manage-doctors.component';
import { DoctorService } from '../../doctor.service';
import { SpecializationService } from '../../specialization.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ManageDoctorsComponent', () => {
  let component: ManageDoctorsComponent;
  let fixture: ComponentFixture<ManageDoctorsComponent>;
  let mockDoctorService: any;
  let mockSpecializationService: any;

  beforeEach(async () => {
    mockDoctorService = {
      getDoctors: jasmine.createSpy('getDoctors').and.returnValue(of({ '$values': [] })),
      addDoctor: jasmine.createSpy('addDoctor').and.returnValue(of({})),
      updateDoctor: jasmine.createSpy('updateDoctor').and.returnValue(of({})),
      deleteDoctor: jasmine.createSpy('deleteDoctor').and.returnValue(of({}))
    };

    mockSpecializationService = {
      getSpecializations: jasmine.createSpy('getSpecializations').and.returnValue(of({ '$values': [] }))
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ManageDoctorsComponent], // Import standalone component directly
      providers: [
        { provide: DoctorService, useValue: mockDoctorService },
        { provide: SpecializationService, useValue: mockSpecializationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load doctors and specializations on ngOnInit', () => {
    expect(mockDoctorService.getDoctors).toHaveBeenCalled();
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalled();
  });

  it('should handle successful doctor loading', () => {
    const doctors = [{ doctorId: 1, name: 'Dr. Test' }];
    mockDoctorService.getDoctors.and.returnValue(of({ '$values': doctors }));
    component.loadDoctors();
    expect(component.doctors).toEqual(doctors);
    expect(component.message).toBe('');
  });

  it('should handle error during doctor loading', () => {
    const errorMsg = 'Failed to load doctors.';
    mockDoctorService.getDoctors.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.loadDoctors();
    expect(component.doctors).toEqual([]);
    expect(component.message).toBe(errorMsg);
  });

  it('should set doctor for editing', () => {
    const doctor = { doctorId: 1, name: 'Dr. Test' } as any;
    component.editDoctor(doctor);
    expect(component.selectedDoctor).toEqual(doctor);
    expect(component.isEditing).toBeTrue();
  });

  it('should delete doctor and reload', () => {
    component.deleteDoctor(1);
    expect(mockDoctorService.deleteDoctor).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Doctor deleted successfully.');
    expect(mockDoctorService.getDoctors).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during doctor deletion', () => {
    const errorMsg = 'Failed to delete doctor.';
    mockDoctorService.deleteDoctor.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.deleteDoctor(1);
    expect(mockDoctorService.deleteDoctor).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should add doctor and reload', () => {
    component.newDoctor = { name: 'Dr. New', specializationId: 1, city: 'Test' } as any;
    component.addDoctor();
    expect(mockDoctorService.addDoctor).toHaveBeenCalledWith(component.newDoctor);
    expect(component.message).toBe('Doctor added successfully.');
    expect(component.newDoctor).toEqual({} as any); // Reset newDoctor
    expect(mockDoctorService.getDoctors).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should update doctor and reload', () => {
    component.selectedDoctor = { doctorId: 1, name: 'Dr. Updated' } as any;
    component.updateDoctor();
    expect(mockDoctorService.updateDoctor).toHaveBeenCalledWith(component.selectedDoctor);
    expect(component.message).toBe('Doctor updated successfully.');
    expect(component.selectedDoctor).toBeNull();
    expect(component.isEditing).toBeFalse();
    expect(mockDoctorService.getDoctors).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should cancel editing', () => {
    component.selectedDoctor = { doctorId: 1 } as any;
    component.isEditing = true;
    component.cancelEdit();
    expect(component.selectedDoctor).toBeNull();
    expect(component.isEditing).toBeFalse();
  });
});
