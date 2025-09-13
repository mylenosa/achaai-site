// src/components/LandingPage.tsx
// Single Responsibility: Página principal (landing page)
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { KPIs } from './KPIs';
import { ForStores } from './ForStores';
import { Pricing } from './Pricing/Pricing';
import { Testimonials } from './Testimonials';
import { FAQ } from './FAQ';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { config } from '../lib/config';

// Use window.location.origin como siteUrl local
const siteUrl = window.location.origin;

export const LandingPage: React.FC = () => {
  // constrói canonical usando siteUrl local
  const canonical = `${siteUrl.replace(/\/$/, '')}/`;

  return (
    <div className="min-h-screen">
      <Helmet prioritizeSeoTags>
        {/* Title & Description */}
        <title>{config.seo.title}</title>
        <meta name="description" content={config.seo.description} />
        {config.seo.keywords && (
          <meta name="keywords" content={config.seo.keywords} />
        )}

        {/* Canonical */}
        <link rel="canonical" href={canonical} />

        {/* Open Graph */}
        <meta property="og:title" content={config.seo.title} />
        <meta property="og:description" content={config.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="pt_BR" />

        {/* (Opcional) Twitter cards, se quiser */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.seo.title} />
        <meta name="twitter:description" content={config.seo.description} />
      </Helmet>

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
};
