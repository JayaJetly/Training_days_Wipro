import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { BookAppointmentComponent } from './book-appointment/book-appointment.component';
import { RegisterComponent } from './register/register.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ManageDoctorsComponent } from './manage-doctors/manage-doctors.component';
import { ManageSpecializationsComponent } from './manage-specializations/manage-specializations.component';
import { ManageAppointmentsComponent } from './manage-appointments/manage-appointments.component';
import { MyAppointmentsComponent } from './my-appointments/my-appointments.component';
import { ManageUsersComponent } from './manage-users/manage-users.component'; // Import ManageUsersComponent
import { AdminGuard } from './admin.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'doctor-search', component: DoctorSearchComponent },
    { path: 'book-appointment/:id', component: BookAppointmentComponent },
    { path: 'my-appointments', component: MyAppointmentsComponent },
    { 
      path: 'admin', 
      component: AdminDashboardComponent, 
      canActivate: [AdminGuard], 
      children: [
        { path: '', redirectTo: 'users', pathMatch: 'full' }, // Redirect empty path within admin to users
        { path: 'doctors', component: ManageDoctorsComponent },
        { path: 'specializations', component: ManageSpecializationsComponent },
        { path: 'appointments', component: ManageAppointmentsComponent },
        { path: 'users', component: ManageUsersComponent } // Add route for managing users
      ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];