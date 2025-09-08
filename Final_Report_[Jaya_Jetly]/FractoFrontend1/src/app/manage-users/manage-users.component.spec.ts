import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUsersComponent } from './manage-users.component';
import { UserService } from '../../user.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ManageUsersComponent', () => {
  let component: ManageUsersComponent;
  let fixture: ComponentFixture<ManageUsersComponent>;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      getAllUsers: jasmine.createSpy('getAllUsers').and.returnValue(of({ '$values': [] })),
      updateUser: jasmine.createSpy('updateUser').and.returnValue(of({})),
      deleteUser: jasmine.createSpy('deleteUser').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ManageUsersComponent], // Import standalone component directly
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on ngOnInit', () => {
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
  });

  it('should handle successful user loading', () => {
    const users = [{ userId: 1, username: 'testuser' }];
    mockUserService.getAllUsers.and.returnValue(of({ '$values': users }));
    component.loadUsers();
    expect(component.users).toEqual(users);
    expect(component.message).toBe('');
  });

  it('should handle error during user loading', () => {
    const errorMsg = 'Failed to load users.';
    mockUserService.getAllUsers.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.loadUsers();
    expect(component.users).toEqual([]);
    expect(component.message).toBe(errorMsg);
  });

  it('should set user for editing', () => {
    const user = { userId: 1, username: 'testuser' } as any;
    component.editUser(user);
    expect(component.selectedUser).toEqual(user);
    expect(component.isEditing).toBeTrue();
  });

  it('should delete user and reload', () => {
    component.deleteUser(1);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
    expect(component.message).toBe('User deleted successfully.');
    expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should handle error during user deletion', () => {
    const errorMsg = 'Failed to delete user.';
    mockUserService.deleteUser.and.returnValue(throwError(() => ({ error: errorMsg })));
    component.deleteUser(1);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
    expect(component.message).toBe(errorMsg);
  });

  it('should update user and reload', () => {
    component.selectedUser = { userId: 1, username: 'updateduser' } as any;
    component.updateUser();
    expect(mockUserService.updateUser).toHaveBeenCalledWith(component.selectedUser);
    expect(component.message).toBe('User updated successfully.');
    expect(component.selectedUser).toBeNull();
    expect(component.isEditing).toBeFalse();
    expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(2); // Initial load + reload
  });

  it('should cancel editing', () => {
    component.selectedUser = { userId: 1 } as any;
    component.isEditing = true;
    component.cancelEdit();
    expect(component.selectedUser).toBeNull();
    expect(component.isEditing).toBeFalse();
  });
});
