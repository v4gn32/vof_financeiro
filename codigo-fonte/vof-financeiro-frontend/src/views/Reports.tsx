import React, { useState } from 'react';
import { Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

const Reports: React.FC = () => {
  const { transactions, dashboardStats } = useFinancial();
  const [dateRange, setDateRange] = useState('current-month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const monthlyData = [
    { month: 'Jan', income: 5000, expenses: 3500 },
    { month: 'Feb', income: 5200, expenses: 3800 },
    { month: 'Mar', income: 4800, expenses: 3200 },
    { month: 'Abr', income: 5500, expenses: 4000 },
    { month: 'Mai', income: 5000, expenses: 3600 },
    { month: 'Jun', income: 5300, expenses: 3900 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatórios Financeiros</h2>
          <p className="text-gray-600">Análises detalhadas das suas finanças</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas Totais</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardStats.monthlyIncome)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboardStats.monthlyExpenses)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo do Mês</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardStats.monthlyBalance)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Economia</p>
              <p className="text-2xl font-bold text-purple-600">32%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Evolução Mensal</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option value="6">Últimos 6 meses</option>
              <option value="12">Últimos 12 meses</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{data.month}</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">+{formatCurrency(data.income)}</span>
                    <span className="text-red-600">-{formatCurrency(data.expenses)}</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500"
                      style={{ width: `${(data.income / 6000) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-500"
                      style={{ width: `${(data.expenses / 6000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros de Relatório</h3>
            <Filter className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="current-month">Mês Atual</option>
                <option value="last-month">Mês Anterior</option>
                <option value="current-year">Ano Atual</option>
                <option value="custom">Período Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="all">Todas as Categorias</option>
                <option value="moradia">Moradia</option>
                <option value="alimentacao">Alimentação</option>
                <option value="transporte">Transporte</option>
                <option value="saude">Saúde</option>
                <option value="lazer">Lazer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-green-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Receitas</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-red-600" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Despesas</span>
                </label>
              </div>
            </div>

            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;