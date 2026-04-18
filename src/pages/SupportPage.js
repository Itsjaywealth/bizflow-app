import React from 'react'
import { Link } from 'react-router-dom'
import PageUtilityNav from '../components/PageUtilityNav'
import Seo from '../components/Seo'
import { SUPPORT_EMAIL, getSupportMailto } from '../lib/support'

const supportItems = [
  ['Account help', 'Login, email confirmation, password reset, and onboarding support.'],
  ['Invoice help', 'Creating invoices, copying invoice links, PDF downloads, and WhatsApp reminders.'],
  ['Business setup', 'Logo, payment details, products/services, staff records, and expense setup.'],
  ['Launch guidance', 'Help with domain, branded emails, onboarding clarity, and getting BizFlow ready for customers.']
]

export default function SupportPage() {
  return (
    <div className="legal-shell">
      <Seo
        title="Support — BizFlow NG"
        description="Get help with onboarding, invoices, business setup, and account support for BizFlow NG."
        path="/support"
      />
      <div className="legal-card support-card">
        <PageUtilityNav />
        <div className="landing-eyebrow">BizFlow NG Support</div>
        <h1>How can we help?</h1>
        <p className="legal-intro">
          Get help setting up and using BizFlow NG. Reach our support team directly at {SUPPORT_EMAIL} for guided product assistance and account help.
        </p>

        <div className="support-grid">
          {supportItems.map(([title, body]) => (
            <div key={title} className="support-panel">
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="notice success">
          For faster help, include your business name, the page you were on, and a short screenshot or screen recording when reporting a problem.
        </div>

        <div className="support-actions">
          <a className="btn-primary" href={getSupportMailto('BizFlow NG Support Request')}>Email Support</a>
          <Link className="btn-outline" to="/login">Log in to BizFlow</Link>
        </div>
      </div>
    </div>
  )
}
