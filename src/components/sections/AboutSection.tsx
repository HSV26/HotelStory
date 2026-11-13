import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ABOUT_CONTENT, SITE_IMAGES } from '../../data/siteContent';
import { EditorialImage } from '../ui/EditorialImage';

interface AboutSectionProps {
  onAuditClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onAuditClick }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="about"
      className="relative bg-[#FFFFFF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          {/* Editorial Story Copy */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-4">
              {ABOUT_CONTENT.eyebrow}
            </p>
            <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.15rem)] leading-[1.12] text-[#0A1F5C] mb-6 sm:mb-8 [text-wrap:balance]">
              Great Hospitality{' '}
              <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
                Deserves to Be Seen.
              </span>
            </h2>

            <div className="space-y-5 text-base sm:text-lg text-[#44546F] leading-[1.6] mb-8 sm:mb-10">
              {ABOUT_CONTENT.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="border-t border-[#DCEBFF] pt-7 sm:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="font-signature font-bold text-4xl sm:text-[2.65rem] leading-none text-[#0A1F5C] mb-1.5">
                  {ABOUT_CONTENT.signatureText}
                </p>
                <p className="text-sm text-[#44546F]">
                  <span className="font-semibold text-[#0A1F5C]">
                    {ABOUT_CONTENT.founderName}
                  </span>{' '}
                  ·{' '}
                  <span className="text-[#1D4ED8] font-medium">
                    {ABOUT_CONTENT.founderTitle}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={onAuditClick}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 py-3 text-base sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_10px_24px_rgba(59,130,246,0.3)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2"
              >
                <span>{ABOUT_CONTENT.ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Founder Block: Photo + Name & Title */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center"
          >
            <div className="w-full max-w-[320px] md:max-w-[420px] lg:max-w-none mx-auto flex flex-col rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#DCEBFF] shadow-[0_18px_45px_rgba(29,78,216,0.1)]">
              <div className="w-full overflow-hidden">
                <EditorialImage
                  src={SITE_IMAGES.founderPortrait}
                  alt={ABOUT_CONTENT.founderFullTitle}
                  fallbackTitle={ABOUT_CONTENT.founderName}
                  className="w-full aspect-[4/5]"
                  imgClassName="object-cover object-[50%_15%] [@media(hover:hover)]:hover:scale-[1.03]"
                />
              </div>
              <div className="bg-[#F2F7FF] border-t border-[#DCEBFF] px-6 py-5">
                <p className="font-display font-bold text-lg sm:text-xl text-[#0A1F5C]">
                  {ABOUT_CONTENT.founderName}
                </p>
                <p className="text-sm font-medium text-[#1D4ED8] mt-0.5">
                  {ABOUT_CONTENT.founderTitle}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
