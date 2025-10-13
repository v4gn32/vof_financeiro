import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showNotification } from '../../utils/notifications';

interface ProfilePhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        showNotification('error', 'Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', 'A imagem deve ter no máximo 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Simular upload (em produção, seria enviado para um servidor)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Converter para base64 para armazenar localmente
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        updateProfile({ avatar: base64 });
        showNotification('success', 'Foto de perfil atualizada com sucesso!');
        onClose();
        resetForm();
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      showNotification('error', 'Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    updateProfile({ avatar: undefined });
    showNotification('success', 'Foto de perfil removida com sucesso!');
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Alterar Foto de Perfil</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Foto Atual */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 text-center">
              {previewUrl ? 'Nova foto selecionada' : 'Foto atual'}
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-600">Selecionar Nova Foto</span>
            </button>

            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 truncate">
                      {selectedFile.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-6">
            {user?.avatar && (
              <button
                onClick={handleRemovePhoto}
                className="flex-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remover Foto
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Salvar Foto'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;