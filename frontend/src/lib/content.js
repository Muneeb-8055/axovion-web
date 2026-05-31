export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_137b2a28-eae0-47d2-9d98-373dabc9cc03/artifacts/hbqa2d49_logo.jpg';
export const BRAND_NAME = 'Axovion.io';
export const BRAND_TAGLINE = 'Automate to Win';

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/axovion.io?igsh=MW9ieGpvbnQ0enoybw==',
  facebook: 'https://www.facebook.com/share/18tybvyFQ9/',
  facebookPage: 'https://www.facebook.com/share/1LpN7Ao1fe/',
  youtube: 'https://www.youtube.com/@Axovion_io',
  twitter: 'https://x.com/Axovionio',
  linkedin: 'https://www.linkedin.com/in/axovion-io-610489409',
  reddit: 'https://www.reddit.com/user/Aggressive-Raise-635/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button',
};

export const SERVICES = [
  {
    slug: 'ai-audit',
    icon: 'ClipboardCheck',
    title: 'Free AI Audit',
    short: 'Workflow automation map + ROI estimate + recommended agents — delivered in 24h.',
    full: 'A deep-dive scan of your business that produces a custom automation map, ROI/savings projections, recommended AI agents, and an implementation timeline.',
    bullets: [
      'Workflow automation map',
      'Estimated ROI & monthly savings',
      'Recommended AI agents',
      'Implementation timeline',
    ],
    industries: ['All industries'],
  },
  {
    slug: 'support-chatbots',
    icon: 'MessageSquareBot',
    title: 'Customer Support Chatbots',
    short: 'Website, WhatsApp & custom channel agents that handle 70-90% of support tickets.',
    full: 'Production-grade AI chatbots trained on your knowledge base, integrated with your helpdesk, deployable on web + WhatsApp + custom channels.',
    bullets: [
      'Website + WhatsApp + custom channels',
      'Knowledge base ingestion',
      'Helpdesk handoff (Gorgias, Zendesk, Intercom)',
      '24/7 instant response',
    ],
    industries: ['E-commerce', 'SaaS', 'Healthcare', 'Services'],
  },
  {
    slug: 'lead-followup',
    icon: 'Zap',
    title: 'Lead Generation & Follow-Up',
    short: 'Never miss a lead. AI captures, qualifies, and follows up across channels until they convert or opt out.',
    full: 'Multi-channel lead capture + automated qualification + persistent follow-up sequences with CRM sync.',
    bullets: [
      'Capture leads from any channel',
      'Automated qualification',
      'Persistent follow-up sequences',
      'CRM sync (HubSpot, Salesforce, Pipedrive)',
    ],
    industries: ['Real estate', 'Agencies', 'B2B'],
  },
  {
    slug: 'booking-automation',
    icon: 'CalendarClock',
    title: 'Booking Automation',
    short: 'Bookings, reminders, reschedules and no-show recovery — all handled by AI.',
    full: 'AI scheduling agents that book, remind, reschedule, and recover no-shows automatically with calendar integration.',
    bullets: [
      'Calendar integration',
      'Reminder sequences',
      'Rescheduling handling',
      'No-show reduction',
    ],
    industries: ['Clinics', 'Salons', 'Service businesses'],
  },
  {
    slug: 'ecommerce-support',
    icon: 'ShoppingCart',
    title: 'E-Commerce Support',
    short: 'Order tracking, returns, recommendations — AI handles it all so your team can scale.',
    full: 'Specialized AI agents for ecom: order tracking, return/refund handling, product recommendations, cart abandonment recovery.',
    bullets: [
      'Order tracking',
      'Return/refund handling',
      'Product recommendations',
      'Cart abandonment recovery',
    ],
    industries: ['E-commerce', 'DTC brands'],
  },
  {
    slug: 'cart-recovery',
    icon: 'PackageSearch',
    title: 'Abandoned Cart Recovery',
    short: 'Multi-channel AI follow-up that recovers 15-30% of abandoned carts on autopilot.',
    full: 'Personalized multi-channel cart recovery sequences with discount-offer logic and revenue tracking.',
    bullets: [
      'Multi-channel follow-up',
      'Personalized messaging',
      'Discount offer logic',
      'Revenue recovery tracking',
    ],
    industries: ['E-commerce'],
  },
  {
    slug: 'consulting',
    icon: 'Compass',
    title: 'AI Consulting &amp; Strategy',
    short: 'AI readiness assessment, custom architecture, team training, ongoing optimization.',
    full: 'End-to-end AI strategy: readiness assessment, custom agent architecture design, team training, ongoing optimization retainer.',
    bullets: [
      'AI readiness assessment',
      'Custom agent architecture',
      'Team training',
      'Ongoing optimization',
    ],
    industries: ['Mid-market', 'Enterprise'],
  },
];

export const TESTIMONIALS = [
  {
    name: 'Sarah K.',
    role: 'Founder, DTC Skincare Brand',
    quote: 'Axovion built a chatbot that handles 82% of our support tickets and the team finally has time to actually grow the business. Response time went from 14h to instant.',
    metric: '82% tickets auto-resolved',
  },
  {
    name: 'Marcus T.',
    role: 'Director, Real Estate Agency',
    quote: 'We were drowning in unfollowed leads. Their AI follow-up agent recovers cold leads we would have lost. 40% more booked viewings in 60 days.',
    metric: '+40% booked viewings',
  },
  {
    name: 'Dr. Priya R.',
    role: 'Owner, Multi-location Clinic',
    quote: 'The AI Audit alone showed us $14K/month we were leaking on missed appointments. Their booking agent paid for itself in 3 weeks.',
    metric: '$14K/mo recovered',
  },
];

