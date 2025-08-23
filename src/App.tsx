// Single Responsibility: Componente principal da aplicação
// Dependency Inversion: Usa configurações injetadas
import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { KPIs } from './components/KPIs';
import { ForStores } from './components/ForStores';
import { Pricing } from './components/Pricing/Pricing';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
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
    // SEO Meta Tags
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
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <KPIs />
        <ForStores />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;