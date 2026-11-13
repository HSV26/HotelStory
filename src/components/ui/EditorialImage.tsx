import React, { useState } from 'react';
import { BrandStar } from './BrandMark';

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackTitle?: string;
  loading?: 'eager' | 'lazy';
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackTitle,
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative max-w-full overflow-hidden bg-[#0A1F5C] ${className}`}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`max-w-full w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${imgClassName}`}
        />
      ) : (
        <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0A1F5C] to-[#1D4ED8] border border-white/20">
          <BrandStar className="w-6 h-6 mb-3 opacity-90" color="#DCEBFF" />
          <p className="font-display font-bold text-base text-[#FFFFFF]">
            {fallbackTitle || alt}
          </p>
        </div>
      )}
    </div>
  );
};
