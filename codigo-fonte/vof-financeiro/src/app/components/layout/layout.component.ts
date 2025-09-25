import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
           [class.translate-x-0]="sidebarOpen"
           [class.-translate-x-full]="!sidebarOpen">
        
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 class="text-xl font-bold text-primary-600">VOF Financeiro</h1>
        </div>

        <!-- Navigation -->
        <nav class="mt-5 px-2">
          <a routerLink="/app/dashboard" 
             routerLinkActive="active" 
             class="sidebar-item mb-1 rounded-lg"
             (click)="closeSidebar()">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"/>
            </svg>
            Dashboard
          </a>

          <a routerLink="/app/transactions" 
             routerLinkActive="active" 
             class="sidebar-item mb-1 rounded-lg"
             (click)="closeSidebar()">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            </svg>
            Lançamentos
          </a>

          <a routerLink="/app/invoices" 
             routerLinkActive="active" 
             class="sidebar-item mb-1 rounded-lg"
             (click)="closeSidebar()">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Notas Fiscais
          </a>

          <a routerLink="/app/profile" 
             routerLinkActive="active" 
             class="sidebar-item mb-1 rounded-lg"
             (click)="closeSidebar()">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Perfil
          </a>

          <button (click)="logout()" 
                  class="sidebar-item mb-1 rounded-lg w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700">
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Sair
          </button>
        </nav>
      </div>

      <!-- Mobile sidebar overlay -->
      <div *ngIf="sidebarOpen" 
           class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
           (click)="closeSidebar()"></div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <!-- Top header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="flex items-center justify-between px-4 py-4">
            <button (click)="toggleSidebar()"
                    class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">Olá, {{ currentUser?.name }}</span>
              <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">{{ getUserInitials() }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div class="container mx-auto px-4 py-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    }, (err: any) => {
      console.error('Logout error:', err);
      this.router.navigate(['/']);
    });
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return '';
    return this.currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}