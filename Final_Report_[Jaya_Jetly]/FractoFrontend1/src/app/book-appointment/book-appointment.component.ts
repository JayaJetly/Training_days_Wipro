import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../doctor.service';
import { AppointmentService, Appointment, BookAppointmentPayload } from '../appointment.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  doctor: Doctor | undefined;
  appointmentDate: string = new Date().toISOString().split('T')[0]; // Today's date
  availableTimeSlots: string[] = [];
  selectedTimeSlot: string = '';
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (doctorId) {
      this.loadDoctorDetails(doctorId);
    }
  }

  loadDoctorDetails(id: number): void {
    this.doctorService.getDoctor(id).subscribe({
      next: (data) => {
        this.doctor = data;
        // Now that we have the doctor, load the time slots
        this.loadAvailableTimeSlots();
      },
      error: (error) => {
        this.message = error.error || 'Failed to load doctor details.';
        console.error('Error loading doctor:', error);
      }
    });
  }

  loadAvailableTimeSlots(): void {
    if (this.doctor && this.appointmentDate) {
      this.appointmentService.getAvailableTimeSlots(this.doctor.doctorId, this.appointmentDate).subscribe({
        next: (response: any) => {
          if (response && Array.isArray(response['$values'])) {
            this.availableTimeSlots = response['$values'];
          } else {
            this.availableTimeSlots = [];
          }
          this.selectedTimeSlot = ''; // Reset selection
        },
        error: (error) => {
          this.message = error.error || 'Failed to load time slots.';
          console.error('Error loading time slots:', error);
          this.availableTimeSlots = [];
        }
      });
    }
  }

  onDateChange(): void {
    this.loadAvailableTimeSlots();
  }

  bookAppointment(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!this.doctor || !this.selectedTimeSlot || !currentUser) {
      this.message = 'Please select a time slot and ensure you are logged in.';
      return;
    }

    const appointment: BookAppointmentPayload = {
      appointmentId: 0, // Assuming the backend generates the ID
      userId: parseInt(currentUser.userId, 10),
      doctorId: this.doctor.doctorId,
      appointmentDate: new Date(this.appointmentDate),
      timeSlot: this.selectedTimeSlot,
      status: 'Booked'
    };

    this.appointmentService.bookAppointment(appointment).subscribe({
      next: (response: any) => {
        // Handle both object and string responses for the success message
        this.message = response.message || response.toString();
        setTimeout(() => this.router.navigate(['/doctor-search']), 2000); // Redirect after 2 seconds
      },
      error: (error) => {
        this.message = error.error || 'Failed to book appointment.';
        console.error('Error booking appointment:', error);
      }
    });
  }
}