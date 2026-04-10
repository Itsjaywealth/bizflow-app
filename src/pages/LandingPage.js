import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    title: 'Invoices',
    body: 'Create invoices, add line items, calculate VAT, export PDF copies, and share invoice links.'
  },
  {
    title: 'Clients',
    body: 'Save customer details while creating invoices or add them separately from your client page.'
  },
  {
    title: 'Products and expenses',
    body: 'Save common products or services and record business spending so your records stay organised.'
  },
  {
    title: 'Staff records',
    body: 'Keep staff names, roles, salaries, and status in one simple workspace.'
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
  { label: 'Product overview', to: '/features', description: 'See what BizFlow NG does' },
  { label: 'How it works', to: '/how-it-works', description: 'From signup to first invoice' },
  { label: 'Pricing', to: '/pricing', description: 'See available service plans' },
  { label: 'Support center', to: '/support', description: 'Get help using BizFlow NG' }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

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
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">Built for Nigerian SMEs</div>
            <h1>Run invoicing, client records, and team admin from one calm dashboard.</h1>
            <p>
              BizFlow NG helps small businesses create invoices, save client details,
              manage staff records, and keep daily business information in one place.
            </p>
            <div className="landing-actions">
              <Link to="/auth" className="btn-primary landing-hero-btn">Start with your business email</Link>
              <Link to="/how-it-works" className="btn-outline landing-hero-btn">See how it works</Link>
            </div>
            <div className="landing-meta">
              <span>Simple setup</span>
              <span>Invoice links</span>
              <span>For Nigerian SMEs</span>
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-card-top">
              <span className="landing-card-pill">How BizFlow works</span>
              <span className="landing-card-note">Simple daily workflow</span>
            </div>
            <div className="landing-demo-list">
              <div>
                <strong>1. Add business details</strong>
                <p>Set your business name, contact information, bank details, logo link, and optional customer payment link.</p>
              </div>
              <div>
                <strong>2. Create an invoice</strong>
                <p>Enter a customer name, add invoice items, set a due date, and save the invoice.</p>
              </div>
              <div>
                <strong>3. Share and follow up</strong>
                <p>Send the invoice link, download a PDF, and update the status when payment is made.</p>
              </div>
            </div>
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
            <h2>The main tools inside BizFlow NG</h2>
            <p>
              A focused workspace for invoicing, records, and everyday business admin.
            </p>
          </div>
          <div className="landing-grid">
            {features.map((feature) => (
              <article key={feature.title} className="landing-panel">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
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
              <article key={plan.name} className="landing-panel landing-plan">
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
            Create your account, set up your business details, and start managing invoices, clients, and staff records in one place.
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
