import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, CreditCard, Investment, Note, DashboardStats } from '../types';
import { useAuth } from './AuthContext';

interface FinancialContextType {
  transactions: Transaction[];
  creditCards: CreditCard[];
  investments: Investment[];
  notes: Note[];
  dashboardStats: DashboardStats;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => void;
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyBalance: 0,
    totalInvestments: 0,
    creditCardDebt: 0,
  });

  // Load mock data when user logs in
  useEffect(() => {
    if (user) {
      loadMockData();
    }
  }, [user]);

  // Calculate dashboard stats when transactions change
  useEffect(() => {
    calculateDashboardStats();
  }, [transactions, investments]);

  const loadMockData = () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        userId: user!.id,
        type: 'income',
        amount: 5000,
        category: 'Salário',
        description: 'Salário mensal',
        date: new Date(2025, 0, 5),
        paymentMethod: 'Transferência',
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: user!.id,
        type: 'expense',
        amount: 1200,
        category: 'Moradia',
        description: 'Aluguel',
        date: new Date(2025, 0, 10),
        paymentMethod: 'Débito',
        createdAt: new Date(),
      },
      {
        id: '3',
        userId: user!.id,
        type: 'expense',
        amount: 350,
        category: 'Alimentação',
        description: 'Supermercado',
        date: new Date(2025, 0, 15),
        paymentMethod: 'Cartão de Crédito',
        createdAt: new Date(),
      },
    ];

    const mockCreditCards: CreditCard[] = [
      {
        id: '1',
        userId: user!.id,
        name: 'Nubank',
        lastFourDigits: '1234',
        closingDay: 15,
        dueDay: 10,
        limit: 5000,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    const mockInvestments: Investment[] = [
      {
        id: '1',
        userId: user!.id,
        type: 'Tesouro Direto',
        description: 'Tesouro Selic 2030',
        amount: 1000,
        date: new Date(2025, 0, 1),
        transactionType: 'deposit',
        createdAt: new Date(),
      },
    ];

    setTransactions(mockTransactions);
    setCreditCards(mockCreditCards);
    setInvestments(mockInvestments);
  };

  const calculateDashboardStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInvestments = investments
      .reduce((sum, inv) => {
        return inv.transactionType === 'deposit' 
          ? sum + inv.amount 
          : sum - inv.amount;
      }, 0);

    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);

    setDashboardStats({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      totalInvestments,
      creditCardDebt: 0, // Would be calculated from credit card invoices
    });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const addCreditCard = (card: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date(),
    };
    setCreditCards(prev => [...prev, newCard]);
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date(),
    };
    setInvestments(prev => [...prev, newInvestment]);
  };

  const addNote = (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  };

  return (
    <FinancialContext.Provider value={{
      transactions,
      creditCards,
      investments,
      notes,
      dashboardStats,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCreditCard,
      addInvestment,
      addNote,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};