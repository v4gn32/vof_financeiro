import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { Transaction, TransactionType, Category } from '../../models/financial.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Lançamentos Financeiros</h1>
          <p class="text-gray-600">Gerencie suas receitas e despesas</p>
        </div>
        <button (click)="showAddForm = !showAddForm"
                class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Novo Lançamento
        </button>
      </div>

      <!-- Add Transaction Form -->
      <div *ngIf="showAddForm" class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Novo Lançamento</h3>
        
        <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select formControlName="type" class="input-field" (change)="onTypeChange()">
                <option value="">Selecione o tipo</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select formControlName="categoryId" class="input-field">
                <option value="">Selecione a categoria</option>
                <option *ngFor="let category of availableCategories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input type="number" 
                     step="0.01" 
                     formControlName="amount" 
                     class="input-field" 
                     placeholder="0,00">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input type="date" 
                     formControlName="date" 
                     class="input-field">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input type="text" 
                     formControlName="description" 
                     class="input-field" 
                     placeholder="Descrição do lançamento">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Parcelamento (opcional)</label>
              <input type="number" 
                     min="1" 
                     max="60" 
                     formControlName="installments" 
                     class="input-field" 
                     placeholder="Número de parcelas">
            </div>
          </div>

          <div class="flex space-x-4">
            <button type="submit" 
                    [disabled]="transactionForm.invalid || submitting"
                    class="btn-primary">
              <span *ngIf="submitting">Salvando...</span>
              <span *ngIf="!submitting">Salvar Lançamento</span>
            </button>
            <button type="button" 
                    (click)="cancelAdd()"
                    class="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Filters -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select [(ngModel)]="filters.type" (ngModelChange)="applyFilters()" class="input-field">
              <option value="">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
            <input type="date" 
                   [(ngModel)]="filters.startDate" 
                   (ngModelChange)="applyFilters()"
                   class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
            <input type="date" 
                   [(ngModel)]="filters.endDate" 
                   (ngModelChange)="applyFilters()"
                   class="input-field">
          </div>

          <div class="flex items-end">
            <button (click)="clearFilters()" class="btn-secondary w-full">
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Lista de Lançamentos</h3>
          <span class="text-sm text-gray-500">{{ filteredTransactions.length }} lançamentos</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parcelas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let transaction of filteredTransactions" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-lg flex items-center justify-center mr-3"
                         [style.background-color]="transaction.category.color + '20'"
                         [style.color]="transaction.category.color">
                      <svg *ngIf="transaction.type === 'receita'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                      </svg>
                      <svg *ngIf="transaction.type === 'despesa'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                      </svg>
                    </div>
                    <div class="text-sm font-medium text-gray-900">{{ transaction.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [style.background-color]="transaction.category.color + '20'"
                        [style.color]="transaction.category.color">
                    {{ transaction.category.name }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(transaction.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    [class.text-success-600]="transaction.type === 'receita'"
                    [class.text-danger-600]="transaction.type === 'despesa'">
                  {{ transaction.type === 'receita' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span *ngIf="transaction.installments">
                    {{ transaction.currentInstallment }}/{{ transaction.installments }}x
                  </span>
                  <span *ngIf="!transaction.installments">-</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredTransactions.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Nenhum lançamento encontrado</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  showAddForm = false;
  submitting = false;
  transactionForm: FormGroup;
  availableCategories: Category[] = [];

  filters = {
    type: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService
  ) {
    this.transactionForm = this.fb.group({
      type: ['', Validators.required],
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      description: ['', Validators.required],
      installments: ['']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.financialService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.applyFilters();
    });
  }

  onTypeChange(): void {
    const type = this.transactionForm.get('type')?.value as TransactionType;
    if (type) {
      this.availableCategories = this.financialService.getCategoriesByType(type);
      this.transactionForm.patchValue({ categoryId: '' });
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.submitting = true;
      
      const formValue = this.transactionForm.value;
      const category = this.availableCategories.find(c => c.id === +formValue.categoryId);
      
      if (!category) return;

      const transaction = {
        type: formValue.type,
        category,
        amount: +formValue.amount,
        date: new Date(formValue.date),
        description: formValue.description,
        installments: formValue.installments ? +formValue.installments : undefined,
        currentInstallment: formValue.installments ? 1 : undefined
      };

      this.financialService.addTransaction(transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.cancelAdd();
        },
        error: () => {
          this.submitting = false;
        }
      });
    }
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.submitting = false;
    this.transactionForm.reset({
      date: new Date().toISOString().split('T')[0]
    });
    this.availableCategories = [];
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Type filter
      if (this.filters.type && transaction.type !== this.filters.type) {
        return false;
      }

      // Date filters
      if (this.filters.startDate) {
        const startDate = new Date(this.filters.startDate);
        if (transaction.date < startDate) {
          return false;
        }
      }

      if (this.filters.endDate) {
        const endDate = new Date(this.filters.endDate);
        if (transaction.date > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      startDate: '',
      endDate: ''
    };
    this.applyFilters();
  }

  formatCurrency(value: number): string {
    return this.financialService.formatCurrency(value);
  }

  formatDate(date: Date): string {
    return this.financialService.formatDate(date);
  }
}