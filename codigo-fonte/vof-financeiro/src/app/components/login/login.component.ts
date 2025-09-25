import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
            Entre na sua conta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Ou
            <a routerLink="/register" class="font-medium text-primary-600 hover:text-primary-500">
              crie uma nova conta
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                formControlName="email"
                required
                class="input-field"
                placeholder="seu@email.com"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Email é obrigatório e deve ser válido
              </div>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                formControlName="password"
                required
                class="input-field"
                placeholder="Sua senha"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Senha é obrigatória
              </div>
            </div>
          </div>

          <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading"
              class="group relative w-full btn-primary py-3 text-sm font-medium"
            >
              <span *ngIf="loading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
              <span *ngIf="!loading">Entrar</span>
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Versão demo: use qualquer email/senha para entrar
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/app/dashboard']);
          } else {
            this.error = response.error || 'Erro ao fazer login. Tente novamente.';
          }
        },
        error: (err: any) => {
          this.error = 'Erro ao fazer login. Tente novamente.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}