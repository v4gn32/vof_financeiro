import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Goal } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Target, Plus, Edit, Trash2 } from 'lucide-react';
import { GoalForm } from './GoalForm';

interface GoalsProps {
  goals: Goal[];
  onAdd: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ goals, onAdd, onEdit, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (editingGoal) {
      onEdit({ ...goalData, id: editingGoal.id, createdAt: editingGoal.createdAt });
    } else {
      onAdd(goalData);
    }
    setEditingGoal(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Metas Financeiras</h2>
          <p className="text-gray-600">Defina e acompanhe seus objetivos</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = progress >= 100;
          const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;
          
          return (
            <Card key={goal.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    isCompleted ? 'bg-green-100' :
                    isOverdue ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                    <Target className={`w-6 h-6 ${
                      isCompleted ? 'text-green-600' :
                      isOverdue ? 'text-red-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(goal)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progresso</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' :
                        isOverdue ? 'bg-red-500' :
                        'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Atual:</span>
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Meta:</span>
                  <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prazo:</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {formatDate(goal.deadline)}
                  </span>
                </div>
                
                {goal.category && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium">{goal.category}</span>
                  </div>
                )}
                
                {isCompleted && (
                  <div className="text-center pt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Meta Alcançada!
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        
        {goals.length === 0 && (
          <Card className="p-8 text-center col-span-full">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta definida</h3>
            <p className="text-gray-600 mb-4">Comece definindo suas metas financeiras</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeira Meta
            </Button>
          </Card>
        )}
      </div>

      <GoalForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingGoal={editingGoal}
      />
    </div>
  );
};