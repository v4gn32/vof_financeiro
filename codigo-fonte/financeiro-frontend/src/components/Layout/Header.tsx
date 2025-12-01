import React from 'react';
import { Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import NotificationCenter from '../Notifications/NotificationCenter';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useFinancial();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {getGreeting()}, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">Acompanhe suas finanças de forma inteligente</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transações..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onDeleteNotification={deleteNotification}
          />
          
          <div className="w-8 h-8 rounded-full overflow-hidden bg-green-100 flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Perfil" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-green-600" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;