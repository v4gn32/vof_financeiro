import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet, provideRouter, Router, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

// Components
import { HomeComponent } from './app/components/home/home.component';
import { LoginComponent } from './app/components/login/login.component';
import { RegisterComponent } from './app/components/register/register.component';
import { LayoutComponent } from './app/components/layout/layout.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { TransactionsComponent } from './app/components/transactions/transactions.component';
import { InvoicesComponent } from './app/components/invoices/invoices.component';
import { ProfileComponent } from './app/components/profile/profile.component';

// Guards
import { AuthGuard } from './app/guards/auth.guard';
import { GuestGuard } from './app/guards/guest.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: '**', redirectTo: '/' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  template: '<router-outlet></router-outlet>'
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideAnimations()
  ]
});