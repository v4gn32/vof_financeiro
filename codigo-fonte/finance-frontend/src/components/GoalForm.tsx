import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Goal } from '../types';
import { Modal } from './ui/Modal';
import { defaultCategories } from '../data/categories';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  editingGoal?: Goal;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
}) => {
  const [formData, setFormData] = useState({
    title: editingGoal?.title || '',
    targetAmount: editingGoal?.targetAmount.toString() || '',
    currentAmount: editingGoal?.currentAmount.toString() || '0',
    category: editingGoal?.category || '',
    deadline: editingGoal?.deadline || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.targetAmount || !formData.deadline) return;

    onSubmit({
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount),
      category: formData.category,
      deadline: formData.deadline,
    });

    setFormData({
      title: '',
      targetAmount: '',
      currentAmount: '0',
      category: '',
      deadline: '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título da Meta
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Viagem para Europa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor Alvo
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor Atual
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.currentAmount}
            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria (Opcional)
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione uma categoria</option>
            {defaultCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prazo
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex space-x-3">
          <Button type="submit" className="flex-1">
            {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};