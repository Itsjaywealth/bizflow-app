import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    icon: '🧾',
    title: 'Smart Invoicing',
    body: 'Create, send, and track invoices with PDF export and WhatsApp sharing.'
  },
  {
    icon: '🤝',
    title: 'Client Management',
    body: 'Build a complete client database with invoice history and notes.'
  },
  {
    icon: '📦',
    title: 'Product Catalogue',
    body: 'Maintain your products and services with pricing for faster invoicing.'
  },
  {
    icon: '💸',
    title: 'Expense Tracking',
    body: 'Record and categorize business expenses to see true profitability.'
  },
  {
    icon: '👥',
    title: 'Team Management',
    body: 'Add staff, assign roles, and keep HR records organized.'
  },
  {
    icon: '📊',
    title: 'Business Analytics',
    body: 'Real-time dashboard showing revenue, costs, and business health.'
  }
]

const steps = [
  {
    title: 'Create your account',
    body: 'Sign up free, confirm email, and enter your business details.'
  },
  {
    title: 'Add your first invoice',
    body: 'Type a client name directly on the invoice — no setup needed.'
  },
  {
    title: 'Grow with your data',
    body: 'Track payments, expenses, and team as your business scales.'
  }
]

const testimonials = [
  {
    quote: 'BizFlow has completely replaced my spreadsheet chaos. I send invoices in seconds now.',
    author: 'Adaeze Okonkwo',
    role: 'Fashion Business, Lagos'
  },
  {
    quote: 'The WhatsApp invoice sharing alone is worth it. My clients pay faster now.',
    author: 'Emeka Nwachukwu',
    role: 'Logistics Company, Abuja'
  },
  {
    quote: 'As a small shop owner, having invoices, clients, and expenses in one place is a game changer.',
    author: 'Fatima Abdullahi',
    role: 'Retail Shop, Kano'
  }
]

const faqs = [
  {
    question: 'Do I need technical skills?',
    answer: 'No. BizFlow NG is designed for everyday business owners, not developers. If you can use WhatsApp, you can use BizFlow.'
  },
  {
    question: 'Can I try it before paying?',
    answer: 'Yes — every account includes a 14-day free trial with full access to all features. No credit card required to start.'
  },
  {
    question: 'Is my data safe?',
    answer: 'Your data is encrypted and stored securely. We use bank-grade security standards and never share your information.'
  },
  {
    question: 'Can I use it on my phone?',
    answer: 'Yes. BizFlow NG works on any device — phone, tablet, or computer.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept cards, bank transfer, and USSD via Paystack — all major Nigerian banks supported.'
  }
]

const socialAvatars = ['👩🏽‍💼', '🧑🏾‍💻', '👨🏽‍💼', '👩🏾‍🍳', '🧕🏽', '👨🏾‍🔧']

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
    period: '/mo',
    note: 'For solo founders and small businesses getting organised.',
    details: ['Smart invoicing', 'Client records', 'Product catalogue', 'WhatsApp invoice sharing']
  },
  {
    name: 'Growth',
    price: '₦12,000',
    period: '/mo',
    note: 'For growing teams that need clearer operations and reporting.',
    details: ['Everything in Starter', 'Expense tracking', 'Team management', 'Business analytics']
  }
]

