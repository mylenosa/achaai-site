// Single Responsibility: Rodapé da aplicação
import React from 'react';
import { Search, MessageCircle, HelpCircle, CreditCard } from 'lucide-react';
import { config } from '../lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-emerald-500 rounded-full p-2 mr-3">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">{config.app.name}</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              A plataforma que conecta quem procura com quem tem em {config.app.city}-{config.app.state}. 
              Tudo via WhatsApp, simples e direto.
            </p>
            <p className="text-emerald-400 font-medium">
              Tem uma loja? Conecte seu estoque ao {config.app.name} 📦
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <a href="#como-funciona" className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  FAQ
                </a>
              </li>
              <li>
                <a href="#planos" className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Planos
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href={config.app.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 {config.app.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};