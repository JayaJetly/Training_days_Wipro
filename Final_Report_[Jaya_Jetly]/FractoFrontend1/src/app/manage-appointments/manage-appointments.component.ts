import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { AppointmentService, Appointment } from '../appointment.service';
import { NotificationService } from '../notification.service';
import { RatingService } from '../rating.service'; // Import RatingService
import { DoctorService, Doctor } from '../doctor.service'; // Import DoctorService and Doctor
import { Observable, forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators'; // Import map
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './manage-appointments.component.html',
  styleUrls: ['./manage-appointments.component.css']
})
export class ManageAppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = [];
  message: string = '';
  private notificationSubscription!: Subscription;
  selectedAppointment: Appointment | null = null; // New property
  ratingValue: number = 0; // New property

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private ratingService: RatingService, // Inject RatingService
    private doctorService: DoctorService // Inject DoctorService
  ) { }

  ngOnInit(): void {
    this.loadAppointments();
    this.notificationService.startConnection().then(() => {
      this.notificationService.addNotificationListener();
      this.notificationSubscription = this.notificationService.notification$.subscribe(notificationMessage => {
        // Display notification to the user and refresh the list
        this.message = notificationMessage;
        console.log('Received notification in component:', notificationMessage);
        this.loadAppointments();
      });
    }).catch((err: HttpErrorResponse) => console.error('Error starting SignalR connection:', err));
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.notificationService.stopConnection();
  }

  loadAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // For debugging purposes
        
        if (response && Array.isArray(response['$values'])) {
          this.appointments = response['$values'];
        } else if (Array.isArray(response)) {
          this.appointments = response;
        } else {
          console.warn('Unexpected API response structure.', response);
          this.appointments = [];
        }
      },
      error: (error: HttpErrorResponse) => {
        // Safely access error message
        this.message = error.error?.message || error.error || 'Failed to load appointments.';
        console.error('Error loading appointments:', error);
        this.appointments = []; // Clear appointments on error
      }
    });
  }

  approveAppointment(id: number): void {
    this.appointmentService.approveAppointment(id).subscribe({
      next: () => {
        this.message = 'Appointment approved successfully.';
        this.loadAppointments(); // Refresh the list
      },
      error: (error: HttpErrorResponse) => {
        this.message = error.error?.message || error.error || 'Failed to approve appointment.';
        console.error('Error approving appointment:', error);
      }
    });
  }

  cancelAppointment(id: number): void {
    if (typeof id !== 'number' || isNaN(id)) {
      this.message = 'Invalid appointment ID. Cannot cancel.';
      console.error('Invalid appointment ID:', id);
      return;
    }
    this.appointmentService.adminCancelAppointment(id).subscribe({
      next: () => {
        this.message = 'Appointment cancelled successfully.';
        this.loadAppointments(); // Refresh the list
      },
      error: (error: HttpErrorResponse) => {
        this.message = error.error?.message || error.error || 'Failed to cancel appointment.';
        console.error('Error cancelling appointment:', error);
      }
    });
  }

  // New methods for rating functionality
  getSpecializationName(doctor: any): string {
    return doctor?.specialization?.specializationName || 'N/A';
  }

  selectAppointmentForRating(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.ratingValue = 0; // Reset rating value
  }

  submitRating(): void {
    if (this.selectedAppointment && this.ratingValue > 0 && this.ratingValue <= 5) {
      // Assuming RatingService has a method to submit ratings
      this.ratingService.postRating({
        doctorId: this.selectedAppointment.doctorId,
        ratingValue: this.ratingValue
      }).subscribe({
        next: () => {
          this.message = 'Rating submitted successfully.';
          this.cancelRating(); // Close modal
          this.loadAppointments(); // Refresh appointments
        },
        error: (error: HttpErrorResponse) => {
          this.message = error.error?.message || error.error || 'Failed to submit rating.';
          console.error('Error submitting rating:', error);
        }
      });
    } else {
      this.message = 'Please select an appointment and provide a valid rating (1-5).';
    }
  }

  cancelRating(): void {
    this.selectedAppointment = null;
    this.ratingValue = 0;
  }
}