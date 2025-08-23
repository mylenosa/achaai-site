import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface TrustBadgeProps {
  text: string;
  icon?: 'shield' | 'check';
  variant?: 'default' | 'success';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ 
  text, 
  icon = 'check', 
  variant = 'success' 
}) => {
  const IconComponent = icon === 'shield' ? Shield : CheckCircle;
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variantClasses[variant]}`}>
      <IconComponent className="w-4 h-4 mr-2" />
      {text}
    </div>
  );
};