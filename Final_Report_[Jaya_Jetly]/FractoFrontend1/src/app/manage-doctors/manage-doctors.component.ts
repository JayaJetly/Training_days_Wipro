import { Component, OnInit } from '@angular/core';
import { DoctorService, Doctor } from '../doctor.service';
import { SpecializationService, Specialization } from '../specialization.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-doctors',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './manage-doctors.component.html',
  styleUrl: './manage-doctors.component.css'
})
export class ManageDoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  specializations: Specialization[] = [];
  newDoctor: Doctor = { doctorId: 0, name: '', specializationId: 0, specialization: { specializationId: 0, specializationName: '' }, city: '', rating: 0 };
  editingDoctor: Doctor | null = null;
  message: string = '';

  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService
  ) { }

  ngOnInit(): void {
    this.loadSpecializations(); // Load specializations FIRST
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getDoctors().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.doctors = response['$values'];
        } else if (Array.isArray(response)) {
          this.doctors = response;
        } else {
          this.doctors = [];
        }
      },
      error: (error) => {
        this.message = error.error || 'Failed to load doctors.';
        console.error('Error loading doctors:', error);
      }
    });
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.specializations = response['$values'];
        } else {
          this.specializations = [];
        }
      },
      error: (error) => {
        this.message = error.error || 'Failed to load specializations.';
        console.error('Error loading specializations:', error);
      }
    });
  }

  // --- NEW HELPER FUNCTION ---
  getSpecializationName(id: number | undefined): string {
    if (id === undefined) {
      return 'Unknown';
    }
    const specialization = this.specializations.find(s => s.specializationId === id);
    return specialization ? specialization.specializationName : 'Unknown';
  }

  addDoctor(): void {
    if (this.newDoctor.name.trim() && this.newDoctor.city.trim() && this.newDoctor.specializationId > 0) {
      this.doctorService.addDoctor(this.newDoctor).subscribe({
        next: (data) => {
          this.message = 'Doctor added successfully!';
          this.newDoctor = { doctorId: 0, name: '', specializationId: 0, specialization: { specializationId: 0, specializationName: '' }, city: '', rating: 0 };
          this.loadDoctors();
        },
        error: (error) => {
          this.message = error.error || 'Failed to add doctor.';
          console.error('Error adding doctor:', error);
        }
      });
    } else {
      this.message = 'Please fill in all required fields and select a valid specialization.';
    }
  }

  editDoctor(doctor: Doctor): void {
    this.editingDoctor = { ...doctor };
  }

  updateDoctor(): void {
    if (this.editingDoctor) {
      this.doctorService.updateDoctor(this.editingDoctor.doctorId, this.editingDoctor).subscribe({
        next: () => {
          this.message = 'Doctor updated successfully!';
          this.editingDoctor = null;
          this.loadDoctors();
        },
        error: (error) => {
          this.message = error.error || 'Failed to update doctor.';
          console.error('Error updating doctor:', error);
        }
      });
    }
  }

  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          this.message = 'Doctor deleted successfully!';
          this.loadDoctors();
        },
        error: (error) => {
          this.message = error.error || 'Failed to delete doctor.';
          console.error('Error deleting doctor:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingDoctor = null;
  }
}