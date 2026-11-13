import React from 'react';
import { ArrowUp, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { CONTACT_INFO } from '../../data/siteContent';
import { BrandWordmark } from '../ui/BrandMark';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A1F5C] text-[#FFFFFF] border-t border-white/20 py-10 md:py-12 px-5 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <BrandWordmark light />
          <span className="hidden sm:inline text-white/30">•</span>
          <p className="text-xs sm:text-sm text-[#FFFFFF]/75">
            Social media &amp; brand positioning for hospitality &amp; venues.
          </p>
        </div>

        {/* Socials & Back to Top */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start lg:justify-end gap-6">
          <div className="flex items-center gap-3">
            <a
              href={CONTACT_INFO.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HotelStory Facebook"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={CONTACT_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HotelStory Instagram"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={CONTACT_INFO.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HotelStory YouTube"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href={CONTACT_INFO.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HotelStory LinkedIn"
              className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

          <div className="hidden sm:block h-5 w-px bg-white/20" />

          <div className="flex items-center gap-6 text-xs text-[#FFFFFF]/75">
            <span>© {currentYear} HotelStory.</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="min-h-[44px] inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#DCEBFF] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#FFFFFF]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
