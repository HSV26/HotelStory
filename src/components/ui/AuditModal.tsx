import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Send, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BUSINESS_CATEGORIES } from '../../data/siteContent';
import { insertLead } from '../../lib/supabase';

export interface AuditSubmissionPayload {
  fullName: string;
  businessName: string;
  city: string;
  phone: string;
  email: string;
  businessType: string;
  message: string;
  packageInterest?: string;
  honeypot?: string;
}

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBusinessType?: string;
  packageInterest?: string;
}

const BUSINESS_TYPES = BUSINESS_CATEGORIES.map((c) => c.name);

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  initialBusinessType,
  packageInterest,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState(
    initialBusinessType || 'Dining'
  );
  const [message, setMessage] = useState('');
  // Hidden spam-trap honeypot field (humans leave it blank)
  const [honeypot, setHoneypot] = useState('');

  const [errors, setErrors] = useState<
    Partial<Record<'fullName' | 'businessName' | 'city' | 'phone' | 'email', string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync optional pre-selected business type or package interest
  useEffect(() => {
    if (initialBusinessType && BUSINESS_TYPES.includes(initialBusinessType)) {
      setBusinessType(initialBusinessType);
    }
  }, [initialBusinessType]);

  useEffect(() => {
    if (!isOpen) return;
    if (packageInterest) {
      setMessage((prev) =>
        !prev.trim() || prev.startsWith('Interested in ')
          ? `Interested in ${packageInterest}.`
          : prev
      );
    } else {
      setMessage((prev) => (prev.startsWith('Interested in ') ? '' : prev));
    }
  }, [isOpen, packageInterest]);

  // Detect mobile viewport for bottom-sheet vs centered modal animation
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Lock background scroll and move initial focus cleanly on desktop
  useEffect(() => {
    if (!isOpen) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      if (isSuccess) {
        closeButtonRef.current?.focus();
      } else if (window.innerWidth >= 640) {
        firstInputRef.current?.focus();
      }
    }, 60);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, isSuccess]);

  // Escape key & focus trap inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === first ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (
            document.activeElement === last ||
            !dialogRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};
    const digitsOnly = phone.replace(/\D/g, '');

    if (!fullName.trim()) {
      nextErrors.fullName = 'Please enter your full name.';
    }
    if (!businessName.trim()) {
      nextErrors.businessName = 'Please enter your business or brand name.';
    }
    if (!city.trim()) {
      nextErrors.city = 'Please enter your city.';
    }
    if (!phone.trim() || digitsOnly.length < 7) {
      nextErrors.phone = 'Please enter a valid phone or WhatsApp number.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // =========================================================================
  // CENTRALIZED AUDIT FORM SUBMIT HANDLER
  // Saves lead to Supabase `leads` table (source: "popup") and can also
  // trigger email / Google Sheet / WhatsApp notifications if added later.
  // =========================================================================
  const handleAuditSubmit = async (
    payload: AuditSubmissionPayload
  ): Promise<{ ok: boolean; error?: string }> => {
    // Honeypot spam check: silently pretend success without inserting into DB
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return { ok: true };
    }

    return insertLead({
      full_name: payload.fullName,
      business_name: payload.businessName,
      city: payload.city,
      phone: payload.phone,
      email: payload.email,
      business_type: payload.businessType,
      message: payload.message,
      source: 'popup',
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await handleAuditSubmit({
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        city: city.trim(),
        phone: phone.trim(),
        email: email.trim(),
        businessType,
        message: message.trim(),
        packageInterest,
        honeypot,
      });

      if (result.ok) {
        setIsSuccess(true);
      } else {
        setSubmitError(
          result.error || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      if (isSuccess) {
        setIsSuccess(false);
        setFullName('');
        setBusinessName('');
        setCity('');
        setPhone('');
        setEmail('');
        setMessage('');
        setHoneypot('');
        setErrors({});
        setSubmitError(null);
      }
    }, 260);
  };

  const handleFieldFocus = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.currentTarget;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);
  };

  const inputClass =
    'w-full min-h-[46px] rounded-xl bg-[#FFFFFF] border border-[#DCEBFF] px-4 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/55 focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:shadow-[0_0_0_4px_rgba(29,78,216,0.1)] transition-all';
  const inputErrorClass =
    'w-full min-h-[46px] rounded-xl bg-[#FEF2F2]/40 border border-[#DC2626] px-4 py-2.5 text-base sm:text-sm text-[#0A1F5C] placeholder:text-[#44546F]/55 focus:border-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.1)] transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0A1F5C]/60 backdrop-blur-sm p-0 sm:p-6"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-modal-heading"
            onClick={(e) => e.stopPropagation()}
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : isMobile
                  ? { opacity: 1, y: '100%' }
                  : { opacity: 0, scale: 0.95, y: 12 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : isMobile
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : isMobile
                  ? { opacity: 0.8, y: '100%' }
                  : { opacity: 0, scale: 0.95, y: 8 }
            }
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-[560px] max-h-[92svh] sm:max-h-[90svh] flex flex-col overflow-hidden bg-[#FFFFFF] text-[#44546F] rounded-t-3xl sm:rounded-3xl border border-[#DCEBFF] shadow-[0_28px_72px_rgba(10,31,92,0.28)]"
          >
            {/* Pinned Top Header (never overlaps inputs or scroll area) */}
            <div className="shrink-0 bg-[#FFFFFF] border-b border-[#DCEBFF]/80 px-5 pt-3 pb-3.5 sm:px-8 sm:pt-6 sm:pb-5">
              <div className="sm:hidden flex justify-center mb-2.5">
                <div
                  aria-hidden="true"
                  className="w-10 h-1 rounded-full bg-[#DCEBFF]"
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.16em] uppercase text-[#1D4ED8] mb-1">
                    Free Social Media Audit
                  </p>
                  <h2
                    id="audit-modal-heading"
                    className="font-display font-bold tracking-tight text-xl sm:text-[1.65rem] leading-[1.16] text-[#0A1F5C] [text-wrap:balance]"
                  >
                    {isSuccess
                      ? 'Audit Request Received'
                      : "Let's Make Your Brand the #1 Name in Your City"}
                  </h2>
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleClose}
                  aria-label="Close free audit modal"
                  className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#DCEBFF] bg-[#F2F7FF] flex items-center justify-center text-[#0A1F5C] hover:bg-[#1D4ED8] hover:text-[#FFFFFF] hover:border-[#1D4ED8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body + Pinned Footer */}
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="modal-form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 min-h-0 flex flex-col"
                >
                  {/* Scrollable Inputs Area */}
                  <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 py-4 sm:px-8 sm:py-5 space-y-3.5 sm:space-y-4">
                    <p className="text-sm text-[#44546F] leading-relaxed">
                      Share a few details and we&apos;ll send your free
                      Instagram audit within 24 hours.
                    </p>

                    {/* Hidden Honeypot Field for Spam Prevention */}
                    <div
                      aria-hidden="true"
                      className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden opacity-0 pointer-events-none"
                    >
                      <label htmlFor="modal-company-website">Website</label>
                      <input
                        id="modal-company-website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label
                          htmlFor="modal-full-name"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          Full Name *
                        </label>
                        <input
                          ref={firstInputRef}
                          id="modal-full-name"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onFocus={handleFieldFocus}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName)
                              setErrors((prev) => ({
                                ...prev,
                                fullName: undefined,
                              }));
                          }}
                          placeholder="e.g. Arjun Mehta"
                          aria-invalid={Boolean(errors.fullName)}
                          className={errors.fullName ? inputErrorClass : inputClass}
                        />
                        {errors.fullName && (
                          <p
                            className="text-xs text-[#DC2626] font-medium mt-1.5"
                            role="alert"
                          >
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="modal-business-name"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          Business Name *
                        </label>
                        <input
                          id="modal-business-name"
                          type="text"
                          autoComplete="organization"
                          value={businessName}
                          onFocus={handleFieldFocus}
                          onChange={(e) => {
                            setBusinessName(e.target.value);
                            if (errors.businessName)
                              setErrors((prev) => ({
                                ...prev,
                                businessName: undefined,
                              }));
                          }}
                          placeholder="e.g. Atelier Ember"
                          aria-invalid={Boolean(errors.businessName)}
                          className={
                            errors.businessName ? inputErrorClass : inputClass
                          }
                        />
                        {errors.businessName && (
                          <p
                            className="text-xs text-[#DC2626] font-medium mt-1.5"
                            role="alert"
                          >
                            {errors.businessName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label
                          htmlFor="modal-city"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          City *
                        </label>
                        <input
                          id="modal-city"
                          type="text"
                          autoComplete="address-level2"
                          value={city}
                          onFocus={handleFieldFocus}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (errors.city)
                              setErrors((prev) => ({
                                ...prev,
                                city: undefined,
                              }));
                          }}
                          placeholder="e.g. Mumbai"
                          aria-invalid={Boolean(errors.city)}
                          className={errors.city ? inputErrorClass : inputClass}
                        />
                        {errors.city && (
                          <p
                            className="text-xs text-[#DC2626] font-medium mt-1.5"
                            role="alert"
                          >
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="modal-phone"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="modal-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={phone}
                          onFocus={handleFieldFocus}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone)
                              setErrors((prev) => ({
                                ...prev,
                                phone: undefined,
                              }));
                          }}
                          placeholder="+91 98XXX XXXXX"
                          aria-invalid={Boolean(errors.phone)}
                          className={errors.phone ? inputErrorClass : inputClass}
                        />
                        {errors.phone && (
                          <p
                            className="text-xs text-[#DC2626] font-medium mt-1.5"
                            role="alert"
                          >
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div>
                        <label
                          htmlFor="modal-email"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          Email *
                        </label>
                        <input
                          id="modal-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onFocus={handleFieldFocus}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email)
                              setErrors((prev) => ({
                                ...prev,
                                email: undefined,
                              }));
                          }}
                          placeholder="you@yourbrand.com"
                          aria-invalid={Boolean(errors.email)}
                          className={errors.email ? inputErrorClass : inputClass}
                        />
                        {errors.email && (
                          <p
                            className="text-xs text-[#DC2626] font-medium mt-1.5"
                            role="alert"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="modal-business-type"
                          className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                        >
                          Business Type
                        </label>
                        <select
                          id="modal-business-type"
                          value={businessType}
                          onFocus={handleFieldFocus}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className={inputClass}
                        >
                          {BUSINESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="modal-message"
                        className="block text-xs font-semibold text-[#0A1F5C] mb-1.5"
                      >
                        Message{' '}
                        <span className="font-normal text-[#44546F]">
                          (Optional)
                        </span>
                      </label>
                      <textarea
                        id="modal-message"
                        rows={2}
                        value={message}
                        onFocus={handleFieldFocus}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Instagram handle or quick goals..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Pinned Bottom CTA Bar */}
                  <div className="shrink-0 bg-[#FFFFFF] border-t border-[#DCEBFF]/80 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-5 space-y-2.5">
                    {submitError && (
                      <div
                        role="alert"
                        className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#DC2626]"
                      >
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-full bg-[#1D4ED8] px-6 py-3.5 text-base font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] hover:shadow-[0_12px_30px_rgba(59,130,246,0.35)] disabled:opacity-75 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {submitError
                              ? 'Retry Request'
                              : 'Request My Free Audit'}
                          </span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-[#44546F]/80">
                      No spam. No obligation.
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="modal-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 overflow-y-auto no-scrollbar px-6 py-10 sm:px-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 18,
                      delay: 0.08,
                    }}
                    className="w-16 h-16 rounded-full bg-[#F2F7FF] border-2 border-[#1D4ED8] flex items-center justify-center mx-auto mb-6 text-[#1D4ED8] shadow-[0_10px_28px_rgba(29,78,216,0.18)]"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>

                  <h3 className="font-display font-bold tracking-tight text-xl sm:text-2xl text-[#0A1F5C] mb-3">
                    Thank you! Sarvesh or the HotelStory team will contact you
                    within 24 hours.
                  </h3>

                  <p className="text-base sm:text-sm text-[#44546F] max-w-sm mx-auto leading-relaxed mb-8">
                    We&apos;ve received the audit request for{' '}
                    <span className="font-semibold text-[#0A1F5C]">
                      {businessName}
                    </span>{' '}
                    ({city}). Check{' '}
                    <span className="font-medium text-[#1D4ED8]">{email}</span>{' '}
                    or WhatsApp for our strategist&apos;s note.
                  </p>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="min-h-[48px] inline-flex items-center justify-center rounded-full bg-[#1D4ED8] px-8 py-3 text-base sm:text-sm font-semibold text-[#FFFFFF] hover:bg-[#3B82F6] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
