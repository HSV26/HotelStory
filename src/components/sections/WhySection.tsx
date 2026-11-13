import React from 'react';
import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SITE_IMAGES, WHY_DIFFERENTIATORS } from '../../data/siteContent';
import { EditorialImage } from '../ui/EditorialImage';

export const WhySection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="why-hotelstory"
      className="relative bg-[#F2F7FF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-stretch">
          {/* Left Editorial Image */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex"
          >
            <div className="w-full rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-[0_18px_45px_rgba(29,78,216,0.1)]">
              <EditorialImage
                src={SITE_IMAGES.whyEditorialLobby}
                alt="Luxury hotel lobby lounge with warm travertine arches and sculptural lighting"
                fallbackTitle="HotelStory Editorial Direction"
                className="w-full h-full min-h-[240px] sm:min-h-[320px] lg:min-h-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto"
                imgClassName="[@media(hover:hover)]:hover:scale-[1.03]"
              />
            </div>
          </motion.div>

          {/* Right Differentiators */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-3 md:mb-4">
                Why HotelStory
              </p>
              <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.15rem)] leading-[1.1] text-[#0A1F5C] mb-8 md:mb-10 [text-wrap:balance]">
                Built for Brands That{' '}
                <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
                  Refuse to Blend In.
                </span>
              </h2>
            </motion.div>

            <div className="divide-y divide-[#DCEBFF] border-y border-[#DCEBFF]">
              {WHY_DIFFERENTIATORS.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="py-5 sm:py-6 flex items-start gap-4"
                >
                  <span className="mt-1 w-6 h-6 rounded-full border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#1D4ED8] stroke-[2.4]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#0A1F5C] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-base text-[#44546F] leading-[1.6]">
                      {item.detail}
                    </p>
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
