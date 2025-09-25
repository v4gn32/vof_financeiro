import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { SupabaseService } from './supabase.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isSupabaseConfigured = false;

  constructor(private supabase: SupabaseService) {
    this.checkSupabaseConfiguration();
    this.loadCurrentUser();
  }

  private checkSupabaseConfiguration(): void {
    this.isSupabaseConfigured = 
      environment.supabaseUrl !== 'https://placeholder.supabase.co' &&
      environment.supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';
  }

  private mapSupabaseUser(user: any): User {
    return {
      id: user.id,
      name: user.user_metadata?.['name'] || user.email?.split('@')[0] || '',
      email: user.email || '',
      role: user.user_metadata?.['role'] || 'user',
      createdAt: new Date(user.created_at)
    };
  }

  private async loadCurrentUser(): Promise<void> {
    if (!this.isSupabaseConfigured) {
      console.warn('Supabase not configured. Using mock authentication.');
      return;
    }

    try {
      const { user } = await this.supabase.getCurrentUser();
      if (user) {
        this.currentUserSubject.next(this.mapSupabaseUser(user));
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  register(email: string, password: string, name: string): Observable<{ success: boolean; error?: string }> {
    if (!this.isSupabaseConfigured) {
      // Mock successful registration for development
      const mockUser: User = {
        id: 'mock-' + Date.now(),
        email,
        name,
        role: 'user',
        createdAt: new Date()
      };
      this.currentUserSubject.next(mockUser);
      return of({ success: true });
    }

    return from(this.supabase.signUp(email, password, { name })).pipe(
      map(({ data, error }) => {
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          this.currentUserSubject.next(this.mapSupabaseUser(data.user));
        }
        return { success: true };
      }),
      catchError((err: any) => of({ success: false, error: err.message }))
    );
  }

  login(email: string, password: string): Observable<{ success: boolean; error?: string }> {
    if (!this.isSupabaseConfigured) {
      // Mock successful login for development
      const mockUser: User = {
        id: 'mock-' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'user',
        createdAt: new Date()
      };
      this.currentUserSubject.next(mockUser);
      return of({ success: true });
    }

    return from(this.supabase.signIn(email, password)).pipe(
      map(({ data, error }) => {
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          this.currentUserSubject.next(this.mapSupabaseUser(data.user));
        }
        return { success: true };
      }),
      catchError((err: any) => of({ success: false, error: err.message }))
    );
  }

  logout(): Observable<void> {
    if (!this.isSupabaseConfigured) {
      this.currentUserSubject.next(null);
      return of(void 0);
    }

    return from(this.supabase.signOut()).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        return void 0;
      }),
      catchError((err: any) => {
        console.error('Error signing out:', err);
        return throwError(() => new Error(err.message));
      })
    );
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: 'admin' | 'user'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role || false;
  }
}