import { toast } from 'react-hot-toast';
import { Notification } from '../types';

export const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  switch (type) {
    case 'success':
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      break;
    case 'error':
      toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      break;
    case 'warning':
      toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: '⚠️',
        style: {
          background: '#F59E0B',
          color: '#fff',
        },
      });
      break;
    case 'info':
      toast(message, {
        duration: 4000,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });
      break;
  }
};

export const checkInvoiceDueDates = (invoices: any[]) => {
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  invoices.forEach(invoice => {
    const dueDate = new Date(invoice.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff <= 3 && daysDiff >= 0 && invoice.status === 'pending') {
      showNotification('warning', `Fatura do cartão ${invoice.cardName} vence em ${daysDiff} dias!`);
    } else if (daysDiff < 0 && invoice.status === 'pending') {
      showNotification('error', `Fatura do cartão ${invoice.cardName} está em atraso!`);
    }
  });
};

export const checkExpenseLimit = (monthlyExpenses: number, limit: number) => {
  const percentage = (monthlyExpenses / limit) * 100;

  if (percentage >= 90) {
    showNotification('error', `Você já gastou ${percentage.toFixed(1)}% do seu limite mensal!`);
  } else if (percentage >= 75) {
    showNotification('warning', `Atenção: você já gastou ${percentage.toFixed(1)}% do seu limite mensal.`);
  }
};

export const checkInvestmentGoals = (currentAmount: number, goalAmount: number, goalName: string) => {
  const percentage = (currentAmount / goalAmount) * 100;

  if (percentage >= 100) {
    showNotification('success', `Parabéns! Você atingiu sua meta de ${goalName}!`);
  } else if (percentage >= 75) {
    showNotification('info', `Você está a ${(100 - percentage).toFixed(1)}% da sua meta de ${goalName}!`);
  }
};