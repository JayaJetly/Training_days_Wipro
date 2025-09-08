import { Component, OnInit } from '@angular/core';
import { DoctorService, Doctor } from '../doctor.service';
import { SpecializationService, Specialization } from '../specialization.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './doctor-search.component.html',
  styleUrl: './doctor-search.component.css'
})
export class DoctorSearchComponent implements OnInit {
  doctors: Doctor[] = [];
  specializations: Specialization[] = [];
  searchCity: string = '';
  searchSpecializationId: number = 0;
  searchMinRating: number = 0;
  searchDate: string = ''; // New property for date selection
  message: string = '';
  availableCities: string[] = [];
  filteredSpecializations: Specialization[] = [];
  allDoctors: Doctor[] = []; // To store all doctors for initial filtering
  minDate: string; // New property for minimum date

  constructor(
    private doctorService: DoctorService,
    private specializationService: SpecializationService,
    private router: Router
  ) {
    // Initialize minDate to today's date
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSpecializations();
  }

  loadSpecializations(): void {
    this.specializationService.getSpecializations().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.specializations = response['$values'];
        } else {
          this.specializations = [];
        }
        this.loadInitialDoctorData();
      },
      error: (error) => {
        this.message = error.error || 'Failed to load specializations.';
        console.error('Error loading specializations:', error);
        this.loadInitialDoctorData();
      }
    });
  }

  loadInitialDoctorData(): void {
    this.doctorService.searchDoctors('', 0, 0, '').subscribe({ // Fetch all doctors, no date filter initially
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.allDoctors = response['$values'];
          this.doctors = [...this.allDoctors]; // Display all doctors initially

          this.populateDropdowns(this.allDoctors); // Populate dropdowns based on all doctors
        } else {
          this.allDoctors = [];
          this.doctors = [];
          this.populateDropdowns([]); // Clear dropdowns if no doctors
        }
        this.message = '';
      },
      error: (error) => {
        this.message = error.error?.message || error.message || 'Failed to load initial doctor data.';
        console.error('Error loading initial doctor data:', error);
        this.populateDropdowns([]); // Clear dropdowns on error
      }
    });
  }

  searchDoctors(): void {
    this.doctorService.searchDoctors(
      this.searchCity,
      this.searchSpecializationId,
      this.searchMinRating,
      this.searchDate // Pass the selected date
    ).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.doctors = response['$values'];
          this.populateDropdowns(this.doctors); // Populate dropdowns based on current search results
        } else {
          this.doctors = [];
          this.populateDropdowns(this.allDoctors); // Revert to all doctors' specializations/cities if no results
        }
        this.message = '';
      },
      error: (error) => {
        this.message = error.error?.message || error.message || 'Failed to search doctors.';
        console.error('Error searching doctors:', error);
        this.populateDropdowns(this.allDoctors); // Revert to all doctors' specializations/cities on error
      }
    });
  }

  private populateDropdowns(doctorsToConsider: Doctor[]): void {
    // Filter specializations based on doctorsToConsider
    this.filteredSpecializations = [...this.specializations]; // Display all specializations
    // Ensure selected specialization is still valid if it was previously set to a specific value
    if (this.searchSpecializationId !== 0 && !this.specializations.some(s => s.specializationId === this.searchSpecializationId)) {
      this.searchSpecializationId = 0;
    }

    // Populate available cities based on doctorsToConsider
    const uniqueCities = new Set(doctorsToConsider.map(d => d.city));
    this.availableCities = Array.from(uniqueCities).sort();
    // Ensure selected city is still valid
    if (this.searchCity && !uniqueCities.has(this.searchCity)) {
      this.searchCity = '';
    }
  }

  getSpecializationName(id: number | undefined): string {
    if (id === undefined) {
      return 'Unknown';
    }
    const specialization = this.specializations.find(s => s.specializationId === id);
    return specialization ? specialization.specializationName : 'Unknown';
  }

  selectDoctor(doctor: Doctor): void {
    this.router.navigate(['/book-appointment', doctor.doctorId]);
  }
}