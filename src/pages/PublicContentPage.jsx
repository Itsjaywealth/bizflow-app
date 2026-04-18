import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'
import PageUtilityNav from '../components/PageUtilityNav'
import Seo from '../components/Seo'
import Card from '../components/ui/Card'
import { publicContentPages, publicFooterGroups } from '../lib/publicContent'
import { SUPPORT_EMAIL, getSupportMailto } from '../lib/support'

function SectionBlock({ section, index }) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="grid gap-6 rounded-[28px] border border-emerald-500/10 bg-white/92 p-6 shadow-card backdrop-blur md:p-8 dark:border-white/10 dark:bg-white/[0.05]"
    >
      <div className="grid gap-3">
        <h2 className="text-2xl font-black tracking-tight text-neutral-950 dark:text-white">{section.title}</h2>
        <p className="max-w-3xl text-base leading-8 text-neutral-700 dark:text-neutral-300">{section.body}</p>
      </div>

      {section.cards?.length ? (
        <div className={`grid gap-4 ${section.cards.length > 2 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
          {section.cards.map((card) => {
            const Icon = card.icon
            return (
              <Card key={card.title} hover className="rounded-[24px] border-emerald-500/12 bg-[#fcfffd] p-6 dark:bg-white/[0.06]">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black tracking-tight text-neutral-950 dark:text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-300">{card.body}</p>
              </Card>
            )
          })}
        </div>
      ) : null}

      {section.bullets?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {section.bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-2xl border border-emerald-500/10 bg-emerald-50/70 px-4 py-4 text-sm leading-7 text-neutral-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200"
            >
              {bullet}
            </div>
          ))}
        </div>
      ) : null}
    </motion.section>
  )
}

SectionBlock.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    cards: PropTypes.array,
    bullets: PropTypes.array,
  }).isRequired,
  index: PropTypes.number.isRequired,
}

export default function PublicContentPage({ type }) {
  const page = publicContentPages[type] || publicContentPages.features

  return (
    <div className="relative overflow-hidden bg-background text-neutral-900 dark:bg-darkbg dark:text-white">
      <Seo title={page.seoTitle} description={page.description} path={page.path} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.2),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
        <PageUtilityNav backTo="/" backLabel="Back to homepage" />

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] border border-emerald-500/12 bg-white/94 p-7 shadow-modal backdrop-blur md:p-10 dark:border-white/10 dark:bg-white/[0.05]"
          >
            <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary dark:bg-white/5 dark:text-brand-glow">
              {page.eyebrow}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.04em] text-neutral-950 sm:text-5xl dark:text-white">
              {page.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-700 dark:text-neutral-300">
              {page.subheadline}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {page.heroHighlights?.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-500/14 bg-[#f7fcf9] px-4 py-2 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link to={page.cta.primary.to} className="btn-primary w-full sm:w-auto">
                {page.cta.primary.label}
              </Link>
              <Link to={page.cta.secondary.to} className="btn-outline w-full sm:w-auto">
                {page.cta.secondary.label}
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="rounded-[28px] border border-emerald-500/12 bg-[#fbfefc] p-6 shadow-card dark:border-white/10 dark:bg-white/[0.05]"
          >
            <BrandLogo showTagline={false} />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">On this page</p>
            <div className="mt-4 space-y-2">
              {page.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:border-emerald-500/14 hover:bg-emerald-50/80 hover:text-primary dark:text-neutral-200 dark:hover:border-white/10 dark:hover:bg-white/[0.05]"
                >
                  {section.title}
                </a>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-500/10 bg-emerald-50/70 p-4 text-sm leading-7 text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300">
              Need help with anything on this page?
              {' '}
              <a href={getSupportMailto('BizFlow NG Website Question')} className="font-semibold text-primary underline-offset-4 hover:underline">
                Contact {SUPPORT_EMAIL}
              </a>
            </div>
          </motion.aside>
        </section>

        <div className="mt-10 grid gap-6">
          {page.sections.map((section, index) => (
            <SectionBlock key={section.id} section={section} index={index} />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mt-10 rounded-[32px] border border-emerald-500/12 bg-gradient-to-br from-[#f7fcf9] via-white to-[#ecfdf5] p-8 shadow-modal dark:border-white/10 dark:from-white/[0.06] dark:via-white/[0.04] dark:to-white/[0.03] md:p-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary dark:text-brand-glow">Next step</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-neutral-950 dark:text-white">{page.cta.title}</h2>
            <p className="mt-4 text-base leading-8 text-neutral-700 dark:text-neutral-300">{page.cta.body}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={page.cta.primary.to} className="btn-primary w-full sm:w-auto">
              {page.cta.primary.label}
            </Link>
            <Link to={page.cta.secondary.to} className="btn-outline w-full sm:w-auto">
              {page.cta.secondary.label}
            </Link>
          </div>
        </motion.section>

        <footer className="mt-12 rounded-[28px] border border-emerald-500/10 bg-white/92 p-7 shadow-card dark:border-white/10 dark:bg-white/[0.05]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_repeat(3,minmax(0,0.8fr))]">
            <div>
              <BrandLogo />
              <p className="mt-4 max-w-md text-sm leading-7 text-neutral-700 dark:text-neutral-300">
                BizFlow NG helps Nigerian businesses manage operations with more structure, stronger visibility, and a cleaner day-to-day operating rhythm.
              </p>
            </div>
            {publicFooterGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">{group.title}</p>
                <div className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <Link key={item.to} to={item.to} className="block text-sm font-medium text-neutral-700 transition hover:text-primary dark:text-neutral-300">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}

PublicContentPage.propTypes = {
  type: PropTypes.string.isRequired,
}
