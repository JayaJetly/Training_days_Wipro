import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../appointment.service';
import { RatingService } from '../rating.service';
import { SpecializationService, Specialization } from '../specialization.service';
import { Doctor, DoctorService } from '../doctor.service'; // Added DoctorService
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface InitialDataResponse { // Added interface for type safety
  appointments: Appointment[];
  specializations: Specialization[];
  doctors: Doctor[];
}

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.css']
})
export class MyAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  specializations: Specialization[] = [];
  message: string = '';
  selectedAppointment: Appointment | null = null;
  ratingValue: number = 5;

  constructor(
    private appointmentService: AppointmentService,
    private ratingService: RatingService,
    private specializationService: SpecializationService,
    private doctorService: DoctorService // Injected DoctorService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      appointments: this.appointmentService.getUserAppointments(),
      specializations: this.specializationService.getSpecializations(),
      doctors: this.doctorService.getDoctors() // Fetch all doctors
    }).pipe(
      map((response: InitialDataResponse) => {
        const appointments = Array.isArray(response.appointments) ? response.appointments : (response.appointments as any)?.['$values'] || [];
        const specializations = Array.isArray(response.specializations) ? response.specializations : (response.specializations as any)?.['$values'] || [];
        const doctors = Array.isArray(response.doctors) ? response.doctors : (response.doctors as any)?.['$values'] || []; // Extract doctors

        // Enrich appointments with doctor details
        this.appointments = appointments.map((appointment: Appointment) => {
          const doctor = doctors.find((d: Doctor) => d.doctorId === appointment.doctorId);
          return { ...appointment, doctor: doctor }; // Attach the found doctor object
        });

        this.specializations = specializations;
      })
    ).subscribe({
      error: (err) => {
        this.message = 'Failed to load page data.';
        console.error('Error loading initial data:', err);
      }
    });
  }

  loadUserAppointments(): void {
    this.appointmentService.getUserAppointments().subscribe({
      next: (response: any) => {
        this.appointments = Array.isArray(response) ? response : response?.['$values'] || [];
      },
      error: (error) => {
        this.message = error.error || 'Failed to load appointments.';
      }
    });
  }

  getSpecializationName(doctor: Doctor | undefined): string {
    if (!doctor) return 'N/A';
    const specialization = this.specializations.find(s => s.specializationId === doctor.specialization?.specializationId);
    return specialization ? specialization.specializationName : 'N/A';
  }

  cancelAppointment(id: number | undefined): void {
    if (typeof id === 'undefined' || id === null) {
      this.message = 'Invalid appointment ID. Cannot cancel.';
      return;
    }

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.message = 'Appointment cancelled successfully.';
        this.loadUserAppointments();
      },
      error: (error) => {
        this.message = error.error || 'Failed to cancel appointment.';
      }
    });
  }

  selectAppointmentForRating(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.ratingValue = 5;
  }

  submitRating(): void {
    if (!this.selectedAppointment?.doctor) return;

    const rating = {
      doctorId: this.selectedAppointment.doctor.doctorId,
      ratingValue: this.ratingValue
    };

    this.ratingService.postRating(rating).subscribe({
      next: () => {
        this.message = 'Rating submitted successfully.';
        this.selectedAppointment = null;
        this.loadUserAppointments();
      },
      error: (error) => {
        this.message = error.error || 'Failed to submit rating.';
      }
    });
  }

  cancelRating(): void {
    this.selectedAppointment = null;
  }
}