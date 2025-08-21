import { Component } from '@angular/core';
import { DataserviceService } from '../../service/dataservice.service';
@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  users: any[] = [];
  user: any = {};
constructor(private dataService: DataserviceService) {}
getusers() {
    this.dataService.getUsers().subscribe({
      next: (users) => this.users = users as any[],
      complete: () => console.log('Users fetched successfully'  ),
      error: (err) => console.error('Error fetching users:', err)
    });
  }
}
