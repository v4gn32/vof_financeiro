import React, { useState } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

const Investments: React.FC = () => {
  const { investments, dashboardStats } = useFinancial();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Investimentos</h2>
          <p className="text-gray-600">Acompanhe seus aportes e retiradas</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Aporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investido</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalInvestments)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rentabilidade</p>
              <p className="text-2xl font-bold text-green-600">+12.5%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Atual</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardStats.totalInvestments * 1.125)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Histórico de Investimentos</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {investments.map((investment) => (
            <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    investment.transactionType === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${
                      investment.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{investment.type}</h3>
                    <p className="text-sm text-gray-600">{investment.description}</p>
                    {investment.notes && (
                      <p className="text-xs text-gray-500 mt-1">{investment.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    investment.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {investment.transactionType === 'deposit' ? '+' : '-'}{formatCurrency(investment.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(investment.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Investments;