import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Youtube,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  BUSINESS_CATEGORIES,
  CONTACT_INFO,
  FREE_AUDIT_POINTS,
  SERVICES_LIST,
} from '../../data/siteContent';
import { insertLead } from '../../lib/supabase';
import { MagneticButton } from '../ui/MagneticButton';

interface ContactSectionProps {
  preselectedService?: string;
  preselectedBusinessType?: string;
  onOpenAuditModal: () => void;
}

interface FormState {
  name: string;
  brandName: string;
  businessType: string;
  city: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  honeypot: string;
}

const SERVICE_OPTIONS = [
  ...SERVICES_LIST.map((s) => s.title),
  'Starter Package',
  'Growth Package',
  'Dominator Package',
  'Full Hospitality Retainer',
];

const BUSINESS_TYPE_OPTIONS = BUSINESS_CATEGORIES.map((cat) => ({
  value: cat.name,
  label: `${cat.name} (${cat.types.slice(0, 3).join(', ')})`,
}));

export const ContactSection: React.FC<ContactSectionProps> = ({
  preselectedService,
  preselectedBusinessType,
  onOpenAuditModal,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [form, setForm] = useState<FormState>({
    name: '',
    brandName: '',
    businessType: preselectedBusinessType || 'Dining',
    city: '',
    phone: '',
    email: '',
    service: preselectedService || 'Full Hospitality Retainer',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setForm((prev) => ({ ...prev, service: preselectedService }));
      setSubmitted(false);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedBusinessType) {
      setForm((prev) => ({ ...prev, businessType: preselectedBusinessType }));
      setSubmitted(false);
    }
  }, [preselectedBusinessType]);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const digitsOnly = form.phone.replace(/\D/g, '');

    if (!form.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!form.brandName.trim())
      nextErrors.brandName = 'Please enter your brand or venue name.';
    if (!form.city.trim()) nextErrors.city = 'Please enter your city.';
    if (!form.phone.trim() || digitsOnly.length < 7)
      nextErrors.phone = 'Please enter a valid phone or WhatsApp number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = 'Please enter a valid email address.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // =========================================================================
  // BOTTOM CONTACT FORM SUBMIT HANDLER
  // Saves lead to Supabase `leads` table with source: "contact form"
  // =========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    // Honeypot spam protection: silently succeed without saving
    if (form.honeypot.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const combinedMessage = [
      form.service ? `Service: ${form.service}` : '',
      form.message.trim(),
    ]
      .filter(Boolean)
      .join(' — ');

    try {
      const result = await insertLead({
        full_name: form.name.trim(),
        business_name: form.brandName.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        business_type: form.businessType,
        message: combinedMessage,
        source: 'contact form',
      });

      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(
          result.error || 'Could not submit your request. Please retry.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrors({});
    setSubmitError(null);
    setForm({
      name: '',
      brandName: '',
      businessType: 'Dining',
      city: '',
      phone: '',
      email: '',
      service: 'Full Hospitality Retainer',
      message: '',
      honeypot: '',
    });
  };

  const whatsappHref = `https://wa.me/${CONTACT_INFO.whatsappNumber}?text=${encodeURIComponent(
    CONTACT_INFO.whatsappPrefill
  )}`;

  const handleFieldFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (window.innerWidth < 768) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const inputBaseClass =
    'w-full min-h-[46px] rounded-xl bg-white/10 border border-white/25 px-4 py-3 text-base sm:text-sm text-[#FFFFFF] placeholder:text-white/50 focus:border-[#FFFFFF] focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/60 transition-all';
  const inputErrorClass =
    'w-full min-h-[46px] rounded-xl bg-[#EF4444]/15 border border-[#FCA5A5] px-4 py-3 text-base sm:text-sm text-[#FFFFFF] placeholder:text-white/50 focus:border-[#FECACA] focus:bg-[#EF4444]/20 focus:outline-none focus:ring-2 focus:ring-[#FCA5A5]/60 transition-all';
  const fieldErrorClass =
    'inline-block rounded-md bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 text-xs font-semibold text-[#DC2626] mt-1.5';

  return (
    <section
      id="contact"
      className="relative bg-gradient-to-br from-[#0A1F5C] to-[#1D4ED8] py-16 md:py-20 lg:py-32 px-5 md:px-8 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-start">
          {/* Left Dramatic Headline & Direct Contact */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#DCEBFF] mb-3 md:mb-4">
              Complimentary Social Audit
            </p>
            <h2 className="font-display font-bold tracking-tight text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] text-[#FFFFFF] mb-5 md:mb-6 [text-wrap:balance]">
              Ready to Become the #1 Name in Your City?
            </h2>
            <p className="text-base text-[#FFFFFF]/80 leading-[1.6] mb-3 max-w-md">
              Tell us about your brand. Within 24 hours, we&apos;ll send over a
              clear, honest Instagram audit—with zero obligation.
            </p>
            <p className="text-sm sm:text-base font-medium text-[#DCEBFF] mb-6 max-w-md">
              You&apos;ll hear directly from Sarvesh, Founder &amp; Brand
              Strategist
            </p>

            {/* What you get in your free audit */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 mb-8 max-w-md">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#DCEBFF] mb-3.5">
                What you get in your free audit
              </p>
              <ul className="space-y-2.5">
                {FREE_AUDIT_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#FFFFFF]/90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#DCEBFF] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8 md:mb-10">
              <MagneticButton
                wrapperClassName="w-full sm:w-auto inline-block"
                onClick={onOpenAuditModal}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FFFFFF] px-7 py-3.5 text-base sm:text-base font-semibold text-[#0A1F5C] hover:bg-[#F2F7FF] hover:shadow-[0_14px_34px_rgba(255,255,255,0.24)] transition-all cursor-pointer"
              >
                <span>Request My Free Audit</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </div>

            {/* Direct Contact Channels */}
            <div className="space-y-2 border-t border-white/20 pt-6">
              <div>
                <a
                  href={CONTACT_INFO.phoneHref}
                  className="min-h-[44px] inline-flex items-center gap-3.5 text-base text-[#FFFFFF]/90 hover:text-[#DCEBFF] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#DCEBFF] shrink-0" />
                  <span className="tabular-nums">{CONTACT_INFO.phoneDisplay}</span>
                </a>
              </div>

              <div>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="min-h-[44px] inline-flex items-center gap-3.5 text-base text-[#FFFFFF]/90 hover:text-[#DCEBFF] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#DCEBFF] shrink-0" />
                  <span>{CONTACT_INFO.email}</span>
                </a>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] inline-flex items-center gap-2.5 rounded-full border border-white/55 bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] hover:border-[#FFFFFF] transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message on WhatsApp</span>
                </a>

                <a
                  href={CONTACT_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HotelStory on Facebook"
                  className="w-11 h-11 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] hover:border-[#FFFFFF] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                <a
                  href={CONTACT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HotelStory on Instagram"
                  className="w-11 h-11 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] hover:border-[#FFFFFF] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href={CONTACT_INFO.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HotelStory on YouTube"
                  className="w-11 h-11 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] hover:border-[#FFFFFF] transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href={CONTACT_INFO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="HotelStory on LinkedIn"
                  className="w-11 h-11 rounded-full border border-white/30 bg-white/10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] hover:border-[#FFFFFF] transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Glassmorphism Audit Request Form */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-7 lg:p-10"
          >
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="audit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4 sm:space-y-5 relative"
                >
                  {/* Hidden Honeypot Field for Spam Prevention */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden opacity-0 pointer-events-none"
                  >
                    <label htmlFor="hs-company-website">Website</label>
                    <input
                      id="hs-company-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.honeypot}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, honeypot: e.target.value }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label
                        htmlFor="hs-name"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        Your Name *
                      </label>
                      <input
                        id="hs-name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, name: e.target.value }));
                          if (errors.name)
                            setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="e.g. Arjun Mehta"
                        aria-invalid={Boolean(errors.name)}
                        className={errors.name ? inputErrorClass : inputBaseClass}
                      />
                      {errors.name && (
                        <p className={fieldErrorClass} role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="hs-brand"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        Brand / Venue Name *
                      </label>
                      <input
                        id="hs-brand"
                        type="text"
                        value={form.brandName}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, brandName: e.target.value }));
                          if (errors.brandName)
                            setErrors((prev) => ({
                              ...prev,
                              brandName: undefined,
                            }));
                        }}
                        placeholder="e.g. Atelier Ember or The Verandah"
                        aria-invalid={Boolean(errors.brandName)}
                        className={
                          errors.brandName ? inputErrorClass : inputBaseClass
                        }
                      />
                      {errors.brandName && (
                        <p className={fieldErrorClass} role="alert">
                          {errors.brandName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label
                        htmlFor="hs-business-type"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        Business Type
                      </label>
                      <select
                        id="hs-business-type"
                        value={form.businessType}
                        onFocus={handleFieldFocus}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            businessType: e.target.value,
                          }))
                        }
                        className={inputBaseClass}
                      >
                        {BUSINESS_TYPE_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#0A1F5C] text-[#FFFFFF]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="hs-city"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        City / Destination *
                      </label>
                      <input
                        id="hs-city"
                        type="text"
                        autoComplete="address-level2"
                        value={form.city}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, city: e.target.value }));
                          if (errors.city)
                            setErrors((prev) => ({ ...prev, city: undefined }));
                        }}
                        placeholder="e.g. Mumbai"
                        aria-invalid={Boolean(errors.city)}
                        className={errors.city ? inputErrorClass : inputBaseClass}
                      />
                      {errors.city && (
                        <p className={fieldErrorClass} role="alert">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label
                        htmlFor="hs-phone"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        Phone / WhatsApp *
                      </label>
                      <input
                        id="hs-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, phone: e.target.value }));
                          if (errors.phone)
                            setErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="+91 98XXX XXXXX"
                        aria-invalid={Boolean(errors.phone)}
                        className={errors.phone ? inputErrorClass : inputBaseClass}
                      />
                      {errors.phone && (
                        <p className={fieldErrorClass} role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="hs-email"
                        className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        id="hs-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setForm((f) => ({ ...f, email: e.target.value }));
                          if (errors.email)
                            setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="you@yourbrand.com"
                        aria-invalid={Boolean(errors.email)}
                        className={errors.email ? inputErrorClass : inputBaseClass}
                      />
                      {errors.email && (
                        <p className={fieldErrorClass} role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="hs-service"
                      className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                    >
                      Service Interested In
                    </label>
                    <select
                      id="hs-service"
                      value={form.service}
                      onFocus={handleFieldFocus}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, service: e.target.value }))
                      }
                      className={inputBaseClass}
                    >
                      {SERVICE_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#0A1F5C] text-[#FFFFFF]"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="hs-message"
                      className="block text-xs font-medium tracking-wide text-[#FFFFFF]/90 mb-2"
                    >
                      Tell Us About Your Goals (Optional)
                    </label>
                    <textarea
                      id="hs-message"
                      rows={4}
                      value={form.message}
                      onFocus={handleFieldFocus}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder="Share your Instagram handle, seating/room capacity, or upcoming launch goals..."
                      className={`${inputBaseClass} resize-none`}
                    />
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] px-4 py-3 text-sm font-semibold text-[#DC2626]"
                    >
                      {submitError}
                    </div>
                  )}

                  <div className="pt-2">
                    <MagneticButton
                      wrapperClassName="w-full sm:w-auto inline-block"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FFFFFF] px-8 py-4 text-base font-semibold text-[#0A1F5C] hover:bg-[#F2F7FF] hover:shadow-[0_14px_34px_rgba(255,255,255,0.24)] disabled:opacity-75 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Request...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {submitError ? 'Retry Audit Request' : 'Send Audit Request'}
                          </span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="audit-success"
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="py-10 sm:py-12 px-2 sm:px-4 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="w-16 h-16 rounded-full bg-white/15 border border-[#DCEBFF] flex items-center justify-center mx-auto mb-6 text-[#FFFFFF]"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>

                  <h3 className="font-display font-bold tracking-tight text-2xl sm:text-3xl text-[#FFFFFF] mb-3">
                    Audit Request Received
                  </h3>
                  <p className="text-base text-[#FFFFFF]/80 max-w-md mx-auto leading-[1.6] mb-8">
                    Thank you, <span className="text-[#FFFFFF] font-semibold">{form.name}</span>.
                    Our {form.businessType.toLowerCase()} strategy team is reviewing{' '}
                    <span className="text-[#DCEBFF] font-semibold">{form.brandName}</span>{' '}
                    ({form.city}) and will deliver your free audit to{' '}
                    <span className="text-[#FFFFFF] underline underline-offset-2">{form.email}</span> within 24 hours.
                  </p>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-white/55 px-6 py-2.5 text-sm font-medium text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0A1F5C] transition-colors cursor-pointer"
                  >
                    Submit Another Brand
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
