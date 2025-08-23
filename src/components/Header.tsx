// Single Responsibility: Cabeçalho da aplicação
import React from 'react';
import { Search } from 'lucide-react';
import { config } from '../lib/config';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { DarkModeToggle } from './ui/DarkModeToggle';

const sections = ['hero', 'como-funciona', 'para-lojas', 'planos', 'faq'];

export const Header: React.FC = () => {
  const activeSection = useScrollSpy(sections);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="bg-emerald-500 rounded-full p-2 mr-3">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {config.app.name}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => scrollToSection('como-funciona')}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  activeSection === 'como-funciona' 
                    ? 'text-emerald-600' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Como funciona
              </button>
              <button
                onClick={() => scrollToSection('para-lojas')}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  activeSection === 'para-lojas' 
                    ? 'text-emerald-600' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Para Lojas
              </button>
              <button
                onClick={() => scrollToSection('planos')}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  activeSection === 'planos' 
                    ? 'text-emerald-600' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                Planos
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  activeSection === 'faq' 
                    ? 'text-emerald-600' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                FAQ
              </button>
            </nav>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
              Como funciona
            </a>
            <a href="#para-lojas" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Para Lojas
            </a>
            <a href="#planos" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Planos
            </a>
            <a href="#faq" className="text-gray-600 hover:text-emerald-600 transition-colors">
              FAQ
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};