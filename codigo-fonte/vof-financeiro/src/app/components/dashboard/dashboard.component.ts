import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialService } from '../../services/financial.service';
import { DashboardData, Transaction } from '../../models/financial.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Visão geral das suas finanças</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]" class="card animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div *ngIf="!loading && dashboardData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Revenue Card -->
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-success-100 rounded-lg flex items-center justify-center">
                <svg class="h-5 w-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Receitas</p>
              <p class="text-2xl font-bold text-success-600">
                {{ formatCurrency(dashboardData.totalRevenue) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Expenses Card -->
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <svg class="h-5 w-5 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Despesas</p>
              <p class="text-2xl font-bold text-danger-600">
                {{ formatCurrency(dashboardData.totalExpenses) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Balance Card -->
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Saldo</p>
              <p class="text-2xl font-bold" 
                 [class.text-success-600]="dashboardData.balance >= 0"
                 [class.text-danger-600]="dashboardData.balance < 0">
                {{ formatCurrency(dashboardData.balance) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div *ngIf="!loading && dashboardData" class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Lançamentos Recentes</h2>
          <a routerLink="/app/transactions" class="text-primary-600 hover:text-primary-500 text-sm font-medium">
            Ver todos
          </a>
        </div>

        <div class="space-y-4">
          <div *ngFor="let transaction of dashboardData.recentTransactions" 
               class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-lg flex items-center justify-center"
                   [style.background-color]="transaction.category.color + '20'"
                   [style.color]="transaction.category.color">
                <svg *ngIf="transaction.type === 'receita'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                </svg>
                <svg *ngIf="transaction.type === 'despesa'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                <p class="text-sm text-gray-500">{{ transaction.category.name }} • {{ formatDate(transaction.date) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold"
                 [class.text-success-600]="transaction.type === 'receita'"
                 [class.text-danger-600]="transaction.type === 'despesa'">
                {{ transaction.type === 'receita' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
              <p *ngIf="transaction.installments" class="text-xs text-gray-500">
                {{ transaction.currentInstallment }}/{{ transaction.installments }}x
              </p>
            </div>
          </div>

          <div *ngIf="dashboardData.recentTransactions.length === 0" class="text-center py-8">
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
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;

  constructor(private financialService: FinancialService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.financialService.getDashboardData().subscribe(data => {
      this.dashboardData = data;
      this.loading = false;
    });
  }

  formatCurrency(value: number): string {
    return this.financialService.formatCurrency(value);
  }

  formatDate(date: Date): string {
    return this.financialService.formatDate(date);
  }
}