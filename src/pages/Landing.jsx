import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  CreditCard,
  Facebook,
  FileText,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Menu,
  MessageCircleMore,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
  Twitter,
} from 'lucide-react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Seo from '../components/Seo'

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

function Reveal({ children, className = '', delay = 0 }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
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

  function dismissCookieBanner() {
    localStorage.setItem('bizflow-cookie-ok', 'yes')
    setShowCookieBanner(false)
  }

  return (
    <div className="bg-background text-neutral-900">
      <Seo
        title="BizFlow NG — Business Management Software for Nigerian SMEs"
        description="Invoicing, payroll, HR and client management built for Nigerian businesses. Get paid faster. Run smarter."
        path="/"
      />
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-neutral-200 bg-white/95 shadow-card backdrop-blur' : 'bg-transparent'}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-button">
              BF
            </span>
            <div>
              <p className="text-base font-black text-neutral-900">BizFlow NG</p>
              <p className="text-xs text-neutral-500">Business OS for SMEs</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-semibold text-neutral-600 hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex rounded-2xl border border-neutral-200 bg-white p-3 text-neutral-700 lg:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="border-t border-neutral-200 bg-white lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-semibold text-neutral-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth>Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button fullWidth>Start Free Trial</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_right,_rgba(26,86,219,0.18),_transparent_36%),radial-gradient(circle_at_left,_rgba(245,158,11,0.16),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#f8fafc_100%)]" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <Reveal className="max-w-2xl">
              <Badge variant="info" className="rounded-full px-4 py-2 text-sm font-semibold">
                🇳🇬 Built for Nigerian Businesses
              </Badge>
              <h1 className="mt-6 text-5xl font-black tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
                Run Your Business Smarter. Get Paid Faster.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
                BizFlow NG is the all-in-one platform for invoicing, payroll, client management, and HR — built for Nigerian SMEs and growing businesses worldwide.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Start Free — No Credit Card
                  </Button>
                </Link>
                <a href="#dashboard-preview">
                  <Button
                    size="lg"
                    variant="outline"
                    leftIcon={<CirclePlay className="h-4 w-4" />}
                  >
                    Watch Demo
                  </Button>
                </a>
              </div>
              <p className="mt-5 text-sm font-semibold text-neutral-500">
                ⭐ Trusted by 1,200+ businesses across Nigeria
              </p>
            </Reveal>

            <Reveal delay={0.15} className="relative">
              <div className="absolute -left-6 top-16 hidden h-40 w-40 rounded-full bg-primary/10 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-8 hidden h-40 w-40 rounded-full bg-accent/20 blur-3xl lg:block" />
              <div className="relative rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-modal backdrop-blur">
                <div className="rounded-[28px] border border-neutral-200 bg-neutral-950 p-4 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-blue-200">Live dashboard</p>
                      <h3 className="mt-2 text-xl font-bold">BizFlow command center</h3>
                    </div>
                    <Badge className="bg-white/10 text-white ring-0">Realtime</Badge>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {[
                      ['Revenue', '₦4.8M', 'up 18%'],
                      ['Pending', '₦720k', '6 invoices'],
                      ['Payroll', '₦1.2M', 'processed'],
                      ['Staff', '18', 'active team'],
                    ].map(([label, value, meta]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-neutral-300">{label}</p>
                        <p className="mt-3 text-2xl font-black">{value}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300">{meta}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4">
                    <div className="flex items-end justify-between gap-3">
                      {[40, 58, 52, 70, 86, 78, 92].map((value, index) => (
                        <div key={value} className="flex flex-1 flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${value}%` }}
                            transition={{ duration: 0.7, delay: index * 0.06 }}
                            className="w-full rounded-full bg-gradient-to-t from-primary via-blue-400 to-sky-300"
                          />
                          <span className="text-[10px] text-neutral-400">W{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror' }}
                  className="absolute -left-3 top-10 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-card"
                >
                  <p className="text-sm font-semibold text-neutral-900">✅ Invoice #1042 paid — ₦450,000</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, repeatType: 'mirror' }}
                  className="absolute -right-2 top-1/3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-card"
                >
                  <p className="text-sm font-semibold text-neutral-900">👤 New client added</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, repeatType: 'mirror' }}
                  className="absolute bottom-0 left-8 rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-card"
                >
                  <p className="text-sm font-semibold text-neutral-900">💰 Payroll processed</p>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal className="border-y border-neutral-200 bg-white/80 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-sm font-semibold text-neutral-600">
                Trusted by businesses in Lagos, Abuja, Port Harcourt, London, Houston & more
              </p>
              <div className="grid gap-4 text-sm font-semibold text-neutral-700 sm:grid-cols-3">
                <p>1,200+ Businesses</p>
                <p>₦2.4B Processed</p>
                <p>98% Satisfaction</p>
              </div>
            </div>
            <div className="relative mt-6 overflow-hidden">
              <motion.div
                className="flex gap-4"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {repeatedLogos.map((logo, index) => (
                  <div
                    key={`${logo}-${index}`}
                    className="flex min-w-[180px] items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-neutral-700">{logo}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </Reveal>

        <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Features</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                Everything you need to run your business
              </h2>
              <p className="mt-5 text-lg text-neutral-600">
                One platform. Zero confusion. Maximum results.
              </p>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Reveal key={feature.title} delay={index * 0.07}>
                    <Card hover className="h-full rounded-[28px] border-neutral-200 p-7">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-neutral-900">{feature.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-neutral-600">{feature.description}</p>
                    </Card>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">How it works</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                Get started in 3 simple steps
              </h2>
            </Reveal>

            <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
              <div className="absolute left-[16.5%] right-[16.5%] top-14 hidden h-1 rounded-full bg-neutral-200 lg:block">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-sky-400 to-accent"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  transition={{ duration: 1.1 }}
                  viewport={{ once: true }}
                />
              </div>
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Reveal key={step.title} delay={index * 0.08}>
                    <div className="relative rounded-[28px] border border-neutral-200 bg-background p-8 shadow-card">
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-black text-white">
                          0{index + 1}
                        </span>
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-neutral-900">{step.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-neutral-600">{step.description}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section id="dashboard-preview" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Platform preview</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                The dashboard your business deserves
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-14">
              <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-modal">
                <div className="grid min-h-[620px] lg:grid-cols-[250px_1fr]">
                  <aside className="bg-neutral-950 px-6 py-8 text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-black">
                        BF
                      </span>
                      <div>
                        <p className="font-black">BizFlow NG</p>
                        <p className="text-xs text-neutral-400">Operations OS</p>
                      </div>
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

                  <div className="bg-background p-6 sm:p-8">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ['Revenue', '₦4.8M', '+18.4%'],
                        ['Pending', '₦720k', '6 invoices'],
                        ['Payroll', '₦1.2M', 'completed'],
                        ['Staff', '18', 'active'],
                      ].map(([label, value, meta]) => (
                        <div key={label} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
                          <p className="text-sm text-neutral-500">{label}</p>
                          <p className="mt-3 text-3xl font-black text-neutral-900">{value}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">{meta}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-card">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">Cashflow trend</p>
                            <p className="text-xs text-neutral-500">Revenue vs expenses</p>
                          </div>
                          <Badge variant="success">Live</Badge>
                        </div>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                              <YAxis stroke="#64748B" fontSize={12} />
                              <Tooltip />
                              <Line type="monotone" dataKey="revenue" stroke="#1A56DB" strokeWidth={3} dot={false} />
                              <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={3} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-card">
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-neutral-900">Recent invoices</p>
                          <p className="text-xs text-neutral-500">Last billing activity across your workspace</p>
                        </div>
                        <div className="space-y-3">
                          {mockInvoiceRows.map((row) => (
                            <div key={row.invoice} className="rounded-2xl border border-neutral-200 px-4 py-4">
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
                  <Button variant="outline" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    See BizFlow NG in action
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="border-y border-neutral-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Pricing</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-5 text-lg text-neutral-600">No hidden fees. Cancel anytime.</p>
            </Reveal>

            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex rounded-full border border-neutral-200 bg-background p-1">
                {['monthly', 'annual'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBillingMode(mode)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                      billingMode === mode ? 'bg-primary text-white shadow-button' : 'text-neutral-600'
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
                        ? 'border-primary bg-primary text-white shadow-modal'
                        : 'border-neutral-200 bg-background text-neutral-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black">{plan.name}</h3>
                        <p className={`mt-3 text-sm leading-7 ${plan.highlight ? 'text-blue-100' : 'text-neutral-500'}`}>
                          {plan.description}
                        </p>
                      </div>
                      {plan.highlight ? (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
                          Most Popular
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-8 flex items-end gap-2">
                      <span className="text-5xl font-black">{plan.price}</span>
                      {plan.period ? <span className={plan.highlight ? 'text-blue-100' : 'text-neutral-500'}>{plan.period}</span> : null}
                    </div>
                    <div className="mt-8 space-y-4">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <Check className={`mt-1 h-4 w-4 shrink-0 ${plan.highlight ? 'text-white' : 'text-success'}`} />
                          <span className={`text-sm ${plan.highlight ? 'text-blue-50' : 'text-neutral-600'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Link to={plan.name === 'Enterprise' ? '/support' : '/signup'}>
                        <Button
                          fullWidth
                          variant={plan.highlight ? 'secondary' : 'primary'}
                          className={plan.highlight ? 'bg-white text-primary hover:bg-neutral-100' : ''}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Testimonials</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                What business owners are saying
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal>
                <Card className="h-full rounded-[30px] bg-neutral-950 p-8 text-white shadow-modal">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">Featured story</p>
                  <p className="mt-6 text-2xl font-bold leading-10">
                    “{activeTestimonial.quote}”
                  </p>
                  <div className="mt-10 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-sm font-black">
                      {activeTestimonial.initials}
                    </div>
                    <div>
                      <p className="font-bold">{activeTestimonial.name}</p>
                      <p className="text-sm text-neutral-300">
                        {activeTestimonial.title} — {activeTestimonial.company}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>

              <div className="space-y-5">
                {testimonials.map((testimonial, index) => (
                  <Reveal key={testimonial.name} delay={index * 0.07}>
                    <motion.div
                      animate={{ opacity: testimonialIndex === index ? 1 : 0.72, scale: testimonialIndex === index ? 1 : 0.98 }}
                      className="rounded-[28px] border border-neutral-200 bg-white p-7 shadow-card"
                    >
                      <div className="mb-4 flex items-center gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, star) => (
                          <span key={star}>★</span>
                        ))}
                      </div>
                      <p className="text-base leading-8 text-neutral-700">{testimonial.quote}</p>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-black text-primary">
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{testimonial.name}</p>
                          <p className="text-sm text-neutral-500">
                            {testimonial.title} — {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
                <div className="flex justify-center gap-3 pt-3">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setTestimonialIndex(index)}
                      className={`h-3 w-3 rounded-full transition-all ${testimonialIndex === index ? 'bg-primary w-8' : 'bg-neutral-300'}`}
                      aria-label={`Show testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">FAQ</p>
              <h2 className="mt-4 text-4xl font-black text-neutral-900 sm:text-5xl">
                Frequently Asked Questions
              </h2>
            </Reveal>

            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => (
                <Reveal key={faq.question} delay={index * 0.04}>
                  <div className="overflow-hidden rounded-[24px] border border-neutral-200 bg-background shadow-sm">
                    <button
                      type="button"
                      onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-base font-bold text-neutral-900">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: openFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-neutral-500"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === index ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24 }}
                        >
                          <div className="border-t border-neutral-200 px-6 py-5 text-sm leading-7 text-neutral-600">
                            {faq.answer}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#1A56DB_0%,#3B82F6_48%,#F59E0B_130%)] px-6 py-14 text-center text-white shadow-modal sm:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Ready when you are</p>
                <h2 className="mt-4 text-4xl font-black sm:text-5xl">
                  Ready to take control of your business?
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50">
                  Join 1,200+ smart business owners already using BizFlow NG.
                </p>
                <div className="mt-8">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      variant="secondary"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      className="bg-white text-primary hover:bg-neutral-100"
                    >
                      Get Started Free Today
                    </Button>
                  </Link>
                </div>
                <p className="mt-5 text-sm font-semibold text-blue-100">
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
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-button">
                  BF
                </span>
                <div>
                  <p className="text-base font-black text-neutral-900">BizFlow NG</p>
                  <p className="text-sm text-neutral-500">Business management platform</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">
                Built for Nigerian SMEs, designed to help modern businesses invoice faster, manage teams better, and grow with clarity.
              </p>
              <div className="mt-6 flex items-center gap-3">
                {[
                  { icon: Twitter, href: 'https://x.com/bizflowng', label: 'Twitter' },
                  { icon: Instagram, href: 'https://www.instagram.com/bizflowng?igsh=a2N2OXk5bHB3NDhk', label: 'Instagram' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { icon: Facebook, href: '#', label: 'Facebook' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Product</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-600">
                <a href="#features" className="block hover:text-primary">Features</a>
                <a href="#pricing" className="block hover:text-primary">Pricing</a>
                <a href="#blog" className="block hover:text-primary">Changelog</a>
                <a href="#blog" className="block hover:text-primary">Roadmap</a>
              </div>
            </div>

            <div id="blog">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Company</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-600">
                <a href="#top" className="block hover:text-primary">About</a>
                <a href="#blog" className="block hover:text-primary">Blog</a>
                <a href="#contact" className="block hover:text-primary">Careers</a>
                <a href="mailto:hello@bizflowng.com" className="block hover:text-primary">Contact</a>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">Legal</p>
              <div className="mt-5 space-y-3 text-sm text-neutral-600">
                <Link to="/privacy" className="block hover:text-primary">Privacy Policy</Link>
                <Link to="/terms" className="block hover:text-primary">Terms</Link>
                <Link to="/privacy" className="block hover:text-primary">Privacy & Cookies</Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-500 lg:flex-row lg:items-center lg:justify-between">
            <p>© 2025 BizFlow NG. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secured by Paystack</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-success" /> SSL Encrypted</span>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showCookieBanner ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-[28px] border border-neutral-200 bg-white p-5 shadow-modal"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MessageCircleMore className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-bold text-neutral-900">We use cookies to improve your experience.</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">
                    By continuing, you agree to our use of cookies for analytics, product improvement, and smoother sessions.
                  </p>
                </div>
              </div>
              <Button onClick={dismissCookieBanner}>Got it</Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
