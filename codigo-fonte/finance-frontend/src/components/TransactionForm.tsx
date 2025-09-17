import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Transaction, Category } from '../types';
import { defaultCategories } from '../data/categories';
import { Modal } from './ui/Modal';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTransaction,
}) => {
  const [formData, setFormData] = useState({
    type: editingTransaction?.type || 'expense' as 'income' | 'expense',
    amount: editingTransaction?.amount.toString() || '',
    category: editingTransaction?.category || '',
    description: editingTransaction?.description || '',
    date: editingTransaction?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) return;

    onSubmit({
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    });

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const categories = defaultCategories.filter(cat => cat.type === formData.type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense', category: '' })}
              className="mr-2"
            />
            Despesa
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income', category: '' })}
              className="mr-2"
            />
            Receita
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite uma descrição"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex space-x-3">
          <Button type="submit" className="flex-1">
            {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};