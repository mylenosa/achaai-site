import React from 'react';
import { Search, MessageCircle, MapPin } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-emerald-500 rounded-full p-3 mr-3">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              AchaAí
            </h1>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            Procurando algo em Ariquemes? <br />
            <span className="text-emerald-600">Pergunte no zap</span> 🔍
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            O AchaAí encontra pra você onde tem o que você procura — direto no WhatsApp 💬
          </p>

          {/* CTA Button */}
          <div className="mb-8">
            <a
              href="https://bit.ly/AchaAi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <MessageCircle className="mr-3 h-6 w-6" />
              Abrir no WhatsApp
            </a>
          </div>

          {/* Example Queries */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Exemplos de busca:</span>
            </div>
            <div className="space-y-3">
              <div className="text-gray-700 italic">
                "Onde encontro garrafa com tampa hermética em Ariquemes?"
              </div>
              <div className="text-gray-700 italic">
                "Onde encontro WD-40 hoje?"
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Tem uma loja? Conecte seu estoque ao AchaAí 📦
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;