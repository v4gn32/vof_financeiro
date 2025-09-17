export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  createdAt: string;
}

export interface MonthlyBudget {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: string;
  year: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences: {
    currency: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}