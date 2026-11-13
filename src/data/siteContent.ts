/**
 * HotelStory Centralized Content & Placeholder Registry
 * ---------------------------------------------------
 * All imagery, statistics, case studies, testimonials, packages,
 * founder details, and contact links live here so you can swap
 * placeholders for live client assets in minutes.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroMiniStat {
  title: string;
  subtitle: string;
}

export interface ProblemItem {
  index: string;
  title: string;
  description: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  types: string[];
  image: string; // PLACEHOLDER: Replace with category photography
  imageAlt: string;
  iconName:
    | 'Utensils'
    | 'Coffee'
    | 'Martini'
    | 'BedDouble'
    | 'Sparkles'
    | 'Compass';
}

export interface ServiceItem {
  id: string;
  title: string;
  benefit: string;
  description: string;
  deliverables: string[];
  iconName:
    | 'CalendarRange'
    | 'Clapperboard'
    | 'Camera'
    | 'Users'
    | 'MapPin'
    | 'TrendingUp';
}

export interface MethodStep {
  step: string;
  title: string;
  headline: string;
  description: string;
  outcome: string;
}

export type WorkCategory =
  | 'Dining'
  | 'Café'
  | 'Nightlife'
  | 'Stay'
  | 'Events';

export interface SampleWorkItem {
  id: string;
  category: WorkCategory;
  conceptLabel: string;
  title: string;
  caption: string;
  mediaType: 'image' | 'video';
  thumbnail: string; // PLACEHOLDER: Replace with your image or video thumbnail
  imageAlt: string;
  videoUrl?: string; // PLACEHOLDER: Add Reel or video link when ready
}

export interface PackageTier {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;
  featured?: boolean;
  features: string[];
  ctaLabel: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ============================================================
// PLACEHOLDER IMAGES (Generated assets ready to swap anytime)
// ============================================================
export const SITE_IMAGES = {
  heroBackground: '/src/assets/images/hero_luxury_hotel_1794568667869.jpg',
  whyEditorialLobby: '/src/assets/images/why_hotelstory_editorial_1794568669247.jpg',
  founderPortrait: '/assets/aistudio/WhatsApp_Image_2026-11-13_at_19.11.26_758b6730.jpeg',
  caseStudyResort: '/src/assets/images/case_study_resort_1794568667479.jpg',
  caseStudyRestaurant: '/src/assets/images/case_study_restaurant_1794568668333.jpg',
  caseStudyVilla: '/src/assets/images/case_study_boutique_stay_1794568669249.jpg',
  // Businesses We Serve Category Hover Images (PLACEHOLDER: Easy to replace)
  categoryDining: '/src/assets/images/case_study_restaurant_1794568668333.jpg',
  categoryCafe: '/src/assets/images/category_cafe_1794568998604.jpg',
  categoryNightlife: '/src/assets/images/category_nightlife_1794569000186.jpg',
  categoryStay: '/src/assets/images/case_study_boutique_stay_1794568669249.jpg',
  categoryEvents: '/src/assets/images/category_events_1794568999836.jpg',
  categoryExperiences: '/src/assets/images/case_study_resort_1794568667479.jpg',
};

// ============================================================
// NAVIGATION
// ============================================================
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Our Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact Us', href: '#contact' },
];

// ============================================================
// HERO
// ============================================================
export const HERO_CONTENT = {
  eyebrow: 'Social media marketing for hospitality & entertainment',
  headline: 'We Make Your Business the #1 Name in Your City.',
  subheadline:
    'HotelStory turns restaurants, hotels, cafés, bars, clubs and venues into the brands everyone talks about, follows and visits.',
  primaryCta: 'Get Your Free Social Audit',
  secondaryCta: 'See Our Work',
  miniStats: [
    {
      title: 'Hospitality-only focus',
      subtitle:
        'Built exclusively for restaurants, cafés, bars, hotels and venues.',
    },
    {
      title: 'Free audit in 24 hours',
      subtitle:
        'An honest, actionable review of your Instagram with zero obligation.',
    },
    {
      title: 'Booking-led content',
      subtitle:
        'Reels and stills crafted around guest desire and footfall.',
    },
  ] as HeroMiniStat[],
};

// ============================================================
// TRUST MARQUEE
// ============================================================
export const MARQUEE_CATEGORIES: string[] = [
  'Restaurants',
  'Fine Dining',
  'Cafés',
  'Bakeries',
  'Pubs',
  'Bars',
  'Lounges',
  'Nightclubs',
  'Hotels',
  'Resorts',
  'Boutique Hotels',
  'Banquet Halls',
  'Wedding Venues',
  'Event Spaces',
];

// ============================================================
// THE PROBLEM
// ============================================================
export const PROBLEM_ITEMS: ProblemItem[] = [
  {
    index: '01',
    title: 'Dependence on OTAs & aggregators eating your margins',
    description:
      'Paying steep commissions on third-party platforms leaves revenue on the table while guests never build direct loyalty to your brand.',
  },
  {
    index: '02',
    title: 'Inconsistent, low-quality content',
    description:
      'Phone snapshots of empty tables, dimly lit cocktails, and sporadic posts fail to reflect the craftsmanship and atmosphere guests pay for.',
  },
  {
    index: '03',
    title: 'Competitors getting the attention you deserve',
    description:
      'Newer venues with half your soul are capturing your city’s weekend crowds, staycations, and private events simply because they own the feed.',
  },
];

// ============================================================
// BUSINESSES WE SERVE
// ============================================================
export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'dining',
    name: 'Dining',
    types: ['Restaurants', 'Fine Dining', 'Casual Dining'],
    image: SITE_IMAGES.categoryDining,
    imageAlt: 'Candlelit fine dining restaurant interior with plated dish and wine glass',
    iconName: 'Utensils',
  },
  {
    id: 'cafe',
    name: 'Café',
    types: ['Cafés', 'Coffee Shops', 'Bakeries'],
    image: SITE_IMAGES.categoryCafe,
    imageAlt: 'Warm sunlit specialty café and artisan bakery interior',
    iconName: 'Coffee',
  },
  {
    id: 'nightlife',
    name: 'Nightlife',
    types: ['Pubs', 'Bars', 'Lounges', 'Discos', 'Nightclubs'],
    image: SITE_IMAGES.categoryNightlife,
    imageAlt: 'Moody luxury rooftop cocktail lounge and nightlife bar',
    iconName: 'Martini',
  },
  {
    id: 'stay',
    name: 'Stay',
    types: ['Hotels', 'Resorts', 'Boutique Hotels'],
    image: SITE_IMAGES.categoryStay,
    imageAlt: 'Boutique luxury hotel suite overlooking the coastline',
    iconName: 'BedDouble',
  },
  {
    id: 'events',
    name: 'Events',
    types: ['Banquet Halls', 'Wedding Venues', 'Event Spaces'],
    image: SITE_IMAGES.categoryEvents,
    imageAlt: 'Grand candlelit wedding venue and luxury banquet hall',
    iconName: 'Sparkles',
  },
  {
    id: 'experiences',
    name: 'Experiences',
    types: ['Resorts', 'Destination Properties', 'Hospitality Experiences'],
    image: SITE_IMAGES.categoryExperiences,
    imageAlt: 'Sunlit destination resort courtyard and infinity plunge pool',
    iconName: 'Compass',
  },
];

// ============================================================
// SERVICES
// ============================================================
export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'social-media-management',
    title: 'Social Media Management',
    benefit:
      'Daily editorial curation, copywriting, and calendar stewardship that keeps your brand unmistakable.',
    description:
      'We manage your entire presence across Instagram, Facebook, and LinkedIn with a voice tailored to discerning guests—covering seasonal menus, nightlife nights, room offers, and event showcases.',
    deliverables: [
      'Monthly editorial content calendar & grid art direction',
      'Hospitality-trained copywriting & community engagement',
      'Story sequences engineered for DMs, table bookings & enquiries',
    ],
    iconName: 'CalendarRange',
  },
  {
    id: 'reels-short-form-video',
    title: 'Reels & Short-Form Video',
    benefit:
      'Cinematic 9:16 storytelling engineered for organic discovery, saves, and weekend footfall.',
    description:
      'Short-form video is how modern guests choose where to dine, drink, celebrate, and stay. We script, direct, and edit pacing-perfect Reels that capture the sensory energy of your venue.',
    deliverables: [
      'Hook-driven creative scripting tailored to local & travel intent',
      'Color-graded 4K vertical edits with sound design',
      'Trend adaptation filtered through a refined brand lens',
    ],
    iconName: 'Clapperboard',
  },
  {
    id: 'photo-video-shoots',
    title: 'Photo & Video Shoots',
    benefit:
      'On-site production days capturing signature dishes, cocktails, suites, celebrations, and atmosphere.',
    description:
      'Our production crew visits your venue with a shot list built around conversion—delivering a multi-month library of architectural stills and motion assets.',
    deliverables: [
      'Pre-production moodboards & culinary / venue styling direction',
      'Full-day on-site photography & cinema-line video capture',
      'Retouched high-resolution asset vault for social & web',
    ],
    iconName: 'Camera',
  },
  {
    id: 'influencer-creator-collaborations',
    title: 'Influencer & Creator Collaborations',
    benefit:
      'Vetted culinary, nightlife, lifestyle, and travel creators who drive genuine local buzz and bookings.',
    description:
      'We handle creator vetting, aesthetic alignment, usage rights, and hosted visit briefs so every collaboration generates measurable profile visits, packed tables, and bookings.',
    deliverables: [
      'Curated creator shortlists matched to your guest demographic',
      'Hosted experience management & deliverable contracts',
      'Post-campaign reach, saves, and booking-link tracking',
    ],
    iconName: 'Users',
  },
  {
    id: 'local-seo-reputation',
    title: 'Local SEO & Reputation',
    benefit:
      'Dominate Google Maps, local search packs, and guest review sentiment across your city.',
    description:
      'When guests search "best fine dining," "rooftop bar near me," or "wedding venue in the city," your brand should appear first with glowing photography and thoughtful review responses.',
    deliverables: [
      'Google Business Profile optimization & geo-tagged media',
      'TripAdvisor, Zomato & Google review response playbooks',
      'Local keyword positioning for dining, nightlife, stays & events',
    ],
    iconName: 'MapPin',
  },
  {
    id: 'paid-ads-lead-generation',
    title: 'Paid Ads & Lead Generation',
    benefit:
      'Precision Meta and Google campaigns turning high-intent locals and travelers into reservations and venue leads.',
    description:
      'We pair high-craft hospitality creative with hyper-targeted regional audiences—filling mid-week dinner tables, club nights, staycations, and banquet calendars.',
    deliverables: [
      'Full-funnel Meta & Google Search booking campaigns',
      'Retargeting sequences for website & Instagram engagers',
      'WhatsApp, table reservation & wedding lead tracking',
    ],
    iconName: 'TrendingUp',
  },
];

// ============================================================
// THE HOTELSTORY METHOD
// ============================================================
export const METHOD_STEPS: MethodStep[] = [
  {
    step: '01',
    title: 'Audit',
    headline: 'Deep-Dive Brand & Market Audit',
    description:
      'We look closely at your current Instagram presence, Google Maps listing, booking flow, and local competitors to find immediate improvements.',
    outcome: 'Clear gap report & positioning plan',
  },
  {
    step: '02',
    title: 'Strategy',
    headline: 'Bespoke Visual & Booking Blueprint',
    description:
      'We define your visual tone, content pillars, creator ideas, and ad plan around your highest-margin tables, rooms, and events.',
    outcome: 'Focused content & enquiry roadmap',
  },
  {
    step: '03',
    title: 'Execution',
    headline: 'Production, Publishing & Campaigns',
    description:
      'Our creative team shoots on-site, edits vertical Reels, manages daily storytelling, and runs targeted local campaigns without burdening your staff.',
    outcome: 'Consistent, unmistakable brand presence',
  },
  {
    step: '04',
    title: 'Dominate',
    headline: 'Consistent Growth & Clear Reporting',
    description:
      'Every month we review what actually brought profile visits and enquiries—doubling down on winning formats and keeping your brand top-of-mind.',
    outcome: 'Stronger local demand & direct bookings',
  },
];

// ============================================================
// OUR WORK (SAMPLE CONCEPTS)
// PLACEHOLDER: Swap thumbnails and captions with your sample work
// ============================================================
export const WORK_FILTER_CATEGORIES: ('All' | WorkCategory)[] = [
  'All',
  'Dining',
  'Café',
  'Nightlife',
  'Stay',
  'Events',
];

export const SAMPLE_WORK_ITEMS: SampleWorkItem[] = [
  {
    id: 'concept-cafe',
    category: 'Café',
    conceptLabel: 'Sample concept: Café',
    title: 'Morning Pour & Croissant Ritual',
    caption:
      'A 12-second sensory Reel pairing steam, sunlight, and crisp ASMR audio to make your café the weekend breakfast spot people save and share.',
    mediaType: 'video',
    thumbnail: SITE_IMAGES.categoryCafe,
    imageAlt: 'Warm sunlit specialty café and artisan bakery counter',
  },
  {
    id: 'concept-stay',
    category: 'Stay',
    conceptLabel: 'Sample concept: Boutique Hotel',
    title: 'Golden Hour Suite Walkthrough',
    caption:
      'Editorial still and vertical room-tour series built to sell the feeling of waking up at your property—not just the bed size and tariff.',
    mediaType: 'video',
    thumbnail: SITE_IMAGES.categoryStay,
    imageAlt: 'Boutique hotel suite overlooking the coastline at sunset',
  },
  {
    id: 'concept-dining',
    category: 'Dining',
    conceptLabel: 'Sample concept: Fine Dining',
    title: 'Table-Side Craft & Chef Story',
    caption:
      'Close-up plating and candlelight photography designed to turn casual food-lovers into mid-week dinner reservations.',
    mediaType: 'image',
    thumbnail: SITE_IMAGES.categoryDining,
    imageAlt: 'Candlelit fine dining restaurant table with plated dish and wine',
  },
  {
    id: 'concept-nightlife',
    category: 'Nightlife',
    conceptLabel: 'Sample concept: Cocktail Lounge',
    title: 'After-Dark Energy & Signature Pours',
    caption:
      'Fast-cut bar Reels capturing ice, flame, crowd energy, and DJ atmosphere so guests know where Friday night starts.',
    mediaType: 'video',
    thumbnail: SITE_IMAGES.categoryNightlife,
    imageAlt: 'Luxury rooftop cocktail lounge and nightlife bar at night',
  },
  {
    id: 'concept-events',
    category: 'Events',
    conceptLabel: 'Sample concept: Wedding Venue',
    title: 'Before the Guests Arrive',
    caption:
      'A dramatic reveal carousel contrasting an empty banquet courtyard with candlelit evening grandeur to attract high-intent wedding enquiries.',
    mediaType: 'image',
    thumbnail: SITE_IMAGES.categoryEvents,
    imageAlt: 'Grand candlelit wedding venue and luxury banquet hall setup',
  },
  {
    id: 'concept-resort',
    category: 'Stay',
    conceptLabel: 'Sample concept: Destination Resort',
    title: 'The Slow Weekend Escape',
    caption:
      'Poolside lifestyle frames and crisp copy built for city travelers scrolling on Thursday night looking for a weekend drive-out stay.',
    mediaType: 'image',
    thumbnail: SITE_IMAGES.caseStudyResort,
    imageAlt: 'Sunlit destination resort courtyard and turquoise plunge pool',
  },
];

// ============================================================
// WHY HOTELSTORY
// ============================================================
export const WHY_DIFFERENTIATORS: { title: string; detail: string }[] = [
  {
    title: 'Hospitality & entertainment focus',
    detail:
      'We don’t market SaaS tools or generic retail. Every frame, caption, and funnel we build is rooted in how guests choose where to eat, drink, celebrate, and stay.',
  },
  {
    title: 'Content built to drive bookings & footfall',
    detail:
      'Aesthetic feeds alone don’t fill tables or suites. We pair editorial taste with clear hooks, offer architecture, and frictionless WhatsApp and reservation paths.',
  },
  {
    title: 'City-level dominance strategy',
    detail:
      'From local map packs to regional creators, we engineer omnipresence so anyone searching your destination encounters your brand first.',
  },
  {
    title: 'Transparent monthly reporting',
    detail:
      'No vanity fluff. Every month you see reach, profile actions, direct enquiry volume, ad spend efficiency, and next month’s creative priorities.',
  },
  {
    title: 'A dedicated creative team',
    detail:
      'Strategists, hospitality filmmakers, editors, and paid media buyers working as an extension of your leadership team.',
  },
];

// ============================================================
// PACKAGES
// ============================================================
export const PACKAGE_TIERS: PackageTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Editorial consistency for cafés, bakeries & boutique venues.',
    idealFor: 'Cafés, casual dining, B&Bs & independent lounges',
    features: [
      '12 curated posts & Reels per month',
      'Monthly content calendar & hospitality copywriting',
      'Stories cadence & highlight architecture',
      'Google Business Profile optimization',
      'Monthly performance & enquiry summary',
    ],
    ctaLabel: 'Book a Call',
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'Full-funnel social, production & paid demand.',
    idealFor: 'Restaurants, bars, clubs, boutique hotels & wedding venues',
    featured: true,
    features: [
      '20 high-craft Reels, carousels & editorial posts/month',
      'Quarterly on-site photo & cinema video shoot',
      'Targeted Meta & Google direct-booking ad management',
      'Vetted creator & influencer collaboration management',
      'Active reputation & local SEO growth playbook',
      'Bi-weekly strategy sync & transparent ROI dashboard',
    ],
    ctaLabel: 'Book a Call',
  },
  {
    id: 'dominator',
    name: 'Dominator',
    tagline: 'Complete city-wide authority for flagship brands.',
    idealFor: 'Luxury resorts, hospitality groups, nightclubs & grand banquets',
    features: [
      '30+ omnichannel assets/month across venues & outlets',
      'Monthly on-site creative direction & production days',
      'Multi-campaign paid media for stays, tables, events & weddings',
      'Tier-1 culinary, nightlife & travel creator hosting campaigns',
      'Dedicated creative director & priority turnaround',
      'Custom attribution reporting & executive quarterly reviews',
    ],
    ctaLabel: 'Book a Call',
  },
];

// ============================================================
// ABOUT / FOUNDER
// PLACEHOLDER: Replace founder portrait image in SITE_IMAGES when ready
// ============================================================
export const ABOUT_CONTENT = {
  eyebrow: 'Meet the Founder',
  headline: 'Great Hospitality Deserves to Be Seen.',
  paragraphs: [
    'I started HotelStory after noticing the same pattern everywhere I went: great hotels, cafés, restaurants, and venues were invisible online while average ones got all the attention.',
    'I believe every property has a story worth telling—and the right story, told consistently through thoughtful visuals and clear positioning, makes a brand the #1 name in its city.',
    'What you can expect from me is simple and honest: a free social audit before we ever talk retainers, clear reporting you can actually read, and no long lock-in contracts.',
  ],
  founderName: 'Sarvesh Lotankar',
  founderTitle: 'Founder & Brand Strategist',
  founderFullTitle: 'Founder & Brand Strategist, HotelStory',
  signatureText: 'Sarvesh Lotankar',
  ctaLabel: 'Talk to Sarvesh',
};

// ============================================================
// FREE AUDIT DELIVERABLES (CONTACT SECTION)
// ============================================================
export const FREE_AUDIT_POINTS: string[] = [
  "What's working on your Instagram now",
  '3 fixes to get more reach',
  'A content idea tailored to your business',
];

// ============================================================
// FAQ
// ============================================================
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How soon will we see progress after starting?',
    answer:
      'You will see an immediate step up in visual quality, consistency, and profile clarity in your first month. Organic reach and direct enquiry momentum build steadily as we test hooks, publish Reels, and learn what your local audience saves and messages about.',
  },
  {
    question: 'Do you work with only one brand per city or micro-market?',
    answer:
      'Yes—for direct competitors in the same category and micro-market (such as two fine-dining restaurants on the same street or two boutique hotels on the same stretch), we offer category exclusivity so we are never competing against ourselves.',
  },
  {
    question: 'What platforms do you manage?',
    answer:
      'Our core focus is Instagram (Reels, Carousels, Stories), Facebook, YouTube Shorts, and Google Business Profile—the exact channels where hospitality and nightlife discovery happen. LinkedIn for corporate banquets and Pinterest for wedding venues are included in Growth and Dominator tiers.',
  },
  {
    question: 'How do on-site photo and video shoots work?',
    answer:
      'Our production crew schedules a structured 1-to-2 day shoot at your venue using an approved shot list covering hero dishes, drinks, ambiance, rooms, event setups, and team warmth. Between shoot days, we also coach your team on capturing effortless real-time moments.',
  },
  {
    question: 'How is pricing structured?',
    answer:
      'Because an artisan café or cocktail lounge has very different production and ad needs from a multi-room resort or grand wedding venue, we tailor retainers after your free social audit and discovery call. No hidden fees, and ad spend goes directly to the platforms.',
  },
  {
    question: 'Are there long lock-in contracts?',
    answer:
      'No. We work on flexible monthly retainers with no long lock-in contracts. You stay with us because the content, communication, and reporting deliver real value for your business.',
  },
];

// ============================================================
// CONTACT DETAILS
// PLACEHOLDER: Replace with live HotelStory contact info
// ============================================================
export const CONTACT_INFO = {
  email: 'hello@hotelstory.agency', // PLACEHOLDER
  phoneDisplay: '+91 81044 68397',
  phoneHref: 'tel:+918104468397',
  whatsappNumber: '918104468397',
  whatsappPrefill:
    'Hi HotelStory, I would like to request a free social media audit for my brand.',
  facebookUrl: 'https://www.facebook.com/people/HotelStory-Hospitality-Marketing-Agency/61596695273637/',
  instagramUrl: 'https://www.instagram.com/hotelstory.mkt/',
  youtubeUrl: 'https://www.youtube.com/@onlyHotelStory',
  linkedinUrl: 'https://www.linkedin.com/company/hotelstory-hospitality-marketing-agency',
  studioLocation: 'Mumbai · Goa · Dubai · Worldwide', // PLACEHOLDER
};