export const CASE_STUDIES = [
  {
    industry: 'E-Commerce',
    challenge: '500+ support tickets daily, 24h response time hurting retention',
    solution: 'Custom AI chatbot + WhatsApp agent integrated with Shopify + Gorgias',
    results: [
      { label: 'Tickets automated', value: 82, suffix: '%' },
      { label: 'Response time', value: 2, suffix: ' min', from: '14 hours' },
      { label: 'Monthly savings', value: 12000, prefix: '$', suffix: '+' },
    ],
    quote: 'Game changer. We doubled order volume without hiring a single new support rep.',
    quoteName: 'Sarah K., DTC Brand',
  },
  {
    industry: 'Real Estate',
    challenge: 'Leads going cold, missed appointments, manual qualification eating reps\' time',
    solution: 'Lead capture bot + booking automation + multi-channel follow-up sequences',
    results: [
      { label: 'Lead response rate', value: 3, suffix: 'x' },
      { label: 'More bookings', value: 40, suffix: '%' },
      { label: 'Hours saved/week', value: 15, suffix: '' },
    ],
    quote: 'Our agents finally close instead of chasing. Pipeline never stops moving.',
    quoteName: 'Marcus T., Agency Director',
  },
  {
    industry: 'Healthcare',
    challenge: 'Booking chaos, 30% no-show rate, staff burnout from manual scheduling',
    solution: 'AI booking bot + smart reminders + automatic rescheduling',
    results: [
      { label: 'No-show reduction', value: 60, suffix: '%' },
      { label: 'Staff hours saved', value: 20, suffix: '/wk' },
      { label: 'Patient NPS', value: 38, prefix: '+' },
    ],
    quote: 'Patients love it. Staff loves it. Revenue is up. There\'s no downside.',
    quoteName: 'Dr. Priya R., Clinic Owner',
  },
];

export const BLOG_POSTS = [
  {
    slug: 'ai-chatbots-ecommerce-hours-saved',
    category: 'Case Studies',
    title: 'How AI Chatbots Save E-Commerce Brands 20+ Hours a Week',
    excerpt: 'A breakdown of where the hours actually come from — and the 3 chatbot patterns that drive real ROI.',
    date: '2026-05-08',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
  {
    slug: 'real-cost-slow-lead-response',
    category: 'Strategy',
    title: 'The Real Cost of Slow Lead Response (And How to Fix It)',
    excerpt: 'Inside numbers: every minute past the 5-minute mark drops your close rate by ~10%. Here\'s how to fix it permanently.',
    date: '2026-05-01',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
  {
    slug: '5-workflows-clinics-automate-2026',
    category: 'Strategy',
    title: '5 Workflows Every Clinic Should Automate in 2026',
    excerpt: 'Booking, reminders, intake, follow-ups, reactivation — the exact 5 workflows we install for every clinic client.',
    date: '2026-04-22',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
  {
    slug: 'why-most-ai-projects-fail',
    category: 'Strategy',
    title: 'Why Most AI Projects Fail (And How We Avoid It)',
    excerpt: 'The 4 traps that kill AI initiatives, and the deployment playbook we use to ship in days instead of quarters.',
    date: '2026-04-15',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
  {
    slug: 'daily-ai-content-agent-behind-scenes',
    category: 'Tools',
    title: 'Building a Daily AI Content Agent: Behind the Scenes',
    excerpt: 'The exact stack, prompts, and orchestration that publishes daily content from one prompt + zero human edits.',
    date: '2026-04-08',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
  {
    slug: 'workflow-automation-examples',
    category: 'Trends',
    title: '10 Workflow Automation Examples That Pay Back in 30 Days',
    excerpt: 'Quick-win automations — lead routing, abandoned cart, reminder loops, FAQ deflection — that pay for themselves fast.',
    date: '2026-04-01',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=800',
  },
];

export const VALUES = [
  { title: 'ROI First', description: 'If it doesn\'t save money or time, we don\'t build it. Every agent ships with a tracked return.' },
  { title: 'Speed', description: 'Deploy in days, not quarters. Most AI agents are live and earning within 2 weeks.' },
  { title: 'Transparency', description: 'You own your agents. No black boxes. We hand over keys, configs, and full docs.' },
  { title: 'Partnership', description: 'We grow with you. Quarterly optimization, not deliver-and-disappear.' },
];

export const TIMELINE = [
  { year: '2023', title: 'Started building AI agents', description: 'Founded with a thesis: most repetitive business work is AI-automatable today.' },
  { year: '2024', title: 'First production deployment', description: 'Shipped customer-support agent for a DTC brand. 80% deflection, paid back in 2 weeks.' },
  { year: '2025', title: '100+ demos delivered', description: 'Refined the playbook across e-commerce, real estate, healthcare, and agencies.' },
  { year: '2026', title: 'Axovion.io launched', description: 'Productized our process: AI Audit → Build → Operate. Same outcomes, faster.' },
];

export const FAQ_CHIPS = [
  'How long does implementation take?',
  'What industries do you serve?',
  'How much does it cost?',
  'Is my data secure?',
  'What is the AI Audit?',
];
