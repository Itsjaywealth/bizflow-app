import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    icon: '🧾',
    title: 'Fast invoice creation',
    body: 'Create polished invoices with line items, due dates, PDF export, public links, and WhatsApp sharing.'
  },
  {
    icon: '🤝',
    title: 'Client records that stay organised',
    body: 'Save customer details once, review invoice history, and keep follow-up details in one place.'
  },
  {
    icon: '📦',
    title: 'Products, services, and expenses',
    body: 'Reuse saved items, track business spending, and keep everyday records connected.'
  },
  {
    icon: '📊',
    title: 'Live business dashboard',
    body: 'See paid revenue, pending invoices, expenses, and business activity from one dashboard.'
  }
]

const steps = [
  {
    title: 'Create your workspace',
    body: 'Sign up, confirm your email, and add your business details.'
  },
  {
    title: 'Create your first invoice',
    body: 'Add a customer, choose line items, and generate your first invoice.'
  },
  {
    title: 'Share with your customer',
    body: 'Send the invoice by link, PDF, or WhatsApp and keep records up to date.'
  }
]

const outcomes = [
  ['Less scattered admin', 'Keep invoices, clients, products, expenses, and staff records in one organised workspace.'],
  ['Faster customer follow-up', 'Share invoice links through WhatsApp and send reminders without rewriting messages.'],
  ['A clearer money picture', 'Track paid revenue, pending invoices, expenses, and estimated profit from the dashboard.']
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
    details: ['Invoice creation', 'PDF export', 'WhatsApp sharing', 'Client records', 'Products and services list']
  },
  {
    name: 'Growth',
    price: '₦12,000',
    period: '/ month',
    note: 'For growing teams that want staff records, expense tracking, and clearer business activity.',
    details: ['Everything in Starter', 'Staff management', 'Expense tracking', 'Business dashboard', 'Priority onboarding support']
  },
  {
    name: 'Setup Support',
    price: 'From ₦50,000',
    period: 'one-time',
    note: 'For businesses that want guided setup and onboarding support.',
    details: ['Business profile setup', 'Client and product setup support', 'Workflow review', 'Team onboarding guidance']
  }
]

const mobileNavItems = [
  { label: 'Features', to: '/features', description: 'See what BizFlow NG does' },
  { label: 'How it works', to: '/how-it-works', description: 'From signup to first invoice' },
  { label: 'Pricing', to: '/pricing', description: 'See available service plans' },
  { label: 'Support', to: '/support', description: 'Get help using BizFlow NG' }
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
          <strong>BizFlow NG</strong>
          <p>Simple business tools for Nigerian SMEs.</p>
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
              BizFlow NG helps you create invoices, manage customers, track expenses,
              and stay organised without switching between scattered tools.
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
            <span>Core features</span>
            <h2>Everything you need to keep daily business work organised</h2>
            <p>
              A practical workspace for invoices, customers, products, expenses, and staff records.
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

        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="landing-section-head">
            <span>How it works</span>
            <h2>From signup to first invoice in three simple steps</h2>
            <p>
              You can get started quickly without setting up every record first.
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

        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <span>Pricing</span>
            <h2>Simple pricing for small Nigerian businesses</h2>
            <p>
              Choose the plan that fits your current stage, and upgrade when your business grows.
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
                <Link to="/auth" className="btn-primary">Create account</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <h2>Put BizFlow NG to work for your business.</h2>
          <p>
            Create your account and start managing invoices, records, and daily business activity in one place.
          </p>
          <div className="landing-actions">
            <Link to="/auth" className="btn-primary landing-hero-btn">Create account</Link>
            <Link to="/support" className="btn-outline landing-hero-btn">Contact support</Link>
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
