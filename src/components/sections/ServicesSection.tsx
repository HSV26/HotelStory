import React from 'react';
import {
  ArrowRight,
  CalendarRange,
  Camera,
  Clapperboard,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SERVICES_LIST, ServiceItem } from '../../data/siteContent';

interface ServicesSectionProps {
  onAuditClick: (serviceName?: string) => void;
}

const ICON_MAP: Record<ServiceItem['iconName'], React.FC<{ className?: string }>> = {
  CalendarRange,
  Clapperboard,
  Camera,
  Users,
  MapPin,
  TrendingUp,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onAuditClick,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="relative bg-[#FFFFFF] text-[#44546F] py-16 md:py-20 lg:py-32 px-5 md:px-8 border-t border-[#DCEBFF] scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 md:mb-16 lg:mb-20"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#1D4ED8] mb-4">
              Core Capabilities
            </p>
            <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.12] text-[#0A1F5C] [text-wrap:balance]">
              Everything Your Brand Needs to{' '}
              <span className="bg-gradient-to-r from-[#1D4ED8] to-[#3B82F6] bg-clip-text text-transparent">
                Own the Feed.
              </span>
            </h2>
          </div>
          <p className="text-base text-[#44546F] max-w-md leading-[1.6]">
            Every creative discipline under one roof—built around table
            reservations, footfall, room nights, and private event revenue.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {SERVICES_LIST.map((service, idx) => {
            const Icon = ICON_MAP[service.iconName];
            return (
              <motion.div
                key={service.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: (idx % 3) * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className="group h-full rounded-2xl bg-[#F2F7FF] border border-[#DCEBFF] [@media(hover:hover)]:hover:border-[#1D4ED8] p-6 md:p-8 transition-all duration-200 flex flex-col justify-between shadow-[0_10px_30px_rgba(29,78,216,0.06)] [@media(hover:hover)]:hover:shadow-[0_18px_42px_rgba(59,130,246,0.16)]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl border border-[#DCEBFF] bg-[#FFFFFF] flex items-center justify-center text-[#1D4ED8] mb-6 md:mb-7 [@media(hover:hover)]:group-hover:bg-[#1D4ED8] [@media(hover:hover)]:group-hover:text-[#FFFFFF] [@media(hover:hover)]:group-hover:border-[#1D4ED8] transition-colors duration-200">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>

                  <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#0A1F5C] mb-3">
                    {service.title}
                  </h3>

                  <p className="text-base text-[#44546F] leading-[1.6] mb-6 md:mb-8">
                    {service.benefit}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onAuditClick(service.title)}
                  className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] [@media(hover:hover)]:group-hover:text-[#3B82F6] transition-colors cursor-pointer self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-sm"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 [@media(hover:hover)]:group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
