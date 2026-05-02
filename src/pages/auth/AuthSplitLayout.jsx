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

export default function AuthSplitLayout({ title, subtitle, children, minimal = false }) {
  const statCards = useMemo(
    () => [
      ['₦2.4B processed', 'Across invoices and business transactions'],
      ['1,200+ businesses', 'Using BizFlow to stay organised'],
    ],
    []
  )

  return (
    <div className="brand-app-shell min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8 dark:bg-darkbg">
      <div className={`mx-auto ${minimal ? 'flex min-h-[calc(100vh-3rem)] max-w-[460px] items-center justify-center' : 'grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-neutral-200 bg-white shadow-modal dark:border-brand-glow/10 dark:bg-white/5 lg:grid-cols-[1.12fr_0.88fr]'}`}>
        {!minimal ? (
        <div className="relative hidden overflow-hidden bg-brand-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(52,211,153,0.18),_transparent_28%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <BrandLogo textClassName="text-white [&>span:last-child]:text-emerald-100" />
            </Link>
            <div className="mt-20 max-w-xl">
              <div className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-100">
                Built for confident operations
              </div>
              <h1 className="mt-6 text-5xl font-black leading-tight">Your business. Organized. Always.</h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-emerald-100/90">
                Run invoicing, revenue tracking, payroll, and daily operations from a cleaner workspace that feels built for growing teams.
              </p>
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
        ) : null}

        <div className={`relative flex items-center justify-center ${minimal ? 'w-full rounded-[28px] border border-neutral-200/90 bg-white/94 px-4 py-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.4)] dark:border-brand-glow/10 dark:bg-[#07140d]/90 sm:px-6 sm:py-7' : 'bg-white/90 px-4 py-8 sm:px-8 dark:bg-white/5'}`}>
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_72%)] dark:bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.16),transparent_72%)]" />
          <div className={`w-full ${minimal ? 'max-w-[430px]' : 'max-w-xl'}`}>
            <div className={`mb-8 ${minimal ? 'text-center' : 'text-center lg:text-left'}`}>
              <Link to="/" className={`inline-flex items-center gap-3 ${minimal ? '' : 'lg:hidden'}`}>
                <BrandLogo />
              </Link>
              <h1 className={`text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl ${minimal ? 'mt-6' : 'mt-5'}`}>{title}</h1>
              <p className={`text-sm leading-7 text-neutral-500 ${minimal ? 'mt-2' : 'mt-3 max-w-xl'}`}>{subtitle}</p>
            </div>

            <div className={`rounded-[28px] border border-emerald-500/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,252,249,0.98))] shadow-[0_22px_60px_-36px_rgba(22,163,74,0.22)] backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] ${minimal ? 'p-5 sm:p-7' : 'p-6 sm:p-8'}`}>
              {children}
            </div>
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
  minimal: PropTypes.bool,
}
