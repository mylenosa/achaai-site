// Single Responsibility: Botão genérico para CTAs
// Open/Closed: Extensível para diferentes tipos de ação
import React from 'react';
import { CTAButtonProps } from '../../lib/types';

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  'data-cta': dataCta,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-500/20',
    secondary: 'bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-500 hover:border-emerald-600 focus:ring-emerald-500/20'
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
          event_label: dataCta || 'cta-button',
        });
      } catch (error) {
        console.warn('Erro ao enviar evento para GA:', error);
      }
    }
    
    if (onClick) {
      onClick();
    }
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={classes}
        data-cta={dataCta}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={classes}
      data-cta={dataCta}
      {...props}
    >
      {children}
    </button>
  );
};