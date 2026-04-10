import React from 'react'
import { Link } from 'react-router-dom'
import PageUtilityNav from '../components/PageUtilityNav'

const supportItems = [
  ['Account help', 'Login, email confirmation, password reset, and onboarding support.'],
  ['Invoice help', 'Creating invoices, copying invoice links, PDF downloads, and WhatsApp reminders.'],
  ['Business setup', 'Logo, payment details, products/services, staff records, and expense setup.']
]

export default function SupportPage() {
  return (
    <div className="legal-shell">
      <div className="legal-card support-card">
        <PageUtilityNav />
        <div className="landing-eyebrow">BizFlow NG Support</div>
        <h1>How can we help?</h1>
        <p className="legal-intro">
          Get help setting up and using BizFlow NG.
        </p>

        <div className="support-grid">
          {supportItems.map(([title, body]) => (
            <div key={title} className="support-panel">
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="support-actions">
          <a className="btn-primary" href="mailto:support@brandverseventures.com">Email Support</a>
          <Link className="btn-outline" to="/auth">Log in to BizFlow</Link>
        </div>
      </div>
    </div>
  )
}
