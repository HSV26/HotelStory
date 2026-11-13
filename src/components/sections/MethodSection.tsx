import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { METHOD_STEPS } from '../../data/siteContent';

export const MethodSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 72%', 'end 68%'],
  });

  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="process"
      className="relative bg-[#FFFFFF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF] scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Sticky Header */}
          <div className="lg:col-span-5">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:sticky lg:top-28"
            >
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-4">
                The HotelStory Method
              </p>
              <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.35rem)] leading-[1.12] text-[#0A1F5C] mb-5 sm:mb-6 [text-wrap:balance]">
                From Unknown to{' '}
                <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
                  Unmissable.
                </span>
              </h2>
              <p className="text-base text-[#44546F] leading-[1.6] max-w-md mb-6 sm:mb-8">
                A disciplined four-stage system designed so your dining room,
                bar, front desk, and events team feel the lift—without adding
                work to your floor staff.
              </p>
              <div className="h-0.5 w-24 bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6]" />
            </motion.div>
          </div>

          {/* Right Animated Scroll Timeline */}
          <div ref={containerRef} className="lg:col-span-7 relative pl-9 sm:pl-12">
            {/* Background track line */}
            <div
              aria-hidden="true"
              className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-[#DCEBFF]"
            />
            {/* Royal-to-bright blue progress fill line */}
            <motion.div
              aria-hidden="true"
              style={
                prefersReducedMotion
                  ? { scaleY: 1 }
                  : { scaleY: lineScaleY }
              }
              className="absolute left-3 sm:left-4 top-2 bottom-2 w-[2px] -ml-[0.5px] origin-top bg-gradient-to-b from-[#1D4ED8] to-[#3B82F6]"
            />

            <div className="space-y-6 sm:space-y-10 lg:space-y-12">
              {METHOD_STEPS.map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.55,
                    delay: idx * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative"
                >
                  {/* Step node marker */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-9 sm:-left-12 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#FFFFFF] border-2 border-[#1D4ED8] flex items-center justify-center shadow-[0_4px_12px_rgba(29,78,216,0.18)]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                  </div>

                  <div className="rounded-2xl bg-[#F2F7FF] border border-[#DCEBFF] [@media(hover:hover)]:hover:border-[#1D4ED8] p-6 sm:p-8 lg:p-9 shadow-[0_10px_28px_rgba(29,78,216,0.05)] transition-colors duration-200">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase text-[#1D4ED8] mb-3">
                      <span className="tabular-nums">{item.step}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.title}</span>
                    </div>

                    <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#0A1F5C] mb-3">
                      {item.headline}
                    </h3>

                    <p className="text-base text-[#44546F] leading-[1.6] mb-5">
                      {item.description}
                    </p>

                    <div className="border-t border-[#DCEBFF] pt-4 text-sm font-semibold text-[#0A1F5C]">
                      Outcome: <span className="text-[#1D4ED8]">{item.outcome}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
