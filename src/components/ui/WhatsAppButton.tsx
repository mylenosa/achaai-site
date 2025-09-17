// Single Responsibility: Botão específico para WhatsApp
// Liskov Substitution: Implementa interface CTAButtonProps
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CTAButtonProps } from '../../lib/types';
import { config } from '../../lib/config';

interface WhatsAppButtonProps extends Omit<CTAButtonProps, 'href'> {
  href?: string; // Opcional, usa config como fallback
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  children,
  onClick,
  href = config.app.whatsappUrl, // Dependency Inversion
  variant = 'primary',
  size = 'lg',
  className = '',
  'data-cta': dataCta,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/20';
  
  const variantClasses = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 hover:border-emerald-600'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-xl'
  };

  const handleClick = () => {
    // Analytics tracking - só se GA estiver configurado
    if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'click', {
          event_category: 'CTA',
          event_label: dataCta || 'whatsapp-button',
        });
      } catch (error) {
        console.warn('Erro ao enviar evento para GA:', error);
      }
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      data-cta={dataCta}
      {...props}
    >
      <MessageCircle className="mr-3 h-6 w-6" />
      {children}
    </a>
  );
};