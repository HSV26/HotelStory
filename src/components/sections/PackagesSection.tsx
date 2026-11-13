import React, { useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PACKAGE_TIERS, PackageTier } from '../../data/siteContent';
import { MagneticButton } from '../ui/MagneticButton';

interface PackagesSectionProps {
  onSelectPackage: (packageName: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  onSelectPackage,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [tabletSlide, setTabletSlide] = useState<0 | 1>(0);

  const renderCard = (
    tier: PackageTier,
    idx: number,
    extraClassName = '',
    animateOnView = true
  ) => {
    const isFeatured = Boolean(tier.featured);

    return (
      <motion.article
        key={tier.id}
        initial={
          animateOnView && !prefersReducedMotion ? { opacity: 0, y: 26 } : false
        }
        whileInView={animateOnView ? { opacity: 1, y: 0 } : undefined}
        viewport={animateOnView ? { once: true, amount: 0.2 } : undefined}
        transition={{
          duration: 0.55,
          delay: animateOnView ? idx * 0.08 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`rounded-2xl p-6 sm:p-8 min-[1025px]:p-10 flex flex-col justify-between transition-all duration-300 ${
          isFeatured
            ? 'bg-gradient-to-br from-[#0A1F5C] to-[#1D4ED8] text-[#FFFFFF] border border-[#3B82F6]/60 shadow-[0_24px_56px_rgba(10,31,92,0.22)]'
            : 'bg-[#F2F7FF] text-[#44546F] border border-[#DCEBFF] [@media(hover:hover)]:hover:border-[#1D4ED8] shadow-[0_10px_30px_rgba(29,78,216,0.06)]'
        } ${extraClassName}`}
      >
        <div>
          <div className="flex items-center justify-between gap-4 mb-4 min-h-[20px]">
            <span
              className={`text-xs font-semibold tracking-[0.16em] uppercase ${
                isFeatured ? 'text-[#DCEBFF]' : 'text-[#1D4ED8]'
              }`}
            >
              {isFeatured ? 'Most Popular' : `Tier 0${idx + 1}`}
            </span>
            <span
              aria-hidden="true"
              className={`h-px flex-1 ${
                isFeatured ? 'bg-white/20' : 'bg-[#DCEBFF]'
              }`}
            />
          </div>

          <h3
            className={`font-display font-bold tracking-tight text-2xl sm:text-3xl mb-3 ${
              isFeatured ? 'text-[#FFFFFF]' : 'text-[#0A1F5C]'
            }`}
          >
            {tier.name}
          </h3>

          <p
            className={`text-base leading-[1.6] mb-4 ${
              isFeatured ? 'text-[#FFFFFF]/80' : 'text-[#44546F]'
            }`}
          >
            {tier.tagline}
          </p>

          <p
            className={`text-xs sm:text-sm pb-5 mb-5 border-b ${
              isFeatured
                ? 'text-[#DCEBFF] border-white/20'
                : 'text-[#44546F]/80 border-[#DCEBFF]'
            }`}
          >
            Ideal for: {tier.idealFor}
          </p>

          <ul className="space-y-3 mb-8 sm:mb-10">
            {tier.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-[15px] leading-[1.55]"
              >
                <Check
                  className={`w-4 h-4 mt-1 shrink-0 ${
                    isFeatured ? 'text-[#DCEBFF]' : 'text-[#1D4ED8]'
                  }`}
                />
                <span
                  className={
                    isFeatured ? 'text-[#FFFFFF]/90' : 'text-[#0A1F5C]'
                  }
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <MagneticButton
          wrapperClassName="w-full"
          onClick={() => onSelectPackage(`${tier.name} Package`)}
          className={`w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            isFeatured
              ? 'bg-[#FFFFFF] text-[#0A1F5C] hover:bg-[#F2F7FF] hover:shadow-[0_12px_28px_rgba(255,255,255,0.22)]'
              : 'bg-[#1D4ED8] text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_12px_28px_rgba(59,130,246,0.35)]'
          }`}
        >
          <span>{tier.ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </MagneticButton>
      </motion.article>
    );
  };

  return (
    <section
      id="packages"
      className="relative bg-[#FFFFFF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-12 min-[1025px]:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-3 md:mb-4">
            Partnership Tiers
          </p>
          <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.1] text-[#0A1F5C] mb-4 [text-wrap:balance]">
            Tailored Retainers Built Around{' '}
            <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
              Your Brand.
            </span>
          </h2>
          <p className="text-base text-[#44546F] leading-[1.6]">
            Every engagement begins with a complimentary social audit and custom
            scope—structured around your venue, outlets, and growth goals.
          </p>
        </motion.div>

        {/* Mobile (< 768px): Vertical Stack with Most Popular First */}
        <div className="flex flex-col gap-6 md:hidden">
          {PACKAGE_TIERS.map((tier, idx) =>
            renderCard(tier, idx, tier.featured ? 'order-first' : '')
          )}
        </div>

        {/* Tablet (768px–1024px): Zero-Scrollbar 2-Card View with < and > Arrow Controls */}
        <div className="hidden md:max-[1024px]:block">
          <div className="flex items-center justify-between gap-4 mb-5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
              {tabletSlide === 0
                ? 'Showing Starter & Growth'
                : 'Showing Growth & Dominator'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTabletSlide(0)}
                disabled={tabletSlide === 0}
                aria-label="Previous package tiers"
                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#0A1F5C] hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setTabletSlide(1)}
                disabled={tabletSlide === 1}
                aria-label="Next package tiers"
                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#0A1F5C] hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden py-2">
            <motion.div
              animate={{
                x: tabletSlide === 0 ? '0%' : 'calc(-50% - 12px)',
              }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
              }
              className="flex gap-6 items-stretch"
            >
              {PACKAGE_TIERS.map((tier, idx) =>
                renderCard(
                  tier,
                  idx,
                  'w-[calc((100%-24px)/2)] shrink-0',
                  false
                )
              )}
            </motion.div>
          </div>

          {/* Bottom Centered Dots + < / > Arrow Navigation */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setTabletSlide(0)}
              disabled={tabletSlide === 0}
              aria-label="Show Starter and Growth tiers"
              className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#0A1F5C] hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-2">
              {([0, 1] as const).map((slideIdx) => (
                <button
                  key={slideIdx}
                  type="button"
                  onClick={() => setTabletSlide(slideIdx)}
                  aria-label={`View package group ${slideIdx + 1} of 2`}
                  aria-current={tabletSlide === slideIdx ? 'true' : undefined}
                  className="min-w-[32px] min-h-[44px] flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      tabletSlide === slideIdx
                        ? 'w-7 bg-[#1D4ED8]'
                        : 'w-2.5 bg-[#DCEBFF] hover:bg-[#3B82F6]/60'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setTabletSlide(1)}
              disabled={tabletSlide === 1}
              aria-label="Show Growth and Dominator tiers"
              className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#0A1F5C] hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop (1025px+): Unchanged 3-Column Grid */}
        <div className="hidden min-[1025px]:grid min-[1025px]:grid-cols-3 min-[1025px]:gap-8 items-stretch">
          {PACKAGE_TIERS.map((tier, idx) => renderCard(tier, idx))}
        </div>
      </div>
    </section>
  );
};
