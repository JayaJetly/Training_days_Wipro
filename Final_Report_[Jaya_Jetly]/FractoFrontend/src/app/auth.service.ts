import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5029/api/Auth'; // Adjust if your backend runs on a different port

  constructor(private http: HttpClient) { }

  register(username: string, password: string, role: string, invitationCode?: string): Observable<any> {
  const body: any = { username, password, role };
  if (invitationCode) {
    body.invitationCode = invitationCode;
  }
  // Add the options object to specify the expected response type
  return this.http.post(`${this.baseUrl}/register`, body, { responseType: 'text' });
}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          sessionStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('jwt_token');
  }

  getToken(): string | null {
    return sessionStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
      } catch (Error) {
        return null;
      }
    }
    return null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  getCurrentUser(): { userId: string, username: string } | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedToken.sub;
        const username = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decodedToken.name;
        if (userId && username) {
          return { userId, username };
        }
        return null;
      } catch (Error) {
        return null;
      }
    }
    return null;
  }
}
