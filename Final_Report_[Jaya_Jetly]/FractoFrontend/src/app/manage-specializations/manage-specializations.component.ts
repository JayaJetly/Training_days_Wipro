import { Component, OnInit } from '@angular/core';
import { SpecializationService, Specialization } from '../specialization.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-specializations',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-specializations.component.html',
  styleUrl: './manage-specializations.component.css'
})
export class ManageSpecializationsComponent implements OnInit {
  specializations: Specialization[] = [];
  newSpecializationName: string = '';
  editingSpecialization: Specialization | null = null;
  message: string = '';

  constructor(private specializationService: SpecializationService) { }

  ngOnInit(): void {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe({
      next: (response: any) => {
        // Check if the response has a "$values" property and if it's an array
        if (response && Array.isArray(response['$values'])) {
          this.specializations = response['$values'];
        } else {
          this.specializations = [];
          console.warn('Could not find the "$values" array in the API response.');
        }
      },
      error: (error) => {
        this.message = error.error?.message || 'Failed to load specializations.';
        console.error('Error loading specializations:', error);
        this.specializations = [];
      }
    });
  }

  addSpecialization(): void {
    if (this.newSpecializationName.trim()) {
      const newSpecialization: Specialization = { specializationId: 0, specializationName: this.newSpecializationName.trim() };
      this.specializationService.addSpecialization(newSpecialization).subscribe({
        next: (data) => {
          this.message = 'Specialization added successfully!';
          this.newSpecializationName = '';
          this.loadSpecializations();
        },
        error: (error) => {
          this.message = error.error || 'Failed to add specialization.';
          console.error('Error adding specialization:', error);
        }
      });
    }
  }

  editSpecialization(specialization: Specialization): void {
    this.editingSpecialization = { ...specialization };
  }

  updateSpecialization(): void {
    if (this.editingSpecialization) {
      this.specializationService.updateSpecialization(this.editingSpecialization.specializationId, this.editingSpecialization).subscribe({
        next: () => {
          this.message = 'Specialization updated successfully!';
          this.editingSpecialization = null;
          this.loadSpecializations();
        },
        error: (error) => {
          this.message = error.error || 'Failed to update specialization.';
          console.error('Error updating specialization:', error);
        }
      });
    }
  }

  deleteSpecialization(id: number): void {
    if (confirm('Are you sure you want to delete this specialization?')) {
      this.specializationService.deleteSpecialization(id).subscribe({
        next: () => {
          this.message = 'Specialization deleted successfully!';
          this.loadSpecializations();
        },
        error: (error) => {
          this.message = error.error || 'Failed to delete specialization.';
          console.error('Error deleting specialization:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingSpecialization = null;
  }
}