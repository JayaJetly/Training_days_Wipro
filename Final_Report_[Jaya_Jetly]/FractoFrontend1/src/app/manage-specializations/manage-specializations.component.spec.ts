import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageSpecializationsComponent } from './manage-specializations.component';
import { SpecializationService } from '../../specialization.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ManageSpecializationsComponent', () => {
  let component: ManageSpecializationsComponent;
  let fixture: ComponentFixture<ManageSpecializationsComponent>;
  let mockSpecializationService: any;

  beforeEach(async () => {
    mockSpecializationService = {
      getSpecializations: jasmine.createSpy('getSpecializations').and.returnValue(of({ '$values': [] })),
      addSpecialization: jasmine.createSpy('addSpecialization').and.returnValue(of({})),
      updateSpecialization: jasmine.createSpy('updateSpecialization').and.returnValue(of({})),
      deleteSpecialization: jasmine.createSpy('deleteSpecialization').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ManageSpecializationsComponent], // Import standalone component directly
      providers: [
        { provide: SpecializationService, useValue: mockSpecializationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSpecializationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load specializations on ngOnInit', () => {
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalled();
  });

  it('should handle successful specialization loading', () => {
    const specializations = [{ specializationId: 1, specializationName: 'Test' }];
    mockSpecializationService.getSpecializations.and.returnValue(of({ '$values': specializations }));
    component.loadSpecializations();
    expect(component.specializations).toEqual(specializations);
    expect(component.message).toBe('');
  });

  it('should handle error during specialization loading', () => {
    const errorMsg = 'Failed to load specializations.';
    mockSpecializationService.getSpecializations.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.loadSpecializations();
    expect(component.specializations).toEqual([]);
    expect(component.message).toBe(errorMsg);
  });

  it('should set specialization for editing', () => {
    const specialization = { specializationId: 1, specializationName: 'Test' } as any;
    component.editSpecialization(specialization);
    expect(component.selectedSpecialization).toEqual(specialization);
    expect(component.isEditing).toBeTrue();
  });

  it('should delete specialization and reload', () => {
    component.deleteSpecialization(1);
    expect(mockSpecializationService.deleteSpecialization).toHaveBeenCalledWith(1);
    expect(component.message).toBe('Specialization deleted successfully.');
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during specialization deletion', () => {
    const errorMsg = 'Failed to delete specialization.';
    mockSpecializationService.deleteSpecialization.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.deleteSpecialization(1);
    expect(mockSpecializationService.deleteSpecialization).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should add specialization and reload', () => {
    component.newSpecialization = { specializationName: 'New Specialization' } as any;
    component.addSpecialization();
    expect(mockSpecializationService.addSpecialization).toHaveBeenCalledWith(component.newSpecialization);
    expect(component.message).toBe('Specialization added successfully.');
    expect(component.newSpecialization).toEqual({} as any); // Reset newSpecialization
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should update specialization and reload', () => {
    component.selectedSpecialization = { specializationId: 1, specializationName: 'Updated Specialization' } as any;
    component.updateSpecialization();
    expect(mockSpecializationService.updateSpecialization).toHaveBeenCalledWith(component.selectedSpecialization);
    expect(component.message).toBe('Specialization updated successfully.');
    expect(component.selectedSpecialization).toBeNull();
    expect(component.isEditing).toBeFalse();
    expect(mockSpecializationService.getSpecializations).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should cancel editing', () => {
    component.selectedSpecialization = { specializationId: 1 } as any;
    component.isEditing = true;
    component.cancelEdit();
    expect(component.selectedSpecialization).toBeNull();
    expect(component.isEditing).toBeFalse();
  });
});
