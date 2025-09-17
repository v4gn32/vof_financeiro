import React from 'react';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/currency';
import { Transaction, Goal } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, goals }) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Metas</p>
              <p className="text-2xl font-bold text-purple-600">
                {completedGoals}/{goals.length}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Transações Recentes</h3>
          <div className="space-y-3">
            {monthlyTransactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.category}</p>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
            {monthlyTransactions.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma transação este mês</p>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Progresso das Metas</h3>
          <div className="space-y-4">
            {goals.slice(0, 4).map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                    <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma meta definida</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};