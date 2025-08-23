// Single Responsibility: Componente principal da aplicação
// Dependency Inversion: Usa configurações injetadas
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { StoresPage } from './pages/StoresPage';
import { config } from './lib/config';

// Declaração global para analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

function App() {
  useEffect(() => {
    // SEO será gerenciado por cada página individualmente
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lojas" element={<StoresPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;