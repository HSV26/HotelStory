import React from 'react';

interface BrandStarProps {
  className?: string;
  color?: string;
}

export const BrandStar: React.FC<BrandStarProps> = ({
  className = 'w-4 h-4',
  color = '#3B82F6',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
      fill={color}
    />
  </svg>
);

interface BrandWordmarkProps {
  className?: string;
  light?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  light = true,
}) => (
  <span
    className={`inline-flex items-center gap-2.5 font-display text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap shrink-0 transition-colors duration-200 ${
      light ? 'text-[#FFFFFF]' : 'text-[#0A1F5C]'
    } ${className}`}
  >
    <BrandStar
      className="w-4 h-4 shrink-0"
      color={light ? '#3B82F6' : '#1D4ED8'}
    />
    <span>HotelStory</span>
  </span>
);
