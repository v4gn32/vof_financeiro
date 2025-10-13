import React from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  StickyNote,
  Settings,
  LogOut,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'transactions', icon: DollarSign, label: 'Receitas & Despesas' },
    { id: 'credit-cards', icon: CreditCard, label: 'Cartões de Crédito' },
    { id: 'investments', icon: TrendingUp, label: 'Investimentos' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
    { id: 'notes', icon: StickyNote, label: 'Observações' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="bg-white h-full w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">VOF-Financeiro</h1>
        <p className="text-sm text-gray-600 mt-1">Controle Financeiro</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Perfil" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-green-700 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;