const mobileNavItems = [
  { label: 'Features', href: '#features', description: 'See everything included' },
  { label: 'How it works', href: '#how-it-works', description: 'Get started in minutes' },
  { label: 'Pricing', href: '#pricing', description: 'Choose your plan' },
  { label: 'Support', to: '/support', description: 'Get help and contact support' },
  { label: 'Book Demo', href: 'mailto:admin@brandverseventures.com?subject=BizFlow%20NG%20Demo', description: 'Speak with the team' }
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z" /></svg>
          </div>
          <div className="landing-logo-text">BizFlow <span>NG</span></div>
        </Link>

        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link to="/support">Support</Link>
          <a href="mailto:admin@brandverseventures.com?subject=BizFlow%20NG%20Demo">Book Demo</a>
        </div>

        <div className="landing-nav-cta">
          <ThemeToggle compact />
          <Link to="/auth" className="landing-link">Log in</Link>
          <Link to="/auth" className="btn-primary">Start Free</Link>
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
          <p>Smart tools for Nigerian businesses.</p>
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
          <Link to="/auth" className="btn-primary landing-mobile-cta" onClick={closeMobileMenu}>Start Free</Link>
        </div>
      </div>

      <main>
        <section className="landing-hero world-hero">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">🇳🇬 Built for Nigerian SMEs</div>
            <h1>Run Your Business. Not Spreadsheets.</h1>
            <p>
              BizFlow NG gives you invoices, client records, expenses, inventory, and
              staff management in one simple workspace — built for how Nigerian businesses actually work.
            </p>
            <div className="landing-actions">
              <Link to="/auth" className="btn-primary landing-hero-btn">Start for Free — No credit card needed</Link>
              <a href="mailto:admin@brandverseventures.com?subject=BizFlow%20NG%20Demo" className="btn-outline landing-hero-btn">Book a Demo →</a>
            </div>
            <div className="landing-social-proof">
              <div className="landing-avatar-strip">
                {socialAvatars.map(avatar => (
                  <span key={avatar} className="landing-avatar" aria-hidden="true">{avatar}</span>
                ))}
              </div>
              <strong>Join 500+ Nigerian businesses</strong>
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

        <section className="landing-section" id="features">
          <div className="landing-section-head">
            <span>Features</span>
            <h2>Everything your business needs in one place</h2>
            <p>Manage daily operations, customer billing, and business records from one calm workspace.</p>
          </div>
          <div className="world-feature-grid">
            {features.map(feature => (
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
            <h2>Get set up in under 5 minutes</h2>
            <p>Start simple today and let your records grow with your business over time.</p>
          </div>
          <div className="landing-steps-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="landing-step">
                <div className="landing-step-number">{String(index + 1).padStart(2, '0')}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-head">
            <span>Testimonials</span>
            <h2>Trusted by Nigerian business owners</h2>
            <p>From small shops to service businesses, BizFlow NG helps teams move faster with less chaos.</p>
          </div>
          <div className="landing-grid">
            {testimonials.map(item => (
              <article key={item.author} className="landing-panel">
                <div style={{ color: '#f59e0b', marginBottom: 12, fontSize: 16 }}>★★★★★</div>
                <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600, marginBottom: 18 }}>&ldquo;{item.quote}&rdquo;</p>
                <strong style={{ display: 'block', color: 'var(--dark)' }}>{item.author}</strong>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>{item.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <div className="landing-section-head">
            <span>Pricing</span>
            <h2>Simple, honest pricing</h2>
            <p>Choose a plan that fits your business today and scale up when you need more.</p>
          </div>
          <div className="landing-grid">
            {plans.map(plan => (
              <article key={plan.name} className={`landing-panel landing-plan ${plan.name === 'Growth' ? 'featured-plan' : ''}`}>
                <h3>{plan.name}</h3>
                <div className="landing-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <p>{plan.note}</p>
                <ul>
                  {plan.details.map(item => <li key={item}>{item}</li>)}
                </ul>
                <Link to="/auth" className="btn-primary">Start Free</Link>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <Link to="/pricing" className="landing-link" style={{ color: 'var(--green)', fontWeight: 800 }}>See full pricing →</Link>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-head">
            <span>FAQs</span>
            <h2>Common questions</h2>
            <p>Everything you need to know before you get started.</p>
          </div>
          <div className="landing-faq-grid">
            {faqs.map(item => (
              <article key={item.question} className="landing-faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final-cta">
          <h2>Ready to take control of your business?</h2>
          <p>
            Join hundreds of Nigerian entrepreneurs using BizFlow NG to invoice faster,
            track expenses, and grow with clarity.
          </p>
          <div className="landing-actions" style={{ justifyContent: 'center' }}>
            <Link to="/auth" className="btn-primary landing-hero-btn">Create Your Free Account →</Link>
          </div>
          <div className="landing-cta-small-text">14-day free trial • No credit card required • Cancel anytime</div>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <div className="landing-logo-text">BizFlow <span>NG</span></div>
          <p>Smart tools for Nigerian businesses</p>
        </div>
        <div className="landing-footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link to="/support">Support</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        <div className="landing-footer-links">
          <a className="landing-social-link" href="https://www.instagram.com/bizflowng?igsh=a2N2OXk5bHB3NDhk" target="_blank" rel="noreferrer" aria-label="BizFlow NG on Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
            </svg>
            <span>Instagram</span>
          </a>
          <a className="landing-social-link" href="https://x.com/bizflowng" target="_blank" rel="noreferrer" aria-label="BizFlow NG on X">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4L20 20M20 4L4 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
            <span>X</span>
          </a>
        </div>
      </footer>
      <div className="landing-footer-copyright">© 2026 BizFlow NG by BrandVerse Ventures. All rights reserved.</div>
    </div>
  )
}
