// Interface Segregation: Props específicas e enxutas
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  ctaType: 'whatsapp' | 'contact';
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  content: string;
  type: 'customer' | 'store';
  avatar: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface KPI {
  id: string;
  value: string;
  label: string;
  icon?: string;
}

export interface FeatureStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: string;
}

export interface CommunityImpact {
  id: string;
  title: string;
  description: string;
  value: string;
  label: string;
  icon: string;
}

// Liskov Substitution: Interface para botões CTA
export interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-cta'?: string;
}

// Dependency Inversion: Interface para provedor de links
export interface LinkProvider {
  getWhatsAppUrl(): string;
  getContactUrl(): string;
}