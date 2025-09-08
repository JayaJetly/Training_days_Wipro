import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService

export interface Specialization {
  specializationId: number;
  specializationName: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  private baseUrl = 'http://localhost:5029/api/Specialization';

  constructor(private http: HttpClient, private authService: AuthService) { } // Inject AuthService

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getSpecializations(): Observable<Specialization[]> {
    // GET requests for viewing specializations do not require authorization
    return this.http.get<Specialization[]>(this.baseUrl);
  }

  getSpecialization(id: number): Observable<Specialization> {
    // GET requests for viewing specializations do not require authorization
    return this.http.get<Specialization>(`${this.baseUrl}/${id}`);
  }

  addSpecialization(specialization: Specialization): Observable<Specialization> {
    return this.http.post<Specialization>(this.baseUrl, specialization, { headers: this.getAuthHeaders() });
  }

  updateSpecialization(id: number, specialization: Specialization): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, specialization, { headers: this.getAuthHeaders() });
  }

  deleteSpecialization(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}