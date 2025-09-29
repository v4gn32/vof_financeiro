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

  // Load data from backend when user logs in
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Calculate dashboard stats when transactions change
  useEffect(() => {
    calculateDashboardStats();
  }, [transactions, investments]);

  const loadUserData = async () => {
    try {
      // TODO: Implementar chamadas para o backend
      // const [transactionsRes, cardsRes, investmentsRes, notesRes] = await Promise.all([
      //   fetch(`/api/transactions?userId=${user!.id}`),
      //   fetch(`/api/credit-cards?userId=${user!.id}`),
      //   fetch(`/api/investments?userId=${user!.id}`),
      //   fetch(`/api/notes?userId=${user!.id}`)
      // ]);
      
      // setTransactions(await transactionsRes.json());
      // setCreditCards(await cardsRes.json());
      // setInvestments(await investmentsRes.json());
      // setNotes(await notesRes.json());
      
      // Por enquanto, inicializar com arrays vazios
      setTransactions([]);
      setCreditCards([]);
      setInvestments([]);
      setNotes([]);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
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