import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, FileText, ShieldCheck } from 'lucide-react'

const marketingFeatures = [
  {
    icon: FileText,
    title: 'Professional invoicing',
    description: 'Create and send polished invoices in minutes.',
  },
  {
    icon: BarChart3,
    title: 'Live business reporting',
    description: 'Track revenue, payroll, and growth without guessing.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure operations',
    description: 'Business data protected with secure infrastructure.',
  },
]

export default function AuthSplitLayout({ title, subtitle, children }) {
  const statCards = useMemo(
    () => [
      ['₦2.4B processed', 'Across invoices and business transactions'],
      ['1,200+ businesses', 'Using BizFlow to stay organised'],
    ],
    []
  )

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-neutral-200 bg-white shadow-modal lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-primary-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.22),_transparent_28%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-sm font-black text-white">
                BF
              </span>
              <div>
                <p className="text-lg font-black">BizFlow NG</p>
                <p className="text-sm text-blue-100">Business OS for SMEs</p>
              </div>
            </Link>
            <div className="mt-20 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Built for confident operations</p>
              <h1 className="mt-5 text-5xl font-black leading-tight">Your business. Organized. Always.</h1>
              <div className="mt-10 space-y-5">
                {marketingFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.1 }}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-bold">{feature.title}</p>
                        <p className="mt-2 text-sm leading-6 text-blue-100">{feature.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {statCards.map(([value, caption], index) => (
              <motion.div
                key={value}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4 + index, repeat: Infinity, repeatType: 'mirror' }}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur"
              >
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-2 text-sm leading-6 text-blue-100">{caption}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-white px-4 py-8 sm:px-8">
          <div className="w-full max-w-xl">
            <div className="mb-8 text-center lg:text-left">
              <Link to="/" className="inline-flex items-center gap-3 lg:hidden">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-button">
                  BF
                </span>
                <div>
                  <p className="text-lg font-black text-neutral-900">BizFlow NG</p>
                  <p className="text-sm text-neutral-500">Business OS for SMEs</p>
                </div>
              </Link>
              <h2 className="mt-8 text-4xl font-black tracking-tight text-neutral-900">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-500">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

AuthSplitLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
