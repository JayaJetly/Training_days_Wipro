import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../user.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  // Properties for form binding
  currentUsername: string = '';
  currentPassword?: string = ''; // Optional for updates
  currentRole: string = 'User';
  message: string = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response['$values'])) {
          this.users = response['$values'];
        } else {
          this.users = [];
        }
      },
      error: (error) => {
        this.message = error.error || 'Failed to load users.';
        console.error('Error loading users:', error);
      }
    });
  }

  selectUser(user: User): void {
    this.selectedUser = { ...user }; // Create a copy for editing
    this.currentUsername = user.username;
    this.currentPassword = ''; // Clear password for security, user must re-enter to change
    this.currentRole = user.role;
  }

  clearSelection(): void {
    this.selectedUser = null;
    this.currentUsername = '';
    this.currentPassword = '';
    this.currentRole = 'User';
    this.message = '';
  }

  createUser(): void {
    const newUser: User = {
      username: this.currentUsername,
      password: this.currentPassword,
      role: this.currentRole
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.message = 'User created successfully.';
        this.loadUsers();
        this.clearSelection();
      },
      error: (error) => {
        this.message = error.error || 'Failed to create user.';
        console.error('Error creating user:', error);
      }
    });
  }

  updateUser(): void {
    if (this.selectedUser && this.selectedUser.userId) {
      const updatedUser: User = {
        userId: this.selectedUser.userId,
        username: this.currentUsername,
        role: this.currentRole
      };
      // Only include password if it's provided (i.e., user wants to change it)
      if (this.currentPassword) {
        updatedUser.password = this.currentPassword;
      }

      this.userService.updateUser(this.selectedUser.userId, updatedUser).subscribe({
        next: () => {
          this.message = 'User updated successfully.';
          this.loadUsers();
          this.clearSelection();
        },
        error: (error) => {
          this.message = error.error || 'Failed to update user.';
          console.error('Error updating user:', error);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.message = 'User deleted successfully.';
          this.loadUsers();
          this.clearSelection();
        },
        error: (error) => {
          this.message = error.error || 'Failed to delete user.';
          console.error('Error deleting user:', error);
        }
      });
    }
  }
}