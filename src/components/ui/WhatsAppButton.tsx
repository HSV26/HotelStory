import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../../data/siteContent';

interface WhatsAppButtonProps {
  hidden?: boolean;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  hidden = false,
}) => {
  if (hidden) return null;

  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(
    CONTACT_INFO.whatsappPrefill
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with HotelStory on WhatsApp"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:right-[max(1.25rem,env(safe-area-inset-right))] z-30 w-14 h-14 sm:w-auto sm:h-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1D4ED8] text-[#FFFFFF] border border-[#DCEBFF]/40 sm:px-4 sm:py-3 shadow-[0_12px_30px_rgba(29,78,216,0.35)] hover:bg-[#3B82F6] hover:shadow-[0_14px_36px_rgba(59,130,246,0.45)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
    >
      <MessageCircle className="w-6 h-6 sm:w-4 sm:h-4 shrink-0" />
      <span className="hidden sm:inline text-xs font-medium tracking-wide whitespace-nowrap">
        WhatsApp Us
      </span>
    </a>
  );
};
