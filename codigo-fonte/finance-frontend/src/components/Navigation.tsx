import React from 'react';
import { LayoutDashboard, CreditCard, Target, Settings, TrendingUp, User, LogOut } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useSupabase';
import { Button } from './ui/Button';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenProfile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onOpenProfile }) => {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: CreditCard },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">VOF-Finance</h1>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
              
            
            <div className="px-2 pt-2 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile?.name || user?.email}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenProfile}
                    className="!p-2"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="!p-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{profile?.name || user?.email}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenProfile}
                  className="!p-2"
                >
                  <User className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="!p-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};