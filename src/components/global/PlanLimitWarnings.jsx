import React, { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useAppShell } from '../../context/AppShellContext'

export default function PlanLimitWarnings() {
  const navigate = useNavigate()
  const { planUsage } = useAppShell()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (planUsage.reachedLimit) {
      setOpen(true)
    }
  }, [planUsage.reachedLimit])

  if (!planUsage.nearLimit && !planUsage.reachedLimit) return null

  return (
    <>
      <div className={`plan-warning-banner ${planUsage.reachedLimit ? 'plan-warning-banner--danger' : ''}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 dark:bg-white/10">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold">
              {planUsage.reachedLimit
                ? "You've reached your invoice limit. Upgrade to continue."
                : `You've used ${planUsage.invoiceCount}/${planUsage.invoiceLimit} invoices this month.`}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {planUsage.reachedLimit
                ? 'Move to a higher plan to keep sending invoices without interruption.'
                : 'You are close to your monthly invoice cap. Review your plan before it slows down your workflow.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center gap-2 rounded-full border border-current/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/60 dark:hover:bg-white/10"
        >
          Upgrade plan
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upgrade to keep creating invoices"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>Maybe later</Button>
            <Button onClick={() => navigate('/pricing')}>View upgrade options</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            You have already used {planUsage.invoiceCount} of {planUsage.invoiceLimit} invoices this month. Upgrade now to
            keep sending invoices and collecting payments without pauses.
          </p>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 dark:border-primary/30 dark:bg-primary/10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Recommended</p>
            <h3 className="mt-2 text-xl font-black text-neutral-950 dark:text-white">Growth Plan</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              Unlock unlimited invoicing, payroll, reports, and advanced team tools so your business can keep moving.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
