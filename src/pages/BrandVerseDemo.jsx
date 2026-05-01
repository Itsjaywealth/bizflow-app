import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CreditCard,
  MessageCircleMore,
  ReceiptText,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'

const stats = [
  { label: 'Revenue this month', value: '₦4.8M', note: '+18% vs last month' },
  { label: 'Outstanding invoices', value: '12', note: '3 due this week' },
  { label: 'Active clients', value: '47', note: '8 new this month' },
]

const quickActions = [
  'Create invoice',
  'Send WhatsApp reminder',
  'Generate Paystack link',
  'View client history',
]

const clientRows = [
  { name: 'Apex Logistics', amount: '₦450,000', status: 'Sent' },
  { name: 'Luna Studio', amount: '₦180,000', status: 'Overdue' },
  { name: 'Harvest Foods', amount: '₦720,000', status: 'Paid' },
]

function Surface({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-emerald-500/12 bg-white/92 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05] ${className}`}>
      {children}
    </div>
  )
}

export default function BrandVerseDemo() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_35%),linear-gradient(180deg,#f4fbf7_0%,#f8fafc_48%,#eef6f1_100%)] text-neutral-950 dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_28%),linear-gradient(180deg,#09111c_0%,#0c1624_50%,#111a27_100%)] dark:text-white">
      <Seo
        title="BrandVerse Demo — WhatsApp-First Invoicing Web App"
        description="A sample BrandVerse web app experience for WhatsApp-first invoicing, client management, and AI-assisted operations."
        path="/brandverse-demo"
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">
            BrandVerse Demo
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="btn-outline w-full sm:w-auto">Start Free Trial</Link>
            <Link to="/login" className="btn-primary w-full sm:w-auto">Open BizFlow</Link>
          </div>
        </div>

        <section className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.95fr)] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/18 bg-emerald-50/90 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary dark:bg-white/[0.05] dark:text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Sample product direction
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              A mobile-first web app BrandVerse could launch for invoicing and client operations.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              This sample shows a WhatsApp-first invoicing experience built for Nigerian SMEs: create invoices fast, get paid via Paystack, follow up overdue clients, and let AI suggest the next best action.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <Surface key={item.label} className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-black text-neutral-950 dark:text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{item.note}</p>
                </Surface>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-500/14 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                WhatsApp sharing
              </span>
              <span className="rounded-full border border-emerald-500/14 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                Paystack links
              </span>
              <span className="rounded-full border border-emerald-500/14 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                AI follow-ups
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="relative"
          >
            <div className="absolute -right-10 top-8 hidden h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl lg:block" />
            <div className="absolute -left-10 bottom-0 hidden h-44 w-44 rounded-full bg-sky-400/15 blur-3xl lg:block" />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <Surface className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">Desktop dashboard</p>
                    <h2 className="mt-2 text-2xl font-black">BrandVerse Ops</h2>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right dark:bg-white/[0.06]">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Collected</p>
                    <p className="mt-1 text-lg font-black text-emerald-700 dark:text-emerald-300">₦2.1M</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] border border-emerald-500/10 bg-[#f8fcfa] p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                        <ReceiptText className="h-4 w-4" />
                        New invoice
                      </div>
                      <div className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                        VAT 7.5%
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Client</p>
                        <p className="mt-2 font-semibold">Apex Logistics Ltd</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Amount</p>
                          <p className="mt-2 font-semibold">₦450,000</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Due</p>
                          <p className="mt-2 font-semibold">May 7, 2026</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-3 text-sm font-bold text-white shadow-glow">
                        <CreditCard className="h-4 w-4" />
                        Generate Paystack link
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/14 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                        <MessageCircleMore className="h-4 w-4" />
                        Share on WhatsApp
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-emerald-500/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <Bot className="h-4 w-4" />
                      BrandVerse AI
                    </div>
                    <div className="mt-4 rounded-2xl border border-emerald-500/10 bg-[#f7fcf9] p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <p className="text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                        You have <span className="font-semibold text-neutral-950 dark:text-white">3 overdue invoices</span>. Want me to draft a reminder for Apex Logistics?
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      <button className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                        Send reminder to client <ArrowRight className="h-4 w-4 text-primary" />
                      </button>
                      <button className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                        Create invoice <ArrowRight className="h-4 w-4 text-primary" />
                      </button>
                      <button className="flex w-full items-center justify-between rounded-2xl border border-emerald-500/10 bg-white px-4 py-3 text-left text-sm font-semibold text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200">
                        Review overdue payments <ArrowRight className="h-4 w-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-emerald-500/10 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">Client activity</p>
                      <h3 className="mt-2 text-lg font-black">Recent invoices</h3>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                      <UsersRound className="h-4 w-4" />
                      47 clients
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {clientRows.map((row) => (
                      <div key={row.name} className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/10 bg-[#fbfefc] px-4 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <div>
                          <p className="font-semibold">{row.name}</p>
                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-300">{row.amount}</p>
                        </div>
                        <span className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                          row.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
                            : row.status === 'Overdue'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
                              : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-200'
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Surface>

              <Surface className="mx-auto max-w-[220px] p-3 lg:mx-0">
                <div className="rounded-[34px] border border-neutral-900 bg-[#0c1420] p-3 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.75)]">
                  <div className="rounded-[28px] bg-[linear-gradient(180deg,#102132_0%,#132838_50%,#0e1b29_100%)] p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">BrandVerse</p>
                        <p className="mt-1 text-sm font-bold">Mobile web app</p>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                    </div>

                    <div className="mt-4 rounded-3xl bg-white/[0.06] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">Quick actions</p>
                      <div className="mt-3 space-y-2">
                        {quickActions.map((item) => (
                          <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3 text-sm font-medium">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl bg-emerald-400/12 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">AI suggestion</p>
                      <p className="mt-2 text-sm leading-6 text-emerald-50">
                        “Luna Studio is overdue. I can send a reminder now.”
                      </p>
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-4 py-3 text-sm font-bold text-white shadow-glow">
                      <CheckCircle2 className="h-4 w-4" />
                      Send reminder
                    </button>
                  </div>
                </div>
              </Surface>
            </div>
          </motion.div>
        </section>

        <section className="mt-14 grid gap-6 md:grid-cols-3">
          <Surface className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Why this works</p>
            <h3 className="mt-3 text-2xl font-black">Start as a website</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
              This is designed as a mobile-first web app, so users can open it directly from WhatsApp, use it on desktop, and save it to home screen later.
            </p>
          </Surface>
          <Surface className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Best MVP focus</p>
            <h3 className="mt-3 text-2xl font-black">Invoices, clients, reminders</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
              Keep the first version narrow and commercially useful: invoice creation, payment collection, WhatsApp reminders, and simple client records.
            </p>
          </Surface>
          <Surface className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">AI edge</p>
            <h3 className="mt-3 text-2xl font-black">Assistant, not gimmick</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">
              Use AI for actions that save time: create invoice, draft follow-up, summarize overdue payments, and suggest the next operational move.
            </p>
          </Surface>
        </section>
      </div>
    </div>
  )
}
