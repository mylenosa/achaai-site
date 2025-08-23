import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, className, fallback }) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={cn("relative inline-block rounded-full overflow-hidden", className)}>
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};