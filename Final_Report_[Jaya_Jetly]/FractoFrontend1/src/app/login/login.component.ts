import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username!: string;
  password!: string;
  message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.message = 'Login successful!';
        // Redirect based on role or to a default dashboard
        // For now, redirect to doctor-search
        this.router.navigate(['/doctor-search']);
      },
      error: (error) => {
        this.message = error.error || 'Login failed.';
        console.error('Login error:', error);
      }
    });
  }
}