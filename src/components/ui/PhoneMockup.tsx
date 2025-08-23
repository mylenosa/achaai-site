import React from 'react';
import { MessageCircle, Search } from 'lucide-react';

export const PhoneMockup: React.FC = () => {
  return (
    <div className="relative mx-auto w-64 h-[520px]">
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-gray-800 rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="bg-gray-50 h-8 flex items-center justify-between px-6 text-xs font-medium text-gray-600">
            <span>9:41</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-1 h-2 bg-gray-400 rounded-sm"></div>
              <div className="w-6 h-2 bg-green-500 rounded-sm"></div>
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-emerald-500 text-white p-4 flex items-center">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center mr-3">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">AchaAí</div>
              <div className="text-xs text-emerald-100">online</div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 bg-gray-50">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-emerald-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-[80%]">
                <p className="text-sm">Tem tinta spray vermelha em Ariquemes?</p>
                <div className="text-xs text-emerald-100 mt-1">14:32 ✓✓</div>
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%] shadow-sm">
                <p className="text-sm text-gray-800 mb-2">Encontrei 3 lojas com tinta spray vermelha:</p>
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="font-medium text-xs text-gray-800">🏪 Tintas Ariquemes</div>
                    <div className="text-xs text-gray-600">R. Jamari, 1234 - Centro</div>
                    <div className="text-xs text-emerald-600">📞 (69) 3535-1234</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="font-medium text-xs text-gray-800">🏪 Casa das Tintas</div>
                    <div className="text-xs text-gray-600">Av. Tancredo Neves, 567</div>
                    <div className="text-xs text-emerald-600">📞 (69) 3535-5678</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">14:33</div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-3 flex items-center">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500">
              Digite sua mensagem...
            </div>
            <MessageCircle className="w-6 h-6 text-emerald-500 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};