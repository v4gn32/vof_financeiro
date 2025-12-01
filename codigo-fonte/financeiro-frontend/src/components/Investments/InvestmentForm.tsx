import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, TrendingUp, FileText } from 'lucide-react';
import { Investment } from '../../types';

interface InvestmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => void;
  investment?: Investment | null;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  investment 
}) => {
  const [formData, setFormData] = useState({
    type: investment?.type || '',
    description: investment?.description || '',
    amount: investment?.amount || 0,
    date: investment?.date ? new Date(investment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    transactionType: investment?.transactionType || 'deposit' as 'deposit' | 'withdrawal',
    currentValue: investment?.currentValue || 0,
    notes: investment?.notes || '',
  });

  const investmentTypes = [
    'Tesouro Direto',
    'CDB',
    'LCI/LCA',
    'Fundos de Investimento',
    'Ações',
    'FIIs',
    'Criptomoedas',
    'Poupança',
    'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profitLoss = formData.currentValue - formData.amount;
    const profitLossPercentage = formData.amount > 0 ? (profitLoss / formData.amount) * 100 : 0;

    onSubmit({
      type: formData.type,
      description: formData.description,
      amount: formData.amount,
      date: new Date(formData.date),
      transactionType: formData.transactionType,
      currentValue: formData.transactionType === 'deposit' ? formData.currentValue : undefined,
      profitLoss: formData.transactionType === 'deposit' ? profitLoss : undefined,
      profitLossPercentage: formData.transactionType === 'deposit' ? profitLossPercentage : undefined,
      notes: formData.notes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {investment ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Operação</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transactionType: 'deposit' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.transactionType === 'deposit'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Aporte
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, transactionType: 'withdrawal' }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.transactionType === 'withdrawal'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Retirada
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Investimento</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione o tipo</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Tesouro Selic 2030, Ações PETR4, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.transactionType === 'deposit' ? 'Valor do Aporte' : 'Valor da Retirada'}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {formData.transactionType === 'deposit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor Atual (Opcional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentValue: parseFloat(e.target.value) }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Valor atual do investimento"
                />
              </div>
              {formData.currentValue > 0 && formData.amount > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Rentabilidade: 
                    <span className={`ml-1 font-semibold ${
                      formData.currentValue >= formData.amount ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {((formData.currentValue - formData.amount) / formData.amount * 100).toFixed(2)}%
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Observações sobre o investimento..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {investment ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentForm;