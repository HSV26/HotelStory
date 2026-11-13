/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { AboutSection } from './components/sections/AboutSection';
import { BusinessesSection } from './components/sections/BusinessesSection';
import { ContactSection } from './components/sections/ContactSection';
import { FaqSection } from './components/sections/FaqSection';
import { Footer } from './components/sections/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { MethodSection } from './components/sections/MethodSection';
import { Navbar } from './components/sections/Navbar';
import { PackagesSection } from './components/sections/PackagesSection';
import { ProblemSection } from './components/sections/ProblemSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { TrustMarquee } from './components/sections/TrustMarquee';
import { WhySection } from './components/sections/WhySection';
import { WorkSection } from './components/sections/WorkSection';
import { AuditModal } from './components/ui/AuditModal';
import { CursorGlow } from './components/ui/CursorGlow';
import { PageIntro } from './components/ui/PageIntro';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { AdminPage } from './pages/AdminPage';

const SCROLL_OFFSET = 80;

function isAdminRoute(pathname: string): boolean {
  return /^\/(admin|laudalele)\/?$/i.test(pathname);
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const [selectedService, setSelectedService] = useState<string | undefined>(
    undefined
  );
  const [selectedBusinessType, setSelectedBusinessType] = useState<
    string | undefined
  >(undefined);

  // Shared state controlling the AuditModal popup & mobile menu visibility
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalPackage, setModalPackage] = useState<string | undefined>(
    undefined
  );
  const [modalBusinessType, setModalBusinessType] = useState<
    string | undefined
  >(undefined);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Private admin route (intentionally unlinked from public navbar & footer)
  if (isAdminRoute(pathname)) {
    return (
      <MotionConfig reducedMotion="user">
        <AdminPage />
      </MotionConfig>
    );
  }

  const openAuditModal = (options?: {
    packageInterest?: string;
    businessType?: string;
  }) => {
    lastTriggerRef.current = document.activeElement as HTMLElement | null;
    setModalPackage(options?.packageInterest);
    if (options?.businessType) {
      setModalBusinessType(options.businessType);
    }
    setAuditModalOpen(true);
  };

  const closeAuditModal = () => {
    setAuditModalOpen(false);
    window.setTimeout(() => {
      lastTriggerRef.current?.focus();
    }, 50);
  };

  const scrollToContact = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const top =
        contactEl.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const handleServiceModalAudit = (serviceName?: string) => {
    if (serviceName) {
      setSelectedService(serviceName);
    }
    openAuditModal({ packageInterest: serviceName });
  };

  const handleBusinessTypeSelect = (businessTypeName: string) => {
    setSelectedBusinessType(businessTypeName);
    setModalBusinessType(businessTypeName);
    scrollToContact();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-[100svh] bg-[#FFFFFF] text-[#44546F] overflow-x-clip">
        <PageIntro />
        <CursorGlow />
        <Navbar
          onAuditClick={() => openAuditModal()}
          onMenuOpenChange={setMobileMenuOpen}
        />

        <main>
          <HeroSection onAuditClick={() => openAuditModal()} />
          <TrustMarquee />
          <ProblemSection />
          <AboutSection onAuditClick={() => openAuditModal()} />
          <BusinessesSection onSelectBusinessType={handleBusinessTypeSelect} />
          <ServicesSection onAuditClick={handleServiceModalAudit} />
          <WorkSection />
          <MethodSection />
          <WhySection />
          <PackagesSection
            onSelectPackage={(pkg) =>
              openAuditModal({ packageInterest: pkg })
            }
          />
          <FaqSection />
          <ContactSection
            preselectedService={selectedService}
            preselectedBusinessType={selectedBusinessType}
            onOpenAuditModal={() => openAuditModal()}
          />
        </main>

        <Footer />
        <WhatsAppButton hidden={auditModalOpen || mobileMenuOpen} />

        <AuditModal
          isOpen={auditModalOpen}
          onClose={closeAuditModal}
          initialBusinessType={modalBusinessType}
          packageInterest={modalPackage}
        />
      </div>
    </MotionConfig>
  );
}
