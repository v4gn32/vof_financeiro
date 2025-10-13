import React from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AppearanceSettings: React.FC = () => {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  const themes = [
    { id: 'light' as const, name: 'Claro', icon: Sun, description: 'Tema claro sempre ativo' },
    { id: 'dark' as const, name: 'Escuro', icon: Moon, description: 'Tema escuro sempre ativo' },
    { id: 'system' as const, name: 'Sistema', icon: Monitor, description: 'Segue a preferência do sistema' },
  ];

  const colorSchemes = [
    { id: 'green' as const, name: 'Verde', color: 'bg-green-500', description: 'Cor padrão do sistema' },
    { id: 'blue' as const, name: 'Azul', color: 'bg-blue-500', description: 'Azul profissional' },
    { id: 'purple' as const, name: 'Roxo', color: 'bg-purple-500', description: 'Roxo moderno' },
    { id: 'orange' as const, name: 'Laranja', color: 'bg-orange-500', description: 'Laranja energético' },
  ];

  return (
    <div className="space-y-8">
      {/* Tema */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Tema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                theme === themeOption.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  theme === themeOption.id ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <themeOption.icon className={`w-5 h-5 ${
                    theme === themeOption.id ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h5 className={`font-medium ${
                    theme === themeOption.id ? 'text-primary-800' : 'text-gray-800'
                  }`}>
                    {themeOption.name}
                  </h5>
                </div>
              </div>
              <p className="text-sm text-gray-600">{themeOption.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Esquema de Cores */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-800 mb-3">Esquema de Cores</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => setColorScheme(scheme.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                colorScheme === scheme.id
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-lg mr-3 ${scheme.color}`}></div>
                <div>
                  <h5 className={`font-medium ${
                    colorScheme === scheme.id ? 'text-primary-800' : 'text-gray-800'
                  }`}>
                    {scheme.name}
                  </h5>
                  <p className="text-sm text-gray-600">{scheme.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-800 mb-3">Pré-visualização</h4>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-gray-800 dark:text-gray-200">Cartão de Exemplo</h5>
              <div className={`w-3 h-3 rounded-full ${
                colorScheme === 'green' ? 'bg-green-500' :
                colorScheme === 'blue' ? 'bg-blue-500' :
                colorScheme === 'purple' ? 'bg-purple-500' :
                'bg-orange-500'
              }`}></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Este é um exemplo de como os elementos aparecerão com suas configurações.
            </p>
            <button className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
              colorScheme === 'green' ? 'bg-green-600 hover:bg-green-700' :
              colorScheme === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              colorScheme === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}>
              Botão de Exemplo
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            As mudanças serão aplicadas automaticamente em toda a aplicação.
          </div>
        </div>
      </div>

      {/* Configurações Avançadas */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-800 mb-3">Configurações Avançadas</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Animações</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativar animações e transições</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Modo Compacto</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reduzir espaçamentos na interface</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Status de Sincronização */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200">Configurações Salvas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suas preferências são salvas automaticamente</p>
          </div>
          <div className="flex items-center text-primary-600">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">Sincronizado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;