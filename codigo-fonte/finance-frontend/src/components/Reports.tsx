import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { defaultCategories } from '../data/categories';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
}

export const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const reportData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      .toISOString().slice(0, 7);
    
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));
    
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = { income: 0, expense: 0 };
      }
      acc[transaction.category][transaction.type] += transaction.amount;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);
    
    return {
      current: { income: currentIncome, expenses: currentExpenses },
      last: { income: lastIncome, expenses: lastExpenses },
      categoryBreakdown,
    };
  }, [transactions]);

  const incomeChange = reportData.last.income > 0 
    ? ((reportData.current.income - reportData.last.income) / reportData.last.income) * 100
    : 0;
    
  const expenseChange = reportData.last.expenses > 0
    ? ((reportData.current.expenses - reportData.last.expenses) / reportData.last.expenses) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatórios</h2>
        <p className="text-gray-600">Análise detalhada das suas finanças</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(reportData.current.income)}
              </p>
              <div className={`flex items-center mt-1 ${
                incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Mensais</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(reportData.current.expenses)}
              </p>
              <div className={`flex items-center mt-1 ${
                expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Economia Mensal</p>
              <p className={`text-2xl font-bold ${
                reportData.current.income - reportData.current.expenses >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(reportData.current.income - reportData.current.expenses)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {reportData.current.income > 0 
                  ? `${(((reportData.current.income - reportData.current.expenses) / reportData.current.income) * 100).toFixed(1)}% da receita`
                  : '0% da receita'
                }
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <PieChart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Transações</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Este mês: {transactions.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
          <div className="space-y-4">
            {Object.entries(reportData.categoryBreakdown)
              .filter(([_, data]) => data.expense > 0)
              .sort(([_, a], [__, b]) => b.expense - a.expense)
              .slice(0, 6)
              .map(([category, data]) => {
                const categoryInfo = defaultCategories.find(cat => cat.name === category);
                const percentage = reportData.current.expenses > 0 
                  ? (data.expense / reportData.current.expenses) * 100 
                  : 0;
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoryInfo?.color || '#6B7280' }}
                        />
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                      </div>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categoryInfo?.color || '#6B7280'
                        }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(data.expense)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Receitas por Categoria</h3>
          <div className="space-y-4">
            {Object.entries(reportData.categoryBreakdown)
              .filter(([_, data]) => data.income > 0)
              .sort(([_, a], [__, b]) => b.income - a.income)
              .slice(0, 6)
              .map(([category, data]) => {
                const categoryInfo = defaultCategories.find(cat => cat.name === category);
                const percentage = reportData.current.income > 0 
                  ? (data.income / reportData.current.income) * 100 
                  : 0;
                
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: categoryInfo?.color || '#6B7280' }}
                        />
                        <span className="text-sm font-medium text-gray-900">{category}</span>
                      </div>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categoryInfo?.color || '#6B7280'
                        }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(data.income)}
                      </span>
                    </div>
                  </div>
                );
              })}
            {Object.keys(reportData.categoryBreakdown).filter(cat => 
              reportData.categoryBreakdown[cat].income > 0
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma receita registrada</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};