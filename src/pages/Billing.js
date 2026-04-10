import React from 'react'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '₦5,000',
    period: '/ month',
    current: true,
    features: ['Invoices and PDF export', 'Client records', 'Products and services', 'WhatsApp invoice sharing']
  },
  {
    name: 'Growth',
    price: '₦12,000',
    period: '/ month',
    features: ['Everything in Starter', 'Expense tracking', 'Staff records', 'Dashboard insights', 'Priority onboarding support']
  },
  {
    name: 'Setup Support',
    price: 'From ₦50,000',
    period: 'one-time',
    features: ['Business profile setup', 'Client/product setup support', 'Workflow review', 'Team onboarding guidance']
  }
]

export default function Billing() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Plan & Billing</div>
          <div className="page-sub">Review available plans. Online checkout is not connected yet.</div>
        </div>
        <Link className="btn-outline" to="/support">Contact support</Link>
      </div>

      <div className="notice success">
        BizFlow NG is currently in guided rollout. When online payment checkout is ready, upgrades will happen here.
      </div>

      <div className="landing-grid">
        {plans.map(plan => (
          <article key={plan.name} className="landing-panel landing-plan">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <h3>{plan.name}</h3>
              {plan.current && <span className="badge badge-active">Current</span>}
            </div>
            <div className="landing-price">
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </div>
            <ul>
              {plan.features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
            <Link className={plan.current ? 'btn-outline' : 'btn-primary'} to="/support">
              {plan.current ? 'Ask a question' : 'Request this plan'}
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
