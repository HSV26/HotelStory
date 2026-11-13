import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { PROBLEM_ITEMS } from '../../data/siteContent';

export const ProblemSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="problem"
      className="relative bg-gradient-to-br from-[#0A1F5C] to-[#1D4ED8] py-16 md:py-20 lg:py-32 px-5 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 md:mb-16 lg:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#DCEBFF] mb-4">
            The Cost of Staying Quiet
          </p>
          <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.12] text-[#FFFFFF] [text-wrap:balance]">
            Great Business but you are Invisible Online.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {PROBLEM_ITEMS.map((item, idx) => (
            <motion.article
              key={item.index}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 [@media(hover:hover)]:hover:border-white/50 p-6 md:p-8 lg:p-9 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <span className="font-display font-bold text-2xl text-[#DCEBFF] tabular-nums">
                    {item.index}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px w-12 bg-white/20 [@media(hover:hover)]:group-hover:w-20 [@media(hover:hover)]:group-hover:bg-[#DCEBFF] transition-all duration-300"
                  />
                </div>
                <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl leading-snug text-[#FFFFFF] mb-3.5 [text-wrap:balance]">
                  {item.title}
                </h3>
                <p className="text-base text-[#FFFFFF]/80 leading-[1.6]">
                  {item.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
