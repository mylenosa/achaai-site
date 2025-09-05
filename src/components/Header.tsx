// Single Responsibility: Cabeçalho da aplicação
import React from 'react';
import { Search } from 'lucide-react';
import { config } from '../lib/config';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-1">
            <div className="bg-emerald-500 rounded-full p-2 mr-3">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {config.app.name}
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <a href="#como-funciona" className="text-gray-600 hover:text-emerald-600 transition-colors">
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
          
          {/* Botão Acesso do Lojista */}
          <div className="flex items-center justify-end flex-1 md:flex-initial">
            <a 
              href="/portal" 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg transition-colors font-medium text-sm md:text-base"
            >
              <span className="hidden sm:inline">Acesso do Lojista</span>
              <span className="sm:hidden">Acesso</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};