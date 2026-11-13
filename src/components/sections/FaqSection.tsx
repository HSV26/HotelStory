import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FAQ_ITEMS } from '../../data/siteContent';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section
      id="faq"
      className="relative bg-[#F2F7FF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF]"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10 md:mb-14 lg:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-3 md:mb-4">
            Common Questions
          </p>
          <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.1rem)] leading-[1.1] text-[#0A1F5C] [text-wrap:balance]">
            Clarity Before{' '}
            <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
              We Begin.
            </span>
          </h2>
        </motion.div>

        <div className="divide-y divide-[#DCEBFF] border-y border-[#DCEBFF]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="py-1 sm:py-2">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[56px] py-4 sm:py-5 flex items-center justify-between gap-4 sm:gap-6 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-sm"
                >
                  <span className="font-display font-bold tracking-tight text-lg sm:text-xl md:text-2xl text-[#0A1F5C] group-hover:text-[#1D4ED8] transition-colors">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#1D4ED8] border-[#1D4ED8] text-[#FFFFFF]'
                        : 'bg-[#FFFFFF] border-[#DCEBFF] text-[#1D4ED8] group-hover:border-[#1D4ED8]'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { height: 0, opacity: 0 }
                      }
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { height: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 sm:pb-6 pr-2 sm:pr-12 text-base text-[#44546F] leading-[1.6]">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
