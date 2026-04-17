import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="hidden rounded-[32px] bg-neutral-950 p-10 text-white shadow-modal lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" className="inline-flex items-center gap-3 text-lg font-black">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                  BF
                </span>
                <span>BizFlow NG</span>
              </Link>
              <div className="mt-14 max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">
                  Built for Nigerian SMEs
                </p>
                <h1 className="mt-5 text-5xl font-black leading-tight">
                  Run your business with more clarity, less manual work.
                </h1>
                <p className="mt-5 text-lg leading-8 text-neutral-300">
                  Manage invoices, clients, products, expenses, and staff from one modern workspace that feels calm and reliable every day.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['14-day trial', 'Start free without entering a card.'],
                ['WhatsApp ready', 'Share invoices fast with customers.'],
                ['SME focused', 'Built around local business operations.'],
              ].map(([heading, body]) => (
                <div key={heading} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold">{heading}</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-300">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-neutral-200 bg-white p-6 shadow-modal sm:p-8">
              <div className="mb-8 text-center lg:text-left">
                <Link to="/" className="mx-auto inline-flex items-center gap-3 lg:hidden">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary font-black text-white">
                    BF
                  </span>
                  <span className="text-lg font-black text-neutral-900">BizFlow NG</span>
                </Link>
                <h2 className="mt-6 text-3xl font-black tracking-tight text-neutral-900">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{subtitle}</p>
              </div>
              {children}
              {footer ? <div className="mt-8 border-t border-neutral-200 pt-6">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
}
