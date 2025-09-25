import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { Invoice } from '../../models/financial.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notas Fiscais MEI</h1>
          <p class="text-gray-600">Gerencie suas notas fiscais emitidas</p>
        </div>
        <button (click)="showAddForm = !showAddForm"
                class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nova Nota Fiscal
        </button>
      </div>

      <!-- Add Invoice Form -->
      <div *ngIf="showAddForm" class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Nova Nota Fiscal</h3>
        
        <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Número da NF</label>
              <input type="text" 
                     formControlName="number" 
                     class="input-field" 
                     placeholder="NF-2025-001">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
              <input type="text" 
                     formControlName="clientName" 
                     class="input-field" 
                     placeholder="Nome ou razão social">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
              <input type="text" 
                     formControlName="clientDocument" 
                     class="input-field" 
                     placeholder="000.000.000-00 ou 00.000.000/0001-00">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
              <input type="date" 
                     formControlName="issueDate" 
                     class="input-field">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <input type="date" 
                     formControlName="dueDate" 
                     class="input-field">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição dos Serviços/Produtos</label>
              <textarea formControlName="description" 
                        rows="3"
                        class="input-field" 
                        placeholder="Descrição detalhada dos serviços ou produtos"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select formControlName="status" class="input-field">
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="flex space-x-4">
            <button type="submit" 
                    [disabled]="invoiceForm.invalid || submitting"
                    class="btn-primary">
              <span *ngIf="submitting">Salvando...</span>
              <span *ngIf="!submitting">Salvar Nota Fiscal</span>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select [(ngModel)]="filters.status" (ngModelChange)="applyFilters()" class="input-field">
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="cancelled">Cancelado</option>
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

      <!-- Invoices List -->
      <div class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Lista de Notas Fiscais</h3>
          <span class="text-sm text-gray-500">{{ filteredInvoices.length }} notas fiscais</span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emissão
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let invoice of filteredInvoices" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ invoice.number }}</div>
                  <div class="text-sm text-gray-500 truncate max-w-32">{{ invoice.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ invoice.clientName }}</div>
                  <div class="text-sm text-gray-500">{{ invoice.clientDocument }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.issueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.dueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatCurrency(invoice.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': invoice.status === 'pending',
                          'bg-green-100 text-green-800': invoice.status === 'paid',
                          'bg-red-100 text-red-800': invoice.status === 'cancelled'
                        }">
                    {{ getStatusLabel(invoice.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredInvoices.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Nenhuma nota fiscal encontrada</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  showAddForm = false;
  submitting = false;
  invoiceForm: FormGroup;

  filters = {
    status: '',
    startDate: '',
    endDate: ''
  };

  constructor(
    private fb: FormBuilder,
    private financialService: FinancialService
  ) {
    this.invoiceForm = this.fb.group({
      number: ['', Validators.required],
      clientName: ['', Validators.required],
      clientDocument: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      description: ['', Validators.required],
      status: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.financialService.getInvoices().subscribe(invoices => {
      this.invoices = invoices;
      this.applyFilters();
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.submitting = true;
      
      const formValue = this.invoiceForm.value;
      const invoice = {
        number: formValue.number,
        clientName: formValue.clientName,
        clientDocument: formValue.clientDocument,
        amount: +formValue.amount,
        issueDate: new Date(formValue.issueDate),
        dueDate: new Date(formValue.dueDate),
        description: formValue.description,
        status: formValue.status
      };

      this.financialService.addInvoice(invoice).subscribe({
        next: () => {
          this.loadInvoices();
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
    this.invoiceForm.reset({
      issueDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  }

  applyFilters(): void {
    this.filteredInvoices = this.invoices.filter(invoice => {
      // Status filter
      if (this.filters.status && invoice.status !== this.filters.status) {
        return false;
      }

      // Date filters
      if (this.filters.startDate) {
        const startDate = new Date(this.filters.startDate);
        if (invoice.issueDate < startDate) {
          return false;
        }
      }

      if (this.filters.endDate) {
        const endDate = new Date(this.filters.endDate);
        if (invoice.issueDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      startDate: '',
      endDate: ''
    };
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      paid: 'Pago',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  }

  formatCurrency(value: number): string {
    return this.financialService.formatCurrency(value);
  }

  formatDate(date: Date): string {
    return this.financialService.formatDate(date);
  }
}