// Single Responsibility: Página principal para consumidores finais
import React from 'react';
import { useSEO } from '../hooks/useSEO';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { KPIs } from '../components/KPIs';
import { ForStores } from '../components/ForStores';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { FinalCTA } from '../components/FinalCTA';
import { config } from '../lib/config';

export const HomePage: React.FC = () => {
  useSEO({
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
  });

  return (
    <>
      <Hero />
      <HowItWorks />
      <KPIs />
      <ForStores />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
};