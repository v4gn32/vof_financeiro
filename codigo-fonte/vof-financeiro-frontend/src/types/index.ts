export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  paymentMethod: string;
  receipt?: string;
  createdAt: Date;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  lastFourDigits: string;
  closingDay: number;
  dueDay: number;
  limit: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreditCardInvoice {
  id: string;
  cardId: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  type: string;
  description: string;
  amount: number;
  date: Date;
  transactionType: 'deposit' | 'withdrawal';
  notes?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  totalInvestments: number;
  creditCardDebt: number;
}