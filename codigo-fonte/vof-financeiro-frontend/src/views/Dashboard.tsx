import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import StatsCard from '../components/Dashboard/StatsCard';
import ExpenseChart from '../components/Dashboard/ExpenseChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

const Dashboard: React.FC = () => {
  const { dashboardStats, transactions } = useFinancial();

  // Mock expense data by category
  const expenseData = [
    { category: 'Moradia', amount: 1200, color: '#DC2626' },
    { category: 'Alimentação', amount: 350, color: '#EA580C' },
    { category: 'Transporte', amount: 200, color: '#D97706' },
    { category: 'Saúde', amount: 150, color: '#65A30D' },
    { category: 'Lazer', amount: 100, color: '#059669' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Financeiro</h2>
        <p className="text-gray-600">Visão geral das suas finanças pessoais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Saldo Total"
          value={dashboardStats.totalBalance}
          icon={DollarSign}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Receitas do Mês"
          value={dashboardStats.monthlyIncome}
          icon={TrendingUp}
          color="green"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Despesas do Mês"
          value={dashboardStats.monthlyExpenses}
          icon={TrendingDown}
          color="red"
          trend={{ value: 5.1, isPositive: false }}
        />
        <StatsCard
          title="Investimentos"
          value={dashboardStats.totalInvestments}
          icon={PiggyBank}
          color="purple"
          trend={{ value: 15.3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseChart data={expenseData} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
};

export default Dashboard;