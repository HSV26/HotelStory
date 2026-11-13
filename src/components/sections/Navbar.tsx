import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NAV_LINKS } from '../../data/siteContent';
import { BrandWordmark } from '../ui/BrandMark';

interface NavbarProps {
  onAuditClick: (serviceName?: string) => void;
  onMenuOpenChange?: (open: boolean) => void;
}

const SECTION_IDS = ['home', 'about', 'services', 'work', 'process', 'contact'];
const SCROLL_OFFSET = 80;

export const Navbar: React.FC<NavbarProps> = ({
  onAuditClick,
  onMenuOpenChange,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');

  useEffect(() => {
    onMenuOpenChange?.(mobileOpen);
  }, [mobileOpen, onMenuOpenChange]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 28);

      // Scroll-spy: determine which section is currently in view
      const nearBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 40;
      if (nearBottom) {
        setActiveId('contact');
        return;
      }

      let current = 'home';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= SCROLL_OFFSET + 60) {
          current = id;
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const scrollToHref = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      const top =
        target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 pt-[env(safe-area-inset-top)] ${
          scrolled
            ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DCEBFF] shadow-[0_8px_30px_rgba(10,31,92,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between gap-4 min-[1025px]:gap-8 transition-all duration-300 ${
            scrolled
              ? 'min-h-[64px] py-2.5 min-[1025px]:py-3.5'
              : 'min-h-[64px] py-2.5 min-[1025px]:py-5'
          }`}
        >
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToHref('#home');
            }}
            className="min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm shrink-0"
            aria-label="HotelStory Home"
          >
            <BrandWordmark light={!scrolled} />
          </a>

          {/* Zone 2: 6 nav tabs with scroll-spy & sliding underline (Desktop 1025px+) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden min-[1025px]:flex items-center gap-6 xl:gap-8"
          >
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeId === id;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHref(link.href);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative text-[15px] font-medium transition-colors duration-200 whitespace-nowrap shrink-0 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-sm ${
                    isActive
                      ? scrolled
                        ? 'text-[#1D4ED8]'
                        : 'text-[#FFFFFF]'
                      : scrolled
                        ? 'text-[#0A1F5C]/80 hover:text-[#1D4ED8]'
                        : 'text-[#FFFFFF]/85 hover:text-[#DCEBFF]'
                  }`}
                >
                  <span>{link.label}</span>

                  {/* Active sliding underline */}
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-active-underline"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                      className={`absolute left-0 -bottom-0.5 h-0.5 w-full ${
                        scrolled ? 'bg-[#1D4ED8]' : 'bg-[#3B82F6]'
                      }`}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 -bottom-0.5 h-0.5 w-full origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100 ${
                        scrolled ? 'bg-[#1D4ED8]' : 'bg-[#DCEBFF]'
                      }`}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary CTA (Desktop 1025px+) + Hamburger (Mobile & Tablet <= 1024px) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onAuditClick()}
              className="hidden min-[1025px]:inline-flex items-center justify-center rounded-full bg-[#1D4ED8] px-6 py-2.5 text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_10px_28px_rgba(59,130,246,0.38)] transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              Get a Free Audit
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-label="Open navigation menu"
              className={`min-[1025px]:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border transition-colors cursor-pointer ${
                scrolled
                  ? 'border-[#DCEBFF] bg-[#F2F7FF] text-[#0A1F5C] hover:border-[#1D4ED8]'
                  : 'border-white/30 bg-[#0A1F5C]/40 text-[#FFFFFF] hover:border-white'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen White Mobile & Tablet Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 min-[1025px]:hidden bg-[#FFFFFF] flex flex-col justify-between px-5 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto"
          >
            {/* Overlay Top Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCEBFF]">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHref('#home');
                }}
                aria-label="HotelStory Home"
                className="min-h-[44px] inline-flex items-center"
              >
                <BrandWordmark light={false} />
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="w-11 h-11 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] flex items-center justify-center text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stacked Large Navy Tabs */}
            <nav
              aria-label="Mobile Navigation"
              className="my-auto py-6 flex flex-col gap-2"
            >
              {NAV_LINKS.map((link, idx) => {
                const id = link.href.replace('#', '');
                const isActive = activeId === id;
                return (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: idx * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHref(link.href);
                    }}
                    className={`min-h-[52px] py-3 font-display text-2xl sm:text-3xl font-bold tracking-tight border-b border-[#DCEBFF] flex items-center justify-between transition-colors ${
                      isActive
                        ? 'text-[#1D4ED8]'
                        : 'text-[#0A1F5C] hover:text-[#1D4ED8]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                    )}
                  </motion.a>
                );
              })}
            </nav>

            {/* Bottom CTA Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  window.setTimeout(() => {
                    onAuditClick();
                  }, 120);
                }}
                className="w-full min-h-[52px] rounded-full bg-[#1D4ED8] px-6 py-3.5 text-base font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_12px_28px_rgba(59,130,246,0.35)] transition-all cursor-pointer"
              >
                Get a Free Audit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
