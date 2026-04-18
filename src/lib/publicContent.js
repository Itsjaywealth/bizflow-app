import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  FileCheck2,
  FileText,
  Flag,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  Map,
  Newspaper,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

export const publicPageLinks = {
  features: '/features',
  pricing: '/pricing',
  changelog: '/changelog',
  roadmap: '/roadmap',
  about: '/about',
  blog: '/blog',
  careers: '/careers',
  privacy: '/privacy',
  terms: '/terms',
  privacyCookies: '/privacy-cookies',
  how: '/how-it-works',
  refund: '/refund-policy',
}

export const publicContentPages = {
  features: {
    path: publicPageLinks.features,
    title: 'Features',
    seoTitle: 'BizFlow NG Features — Invoicing, Payroll, HR, Reports, and Client Operations',
    description:
      'Explore the full BizFlow NG feature set for Nigerian SMEs, from invoicing and payroll to staff records, analytics, and day-to-day business operations.',
    eyebrow: 'Product Overview',
    headline: 'Everything your team needs to run operations with more clarity',
    subheadline:
      'BizFlow NG combines invoicing, payroll, HR, reporting, client management, and everyday business workflows in one polished operating system.',
    heroHighlights: ['Invoices', 'Clients', 'Staff & HR', 'Payroll', 'Reports', 'Settings'],
    sections: [
      {
        id: 'operations-core',
        title: 'Built for the real operational heartbeat of a growing business',
        body:
          'The platform is designed around what small and mid-sized teams actually do every week: issue invoices, follow up payments, monitor staff records, track spending, and make decisions from live business data.',
        cards: [
          {
            icon: FileText,
            title: 'Smart invoicing workflow',
            body: 'Create invoices, add clients on the fly, share payment links, export PDFs, and keep collections moving without extra admin work.',
          },
          {
            icon: Users,
            title: 'Client relationship memory',
            body: 'Store client contacts, payment terms, invoice history, and notes so follow-ups feel coordinated instead of scattered.',
          },
          {
            icon: TrendingUp,
            title: 'Revenue and cash-flow visibility',
            body: 'See what has been paid, what is still outstanding, and which trends are helping or hurting your cash position.',
          },
        ],
      },
      {
        id: 'team-and-control',
        title: 'Operational control without adding extra tools',
        body:
          'BizFlow NG keeps payroll, staff records, reporting, and admin controls connected, so leaders can move from insight to action faster.',
        bullets: [
          'Staff directory with employment, payroll, leave, and attendance records',
          'Nigerian payroll support with PAYE, pension, NHF, and payslip workflows',
          'Reports and analytics covering invoices, revenue, clients, and payroll trends',
          'Settings, integrations, notifications, and workspace controls in one place',
        ],
      },
      {
        id: 'launch-faster',
        title: 'Launch quickly, scale confidently',
        body:
          'New teams do not need a long setup before seeing value. Start with one client and one invoice, then expand into a fuller operating rhythm as the business grows.',
        cards: [
          {
            icon: Rocket,
            title: 'Fast onboarding',
            body: 'Create a workspace, enter your business profile, and start issuing invoices without waiting on a complex setup project.',
          },
          {
            icon: ShieldCheck,
            title: 'Professional trust signals',
            body: 'Clean invoice experiences, branded documents, secure auth, and polished settings help teams operate with more confidence.',
          },
        ],
      },
    ],
    cta: {
      title: 'See the full product in motion',
      body: 'Create your workspace, explore the modules, and move from setup to live operations in a guided flow.',
      primary: { label: 'Start your 14-day free trial', to: '/signup' },
      secondary: { label: 'Compare plans', to: '/pricing' },
    },
  },
  pricing: {
    path: publicPageLinks.pricing,
    title: 'Pricing',
    seoTitle: 'BizFlow NG Pricing — Plans for Nigerian SMEs',
    description:
      'Compare BizFlow NG pricing for Nigerian businesses and choose the plan that matches your invoicing, payroll, reporting, and team operations needs.',
    eyebrow: 'Pricing',
    headline: 'Simple plans built for growing Nigerian businesses',
    subheadline:
      'Choose the plan that matches your current stage, then scale up as your operations become more complex and your team grows.',
    heroHighlights: ['Starter', 'Growth', 'Enterprise-ready'],
    sections: [
      {
        id: 'plan-grid',
        title: 'Choose the pace that fits your business',
        body:
          'Every plan keeps the product polished and practical. The main difference is how much operational depth and team support you need.',
        cards: [
          {
            icon: Sparkles,
            title: 'Starter — ₦5,000 / month',
            body: 'Ideal for solo operators and lean teams focused on client management, invoicing, and professional payment follow-up.',
          },
          {
            icon: TrendingUp,
            title: 'Growth — ₦15,000 / month',
            body: 'Best for businesses that now need payroll, reports, staff records, better analytics, and a stronger operating cadence.',
          },
          {
            icon: Globe2,
            title: 'Enterprise — custom',
            body: 'Designed for multi-team operations that need higher-touch support, deeper controls, and tailored rollout guidance.',
          },
        ],
      },
      {
        id: 'what-you-get',
        title: 'What every plan is designed to improve',
        body:
          'BizFlow NG is priced around business outcomes, not feature clutter. The goal is to help teams get paid faster, make better decisions, and stay organized as they grow.',
        bullets: [
          'Professional invoice operations and payment clarity',
          'Client records that stay connected to live business work',
          'Team visibility, payroll support, and structured reporting on higher plans',
          'Cleaner onboarding, stronger support, and better operational confidence',
        ],
      },
    ],
    cta: {
      title: 'Choose a plan and start with confidence',
      body: 'You can start lean, then move into deeper payroll and reporting workflows when the business is ready.',
      primary: { label: 'Create your account', to: '/signup' },
      secondary: { label: 'Talk to support', to: '/support' },
    },
  },
  changelog: {
    path: publicPageLinks.changelog,
    title: 'Changelog',
    seoTitle: 'BizFlow NG Changelog — Product Improvements and Releases',
    description:
      'Track BizFlow NG product updates, improvements, launches, and quality upgrades across invoicing, payroll, analytics, design, and operations.',
    eyebrow: 'Changelog',
    headline: 'Product changes that matter to everyday business work',
    subheadline:
      'Follow what has improved in BizFlow NG, from workflow reliability and design upgrades to richer payroll, reporting, and operations tools.',
    heroHighlights: ['UI upgrades', 'Auth hardening', 'Reporting', 'AI workflows'],
    sections: [
      {
        id: 'latest-updates',
        title: 'Recent product milestones',
        body: 'We focus on updates that make the platform cleaner, more reliable, and more useful in real operational moments.',
        cards: [
          {
            icon: Rocket,
            title: 'New app shell and branded redesign',
            body: 'BizFlow NG now carries a more premium green brand system across public pages, app surfaces, and dark/light theme states.',
          },
          {
            icon: ShieldCheck,
            title: 'Auth and session hardening',
            body: 'Protected routes, callback handling, session persistence, and logout behavior were improved for a safer, more stable production experience.',
          },
          {
            icon: TrendingUp,
            title: 'Reports, payroll, and analytics expansion',
            body: 'The platform now includes richer reporting, payroll workflows, and stronger financial visibility for growing teams.',
          },
          {
            icon: Sparkles,
            title: 'BizFlow AI action workflows',
            body: 'BizFlow AI now suggests and confirms actions like invoice creation, reminder drafting, and reporting snapshots.',
          },
        ],
      },
      {
        id: 'how-we-ship',
        title: 'How changes are prioritized',
        body:
          'Our product direction focuses on high-trust fundamentals first: reliable auth, clean invoicing, stronger operational clarity, and lower-friction team workflows.',
        bullets: [
          'Reliability fixes before cosmetic polish when production trust is at stake',
          'Visibility and reporting improvements that help owners make faster decisions',
          'Feature work that reduces admin overhead instead of adding complexity',
        ],
      },
    ],
    cta: {
      title: 'See what is shipping next',
      body: 'Explore where the product is heading and which improvements are currently on deck.',
      primary: { label: 'View roadmap', to: '/roadmap' },
      secondary: { label: 'Start your workspace', to: '/signup' },
    },
  },
  roadmap: {
    path: publicPageLinks.roadmap,
    title: 'Roadmap',
    seoTitle: 'BizFlow NG Roadmap — What Is Coming Next',
    description:
      'See the BizFlow NG roadmap for upcoming features across operations, AI assistance, finance workflows, integrations, and team management.',
    eyebrow: 'Roadmap',
    headline: 'The next layer of operational intelligence for BizFlow NG',
    subheadline:
      'Our roadmap is focused on making the product smarter, more connected, and more action-oriented for business owners and operators.',
    heroHighlights: ['AI assistance', 'Automation', 'Integrations', 'Finance workflows'],
    sections: [
      {
        id: 'next-up',
        title: 'Near-term roadmap',
        body: 'These are the areas we expect to deepen next as BizFlow NG matures from an operations hub into a smarter business system.',
        cards: [
          {
            icon: Sparkles,
            title: 'AI assistant with richer execution',
            body: 'Deeper business context, more guided recommendations, and more safe confirmations around actions like follow-ups and reporting.',
          },
          {
            icon: BadgeCheck,
            title: 'Stronger billing and subscription workflows',
            body: 'Cleaner plan transitions, better payment method support, and stronger billing communication across the workspace.',
          },
          {
            icon: Globe2,
            title: 'Broader integrations',
            body: 'Improved support for payments, communication tools, and workflow automation platforms that reduce manual follow-up.',
          },
        ],
      },
      {
        id: 'product-direction',
        title: 'Longer-term direction',
        body:
          'The long-term vision is to make BizFlow NG feel like a confident operating layer for modern African businesses: practical, data-aware, and trustworthy.',
        bullets: [
          'Smarter operational recommendations grounded in live business activity',
          'More finance visibility across payroll, receivables, and profitability',
          'Better team workflows for growing operations, approvals, and accountability',
          'A cleaner public and in-app experience that feels premium at every step',
        ],
      },
    ],
    cta: {
      title: 'Build with the product as it grows',
      body: 'Start using BizFlow NG now, then keep benefiting as the roadmap unfolds into deeper automation and intelligence.',
      primary: { label: 'Create your account', to: '/signup' },
      secondary: { label: 'Explore features', to: '/features' },
    },
  },
  about: {
    path: publicPageLinks.about,
    title: 'About',
    seoTitle: 'About BizFlow NG — Business Operations Software Built for Nigerian Teams',
    description:
      'Learn what BizFlow NG is building, who it is for, and why the product focuses on helping Nigerian businesses run operations with more clarity and confidence.',
    eyebrow: 'About BizFlow NG',
    headline: 'We are building calmer, clearer business operations for ambitious teams',
    subheadline:
      'BizFlow NG exists to help business owners replace scattered workflows with one trusted platform for invoicing, payroll, clients, reporting, and daily operational control.',
    heroHighlights: ['Built for SMEs', 'Operations-first', 'Premium product quality'],
    sections: [
      {
        id: 'why',
        title: 'Why BizFlow NG exists',
        body:
          'Many businesses outgrow spreadsheets long before they can afford operational confusion. BizFlow NG is designed to close that gap with a clean product that makes everyday decisions easier.',
        cards: [
          {
            icon: HeartHandshake,
            title: 'Built for real business pressure',
            body: 'We care about the moments operators actually feel: chasing receivables, paying staff, preparing reports, and keeping clients organized.',
          },
          {
            icon: BookOpen,
            title: 'Designed to reduce noise',
            body: 'The experience is meant to feel structured and calm, not crowded with unnecessary complexity.',
          },
        ],
      },
      {
        id: 'beliefs',
        title: 'What we believe good business software should feel like',
        body:
          'The best SaaS products do more than store data. They help leaders think clearly, act quickly, and trust the system under pressure.',
        bullets: [
          'Clearer visibility beats feature overload',
          'Professional design creates trust and confidence',
          'Automation should reduce work without hiding important decisions',
          'Products for African businesses should feel world-class, not second-tier',
        ],
      },
    ],
    cta: {
      title: 'See the product in action',
      body: 'Start a workspace and experience how BizFlow NG turns daily operations into a more connected system.',
      primary: { label: 'Start your 14-day free trial', to: '/signup' },
      secondary: { label: 'Read the roadmap', to: '/roadmap' },
    },
  },
  blog: {
    path: publicPageLinks.blog,
    title: 'Blog',
    seoTitle: 'BizFlow NG Blog — Operations, Revenue, and Small Business Growth',
    description:
      'Read BizFlow NG insights on invoicing, cash flow, staff operations, productivity, and better business systems for Nigerian SMEs.',
    eyebrow: 'Blog',
    headline: 'Insights for operators who want clearer systems and healthier growth',
    subheadline:
      'The BizFlow NG blog covers invoicing, cash flow, team operations, and practical decisions that help businesses run with more confidence.',
    heroHighlights: ['Revenue', 'Cash flow', 'Operations', 'Growth'],
    sections: [
      {
        id: 'featured-posts',
        title: 'Featured reads',
        body: 'A few of the practical topics we are building out for founders, finance leads, and operations teams.',
        cards: [
          {
            icon: Newspaper,
            title: 'How to reduce overdue invoices before they become a cash-flow problem',
            body: 'A practical look at reminder timing, payment clarity, and follow-up systems that make collections easier.',
          },
          {
            icon: TrendingUp,
            title: 'What your dashboard should tell you in under two minutes',
            body: 'The core numbers that help owners understand revenue, receivables, expenses, and near-term pressure faster.',
          },
          {
            icon: Users,
            title: 'When a growing team needs more than spreadsheets',
            body: 'A guide to the operational signals that tell you it is time for a more structured business system.',
          },
        ],
      },
      {
        id: 'editorial-direction',
        title: 'What the blog is here to do',
        body:
          'We want the BizFlow NG blog to be useful, not noisy. Every piece should help teams understand operations more clearly and move toward better decisions.',
        bullets: [
          'Clear explanations instead of vague growth advice',
          'Practical examples rooted in small-business realities',
          'Thoughtful product and operations guidance for modern Nigerian teams',
        ],
      },
    ],
    cta: {
      title: 'Want product updates too?',
      body: 'Track what is shipping and where BizFlow NG is heading next.',
      primary: { label: 'Read the changelog', to: '/changelog' },
      secondary: { label: 'View roadmap', to: '/roadmap' },
    },
  },
  careers: {
    path: publicPageLinks.careers,
    title: 'Careers',
    seoTitle: 'Careers at BizFlow NG — Help Build Better Business Software',
    description:
      'Explore careers at BizFlow NG and learn how we think about product quality, operations, ownership, and building world-class SaaS for modern businesses.',
    eyebrow: 'Careers',
    headline: 'Join a team building more trustworthy business software',
    subheadline:
      'BizFlow NG cares deeply about product quality, operational clarity, and making ambitious businesses feel well supported. We want teammates who care about that too.',
    heroHighlights: ['Design quality', 'Product ownership', 'Operational empathy'],
    sections: [
      {
        id: 'working-here',
        title: 'How we want the work to feel',
        body:
          'We are drawn to people who care about craft, systems thinking, and helping customers feel more capable. That means thoughtful design, solid engineering, and real ownership.',
        cards: [
          {
            icon: Briefcase,
            title: 'High standards, low ego',
            body: 'We want a culture that values thoughtful shipping, honest feedback, and calm collaboration across disciplines.',
          },
          {
            icon: Users,
            title: 'Built with operators in mind',
            body: 'We learn from the real pressure points of business teams and turn that into clearer product experiences.',
          },
        ],
      },
      {
        id: 'roles',
        title: 'Current hiring focus',
        body:
          'We are especially interested in product-minded engineers, thoughtful designers, and operators who can raise the quality bar as the platform grows.',
        bullets: [
          'Frontend and full-stack engineers who care about polish and reliability',
          'Designers who can turn complexity into trust and clarity',
          'Operators who understand invoicing, payroll, finance, and team workflows',
        ],
      },
    ],
    cta: {
      title: 'Introduce yourself',
      body: 'Even if a formal role is not listed yet, we are happy to hear from people who align with the product and the mission.',
      primary: { label: 'Contact support', to: '/support' },
      secondary: { label: 'Learn about BizFlow NG', to: '/about' },
    },
  },
  privacy: {
    path: publicPageLinks.privacy,
    title: 'Privacy Policy',
    seoTitle: 'BizFlow NG Privacy Policy',
    description:
      'Read the BizFlow NG privacy policy to understand how account, business, invoice, client, staff, and product data are handled.',
    eyebrow: 'Privacy Policy',
    headline: 'How BizFlow NG handles business and account data',
    subheadline:
      'This policy explains what information BizFlow NG stores, how it is used, and what users should know about keeping business information accurate and secure.',
    heroHighlights: ['Account data', 'Business records', 'Operational security'],
    sections: [
      {
        id: 'information',
        title: 'Information the product may store',
        body:
          'BizFlow NG works by storing the operational records that help a business function in one place. That includes account information, business details, clients, invoices, products, expenses, staff records, and settings.',
        bullets: [
          'Account and authentication details',
          'Business profile and payment information entered by the user',
          'Client, invoice, payroll, expense, and reporting records',
          'Preference and notification settings needed for product behavior',
        ],
      },
      {
        id: 'usage',
        title: 'How information is used',
        body:
          'Data is used to deliver the app experience: sign-in, workspace loading, invoicing, reminders, reporting, payroll workflows, and product support.',
        cards: [
          {
            icon: LockKeyhole,
            title: 'Operational use only',
            body: 'The core purpose of stored data is to make your workspace function correctly and give you useful operational visibility.',
          },
          {
            icon: ShieldCheck,
            title: 'Security-aware handling',
            body: 'Authentication and storage are handled through Supabase-backed infrastructure, but users should still avoid unnecessary sensitive information in freeform notes.',
          },
        ],
      },
      {
        id: 'contact',
        title: 'Questions or privacy requests',
        body:
          'If you need corrections, clarifications, or privacy-related support, contact the BizFlow NG team through the official support channel.',
        bullets: ['Use the support page for privacy requests', 'Include your workspace or business name for faster help'],
      },
    ],
    cta: {
      title: 'Need clarification on data handling?',
      body: 'We want the product to feel trustworthy. If anything here is unclear, reach out and we will help.',
      primary: { label: 'Contact support', to: '/support' },
      secondary: { label: 'Read Privacy & Cookies', to: '/privacy-cookies' },
    },
  },
  terms: {
    path: publicPageLinks.terms,
    title: 'Terms of Service',
    seoTitle: 'BizFlow NG Terms of Service',
    description:
      'Read the BizFlow NG terms of service covering accounts, payments, responsibilities, product usage, and operational limits.',
    eyebrow: 'Terms of Service',
    headline: 'The basic rules for using BizFlow NG responsibly',
    subheadline:
      'These terms explain how BizFlow NG is intended to be used, what users are responsible for, and how product changes may evolve over time.',
    heroHighlights: ['Accounts', 'Responsibilities', 'Payments', 'Product updates'],
    sections: [
      {
        id: 'service-use',
        title: 'Using the service',
        body:
          'BizFlow NG is designed to help businesses manage invoices, clients, expenses, staff records, payroll, and related operational data. Users are responsible for the accuracy of the information entered into the system.',
        bullets: [
          'Keep login details private and secure',
          'Use the product lawfully and responsibly',
          'Review important records before sending them to customers or teams',
        ],
      },
      {
        id: 'payments',
        title: 'Payments and external links',
        body:
          'BizFlow NG may display bank details, external payment links, or invoice payment instructions. Businesses are responsible for validating and maintaining the payment methods they connect or display.',
        cards: [
          {
            icon: FileCheck2,
            title: 'Product-generated records',
            body: 'Invoices, PDFs, payment links, and reminders should be reviewed by the business before relying on them as final business communication.',
          },
          {
            icon: Scale,
            title: 'Product evolution',
            body: 'As BizFlow NG continues to improve, these terms may be updated to reflect new capabilities, billing models, or support processes.',
          },
        ],
      },
    ],
    cta: {
      title: 'Need a clearer answer before you continue?',
      body: 'If any part of these terms feels unclear, reach out and we will help explain the product expectations.',
      primary: { label: 'Contact support', to: '/support' },
      secondary: { label: 'Read privacy policy', to: '/privacy' },
    },
  },
  privacyCookies: {
    path: publicPageLinks.privacyCookies,
    title: 'Privacy & Cookies',
    seoTitle: 'BizFlow NG Privacy & Cookies',
    description:
      'Read how BizFlow NG uses cookies, analytics, and operational session data to keep the product working smoothly.',
    eyebrow: 'Privacy & Cookies',
    headline: 'How cookies and lightweight tracking support the product experience',
    subheadline:
      'BizFlow NG uses limited cookies and session data to keep users signed in, improve reliability, and understand product performance more clearly.',
    heroHighlights: ['Sessions', 'Preferences', 'Analytics'],
    sections: [
      {
        id: 'cookie-use',
        title: 'Why cookies are used',
        body:
          'Cookies and similar browser storage can help BizFlow NG remember sessions, preserve theme preferences, support authentication, and understand product behavior at a high level.',
        bullets: [
          'Session persistence for login and protected routes',
          'Theme and UI preference storage',
          'Basic analytics and product improvement signals where enabled',
        ],
      },
      {
        id: 'what-we-avoid',
        title: 'What this is not meant to do',
        body:
          'The goal is not invasive tracking. The goal is to keep the app usable, reliable, and easier to improve with minimal friction for the user.',
        cards: [
          {
            icon: Flag,
            title: 'Purpose-limited use',
            body: 'Cookie use should stay tied to security, continuity, and product improvement rather than unnecessary surveillance.',
          },
          {
            icon: ShieldCheck,
            title: 'Trust-first approach',
            body: 'Users should always understand that cookies primarily support smoother sessions and a better business workflow experience.',
          },
        ],
      },
    ],
    cta: {
      title: 'Want the broader privacy picture too?',
      body: 'Read the full privacy policy for the complete view of how account and business data are handled.',
      primary: { label: 'Read privacy policy', to: '/privacy' },
      secondary: { label: 'Contact support', to: '/support' },
    },
  },
  how: {
    path: publicPageLinks.how,
    title: 'How It Works',
    seoTitle: 'How BizFlow NG Works — From Signup to Business Operations',
    description:
      'See how BizFlow NG helps businesses move from signup to invoicing, team setup, reporting, and operational clarity without a confusing setup process.',
    eyebrow: 'How It Works',
    headline: 'From signup to your first live workflow without unnecessary friction',
    subheadline:
      'BizFlow NG is designed to help teams get value quickly, then expand naturally into deeper operations like reporting, staff records, payroll, and analytics.',
    heroHighlights: ['Signup', 'Business setup', 'Invoice flow', 'Live dashboard'],
    sections: [
      {
        id: 'steps',
        title: 'A simple path to a working workspace',
        body: 'The core product flow is intentionally practical so teams can start from one important job and build out from there.',
        cards: [
          {
            icon: Sparkles,
            title: 'Create your account',
            body: 'Sign up with your email, verify access, and open your BizFlow NG workspace.',
          },
          {
            icon: Briefcase,
            title: 'Add business details',
            body: 'Complete your profile, payment details, and core business settings so invoices and documents feel professional.',
          },
          {
            icon: FileText,
            title: 'Run your first workflow',
            body: 'Create an invoice, add a client, or open your dashboard so the system starts reflecting real business activity.',
          },
        ],
      },
    ],
    cta: {
      title: 'Start with one live workflow',
      body: 'The fastest way to understand BizFlow NG is to create your account and run one real business task inside it.',
      primary: { label: 'Create your account', to: '/signup' },
      secondary: { label: 'Explore features', to: '/features' },
    },
  },
  refund: {
    path: publicPageLinks.refund,
    title: 'Refund Policy',
    seoTitle: 'BizFlow NG Refund Policy',
    description:
      'Review the BizFlow NG refund policy for support-led setup, manual payments, future subscriptions, and billing expectations.',
    eyebrow: 'Refund Policy',
    headline: 'How refunds are handled while billing continues to evolve',
    subheadline:
      'BizFlow NG is still growing its billing and support workflows, so refund expectations should be understood clearly before manual or support-led work begins.',
    heroHighlights: ['Support-led setup', 'Manual billing', 'Future subscription clarity'],
    sections: [
      {
        id: 'current-status',
        title: 'Current billing status',
        body:
          'If BizFlow NG has not collected payment through an in-app billing flow, there may not be a product-native refund path yet. Support-led arrangements should be clarified before work begins.',
        bullets: [
          'Manual payments should be agreed in writing before setup work starts',
          'Future subscription billing will include clearer self-serve billing expectations',
          'Questions should be resolved through official support before commitment',
        ],
      },
    ],
    cta: {
      title: 'Need billing clarification first?',
      body: 'We would rather answer questions early than let expectations feel uncertain later.',
      primary: { label: 'Contact support', to: '/support' },
      secondary: { label: 'View pricing', to: '/pricing' },
    },
  },
}

export const publicFooterGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: publicPageLinks.features },
      { label: 'Pricing', to: publicPageLinks.pricing },
      { label: 'Changelog', to: publicPageLinks.changelog },
      { label: 'Roadmap', to: publicPageLinks.roadmap },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: publicPageLinks.about },
      { label: 'Blog', to: publicPageLinks.blog },
      { label: 'Careers', to: publicPageLinks.careers },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: publicPageLinks.privacy },
      { label: 'Terms', to: publicPageLinks.terms },
      { label: 'Privacy & Cookies', to: publicPageLinks.privacyCookies },
    ],
  },
]
