import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Specialization {
  specializationId: number;
  specializationName: string;
}

export interface User {
  userId: number;
  username: string;
  role: string;
}

export interface Doctor {
  doctorId: number;
  name: string;
  specializationId: number;
  specialization?: Specialization;
  city: string;
  rating: number;
}

export interface Appointment {
  appointmentId?: number;
  userId: number;
  user: User;
  doctorId: number;
  doctor: Doctor;
  appointmentDate: Date;
  timeSlot: string;
  status: string;
}

export interface BookAppointmentPayload {
  appointmentId?: number;
  userId: number;
  doctorId: number;
  appointmentDate: Date;
  timeSlot: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:5029/api/Appointment';

  constructor(private http: HttpClient) { }

  getAvailableTimeSlots(doctorId: number, date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/doctor/${doctorId}/date/${date}`);
  }

  bookAppointment(appointment: BookAppointmentPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/book`, appointment, { responseType: 'text' });
  }

  getUserAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/user`);
  }

  cancelAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/cancel/${id}`, null);
  }

  // Admin endpoints
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/admin/all`);
  }

  approveAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/approve/${id}`, null);
  }

  adminCancelAppointment(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/cancel/${id}`, null);
  }
}
