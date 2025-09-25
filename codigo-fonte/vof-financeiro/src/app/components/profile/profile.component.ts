import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
        <p class="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <!-- User Info Card -->
      <div class="card">
        <div class="flex items-center space-x-6 mb-6">
          <div class="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center">
            <span class="text-white text-2xl font-bold">{{ getUserInitials() }}</span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ currentUser?.name }}</h2>
            <p class="text-gray-600">{{ currentUser?.email }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-2">
              {{ getRoleLabel() }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Informações da Conta</h3>
            <dl class="space-y-2">
              <div>
                <dt class="text-sm text-gray-500">Nome:</dt>
                <dd class="text-sm font-medium text-gray-900">{{ currentUser?.name }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Email:</dt>
                <dd class="text-sm font-medium text-gray-900">{{ currentUser?.email }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Tipo de Conta:</dt>
                <dd class="text-sm font-medium text-gray-900">{{ getRoleLabel() }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Membro desde:</dt>
                <dd class="text-sm font-medium text-gray-900">{{ formatDate(currentUser?.createdAt) }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">Estatísticas</h3>
            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Sistema em uso desde</span>
                  <span class="text-sm font-medium text-gray-900">Janeiro 2025</span>
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Última atividade</span>
                  <span class="text-sm font-medium text-gray-900">Hoje</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Editar Informações</h3>
        
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input type="text" 
                     formControlName="name" 
                     class="input-field" 
                     placeholder="Seu nome completo">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" 
                     formControlName="email" 
                     class="input-field" 
                     placeholder="seu@email.com">
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h4 class="text-md font-medium text-gray-900 mb-4">Alterar Senha</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                <input type="password" 
                       formControlName="newPassword" 
                       class="input-field" 
                       placeholder="Nova senha (opcional)">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                <input type="password" 
                       formControlName="confirmPassword" 
                       class="input-field" 
                       placeholder="Confirme a nova senha">
              </div>
            </div>

            <div *ngIf="profileForm.hasError('passwordMismatch')" 
                 class="mt-2 text-sm text-red-600">
              As senhas não coincidem
            </div>
          </div>

          <div *ngIf="message" 
               class="p-4 rounded-lg"
               [class.bg-green-50]="messageType === 'success'"
               [class.bg-red-50]="messageType === 'error'"
               [class.text-green-800]="messageType === 'success'"
               [class.text-red-800]="messageType === 'error'">
            {{ message }}
          </div>

          <div class="flex space-x-4">
            <button type="submit" 
                    [disabled]="profileForm.invalid || submitting"
                    class="btn-primary">
              <span *ngIf="submitting">Salvando...</span>
              <span *ngIf="!submitting">Salvar Alterações</span>
            </button>
            <button type="button" 
                    (click)="resetForm()"
                    class="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="card border-red-200">
        <h3 class="text-lg font-semibold text-red-900 mb-4">Zona de Perigo</h3>
        <p class="text-sm text-gray-600 mb-4">
          Ações irreversíveis que afetam permanentemente sua conta.
        </p>
        
        <div class="space-y-3">
          <button class="btn-secondary text-red-600 hover:bg-red-50 border-red-200">
            Exportar Dados
          </button>
          <button class="btn-secondary text-red-600 hover:bg-red-50 border-red-200">
            Excluir Conta
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  submitting = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      newPassword: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.submitting = true;
      this.message = '';

      // Simulate API call
      setTimeout(() => {
        this.message = 'Perfil atualizado com sucesso!';
        this.messageType = 'success';
        this.submitting = false;
        
        // Clear password fields
        this.profileForm.patchValue({
          newPassword: '',
          confirmPassword: ''
        });
      }, 1000);
    }
  }

  resetForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email,
        newPassword: '',
        confirmPassword: ''
      });
    }
    this.message = '';
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

  getRoleLabel(): string {
    const labels: { [key: string]: string } = {
      admin: 'Administrador',
      user: 'Usuário'
    };
    return labels[this.currentUser?.role || ''] || 'Usuário';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }
}