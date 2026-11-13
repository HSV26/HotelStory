import React from 'react';
import {
  ArrowUpRight,
  BedDouble,
  Coffee,
  Compass,
  Martini,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { BUSINESS_CATEGORIES, BusinessCategory } from '../../data/siteContent';

interface BusinessesSectionProps {
  onSelectBusinessType: (businessTypeName: string) => void;
}

const CATEGORY_ICONS: Record<
  BusinessCategory['iconName'],
  React.FC<{ className?: string }>
> = {
  Utensils,
  Coffee,
  Martini,
  BedDouble,
  Sparkles,
  Compass,
};

export const BusinessesSection: React.FC<BusinessesSectionProps> = ({
  onSelectBusinessType,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="businesses"
      className="relative bg-[#F2F7FF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 md:mb-16 lg:mb-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-4">
              Businesses We Serve
            </p>
            <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.12] text-[#0A1F5C] [text-wrap:balance]">
              Built for the{' '}
              <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
                Hospitality &amp; Entertainment
              </span>{' '}
              Industry
            </h2>
          </div>
          <p className="text-base text-[#44546F] max-w-md leading-[1.6]">
            From morning espresso bars to midnight lounges and destination
            estates—select your category to tailor a social audit for your
            brand.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {BUSINESS_CATEGORIES.map((category, idx) => {
            const Icon = CATEGORY_ICONS[category.iconName];

            return (
              <motion.button
                key={category.id}
                type="button"
                onClick={() => onSelectBusinessType(category.name)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative h-full text-left rounded-2xl bg-[#FFFFFF] border border-[#DCEBFF] p-6 md:p-8 lg:p-9 min-h-[224px] md:min-h-[268px] overflow-hidden shadow-[0_10px_30px_rgba(29,78,216,0.06)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:hover:-translate-y-1.5 [@media(hover:hover)]:hover:border-[#1D4ED8] [@media(hover:hover)]:hover:shadow-[0_20px_48px_rgba(59,130,246,0.22)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
              >
                {/* Hover Category Image + Deep Navy/Blue Overlay (desktop pointer) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-500 ease-out"
                >
                  <img
                    src={category.image}
                    alt={category.imageAlt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-105 [@media(hover:hover)]:group-hover:scale-100 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F5C]/88 to-[#1D4ED8]/78 backdrop-blur-[1px]" />
                </div>

                {/* Card Foreground Content */}
                <div className="relative z-10 h-full flex flex-col justify-between gap-7 md:gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl border border-[#DCEBFF] bg-[#F2F7FF] [@media(hover:hover)]:group-hover:bg-white/15 [@media(hover:hover)]:group-hover:border-white/35 flex items-center justify-center text-[#1D4ED8] [@media(hover:hover)]:group-hover:text-[#FFFFFF] transition-colors duration-300">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>

                    <ArrowUpRight
                      aria-hidden="true"
                      className="w-5 h-5 text-[#1D4ED8]/60 [@media(hover:hover)]:group-hover:text-[#FFFFFF] [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <h3 className="font-display font-bold tracking-tight text-2xl sm:text-[1.75rem] text-[#0A1F5C] [@media(hover:hover)]:group-hover:text-[#FFFFFF] mb-4 transition-colors duration-300">
                      {category.name}
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {category.types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center rounded-full border border-[#DCEBFF] bg-[#DCEBFF]/75 px-3 py-1 text-xs font-medium text-[#1D4ED8] [@media(hover:hover)]:group-hover:bg-white/15 [@media(hover:hover)]:group-hover:border-white/30 [@media(hover:hover)]:group-hover:text-[#FFFFFF] transition-colors duration-300"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
