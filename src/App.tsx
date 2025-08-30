// Single Responsibility: Componente principal da aplicação com roteamento
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './components/NotFound';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
    // SEO Meta Tags globais
    document.title = config.seo.title;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = config.seo.description;
      document.head.appendChild(meta);
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: config.seo.title },
      { property: 'og:description', content: config.seo.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
    ];

    ogTags.forEach(tag => {
      const existing = document.querySelector(`meta[property="${tag.property}"]`);
      if (existing) {
        existing.setAttribute('content', tag.content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });

    // Keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', config.seo.keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = config.seo.keywords;
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard protegido */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;