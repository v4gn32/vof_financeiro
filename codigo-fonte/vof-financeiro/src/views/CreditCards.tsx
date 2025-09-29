import React, { useState } from 'react';
import { Plus, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

const CreditCards: React.FC = () => {
  const { creditCards } = useFinancial();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cartões de Crédito</h2>
          <p className="text-gray-600">Controle seus cartões e faturas</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{card.name}</h3>
                <p className="text-blue-100">**** **** **** {card.lastFourDigits}</p>
              </div>
              <CreditCard className="w-8 h-8 text-white opacity-80" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-100">Limite:</span>
                <span className="font-semibold">{formatCurrency(card.limit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Fechamento:</span>
                <span>Dia {card.closingDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Vencimento:</span>
                <span>Dia {card.dueDay}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Fatura Atual:</span>
                <span className="text-xl font-bold">{formatCurrency(0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas Faturas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nubank</p>
                <p className="text-sm text-gray-600">Vence em 15 de Janeiro</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(0)}</p>
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Em dia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCards;