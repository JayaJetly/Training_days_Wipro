import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rating {
  ratingId?: number;
  doctorId: number;
  userId?: number; // Optional as it will be set by the backend
  ratingValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private baseUrl = 'http://localhost:5029/api/Rating';

  constructor(private http: HttpClient) { }

  postRating(rating: { doctorId: number, ratingValue: number }): Observable<any> {
    return this.http.post(this.baseUrl, rating, { responseType: 'text' });
  }
}
