import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    icon: '🧾',
    title: 'Fast invoice creation',
    body: 'Create clean invoices with line items, VAT, due dates, PDF export, public links, and WhatsApp sharing.'
  },
  {
    icon: '🤝',
    title: 'Client records that grow with you',
    body: 'Save customer details while creating invoices or add them separately, then review their invoice history later.'
  },
  {
    icon: '📦',
    title: 'Products, services, and expenses',
    body: 'Save common services, reuse prices on invoices, and record spending so business records stay organised.'
  },
  {
    icon: '📊',
    title: 'Business dashboard',
    body: 'See paid revenue, pending invoices, expenses, estimated profit, clients, and team records from one dashboard.'
  },
  {
    icon: '👥',
    title: 'Staff and team records',
    body: 'Keep staff names, roles, salaries, phone numbers, and active status in one simple workspace.'
  },
  {
    icon: '🏦',
    title: 'Customer payment details',
    body: 'Add bank details and an optional payment link so customers know how to pay from the invoice page.'
  }
]

const steps = [
  {
    title: 'Create your workspace',
    body: 'Sign up, confirm your email, and add your business name, contact details, and invoice information.'
  },
  {
    title: 'Create your first invoice',
    body: 'Type a new customer directly on the invoice or choose a saved client if you already have one.'
  },
  {
    title: 'Share with your customer',
    body: 'Copy the invoice link, download a PDF, or send a WhatsApp reminder from the invoice table.'
  },
  {
    title: 'Keep records together',
    body: 'Add products, expenses, and staff records as your business grows, then track activity from the dashboard.'
  }
]

const smeTypes = [
  ['Retail & online sellers', 'Save customers, create invoices, and track expenses without a spreadsheet.'],
  ['Service providers', 'Reuse common services, send invoice links, and follow up from WhatsApp.'],
  ['Food, beauty & lifestyle businesses', 'Keep simple records for customers, staff, supplies, and monthly costs.'],
  ['Agencies & consultants', 'Manage retainers, one-off projects, client billing, and receipts in one workspace.'],
  ['Logistics & local operations', 'Record repeat charges, dispatch costs, salaries, and pending payments clearly.'],
  ['Growing teams', 'Keep staff records, business details, and daily admin organized as the business expands.']
]

const outcomes = [
  ['Less scattered records', 'Keep invoices, clients, products, expenses, and staff details in one organized workspace.'],
  ['Faster customer follow-up', 'Share invoice links through WhatsApp and send reminders without rewriting the same message.'],
  ['Clearer money view', 'Track paid revenue, pending invoices, expenses, and estimated profit from the dashboard.']
]

const productHighlights = [
  ['Invoice studio', 'Create, preview, edit, download, share, and track invoice status.'],
  ['Business profile', 'Save contact details, bank information, logo link, and customer-facing payment information.'],
  ['Operating records', 'Manage products, services, expenses, staff, and client records as the business grows.']
]

const testimonials = [
  {
    quote: "BizFlow NG replaced my notebook and WhatsApp voice notes. Now I can see exactly what I've been paid and what's still pending.",
    name: 'Chioma A.',
    role: 'Fashion & Beauty Business, Lagos'
  },
  {
    quote: "I used to send invoices as screenshots. Now my clients get a proper link and I can track who has paid without asking.",
    name: 'Emeka O.',
    role: 'Logistics & Delivery, Abuja'
  },
  {
    quote: "Setting up took less than 10 minutes. I had my first invoice sent before the end of that same day.",
    name: 'Funmi B.',
    role: 'Consulting & Services, Port Harcourt'
  }
]

const faqs = [
  {
    q: 'Do I need technical knowledge to use BizFlow NG?',
    a: 'No. If you can use WhatsApp, you can use BizFlow NG. Signup takes under 5 minutes and your first invoice can be created on the same day.'
  },
  {
    q: 'Can I use BizFlow NG on my phone?',
    a: 'Yes. BizFlow NG works on any device — phone, tablet, or computer — through your browser. No app download is required.'
  },
  {
    q: 'What happens to my data if I stop paying?',
    a: 'Your data stays safe. You can export your invoices and records at any time. We do not delete your account immediately if a payment is missed.'
  },
  {
    q: 'Can I add my business logo to invoices?',
    a: 'Yes. You can add a logo link in your business settings and it will appear on your invoices and public invoice pages.'
  },
  {
    q: 'How does WhatsApp sharing work?',
    a: 'Every invoice gets a unique public link. You can copy it and paste it into any WhatsApp chat, or use the built-in WhatsApp reminder button from the invoice table.'
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes. You can create an account and explore the workspace before subscribing. The Setup Support plan is a one-time service for businesses that want hands-on help getting started.'
  }
]

