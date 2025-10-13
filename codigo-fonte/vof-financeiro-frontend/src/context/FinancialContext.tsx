import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, CreditCard, CreditCardTransaction, Investment, Note, DashboardStats, Notification } from '../types';
import { useAuth } from './AuthContext';
import { showNotification, checkInvoiceDueDates, checkExpenseLimit } from '../utils/notifications';

interface FinancialContextType {
  transactions: Transaction[];
  creditCards: CreditCard[];
  creditCardTransactions: CreditCardTransaction[];
  investments: Investment[];
  notes: Note[];
  notifications: Notification[];
  dashboardStats: DashboardStats;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => void;
  addCreditCardTransaction: (transaction: Omit<CreditCardTransaction, 'id' | 'createdAt'>) => void;
  updateCreditCardTransaction: (id: string, transaction: Partial<CreditCardTransaction>) => void;
  deleteCreditCardTransaction: (id: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
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
  const [creditCardTransactions, setCreditCardTransactions] = useState<CreditCardTransaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
  }, [transactions, investments, creditCardTransactions]);

  // Check for notifications
  useEffect(() => {
    if (user && transactions.length > 0) {
      // Check expense limits (example: R$ 3000 monthly limit)
      const monthlyExpenses = dashboardStats.monthlyExpenses + 
        creditCardTransactions
          .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
          .reduce((sum, t) => sum + t.amount, 0);
      
      checkExpenseLimit(monthlyExpenses, 3000);
    }
  }, [dashboardStats, creditCardTransactions, user]);

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
        currentValue: 1125,
        profitLoss: 125,
        profitLossPercentage: 12.5,
        createdAt: new Date(),
      },
    ];

    const mockCreditCardTransactions: CreditCardTransaction[] = [
      {
        id: '1',
        cardId: '1',
        amount: 250,
        description: 'Supermercado Extra',
        category: 'Alimentação',
        date: new Date(2025, 0, 12),
        createdAt: new Date(),
      },
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: user!.id,
        type: 'invoice_due',
        title: 'Fatura próxima do vencimento',
        message: 'A fatura do seu cartão Nubank vence em 3 dias.',
        isRead: false,
        createdAt: new Date(),
      },
    ];

    setTransactions(mockTransactions);
    setCreditCards(mockCreditCards);
    setCreditCardTransactions(mockCreditCardTransactions);
    setInvestments(mockInvestments);
    setNotifications(mockNotifications);
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

    const creditCardDebt = creditCardTransactions
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0) - creditCardDebt;

    setDashboardStats({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      totalInvestments,
      creditCardDebt,
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
    showNotification('success', 'Transação adicionada com sucesso!');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
    showNotification('success', 'Transação atualizada com sucesso!');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    showNotification('success', 'Transação removida com sucesso!');
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

  const addCreditCardTransaction = (transaction: Omit<CreditCardTransaction, 'id' | 'createdAt'>) => {
    const newTransaction: CreditCardTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCreditCardTransactions(prev => [...prev, newTransaction]);
    showNotification('success', 'Compra no cartão adicionada com sucesso!');
  };

  const updateCreditCardTransaction = (id: string, updates: Partial<CreditCardTransaction>) => {
    setCreditCardTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
    showNotification('success', 'Compra no cartão atualizada com sucesso!');
  };

  const deleteCreditCardTransaction = (id: string) => {
    setCreditCardTransactions(prev => prev.filter(transaction => transaction.id !== id));
    showNotification('success', 'Compra no cartão removida com sucesso!');
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date(),
    };
    setInvestments(prev => [...prev, newInvestment]);
    showNotification('success', 'Investimento adicionado com sucesso!');
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments(prev => 
      prev.map(investment => 
        investment.id === id ? { ...investment, ...updates } : investment
      )
    );
    showNotification('success', 'Investimento atualizado com sucesso!');
  };

  const deleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(investment => investment.id !== id));
    showNotification('success', 'Investimento removido com sucesso!');
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

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <FinancialContext.Provider value={{
      transactions,
      creditCards,
      creditCardTransactions,
      investments,
      notes,
      notifications,
      dashboardStats,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCreditCard,
      addCreditCardTransaction,
      updateCreditCardTransaction,
      deleteCreditCardTransaction,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addNote,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};