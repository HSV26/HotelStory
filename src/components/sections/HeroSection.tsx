import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { HERO_CONTENT, SITE_IMAGES } from '../../data/siteContent';
import { MagneticButton } from '../ui/MagneticButton';

interface HeroSectionProps {
  onAuditClick: (serviceName?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onAuditClick }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  const scrollToWork = () => {
    const el = document.getElementById('work');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#0A1F5C] pt-[calc(5.25rem+env(safe-area-inset-top))] pb-12 md:pt-28 md:pb-8"
    >
      {/* Parallax & slow-zoom hospitality backdrop with deep navy to royal blue gradient overlay */}
      <motion.div
        aria-hidden="true"
        style={
          prefersReducedMotion || isMobile
            ? undefined
            : { y: bgY, scale: bgScale }
        }
        className="absolute inset-0 z-0 will-change-transform"
      >
        <img
          src={SITE_IMAGES.heroBackground}
          alt="Luxury coastal resort infinity pool at twilight"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F5C]/94 via-[#0A1F5C]/82 to-[#1D4ED8]/86" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F5C] via-transparent to-[#0A1F5C]/70" />
      </motion.div>

      {/* Main Hero Copy */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 my-auto py-4 sm:py-6">
        <div className="max-w-3xl">
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#DCEBFF] mb-4"
          >
            {HERO_CONTENT.eyebrow}
          </motion.p>

          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-extrabold text-[clamp(2.375rem,6vw,4.35rem)] leading-[1.08] tracking-tight text-[#FFFFFF] mb-5 [text-wrap:balance]"
          >
            We Make Your Business the{' '}
            <span className="bg-gradient-to-r from-[#FFFFFF] via-[#DCEBFF] to-[#3B82F6] bg-clip-text text-transparent">
              #1 Name
            </span>{' '}
            in Your City.
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-[#FFFFFF]/85 leading-[1.6] max-w-2xl mb-8"
          >
            {HERO_CONTENT.subheadline}
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4"
          >
            <MagneticButton
              onClick={() => onAuditClick()}
              wrapperClassName="w-full sm:w-auto inline-block"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FFFFFF] px-7 py-3.5 text-base font-semibold text-[#0A1F5C] hover:bg-[#F2F7FF] hover:shadow-[0_14px_34px_rgba(255,255,255,0.24)] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCEBFF]"
            >
              <span>{HERO_CONTENT.primaryCta}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </MagneticButton>

            <MagneticButton
              onClick={scrollToWork}
              wrapperClassName="w-full sm:w-auto inline-block"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] inline-flex items-center justify-center gap-2 rounded-full border border-[#FFFFFF]/55 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-base font-medium text-[#FFFFFF] hover:bg-white/20 hover:border-[#FFFFFF] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DCEBFF]"
            >
              <span>{HERO_CONTENT.secondaryCta}</span>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Bottom 3-Column Stats Row + Centered Scroll Indicator (hidden on mobile) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 md:px-8 pt-6">
        <div className="border-t border-white/20 pt-8">
          <div className="rounded-2xl bg-white/[0.05] backdrop-blur-md border border-white/[0.12] p-6 md:p-7 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr_1px_1fr] md:gap-x-8 lg:gap-x-10 items-stretch">
              {HERO_CONTENT.miniStats.map((stat, idx) => (
                <React.Fragment key={stat.title}>
                  <motion.div
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 18 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: isMobile ? 0.25 + idx * 0.06 : 0.52 + idx * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group h-full"
                  >
                    <div className="h-full flex flex-col [@media(hover:hover)]:transition-transform [@media(hover:hover)]:duration-200 [@media(hover:hover)]:ease-out [@media(hover:hover)]:group-hover:-translate-y-0.5">
                      <span className="block text-xs font-semibold tracking-wider text-[#DCEBFF] tabular-nums leading-none mb-2.5 transition-colors duration-200 [@media(hover:hover)]:group-hover:text-[#3B82F6]">
                        0{idx + 1}
                      </span>
                      <h2 className="font-display font-semibold text-[18px] sm:text-[20px] md:text-[15px] lg:text-[20px] leading-[1.3] tracking-tight text-[#FFFFFF] md:whitespace-nowrap mb-2">
                        {stat.title}
                      </h2>
                      <p className="text-[15px] md:text-[14px] lg:text-[15px] leading-[1.6] text-[#FFFFFF]/75 md:line-clamp-2">
                        {stat.subtitle}
                      </p>
                    </div>
                  </motion.div>

                  {idx < HERO_CONTENT.miniStats.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="h-px w-full my-5 bg-white/15 md:my-0 md:w-px md:h-auto md:self-stretch"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Centered Scroll Indicator below the stats row (hidden on mobile) */}
        <div className="hidden md:flex pt-6 pb-2 justify-center">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('about');
              if (el) {
                const top =
                  el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
              }
            }}
            aria-label="Scroll to explore"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#DCEBFF] hover:text-[#FFFFFF] transition-colors min-h-[44px]"
          >
            <span>Scroll</span>
            <motion.span
              animate={prefersReducedMotion ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-3.5 h-3.5 text-[#FFFFFF]" />
            </motion.span>
          </a>
        </div>
      </div>
    </section>
  );
};