const previewMetrics = [
  { revenue: 125000, pending: 48000 },
  { revenue: 310000, pending: 85000 },
  { revenue: 675000, pending: 120000 },
  { revenue: 920000, pending: 65000 }
]

const plans = [
  {
    name: 'Starter',
    price: '₦5,000',
    period: '/ month',
    note: 'For solo founders and small businesses that need clean invoicing and customer records.',
    cta: 'Start with Starter',
    details: ['Invoice creation', 'PDF export', 'WhatsApp sharing', 'Client records', 'Products and services list']
  },
  {
    name: 'Growth',
    price: '₦12,000',
    period: '/ month',
    note: 'For growing teams that want staff records, expense tracking, and clearer business activity.',
    cta: 'Get the Growth plan',
    details: ['Everything in Starter', 'Staff management', 'Expense tracking', 'Business dashboard', 'Priority onboarding support']
  },
  {
    name: 'Setup Support',
    price: 'From ₦50,000',
    period: 'one-time',
    note: 'For businesses that want guided setup and onboarding support.',
    cta: 'Talk to us',
    details: ['Business profile setup', 'Client and product setup support', 'Workflow review', 'Team onboarding guidance']
  }
]

const mobileNavItems = [
  { label: 'Product overview', to: '/features', description: 'See what BizFlow NG does' },
  { label: 'How it works', to: '/how-it-works', description: 'From signup to first invoice' },
  { label: 'Pricing', to: '/pricing', description: 'See available service plans' },
  { label: 'Support center', to: '/support', description: 'Get help using BizFlow NG' }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPreviewIndex(index => (index + 1) % previewMetrics.length)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  function formatNaira(value) {
    return `₦${Number(value).toLocaleString()}`
  }

  const preview = previewMetrics[previewIndex]

  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link to="/home" className="landing-logo">
          <div className="landing-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z"/></svg>
          </div>
          <div className="landing-logo-text">BizFlow <span>NG</span></div>
        </Link>
        <div className="landing-nav-links">
          <Link to="/features">Features</Link>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/support">Support</Link>
        </div>
        <div className="landing-nav-cta">
          <ThemeToggle compact />
          <Link to="/auth" className="landing-link">Log in</Link>
          <Link to="/auth" className="btn-primary">Create account</Link>
        </div>
        <button
          className="landing-menu-button"
          type="button"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="landing-mobile-menu"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
        >
          <span>{mobileMenuOpen ? 'x' : '☰'}</span>
        </button>
      </header>

      <div id="landing-mobile-menu" className={`landing-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="landing-mobile-menu-head">
          <strong>Explore BizFlow NG</strong>
          <p>Move around the product, learn the features, or create your account.</p>
        </div>
        {mobileNavItems.map(item => item.to ? (
          <Link key={item.label} to={item.to} onClick={closeMobileMenu}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </Link>
        ) : (
          <a key={item.label} href={item.href} onClick={closeMobileMenu}>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </a>
        ))}
        <div className="landing-mobile-actions">
          <ThemeToggle />
          <Link to="/auth" className="btn-outline landing-mobile-cta" onClick={closeMobileMenu}>Log in</Link>
          <Link to="/auth" className="btn-primary landing-mobile-cta" onClick={closeMobileMenu}>Create account</Link>
        </div>
      </div>

      <main>
        <section className="landing-hero world-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">Built for Nigerian SMEs</div>
            <h1>Streamline invoicing, records, and team operations in one workspace.</h1>
            <p>
              BizFlow NG gives growing businesses a polished workspace for invoices,
              clients, staff records, products, expenses, and daily business decisions.
            </p>
            <div className="landing-actions">
              <Link to="/auth" className="btn-primary landing-hero-btn">Start with your business email</Link>
              <Link to="/how-it-works" className="btn-outline landing-hero-btn">See how it works</Link>
            </div>
            <div className="landing-meta">
              <span>No spreadsheet stress</span>
              <span>WhatsApp-ready invoices</span>
              <span>Built by BrandVerse Ventures</span>
            </div>
          </div>

          <div className="world-product-preview" aria-label="BizFlow NG product preview">
            <div className="preview-window-bar">
              <span></span><span></span><span></span>
              <strong>BizFlow NG Business Overview</strong>
            </div>
            <div className="preview-hero-strip">
              <div>
                <small>Revenue paid</small>
                <strong>{formatNaira(preview.revenue)}</strong>
                <span>Updates as invoices are marked paid</span>
              </div>
              <div>
                <small>Awaiting payment</small>
                <strong>{formatNaira(preview.pending)}</strong>
                <span>Follow up from invoice records</span>
              </div>
            </div>
            <div className="preview-main-grid">
              <div className="preview-panel tall">
                <div className="preview-panel-head">
                  <strong>Today’s flow</strong>
                  <span>guided</span>
                </div>
                {['Create invoice', 'Share via WhatsApp', 'Record expenses', 'Review dashboard'].map(item => (
                  <div className="preview-task" key={item}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
              <div className="preview-panel">
                <strong>Invoice actions</strong>
                <div className="preview-chip-row">
                  <span>PDF</span>
                  <span>Link</span>
                  <span>Reminder</span>
                </div>
              </div>
              <div className="preview-panel">
                <strong>Records</strong>
                <p>Clients, products, staff, and expenses stay connected.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="world-trust-strip">
          {outcomes.map(([title, body]) => (
            <article key={title}>
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </section>

        <section className="landing-section">
          <div className="landing-section-head">
            <span>Made for real business work</span>
            <h2>Built for every Nigerian SME that needs clearer records</h2>
            <p>
              Whether you sell products, offer services, manage staff, or run daily operations,
              BizFlow NG gives you a simple way to keep business activity organized.
            </p>
          </div>
          <div className="landing-grid">
            {smeTypes.map(([title, body]) => (
              <article key={title} className="landing-panel world-hover-card">
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="landing-section-head">
            <span>How it works</span>
            <h2>From signup to first invoice in a few clear steps</h2>
            <p>
              New users do not need to set up everything first. You can create a customer while making your first invoice.
            </p>
          </div>
          <div className="landing-steps">
            {steps.map((step, index) => (
              <div key={step.title} className="landing-step">
                <div className="landing-step-num">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-section-head">
            <span>Core features</span>
            <h2>A complete starter operating system for small businesses</h2>
            <p>
              A focused workspace for invoicing, records, and everyday business admin.
            </p>
          </div>
          <div className="world-feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="landing-panel world-feature-card">
                <div className="world-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section world-command-section">
          <div className="landing-section-head">
            <span>Inside the product</span>
            <h2>Designed around how small teams actually work</h2>
            <p>
              BizFlow NG keeps the important business activities close together, so owners spend less time searching and more time serving customers.
            </p>
          </div>
          <div className="world-command-grid">
            {productHighlights.map(([title, body]) => (
              <article key={title} className="world-command-card">
                <div className="world-command-line"></div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <span>Pricing</span>
            <h2>Simple pricing for small Nigerian businesses</h2>
            <p>
              Start with the plan that fits your current workflow. If you need help setting up clients, products, and team records, setup support is available.
            </p>
          </div>
          <div className="landing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`landing-panel landing-plan ${plan.name === 'Growth' ? 'featured-plan' : ''}`}>
                {plan.name === 'Growth' && <div className="plan-ribbon">Popular for growing SMEs</div>}
                <h3>{plan.name}</h3>
                <div className="landing-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <p>{plan.note}</p>
                <ul>
                  {plan.details.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link to="/auth" className="btn-primary">{plan.cta}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-testimonials-section">
          <div className="landing-section-head">
            <span>What users say</span>
            <h2>Real Nigerian businesses, real results</h2>
            <p>
              Here is what business owners say after switching to BizFlow NG.
            </p>
          </div>
          <div className="landing-testimonials-grid">
            {testimonials.map((t) => (
              <article key={t.name} className="landing-testimonial-card">
                <div className="landing-testimonial-stars">★★★★★</div>
                <p className="landing-testimonial-quote">"{t.quote}"</p>
                <div className="landing-testimonial-author">
                  <div className="landing-testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-faq-section">
          <div className="landing-section-head">
            <span>FAQ</span>
            <h2>Questions people ask before signing up</h2>
          </div>
          <div className="landing-faq-grid">
            {faqs.map((faq) => (
              <article key={faq.q} className="landing-faq-card">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <h2>Put BizFlow NG to work for your business.</h2>
          <p>
            Create your account, set up your business details, and start managing invoices, clients, and staff records in one place.
          </p>
          <div className="landing-actions">
            <Link to="/auth" className="btn-primary landing-hero-btn">Start free today</Link>
            <Link to="/support" className="btn-outline landing-hero-btn">Talk to us first</Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <div className="landing-logo-text">BizFlow <span>NG</span></div>
          <p>A product by <a href="https://brandverseventures.com" target="_blank" rel="noreferrer">BrandVerse Ventures</a>.</p>
        </div>
        <div className="landing-footer-links">
          <Link to="/features">Features</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/support">Support</Link>
        </div>
      </footer>
    </div>
  )
}
