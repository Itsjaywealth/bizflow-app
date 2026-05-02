import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Badge from '../components/ui/Badge'
import BrandLogo from '../components/BrandLogo'
import Seo from '../components/Seo'
import { SUPPORT_EMAIL, getSupportMailto } from '../lib/support'
import { SOCIAL_LINKS } from '../lib/socialLinks'
import { trackEvent } from '../lib/analytics'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
]

const socialLogos = [
  'ApexGrid',
  'Northstar',
  'LumaTrade',
  'KoraWorks',
  'DeltaHive',
  'Bricklane',
  'NovaPeak',
  'StudioWest',
]

const featureCards = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    description: 'Create, send, and get paid on invoices with Paystack integration.',
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Keep all your client records and history in one place.',
  },
  {
    icon: Building2,
    title: 'Staff & HR',
    description: 'Manage your team, track attendance, and handle leave requests.',
  },
  {
    icon: Wallet,
    title: 'Payroll',
    description: 'Run payroll in minutes. Auto-calculate deductions and net pay.',
  },
  {
    icon: LayoutDashboard,
    title: 'Reports & Analytics',
    description: 'Real-time insights into your revenue, expenses, and growth.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted and protected at all times.',
  },
]

const steps = [
  {
    icon: Sparkles,
    title: 'Create your account',
    description: '30 seconds to get started and invite your first admin.',
  },
  {
    icon: Building2,
    title: 'Set up your business profile',
    description: 'Add branding, payment details, and your team structure.',
  },
  {
    icon: ReceiptText,
    title: 'Start running operations',
    description: 'Invoice clients, manage staff, and process payroll from one place.',
  },
]

const chartData = [
  { month: 'Jan', revenue: 420000, expenses: 120000 },
  { month: 'Feb', revenue: 610000, expenses: 170000 },
  { month: 'Mar', revenue: 780000, expenses: 230000 },
  { month: 'Apr', revenue: 920000, expenses: 280000 },
  { month: 'May', revenue: 1080000, expenses: 320000 },
  { month: 'Jun', revenue: 1360000, expenses: 390000 },
]

const pricingPlans = {
  monthly: [
    {
      name: 'Starter',
      price: '₦5,000',
      period: '/month',
      description: 'For lean teams getting their operations under control.',
      cta: 'Start Starter',
      features: ['Up to 5 staff', '50 invoices/month', 'Client management', 'Email support'],
      highlight: false,
    },
    {
      name: 'Growth',
      price: '₦15,000',
      period: '/month',
      description: 'For scaling businesses that need payroll, reporting, and speed.',
      cta: 'Start Growth',
      features: ['Up to 25 staff', 'Unlimited invoices', 'Payroll module', 'Priority support', 'Reports & analytics'],
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For multi-entity operations and advanced internal workflows.',
      cta: 'Talk to Sales',
      features: ['Unlimited everything', 'Dedicated account manager', 'Custom integrations', 'SLA support'],
      highlight: false,
    },
  ],
  annual: [
    {
      name: 'Starter',
      price: '₦48,000',
      period: '/year',
      description: 'Save 20% on the starter plan with annual billing.',
      cta: 'Start Starter',
      features: ['Up to 5 staff', '50 invoices/month', 'Client management', 'Email support'],
      highlight: false,
    },
    {
      name: 'Growth',
      price: '₦144,000',
      period: '/year',
      description: 'Save 20% and lock in your team operations stack for a year.',
      cta: 'Start Growth',
      features: ['Up to 25 staff', 'Unlimited invoices', 'Payroll module', 'Priority support', 'Reports & analytics'],
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Custom annual contracts for advanced teams and multi-market operations.',
      cta: 'Talk to Sales',
      features: ['Unlimited everything', 'Dedicated account manager', 'Custom integrations', 'SLA support'],
      highlight: false,
    },
  ],
}

