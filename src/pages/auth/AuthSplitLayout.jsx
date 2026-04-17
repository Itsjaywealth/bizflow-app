import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart3, FileText, ShieldCheck } from 'lucide-react'
import BrandLogo from '../../components/BrandLogo'

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
    <div className="brand-app-shell min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 dark:bg-darkbg">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-neutral-200 bg-white shadow-modal dark:border-brand-glow/10 dark:bg-white/5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative hidden overflow-hidden bg-brand-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_28%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <BrandLogo textClassName="text-white [&>span:last-child]:text-emerald-100" />
            </Link>
            <div className="mt-20 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-100">Built for confident operations</p>
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
                        <p className="mt-2 text-sm leading-6 text-emerald-100/90">{feature.description}</p>
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
                <p className="mt-2 text-sm leading-6 text-emerald-100/90">{caption}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center bg-white/90 px-4 py-8 sm:px-8 dark:bg-white/5">
          <div className="w-full max-w-xl">
            <div className="mb-8 text-center lg:text-left">
              <Link to="/" className="inline-flex items-center gap-3 lg:hidden">
                <BrandLogo />
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
