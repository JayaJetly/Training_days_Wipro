import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService
import { Specialization } from './appointment.service'; // Import Specialization from appointment.service

export interface Doctor {
  doctorId: number;
  name: string;
  specializationId: number; // Added specializationId
  specialization?: Specialization; // Made specialization optional
  city: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private baseUrl = 'http://localhost:5029/api/Doctor';

  constructor(private http: HttpClient, private authService: AuthService) { } // Inject AuthService

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.baseUrl);
  }

  searchDoctors(city?: string, specializationId?: number, minRating?: number, date?: string): Observable<Doctor[]> {
    let params = new HttpParams();
    if (city) {
      params = params.append('city', city);
    }
    if (specializationId && specializationId > 0) {
      params = params.append('specializationId', specializationId.toString());
    }
    if (minRating && minRating >= 0) {
      params = params.append('minRating', minRating.toString());
    }
    if (date) {
      params = params.append('date', date);
    }
    return this.http.get<Doctor[]>(`${this.baseUrl}/search`, { params });
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/${id}`);
  }

  addDoctor(doctor: Doctor): Observable<Doctor> {
    return this.http.post<Doctor>(this.baseUrl, doctor, { headers: this.getAuthHeaders() });
  }

  updateDoctor(id: number, doctor: Doctor): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, doctor, { headers: this.getAuthHeaders() });
  }

  deleteDoctor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}

