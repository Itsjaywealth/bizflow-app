import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    title: 'Create professional invoices',
    body: 'Generate invoices, calculate VAT automatically, export PDF copies, create public invoice links, and share reminders through WhatsApp.'
  },
  {
    title: 'Keep client records organised',
    body: 'Store client names, contact details, and invoice history in one place so you can follow up faster.'
  },
  {
    title: 'Save products and services',
    body: 'Keep a simple price list for the services or products you sell, then add them to invoices faster.'
  },
  {
    title: 'Track expenses',
    body: 'Record business spending and compare expenses against recorded invoice revenue on your dashboard.'
  },
  {
    title: 'Manage staff records',
    body: 'Track roles, salaries, and staff status without jumping between notebooks and spreadsheets.'
  },
  {
    title: 'See business activity clearly',
    body: 'Monitor outstanding invoices, total revenue recorded, client count, and team size from one dashboard.'
  }
]

const steps = [
  'Create your account with email and password.',
  'Add your business details, logo, and payment instructions.',
  'Create clients, products, invoices, expenses, and staff records from your dashboard.'
]

const plans = [
  {
    name: 'Early Access',
    note: 'Best for solo founders and small teams getting started.',
    details: ['Invoice creation', 'PDF export', 'WhatsApp sharing', 'Client records']
  },
  {
    name: 'Growth',
    note: 'For businesses managing recurring invoices and staff records.',
    details: ['Everything in Early Access', 'Staff management', 'Business dashboard', 'Priority onboarding support']
  },
  {
    name: 'Custom Rollout',
    note: 'For businesses that want guided setup with BrandVerse Ventures.',
    details: ['Guided onboarding', 'Workflow review', 'Team setup support', 'Custom deployment planning']
  }
]

const mobileNavItems = [
  { label: 'Product overview', href: '#features', description: 'See what BizFlow NG does' },
  { label: 'How it works', href: '#how-it-works', description: 'From signup to first invoice' },
  { label: 'Plans', href: '#pricing', description: 'Choose an onboarding path' },
  { label: 'Support center', to: '/support', description: 'Get help and contact BrandVerse' }
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
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Plans</a>
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
              BizFlow NG helps small businesses stay organised with invoicing, PDF exports,
              WhatsApp sharing, staff records, and a simple view of business activity.
            </p>
            <div className="landing-actions">
              <Link to="/auth" className="btn-primary landing-hero-btn">Start with your business email</Link>
              <a href="#features" className="btn-outline landing-hero-btn">See what it does</a>
            </div>
            <div className="landing-meta">
              <span>No setup fee</span>
              <span>Simple onboarding</span>
              <span>BrandVerse support</span>
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="landing-card-top">
              <span className="landing-card-pill">Dashboard snapshot</span>
              <span className="landing-card-note">Current product capabilities</span>
            </div>
            <div className="landing-kpis">
              <div className="landing-kpi">
                <small>Revenue recorded</small>
                <strong>₦245,000</strong>
              </div>
              <div className="landing-kpi">
                <small>Pending invoices</small>
                <strong>4</strong>
              </div>
              <div className="landing-kpi">
                <small>Clients</small>
                <strong>12</strong>
              </div>
              <div className="landing-kpi">
                <small>Staff records</small>
                <strong>6</strong>
              </div>
            </div>
            <div className="landing-demo-list">
              <div>
                <strong>Invoices</strong>
                <p>Create line items, apply VAT, export PDF, copy a public invoice link, and mark status as pending, paid, or overdue.</p>
              </div>
              <div>
                <strong>Products and expenses</strong>
                <p>Save services you sell and record what the business spends, so your dashboard becomes more useful.</p>
              </div>
              <div>
                <strong>Business settings</strong>
                <p>Add your logo, contact details, bank details, and optional external payment link for invoices.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-section-head">
            <span>Core features</span>
            <h2>What BizFlow NG can help you do right now</h2>
            <p>
              Everything below is based on the product as it exists today, without inflated promises.
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

        <section className="landing-section landing-section-alt" id="how-it-works">
          <div className="landing-section-head">
            <span>Getting started</span>
            <h2>From signup to first invoice in a few clear steps</h2>
            <p>
              The onboarding flow is designed to be light: create an account, add your business, then start using the dashboard.
            </p>
          </div>
          <div className="landing-steps">
            {steps.map((step, index) => (
              <div key={step} className="landing-step">
                <div className="landing-step-num">{index + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <span>Plans</span>
            <h2>Choose the onboarding path that fits your business</h2>
          <p>
            Billing checkout is not yet exposed publicly in the app, so the current experience focuses on account creation, business records, and guided onboarding.
          </p>
          </div>
          <div className="landing-grid">
            {plans.map((plan) => (
              <article key={plan.name} className="landing-panel landing-plan">
                <h3>{plan.name}</h3>
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
            <a href="https://brandverseventures.com" className="btn-outline landing-hero-btn" target="_blank" rel="noreferrer">Visit BrandVerse Ventures</a>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <div className="landing-logo-text">BizFlow <span>NG</span></div>
          <p>A product by <a href="https://brandverseventures.com" target="_blank" rel="noreferrer">BrandVerse Ventures</a>.</p>
        </div>
        <div className="landing-footer-links">
          <Link to="/auth">Log in</Link>
          <Link to="/auth">Create account</Link>
          <Link to="/support">Support</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refund-policy">Refund policy</Link>
          <a href="https://brandverseventures.com" target="_blank" rel="noreferrer">BrandVerse Ventures</a>
        </div>
      </footer>
    </div>
  )
}
