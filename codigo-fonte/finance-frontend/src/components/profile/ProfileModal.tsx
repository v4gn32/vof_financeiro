import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useSupabase';
import { User, Mail, Bell, Palette, DollarSign, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useUserProfile();
  const [formData, setFormData] = useState({
    name: '',
    currency: 'BRL',
    theme: 'light' as 'light' | 'dark',
    notifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        currency: profile.currency || 'BRL',
        theme: profile.theme as 'light' | 'dark' || 'light',
        notifications: profile.notifications ?? true,
      });
    } else if (user) {
      // Set defaults for new profile
      setFormData({
        name: user.user_metadata?.name || '',
        currency: 'BRL',
        theme: 'light',
        notifications: true,
      });
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const { error } = await updateProfile({
      name: formData.name,
      currency: formData.currency,
      theme: formData.theme,
      notifications: formData.notifications,
    });

    if (error) {
      setMessage('Erro ao salvar perfil: ' + error.message);
    } else {
      setMessage('Perfil atualizado com sucesso!');
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 1500);
    }
    
    setSaving(false);
  };

  if (!user) return null;

  const displayName = profile?.name || user.user_metadata?.name || user.email;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil do Usuário">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {(displayName || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nome completo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email
          </label>
          <input
            type="email"
            value={user.email || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Moeda padrão
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="BRL">Real Brasileiro (R$)</option>
            <option value="USD">Dólar Americano ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Palette className="w-4 h-4 inline mr-2" />
            Tema
          </label>
          <select
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" className="flex-1" disabled={saving || loading}>
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};