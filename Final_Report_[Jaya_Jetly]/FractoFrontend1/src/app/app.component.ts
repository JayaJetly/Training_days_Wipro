import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
// import { NotificationService } from './notification.service'; // Removed import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  menuOpen: boolean = false;
  title = 'FractoFrontend';

  constructor(
    private authService: AuthService,
    private router: Router,
    // private notificationService: NotificationService // Removed injection
  ) { }

  ngOnInit(): void {
    // this.notificationService.startConnection(); // Removed call
    // this.notificationService.addNotificationListener(); // Removed call
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
