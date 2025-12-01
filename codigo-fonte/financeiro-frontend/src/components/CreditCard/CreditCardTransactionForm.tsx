import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard as CreditCardIcon, Hash } from 'lucide-react';
import { CreditCardTransaction, CreditCard } from '../../types';

interface CreditCardTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<CreditCardTransaction, 'id' | 'createdAt'>) => void;
  creditCards: CreditCard[];
  transaction?: CreditCardTransaction | null;
}

const CreditCardTransactionForm: React.FC<CreditCardTransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  creditCards,
  transaction 
}) => {
  const [formData, setFormData] = useState({
    cardId: transaction?.cardId || '',
    amount: transaction?.amount || 0,
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    installments: transaction?.installments || 1,
    currentInstallment: transaction?.currentInstallment || 1,
  });

  const categories = [
    'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 
    'Compras', 'Serviços', 'Viagem', 'Combustível', 'Outros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cardId: formData.cardId,
      amount: formData.amount,
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date),
      installments: formData.installments > 1 ? formData.installments : undefined,
      currentInstallment: formData.installments > 1 ? formData.currentInstallment : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {transaction ? 'Editar Compra' : 'Nova Compra no Cartão'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cartão de Crédito</label>
            <div className="relative">
              <CreditCardIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.cardId}
                onChange={(e) => setFormData(prev => ({ ...prev, cardId: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cartão</option>
                {creditCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} - **** {card.lastFourDigits}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição da compra"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data da Compra</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.installments}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    installments: parseInt(e.target.value),
                    currentInstallment: 1
                  }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {formData.installments > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parcela Atual</label>
                <input
                  type="number"
                  min="1"
                  max={formData.installments}
                  value={formData.currentInstallment}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentInstallment: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
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
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {transaction ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardTransactionForm;