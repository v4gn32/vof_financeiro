import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Transaction, Invoice, Category, DashboardData, TransactionType } from '../models/financial.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  
  public transactions$ = this.transactionsSubject.asObservable();
  public invoices$ = this.invoicesSubject.asObservable();

  // Mock categories
  public categories: Category[] = [
    { id: 1, name: 'Vendas', type: 'receita', color: '#059669' },
    { id: 2, name: 'Serviços', type: 'receita', color: '#0891b2' },
    { id: 3, name: 'Outros Recebimentos', type: 'receita', color: '#7c3aed' },
    { id: 4, name: 'Material de Escritório', type: 'despesa', color: '#dc2626' },
    { id: 5, name: 'Marketing', type: 'despesa', color: '#ea580c' },
    { id: 6, name: 'Combustível', type: 'despesa', color: '#d97706' },
    { id: 7, name: 'Telefone/Internet', type: 'despesa', color: '#65a30d' },
    { id: 8, name: 'Impostos', type: 'despesa', color: '#dc2626' },
  ];

  // Mock data
  private mockTransactions: Transaction[] = [
    {
      id: 1,
      type: 'receita',
      category: this.categories[0],
      amount: 2500.00,
      date: new Date(2025, 0, 15),
      description: 'Venda de produtos janeiro',
      userId: 1,
      createdAt: new Date()
    },
    {
      id: 2,
      type: 'receita',
      category: this.categories[1],
      amount: 1800.00,
      date: new Date(2025, 0, 12),
      description: 'Prestação de serviços - Cliente A',
      userId: 1,
      createdAt: new Date()
    },
    {
      id: 3,
      type: 'despesa',
      category: this.categories[4],
      amount: 300.00,
      date: new Date(2025, 0, 10),
      description: 'Campanha Google Ads',
      installments: 3,
      currentInstallment: 1,
      userId: 1,
      createdAt: new Date()
    },
    {
      id: 4,
      type: 'despesa',
      category: this.categories[6],
      amount: 120.00,
      date: new Date(2025, 0, 8),
      description: 'Internet empresarial',
      userId: 1,
      createdAt: new Date()
    }
  ];

  private mockInvoices: Invoice[] = [
    {
      id: 1,
      number: 'NF-2025-001',
      clientName: 'Empresa ABC Ltda',
      clientDocument: '12.345.678/0001-90',
      amount: 2500.00,
      issueDate: new Date(2025, 0, 15),
      dueDate: new Date(2025, 1, 15),
      description: 'Prestação de serviços de consultoria',
      status: 'paid',
      userId: 1,
      createdAt: new Date()
    },
    {
      id: 2,
      number: 'NF-2025-002',
      clientName: 'João Silva',
      clientDocument: '123.456.789-00',
      amount: 1800.00,
      issueDate: new Date(2025, 0, 12),
      dueDate: new Date(2025, 1, 12),
      description: 'Venda de produtos',
      status: 'pending',
      userId: 1,
      createdAt: new Date()
    }
  ];

  constructor() {
    this.transactionsSubject.next(this.mockTransactions);
    this.invoicesSubject.next(this.mockInvoices);
  }

  getDashboardData(): Observable<DashboardData> {
    const transactions = this.transactionsSubject.value;
    
    const totalRevenue = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalRevenue - totalExpenses;
    
    return of({
      totalRevenue,
      totalExpenses,
      balance,
      monthlyTransactions: transactions,
      recentTransactions: transactions.slice(0, 5)
    }).pipe(delay(500));
  }

  getTransactions(): Observable<Transaction[]> {
    return this.transactions$.pipe(delay(300));
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$.pipe(delay(300));
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Observable<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.mockTransactions.length + 1,
      userId: 1,
      createdAt: new Date()
    };

    this.mockTransactions.push(newTransaction);
    this.transactionsSubject.next([...this.mockTransactions]);
    
    return of(newTransaction).pipe(delay(500));
  }

  addInvoice(invoice: Omit<Invoice, 'id' | 'userId' | 'createdAt'>): Observable<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: this.mockInvoices.length + 1,
      userId: 1,
      createdAt: new Date()
    };

    this.mockInvoices.push(newInvoice);
    this.invoicesSubject.next([...this.mockInvoices]);
    
    return of(newInvoice).pipe(delay(500));
  }

  getCategoriesByType(type: TransactionType): Category[] {
    return this.categories.filter(c => c.type === type);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}