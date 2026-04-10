import React from 'react'
import { Link } from 'react-router-dom'
import PageUtilityNav from '../components/PageUtilityNav'

const pages = {
  features: {
    eyebrow: 'Product overview',
    title: 'Everything BizFlow NG helps your business manage',
    intro: 'BizFlow NG brings the everyday records of a small business into one simple workspace.',
    cards: [
      ['Invoices', 'Create invoices with line items, VAT, due dates, PDF export, public links, and WhatsApp sharing.'],
      ['Clients', 'Save customer details, view invoice history, and keep follow-up information organised.'],
      ['Products and services', 'Store your regular services or products so invoice creation is faster.'],
      ['Expenses', 'Record business spending and compare it with paid invoice revenue on the dashboard.'],
      ['Staff records', 'Keep staff roles, salary information, and status in one place.'],
      ['Business profile', 'Add your business details, bank details, logo link, and optional invoice payment link.']
    ]
  },
  how: {
    eyebrow: 'How it works',
    title: 'From signup to first invoice without confusion',
    intro: 'New users do not need to create clients or products first. BizFlow lets you start simple and add records as you work.',
    cards: [
      ['1. Create your account', 'Sign up with your email, confirm your account, and open your workspace.'],
      ['2. Add business details', 'Enter your business name, contact information, bank details, and optional logo link.'],
      ['3. Create an invoice', 'Type a new customer directly inside the invoice form or choose a saved client if one already exists.'],
      ['4. Share and track', 'Copy the invoice link, download a PDF, send a WhatsApp reminder, and update the payment status.']
    ]
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Simple plans for small Nigerian businesses',
    intro: 'Choose the plan that fits your current workflow. Public checkout is not enabled yet, so customers can create an account and contact support for setup.',
    cards: [
      ['Starter - ₦5,000 / month', 'Invoice creation, PDF export, WhatsApp sharing, client records, and products/services list.'],
      ['Growth - ₦12,000 / month', 'Everything in Starter, plus staff management, expense tracking, dashboard records, and onboarding support.'],
      ['Setup Support - From ₦50,000 one-time', 'Guided business profile setup, client/product setup support, workflow review, and team onboarding guidance.']
    ]
  }
}

export default function InfoPage({ type }) {
  const page = pages[type] || pages.features

  return (
    <div className="legal-shell">
      <div className="legal-card support-card">
        <PageUtilityNav />
        <div className="landing-eyebrow">{page.eyebrow}</div>
        <h1>{page.title}</h1>
        <p className="legal-intro">{page.intro}</p>

        <div className="support-grid">
          {page.cards.map(([title, body]) => (
            <div key={title} className="support-panel">
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="support-actions">
          <Link className="btn-primary" to="/auth">Create account</Link>
          <Link className="btn-outline" to="/support">Contact support</Link>
        </div>
      </div>
    </div>
  )
}
