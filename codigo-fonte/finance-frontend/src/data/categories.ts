import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Income categories
  { id: '1', name: 'Salário', type: 'income', color: '#10B981', icon: 'Briefcase' },
  { id: '2', name: 'Freelance', type: 'income', color: '#06B6D4', icon: 'Code' },
  { id: '3', name: 'Investimentos', type: 'income', color: '#8B5CF6', icon: 'TrendingUp' },
  { id: '4', name: 'Outros', type: 'income', color: '#6B7280', icon: 'Plus' },
  
  // Expense categories
  { id: '5', name: 'Alimentação', type: 'expense', color: '#F59E0B', icon: 'UtensilsCrossed' },
  { id: '6', name: 'Transporte', type: 'expense', color: '#EF4444', icon: 'Car' },
  { id: '7', name: 'Moradia', type: 'expense', color: '#8B5CF6', icon: 'Home' },
  { id: '8', name: 'Saúde', type: 'expense', color: '#EC4899', icon: 'Heart' },
  { id: '9', name: 'Educação', type: 'expense', color: '#3B82F6', icon: 'GraduationCap' },
  { id: '10', name: 'Lazer', type: 'expense', color: '#10B981', icon: 'Gamepad2' },
  { id: '11', name: 'Compras', type: 'expense', color: '#F97316', icon: 'ShoppingBag' },
  { id: '12', name: 'Outros', type: 'expense', color: '#6B7280', icon: 'MoreHorizontal' },
];