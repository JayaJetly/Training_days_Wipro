import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username!: string;
  password!: string;
  role: string = 'User'; // Default role
  invitationCode!: string;
  message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    this.authService.register(this.username, this.password, this.role, this.invitationCode).subscribe({
      next: (response) => {
        this.message = 'Registration successful!';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.message = error.error || 'Registration failed.';
        console.error('Registration error:', error);
      }
    });
  }
}