const testimonials = [
  {
    quote:
      'BizFlow NG completely transformed how I manage my business. Payroll used to take 2 days. Now it takes 5 minutes.',
    name: 'Tunde Adeleke',
    title: 'CEO',
    company: 'Adeleke Logistics, Lagos',
    initials: 'TA',
  },
  {
    quote:
      'I send professional invoices and get paid via Paystack directly. My clients are always impressed.',
    name: 'Amaka Obi',
    title: 'Founder',
    company: 'StyleHaus Boutique, Abuja',
    initials: 'AO',
  },
  {
    quote:
      'The client management module alone is worth every kobo. Highly recommend for any growing business.',
    name: 'Chukwuemeka Nwosu',
    title: 'MD',
    company: 'TechBuild Nigeria, Port Harcourt',
    initials: 'CN',
  },
]

const faqs = [
  {
    question: 'Is BizFlow NG free to use?',
    answer: 'You can start with a free trial to explore the platform before choosing the plan that fits your business.',
  },
  {
    question: 'Can I accept payments through BizFlow NG?',
    answer: 'Yes. BizFlow NG is built to support payment collection flows and professional invoice experiences for faster checkout.',
  },
  {
    question: 'Is my business data safe?',
    answer: 'Yes. We use secure infrastructure, encrypted storage, and access controls designed to protect sensitive business records.',
  },
  {
    question: 'Can I use BizFlow NG for a business outside Nigeria?',
    answer: 'Absolutely. BizFlow NG is built with Nigerian SMEs in mind, but the product experience is professional enough for businesses operating globally.',
  },
  {
    question: 'How many team members can I add?',
    answer: 'That depends on your plan. Starter is ideal for smaller teams, while Growth and Enterprise are built for larger operations.',
  },
  {
    question: 'Does BizFlow NG work on mobile?',
    answer: 'Yes. The interface is fully responsive across phone, tablet, laptop, and desktop screens.',
  },
  {
    question: 'Can I export my invoices to PDF?',
    answer: 'Yes. You can create polished invoices and export them as PDFs for clients and record keeping.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can manage your subscription from your billing settings, and cancellation can be handled without hidden penalties.',
  },
]

const mockInvoiceRows = [
  { invoice: 'INV-1042', client: 'Westbridge HQ', amount: '₦450,000', status: 'Paid' },
  { invoice: 'INV-1043', client: 'Kora Labs', amount: '₦180,000', status: 'Pending' },
  { invoice: 'INV-1044', client: 'Northline Ltd', amount: '₦620,000', status: 'Paid' },
]

function CashflowTrendPreview() {
  const revenuePoints = chartData.map((item, index) => {
    const x = 28 + index * 62
    const y = 220 - (item.revenue / 1400000) * 170
    return `${x},${y}`
  }).join(' ')
  const expensePoints = chartData.map((item, index) => {
    const x = 28 + index * 62
    const y = 220 - (item.expenses / 1400000) * 170
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox="0 0 370 240" role="img" aria-label="Revenue and expenses trend from January to June" className="h-full w-full">
      <defs>
        <linearGradient id="revenueGradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#1A56DB" />
        </linearGradient>
      </defs>
      {[52, 94, 136, 178, 220].map((y) => (
        <line key={y} x1="24" x2="346" y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 6" />
      ))}
      <polyline points={expensePoints} fill="none" stroke="#F59E0B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <polyline points={revenuePoints} fill="none" stroke="url(#revenueGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      {chartData.map((item, index) => {
        const x = 28 + index * 62
        const y = 220 - (item.revenue / 1400000) * 170
        return (
          <g key={item.month}>
            <circle cx={x} cy={y} r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
            <text x={x} y="236" textAnchor="middle" className="fill-slate-500 text-[11px] font-semibold">{item.month}</text>
          </g>
        )
      })}
    </svg>
  )
}

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <div
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={className}
    >
      {children}
    </div>
  )
}

function LandingButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'bg-brand-gradient text-white shadow-glow hover:brightness-110 focus-visible:ring-primary',
    secondary: 'bg-darkbg-card text-white shadow-card hover:bg-darkbg-hover focus-visible:ring-brand-glow',
    outline: 'border border-primary/30 bg-white text-neutral-900 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
    ghost: 'bg-transparent text-neutral-700 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary dark:text-neutral-200 dark:hover:bg-white/10 dark:hover:text-white',
  }
  const sizeClasses = {
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-background',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ').trim()}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  )
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [billingMode, setBillingMode] = useState('monthly')
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)
  const [showCookieBanner, setShowCookieBanner] = useState(() => localStorage.getItem('bizflow-cookie-ok') !== 'yes')

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  const currentPlans = pricingPlans[billingMode]
  const activeTestimonial = testimonials[testimonialIndex]

  const repeatedLogos = useMemo(() => [...socialLogos, ...socialLogos], [])

  function trackLandingCta(label, target) {
    trackEvent('landing_cta_click', { label, target })
  }

  function dismissCookieBanner() {
    localStorage.setItem('bizflow-cookie-ok', 'yes')
    setShowCookieBanner(false)
  }

  return (
    <div className="brand-app-shell bg-background text-neutral-900 dark:bg-darkbg dark:text-neutral-100">
      <Seo
        title="BizFlow NG — Business Management Software for Nigerian SMEs"
        description="Invoicing, payroll, HR and client management built for Nigerian businesses. Get paid faster. Run smarter."
        path="/"
      />
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-emerald-500/12 bg-white/88 shadow-card backdrop-blur-xl dark:border-white/10 dark:bg-darkbg/84' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top">
            <BrandLogo />
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-semibold text-neutral-600 hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" onClick={() => trackLandingCta('header_login', '/login')}>
              <LandingButton variant="ghost">Login</LandingButton>
            </Link>
            <Link to="/signup" onClick={() => trackLandingCta('header_start_free_trial', '/signup')}>
              <LandingButton>Start Free Trial</LandingButton>
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex rounded-2xl border border-emerald-500/15 bg-white/90 p-3 text-neutral-800 shadow-sm dark:bg-white/5 dark:text-neutral-100 lg:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-emerald-500/12 bg-[#f7fbf9] shadow-card transition-all duration-200 dark:border-white/10 dark:bg-darkbg-card lg:hidden">
              <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm dark:bg-white/5 dark:text-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => {
                      trackLandingCta('mobile_login', '/login')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LandingButton variant="ghost" fullWidth>Login</LandingButton>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => {
                      trackLandingCta('mobile_start_free_trial', '/signup')
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LandingButton fullWidth>Start Free Trial</LandingButton>
                  </Link>
                </div>
              </div>
            </div>
        ) : null}
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.16),_transparent_34%),radial-gradient(circle_at_left,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,#fbfefd_0%,#f4faf7_45%,#eef5f1_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.14),_transparent_28%),radial-gradient(circle_at_left,_rgba(34,197,94,0.10),_transparent_20%),linear-gradient(180deg,#0b1120_0%,#101827_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(520px,1.04fr)] lg:items-center lg:gap-14">
            <Reveal className="mx-auto max-w-2xl lg:mx-0">
              <Badge variant="info" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm">
                🇳🇬 Built for Nigerian Businesses
              </Badge>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] text-neutral-950 sm:text-5xl sm:leading-[1.02] lg:text-[4.5rem] lg:leading-[0.95] dark:text-white">
                All Your Business Operations. One Smart Platform for Growth.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-neutral-700 sm:mt-6 sm:text-lg sm:leading-8 dark:text-neutral-300">
                Manage clients, send invoices, run payroll, and track revenue-all in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto"
                  onClick={() => trackLandingCta('hero_start_trial', '/signup')}
                >
                  <LandingButton size="lg" fullWidth rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Start your 14-day free trial
                  </LandingButton>
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto"
                  onClick={() => trackLandingCta('hero_learn_more', '#features')}
                >
                  <LandingButton
                    size="lg"
                    fullWidth
                    variant="outline"
                    leftIcon={<CirclePlay className="h-4 w-4" />}
                  >
                    Learn more
                  </LandingButton>
                </a>
              </div>
              <p className="mt-5 text-sm font-semibold text-neutral-600 dark:text-neutral-300 sm:mt-6">
                Trusted by 1,200+ businesses across Nigeria
              </p>
            </Reveal>

            <Reveal delay={0.15} className="relative">
              <div className="absolute -left-6 top-16 hidden h-40 w-40 rounded-full bg-primary/10 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-8 hidden h-40 w-40 rounded-full bg-accent/20 blur-3xl lg:block" />
              <div className="relative rounded-[32px] border border-emerald-500/12 bg-[#f8fcfa]/95 p-3 shadow-modal backdrop-blur sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="rounded-[28px] border border-neutral-200 bg-neutral-950 p-4 text-white sm:p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Live dashboard</p>
                      <p className="mt-2 text-lg font-bold sm:text-xl">BizFlow command center</p>
                    </div>
                    <Badge className="bg-white/10 text-white ring-0">Realtime</Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    {[
                      ['Revenue', '₦4.8M', 'up 18%'],
                      ['Pending', '₦720k', '6 invoices'],
                      ['Payroll', '₦1.2M', 'processed'],
                      ['Staff', '18', 'active team'],
                    ].map(([label, value, meta]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">{label}</p>
                        <p className="mt-3 text-2xl font-black sm:text-[1.65rem]">{value}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-emerald-300">{meta}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
                    <div className="flex items-end justify-between gap-2 sm:gap-3">
                      {[40, 58, 52, 70, 86, 78, 92].map((value, index) => (
                        <div key={value} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            style={{ height: `${value}%` }}
                            className="w-full rounded-full bg-gradient-to-t from-primary via-emerald-400 to-accent"
                          />
                          <span className="text-[10px] text-neutral-400">W{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -left-1 top-6 max-w-[220px] rounded-2xl border border-emerald-200 bg-[#fcfffd] px-4 py-3 shadow-card dark:border-white/10 dark:bg-darkbg-card sm:-left-3 sm:top-10"
                >
                  <p className="text-sm font-semibold leading-6 text-neutral-950 dark:text-white">✅ Invoice #1042 paid — ₦450,000</p>
                </div>
                <div
                  className="absolute right-0 top-[32%] max-w-[190px] rounded-2xl border border-neutral-200 bg-[#fbfdfc] px-4 py-3 shadow-card dark:border-white/10 dark:bg-darkbg-card sm:-right-2"
                >
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">👤 New client added</p>
                </div>
                <div
                  className="absolute bottom-0 left-3 max-w-[220px] rounded-2xl border border-amber-200 bg-[#fffdf8] px-4 py-3 shadow-card dark:border-white/10 dark:bg-darkbg-card sm:left-8"
                >
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">💰 Payroll processed</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal className="border-y border-emerald-500/8 bg-[#f4f8f5] px-4 py-7 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-sm font-semibold leading-6 text-neutral-700 dark:text-neutral-200">
                Trusted by businesses in Lagos, Abuja, Port Harcourt, London, Houston & more
              </p>
              <div className="grid gap-4 text-sm font-semibold text-neutral-800 sm:grid-cols-3 dark:text-neutral-100">
                <p>1,200+ Businesses</p>
                <p>₦2.4B Processed</p>
                <p>98% Satisfaction</p>
              </div>
            </div>
            <div className="relative mt-6 overflow-hidden">
              <div className="flex gap-4">
                {repeatedLogos.map((logo, index) => (
                  <div
                    key={`${logo}-${index}`}
                    className="flex min-w-[180px] items-center gap-3 rounded-[24px] border border-emerald-500/12 bg-white/94 px-5 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-white/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-100">{logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <section id="features" className="bg-[#fbfdfc] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:bg-transparent">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Features</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                Everything you need to run your business
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-700 sm:text-lg dark:text-neutral-300">
                One platform. Zero confusion. Maximum results.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Reveal key={feature.title} delay={index * 0.07}>
                    <div className="h-full rounded-[28px] border-emerald-500/12 bg-white/92 p-6 shadow-card dark:border-white/10 dark:bg-white/5 sm:p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-neutral-950 dark:text-white">{feature.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">{feature.description}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,#f3f9f5_0%,#edf6f1_100%)] px-4 py-18 sm:px-6 lg:px-8 lg:py-24 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))]">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">How it works</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                Get started in 3 simple steps
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-700 dark:text-neutral-300">
                Move from setup to day-to-day operations with a simple workflow that stays clear on desktop and mobile.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Reveal key={step.title} delay={index * 0.08}>
                    <div className="relative h-full rounded-[30px] border border-emerald-500/12 bg-white/92 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.28)] transition-transform duration-300 hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.05] sm:p-8">
                      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent dark:via-emerald-400/25" />
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-base font-black text-white shadow-glow">
                          0{index + 1}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-emerald-400/10 dark:text-emerald-200">
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-neutral-950 dark:text-white">{step.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-neutral-700 dark:text-neutral-300">{step.description}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section id="dashboard-preview" className="bg-[#f8fbf9] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:bg-transparent">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Platform preview</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                The dashboard your business deserves
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-14">
              <div className="overflow-hidden rounded-[32px] border border-emerald-500/12 bg-white/92 shadow-modal dark:border-white/10 dark:bg-white/[0.04]">
                <div className="grid min-h-[620px] lg:grid-cols-[250px_1fr]">
                  <aside className="bg-neutral-950 px-6 py-8 text-white">
                    <div className="flex items-center gap-3">
                      <BrandLogo showTagline={false} textClassName="text-white [&>span:last-child]:text-neutral-400" />
                    </div>
                    <div className="mt-8 space-y-2">
                      {['Dashboard', 'Invoices', 'Clients', 'Staff & HR', 'Payroll', 'Reports', 'Settings'].map((item, index) => (
                        <div
                          key={item}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                            index === 0 ? 'bg-white text-neutral-950' : 'text-neutral-400'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </aside>

                  <div className="bg-[#f6faf8] p-5 sm:p-8 dark:bg-transparent">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ['Revenue', '₦4.8M', '+18.4%'],
                        ['Pending', '₦720k', '6 invoices'],
                        ['Payroll', '₦1.2M', 'completed'],
                        ['Staff', '18', 'active'],
                      ].map(([label, value, meta]) => (
                        <div key={label} className="rounded-3xl border border-emerald-500/12 bg-white/95 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
                          <p className="text-sm text-neutral-500">{label}</p>
                          <p className="mt-3 text-3xl font-black text-neutral-900">{value}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">{meta}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[28px] border border-emerald-500/12 bg-white/95 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Cashflow trend</p>
                            <p className="text-xs text-neutral-500">Revenue vs expenses</p>
                          </div>
                          <Badge variant="success">Live</Badge>
                        </div>
                        <div className="h-72">
                          <CashflowTrendPreview />
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-emerald-500/12 bg-white/95 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-neutral-900">Recent invoices</p>
                          <p className="text-xs text-neutral-500">Last billing activity across your workspace</p>
                        </div>
                        <div className="space-y-3">
                          {mockInvoiceRows.map((row) => (
                            <div key={row.invoice} className="rounded-2xl border border-emerald-500/12 bg-[#fcfffd] px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-neutral-900">{row.invoice}</p>
                                  <p className="mt-1 text-xs text-neutral-500">{row.client}</p>
                                </div>
                                <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>{row.status}</Badge>
                              </div>
                              <p className="mt-3 text-lg font-black text-neutral-900">{row.amount}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link to="/signup">
                  <LandingButton variant="outline" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    See BizFlow NG in action
                  </LandingButton>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="border-y border-emerald-500/10 bg-[#eef5f1] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Pricing</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                Simple, transparent pricing
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-700 sm:text-lg dark:text-neutral-300">No hidden fees. Cancel anytime.</p>
            </Reveal>

            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex rounded-full border border-emerald-500/12 bg-white/85 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                {['monthly', 'annual'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBillingMode(mode)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                      billingMode === mode ? 'bg-brand-gradient text-white shadow-glow' : 'text-neutral-600'
                    }`}
                  >
                    {mode === 'monthly' ? 'Monthly' : 'Annual (20% off)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {currentPlans.map((plan, index) => (
                <Reveal key={plan.name} delay={index * 0.08}>
                  <div
                    className={`h-full rounded-[30px] border p-8 shadow-card ${
                      plan.highlight
                        ? 'border-emerald-800 bg-emerald-800 text-white shadow-modal'
                        : 'border-emerald-500/12 bg-white/92 text-neutral-950 dark:border-white/10 dark:bg-white/5 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black">{plan.name}</h3>
                        <p className={`mt-3 text-sm leading-7 ${plan.highlight ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {plan.description}
                        </p>
                      </div>
                      {plan.highlight ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                          Most Popular
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-5xl font-black">{plan.price}</span>
                      {plan.period ? <span className={plan.highlight ? 'text-white' : 'text-neutral-600 dark:text-neutral-400'}>{plan.period}</span> : null}
                    </div>
                    <div className="mt-8 space-y-4">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className={`mt-1 h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-success'}`} />
                          <span className={`text-sm ${plan.highlight ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Link
                        to={plan.name === 'Enterprise' ? '/support' : '/signup'}
                        onClick={() => trackLandingCta(`pricing_${plan.name.toLowerCase()}`, plan.name === 'Enterprise' ? '/support' : '/signup')}
                      >
                        <LandingButton
                          fullWidth
                          variant={plan.highlight ? 'secondary' : 'primary'}
                          className={plan.highlight ? 'bg-white text-primary hover:bg-neutral-100' : ''}
                        >
                          {plan.cta}
                        </LandingButton>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-[linear-gradient(180deg,#f7fcf9_0%,#edf6f1_100%)] px-4 py-18 sm:px-6 lg:px-8 lg:py-24 dark:bg-[linear-gradient(180deg,#0d1622_0%,#111c2a_100%)]">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">Testimonials</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                What business owners are saying
              </h2>
              <p className="mt-5 text-base leading-8 text-neutral-700 dark:text-neutral-200">
                Real feedback from teams using BizFlow NG to run smoother daily operations.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <div className="relative h-full overflow-hidden rounded-[28px] border border-emerald-600/18 bg-[linear-gradient(180deg,rgba(233,247,238,0.98)_0%,rgba(223,240,230,0.98)_100%)] p-7 text-neutral-950 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.24)] sm:p-8 dark:border-emerald-400/14 dark:bg-[linear-gradient(180deg,rgba(13,27,38,0.98)_0%,rgba(10,19,29,0.98)_100%)] dark:text-white dark:shadow-[0_28px_80px_-52px_rgba(0,0,0,0.72)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_58%)]" />
                  <div className="relative">
                  <p className="inline-flex items-center rounded-full border border-emerald-600/18 bg-white/78 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-300/18 dark:bg-white/10 dark:text-emerald-100">
                    Featured story
                  </p>
                  <p className="mt-6 text-xl font-black leading-9 tracking-[-0.02em] text-neutral-950 sm:text-[1.75rem] sm:leading-[2.7rem] dark:text-white">
                    “{activeTestimonial.quote}”
                  </p>
                  <div className="mt-10 flex items-center gap-4 rounded-[24px] border border-emerald-600/14 bg-white/64 px-4 py-4 shadow-[0_14px_32px_-24px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/[0.08] dark:shadow-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/18 bg-[linear-gradient(180deg,rgba(22,163,74,0.18),rgba(34,197,94,0.1))] text-sm font-black text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none">
                      {activeTestimonial.initials}
                    </div>
                    <div>
                      <p className="text-base font-black text-neutral-950 dark:text-white">{activeTestimonial.name}</p>
                      <p className="mt-1 text-sm font-medium leading-6 text-neutral-800 dark:text-neutral-100">
                        {activeTestimonial.title} — {activeTestimonial.company}
                      </p>
                    </div>
                  </div>
                  </div>
                </div>
              </Reveal>

              <div className="space-y-5">
                {testimonials.map((testimonial, index) => (
                  <Reveal key={testimonial.name} delay={index * 0.07}>
                    <div
                      className={`rounded-[28px] border border-emerald-500/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,252,249,0.98)_100%)] p-6 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.2)] transition-all duration-300 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(20,29,40,0.96)_0%,rgba(17,25,36,0.96)_100%)] sm:p-7 ${testimonialIndex === index ? 'opacity-100 scale-100' : 'opacity-90 scale-[0.985]'}`}
                    >
                      <div className="mb-4 flex items-center gap-1 text-amber-500 dark:text-amber-300">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <span key={star}>★</span>
                        ))}
                      </div>
                      <p className="text-base leading-8 text-neutral-900 dark:text-neutral-100">{testimonial.quote}</p>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/12 font-black text-primary dark:bg-emerald-400/12 dark:text-emerald-200">
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{testimonial.name}</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-200">
                            {testimonial.title} — {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
                <div className="flex justify-center gap-3 pt-3">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setTestimonialIndex(index)}
                      className={`h-3 w-3 rounded-full transition-all ${testimonialIndex === index ? 'bg-primary w-8' : 'bg-neutral-400 dark:bg-neutral-500'}`}
                      aria-label={`Show testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-emerald-500/10 bg-[#eff4f1] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto max-w-5xl">
            <Reveal className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">FAQ</p>
              <h2 className="mt-4 text-3xl font-black text-neutral-950 sm:text-5xl dark:text-white">
                Frequently Asked Questions
              </h2>
            </Reveal>

            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <Reveal key={faq.question} delay={index * 0.04}>
                  <div className="overflow-hidden rounded-[24px] border border-emerald-500/12 bg-white/92 shadow-sm dark:border-white/10 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="text-base font-bold text-neutral-950 dark:text-white">{faq.question}</span>
                      <span
                        className={`text-neutral-500 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>
                    {openFaq === index ? (
                      <div className="border-t border-emerald-500/12 px-5 py-5 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:text-neutral-300 sm:px-6">
                        {faq.answer}
                      </div>
                    ) : null}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="overflow-hidden rounded-[36px] bg-brand-dark px-6 py-12 text-center text-white shadow-modal sm:px-10 sm:py-14">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">Ready when you are</p>
                <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                  Ready to take control of your business?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
                  Join 1,200+ smart business owners already using BizFlow NG.
                </p>
                <div className="mt-8">
                  <Link to="/signup" onClick={() => trackLandingCta('final_get_started', '/signup')}>
                    <LandingButton
                      size="lg"
                      variant="secondary"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      className="bg-white text-primary hover:bg-neutral-100"
                    >
                      Get Started Free Today
                    </LandingButton>
                  </Link>
                </div>
                <p className="mt-5 text-sm font-semibold text-emerald-100">
                  No credit card required · Cancel anytime
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-neutral-200 bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
            <div>
              <BrandLogo />
              <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                Built for Nigerian SMEs, designed to help modern businesses invoice faster, manage teams better, and grow with clarity.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/12 bg-[#fcfffd] text-neutral-700 hover:border-primary hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-neutral-200"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Product</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <Link to="/features" className="block hover:text-primary">Features</Link>
                <Link to="/pricing" className="block hover:text-primary">Pricing</Link>
                <Link to="/changelog" className="block hover:text-primary">Changelog</Link>
                <Link to="/roadmap" className="block hover:text-primary">Roadmap</Link>
              </div>
            </div>

            <div id="blog">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Company</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <Link to="/about" className="block hover:text-primary">About</Link>
                <Link to="/blog" className="block hover:text-primary">Blog</Link>
                <Link to="/careers" className="block hover:text-primary">Careers</Link>
                <a href={getSupportMailto('BizFlow NG Support')} className="block hover:text-primary">{SUPPORT_EMAIL}</a>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Legal</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <Link to="/privacy" className="block hover:text-primary">Privacy Policy</Link>
                <Link to="/terms" className="block hover:text-primary">Terms</Link>
                <Link to="/privacy-cookies" className="block hover:text-primary">Privacy & Cookies</Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-emerald-500/12 pt-6 text-sm text-neutral-600 dark:border-white/10 dark:text-neutral-400 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2025 BizFlow NG. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secured by Paystack</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> SSL Encrypted</span>
            </div>
          </div>
        </div>
      </footer>

      {showCookieBanner ? (
          <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-[28px] border border-emerald-500/12 bg-[#fbfdfc] p-5 shadow-modal dark:border-white/10 dark:bg-darkbg-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MessageCircleMore className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-bold text-neutral-950 dark:text-white">We use cookies to improve your experience.</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
                    By continuing, you agree to our use of cookies for analytics, product improvement, and smoother sessions.
                  </p>
                </div>
              </div>
              <LandingButton onClick={dismissCookieBanner}>Got it</LandingButton>
            </div>
          </div>
      ) : null}
    </div>
  )
}
