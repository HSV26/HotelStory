import React from 'react';
import { MARQUEE_CATEGORIES } from '../../data/siteContent';

export const TrustMarquee: React.FC = () => {
  const repeatedItems = [...MARQUEE_CATEGORIES, ...MARQUEE_CATEGORIES];

  return (
    <section
      id="marquee"
      aria-label="Hospitality and entertainment categories we serve"
      className="relative bg-[#F2F7FF] border-y border-[#DCEBFF] py-3.5 sm:py-5 overflow-hidden marquee-wrapper"
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((trackIndex) => (
          <div
            key={trackIndex}
            aria-hidden={trackIndex === 1}
            className="flex items-center shrink-0"
          >
            {repeatedItems.map((category, idx) => (
              <div
                key={`${trackIndex}-${category}-${idx}`}
                className="flex items-center shrink-0"
              >
                <span className="font-display text-sm sm:text-base md:text-lg font-semibold tracking-tight text-[#0A1F5C] px-4 sm:px-6 md:px-8 whitespace-nowrap">
                  {category}
                </span>
                <span
                  aria-hidden="true"
                  className="text-[#1D4ED8] text-xs select-none"
                >
                  ◆
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
