import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import useToast from '../../hooks/useToast'
import { openBillingPortal, startCheckout } from '../../lib/billingApi'

const plans = [
  {
    name: 'Starter',
    price: '₦5,000',
    period: '/ month',
    features: ['Invoices and PDF export', 'Client records', 'Products and services', 'WhatsApp invoice sharing'],
  },
  {
    name: 'Growth',
    price: '₦12,000',
    period: '/ month',
    features: ['Everything in Starter', 'Expense tracking', 'Staff records', 'Dashboard insights', 'Priority onboarding support'],
  },
  {
    name: 'Setup Support',
    price: 'From ₦50,000',
    period: 'one-time',
    features: ['Business profile setup', 'Client/product setup support', 'Workflow review', 'Team onboarding guidance'],
  },
]

export default function Billing({ business }) {
  const currentPlan = business?.subscription_plan || 'Starter'
  const billingSettings = business?.billing_settings || {}
  const [loadingPlan, setLoadingPlan] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const toast = useToast()

  async function handleCheckout(planName) {
    setLoadingPlan(planName)
    try {
      await startCheckout(planName)
    } catch (error) {
      toast.error(error.message || 'Unable to start checkout right now.')
      setLoadingPlan('')
    }
  }

  async function handleBillingPortal() {
    setPortalLoading(true)
    try {
      await openBillingPortal()
    } catch (error) {
      toast.error(error.message || 'Unable to open billing portal right now.')
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Plan & Billing</div>
          <div className="page-sub">Review your current plan, compare upgrades, and choose the support level that fits your business.</div>
        </div>
        <div className="page-header-actions">
          <Link className="btn-outline" to="/pricing">View public pricing</Link>
          <Link className="btn-outline" to="/support">Contact support</Link>
        </div>
      </section>

      <Card className="rounded-[32px]">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Current workspace plan</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-950">{currentPlan}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
              Upgrades, guided setup support, and rollout help are all coordinated through BizFlow NG so you can grow without switching tools.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-400/15 bg-brand-gradient p-5 text-white shadow-glow">
            <p className="text-sm font-semibold text-neutral-700">Need billing help?</p>
            <p className="mt-2 text-sm leading-7 text-emerald-50/90">If you want help choosing a plan, setting up your workspace, or handling invoicing operations, our team can walk you through it.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {billingSettings.stripe_customer_id ? (
                <Button variant="secondary" loading={portalLoading} onClick={handleBillingPortal}>Manage billing</Button>
              ) : null}
              <Link className="btn-outline" to="/support">Talk to support</Link>
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`rounded-[32px] ${plan.name === 'Growth' ? 'border-emerald-400/30 bg-brand-gradient text-white shadow-glow' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className={`text-2xl font-black ${plan.name === 'Growth' ? 'text-white' : 'text-neutral-950'}`}>{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <strong className={`text-4xl font-black tracking-tight ${plan.name === 'Growth' ? 'text-white' : 'text-neutral-950'}`}>{plan.price}</strong>
                  <span className={`pb-1 text-sm font-medium ${plan.name === 'Growth' ? 'text-emerald-50/90' : 'text-neutral-500'}`}>{plan.period}</span>
                </div>
              </div>
              {currentPlan === plan.name ? <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${plan.name === 'Growth' ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary'}`}>Current</span> : null}
            </div>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${plan.name === 'Growth' ? 'border border-white/10 bg-white/8 text-emerald-50' : 'border border-emerald-400/12 bg-neutral-50 text-neutral-700 dark:bg-white/5'}`}>
                  <span className={`font-bold ${plan.name === 'Growth' ? 'text-white' : 'text-primary'}`}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              {currentPlan === plan.name ? (
                billingSettings.stripe_customer_id ? (
                  <Button variant="outline" fullWidth loading={portalLoading} onClick={handleBillingPortal}>Manage plan</Button>
                ) : (
                  <Button variant="outline" fullWidth disabled>Current plan</Button>
                )
              ) : (
                <Button
                  fullWidth
                  variant={plan.name === 'Growth' ? 'secondary' : 'primary'}
                  loading={loadingPlan === plan.name}
                  onClick={() => handleCheckout(plan.name)}
                >
                  {plan.name === 'Setup Support' ? 'Buy setup support' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}

Billing.propTypes = { business: PropTypes.object }
