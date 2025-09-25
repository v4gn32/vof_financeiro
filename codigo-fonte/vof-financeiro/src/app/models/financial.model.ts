export type TransactionType = 'receita' | 'despesa';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  category: Category;
  amount: number;
  date: Date;
  description: string;
  installments?: number;
  currentInstallment?: number;
  userId: number;
  createdAt: Date;
}

export interface Invoice {
  id: number;
  number: string;
  clientName: string;
  clientDocument: string;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  description: string;
  status: 'pending' | 'paid' | 'cancelled';
  userId: number;
  createdAt: Date;
}

export interface DashboardData {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  monthlyTransactions: Transaction[];
  recentTransactions: Transaction[];
}