import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  SAMPLE_WORK_ITEMS,
  WORK_FILTER_CATEGORIES,
  WorkCategory,
} from '../../data/siteContent';
import { EditorialImage } from '../ui/EditorialImage';

export const WorkSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<'All' | WorkCategory>(
    'All'
  );
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = filterScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const el = filterScrollRef.current;
    window.addEventListener('resize', updateScrollButtons);

    let observer: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateScrollButtons);
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', updateScrollButtons);
      observer?.disconnect();
    };
  }, [updateScrollButtons]);

  const scrollFilters = (direction: 'left' | 'right') => {
    const el = filterScrollRef.current;
    if (!el) return;
    const delta = Math.max(160, Math.round(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction === 'right' ? delta : -delta,
      behavior: 'smooth',
    });
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return SAMPLE_WORK_ITEMS;
    return SAMPLE_WORK_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <section
      id="work"
      className="relative bg-gradient-to-br from-[#0A1F5C] to-[#1D4ED8] py-16 md:py-20 lg:py-32 px-5 md:px-8 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-8 sm:mb-12"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#DCEBFF] mb-4">
            Sample Work
          </p>
          <h2 className="font-display font-bold tracking-tight text-[clamp(1.875rem,4.5vw,3.35rem)] leading-[1.12] text-[#FFFFFF] mb-4 [text-wrap:balance]">
            Our Work
          </h2>
          <p className="text-base sm:text-lg text-[#FFFFFF]/80 leading-[1.6] max-w-2xl">
            Concept content created to show what your brand could look like.
            Real client results coming soon.
          </p>
        </motion.div>

        {/* Filter Row: arrow-assisted horizontal slider on mobile, wrapped row on sm+ */}
        <div className="relative flex items-center gap-2 mb-8 sm:mb-12">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollFilters('left')}
              aria-label="Scroll categories left"
              className="sm:hidden shrink-0 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors cursor-pointer shadow-[0_6px_16px_rgba(10,31,92,0.28)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={filterScrollRef}
            onScroll={updateScrollButtons}
            role="group"
            aria-label="Filter sample work by category"
            className="flex-1 min-w-0 flex flex-nowrap sm:flex-wrap items-center gap-2.5 overflow-x-auto no-scrollbar pb-0.5 scroll-smooth"
          >
            {WORK_FILTER_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={(e) => {
                    setActiveCategory(category);
                    if (window.innerWidth < 640) {
                      e.currentTarget.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest',
                      });
                    }
                  }}
                  aria-pressed={isActive}
                  className={`min-h-[44px] rounded-full px-5 py-2 text-sm font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#0A1F5C] border-[#FFFFFF] shadow-[0_8px_22px_rgba(255,255,255,0.2)]'
                      : 'bg-white/10 text-[#FFFFFF] border-white/25 hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollFilters('right')}
              aria-label="Scroll categories right"
              className="sm:hidden shrink-0 w-11 h-11 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors cursor-pointer shadow-[0_6px_16px_rgba(10,31,92,0.28)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sample Work Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7">
          {filteredItems.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.55,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group h-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 [@media(hover:hover)]:hover:border-white/45 overflow-hidden flex flex-col transition-all duration-300"
            >
              {/* Image / Video Thumbnail */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <EditorialImage
                  src={item.thumbnail}
                  alt={item.imageAlt}
                  fallbackTitle={item.conceptLabel}
                  className="w-full h-full"
                  imgClassName="[@media(hover:hover)]:group-hover:scale-105"
                />

                {/* Media Format Indicator (Video vs Photo Concept) */}
                <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#0A1F5C]/80 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-semibold text-[#FFFFFF]">
                  {item.mediaType === 'video' ? (
                    <>
                      <Play className="w-3 h-3 fill-current text-[#3B82F6]" />
                      <span>Video Concept</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 text-[#DCEBFF]" />
                      <span>Photo Concept</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card Copy */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                <span className="inline-block self-start rounded-full bg-white/15 border border-white/25 px-3 py-1 text-xs font-semibold text-[#DCEBFF] mb-3">
                  {item.conceptLabel}
                </span>

                <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#FFFFFF] mb-2.5">
                  {item.title}
                </h3>

                <p className="text-base sm:text-[15px] text-[#FFFFFF]/80 leading-[1.6]">
                  {item.caption}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
