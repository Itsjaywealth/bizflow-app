import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from './ui/Button'
import Modal from './ui/Modal'
import useToast from '../hooks/useToast'
import {
  buildBizFlowAiReply,
  createInvoiceViaAi,
  createReportSnapshot,
  getBizFlowAiContext,
  sendReminderViaAi,
} from '../lib/bizflowAi'
import { formatCurrency, getBalance, getClientName } from '../pages/app/invoiceShared'

const starterPrompts = [
  'Create invoice',
  'Send reminder to client',
  'Review overdue payments',
  'Fetch reports via AI',
  'How can I improve cash flow?',
]

const defaultInvoiceForm = {
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  description: '',
  amount: '',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  note: '',
}

function buildActionResultMessage(action, result) {
  if (action.intent === 'create_invoice') {
    return {
      role: 'assistant',
      title: `Draft invoice ${result.invoice_number} created`,
      intro: 'I created the invoice as a draft so you can review it before sending anything to the client.',
      bullets: [
        `Client: ${result.client_snapshot?.name || 'Not assigned yet'}`,
        `Amount: ${formatCurrency(result.total || 0, result.currency || 'NGN')}`,
        `Due date: ${result.due_date || 'Not set'}`,
      ],
      actions: [
        { kind: 'link', label: 'Open invoice', to: `/app/invoices/${result.id}` },
        { kind: 'execute', label: 'Create another invoice', intent: 'create_invoice' },
      ],
    }
  }

  if (action.intent === 'send_reminder') {
    return {
      role: 'assistant',
      title: `Reminder prepared for ${getClientName(result.invoice)}`,
      intro: `I opened an email draft for ${result.clientEmail}, so you can review and send it immediately.`,
      bullets: [
        `Invoice: ${result.invoice.invoice_number}`,
        `Outstanding balance: ${formatCurrency(getBalance(result.invoice), result.invoice.currency || 'NGN')}`,
        'If you want, the next step is to review the rest of your overdue queue.',
      ],
      actions: [
        { kind: 'link', label: 'Review overdue payments', to: '/app/invoices?filter=overdue' },
        { kind: 'execute', label: 'Send another reminder', intent: 'send_reminder' },
      ],
    }
  }

  if (action.intent === 'fetch_report') {
    return {
      role: 'assistant',
      title: result.headline,
      intro: 'Here is the latest reporting snapshot grounded in your live BizFlow data.',
      bullets: result.bullets,
      actions: [
        { kind: 'link', label: 'Open full reports', to: '/app/reports' },
        { kind: 'execute', label: 'Review overdue payments', intent: 'send_reminder' },
      ],
    }
  }

  return {
    role: 'assistant',
    title: 'Action completed',
    intro: 'BizFlow AI finished the requested step.',
    bullets: [],
    actions: [{ kind: 'link', label: 'Open dashboard', to: '/app/dashboard' }],
  }
}

export default function BizFlowAI({ business, session }) {
  const location = useLocation()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [context, setContext] = useState({
    invoices: [],
    clients: [],
    expenses: [],
    totalRevenue: 0,
    totalClients: 0,
    unpaidInvoices: [],
    overdueInvoices: [],
    recentActivity: [],
  })
  const [contextLoading, setContextLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [executingAction, setExecutingAction] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState(defaultInvoiceForm)
  const [selectedReminderInvoiceId, setSelectedReminderInvoiceId] = useState('')

  const hiddenRoutes = ['/verify-email', '/onboarding']
  const isVisible = !hiddenRoutes.includes(location.pathname) && location.pathname !== '/invoice/:token'

  const greeting = useMemo(() => {
    if (business?.name) return `Ask me anything about ${business.name}`
    if (session) return 'Ask me anything about your business'
    return 'Ask me anything about BizFlow NG'
  }, [business, session])

  const hasWorkspace = Boolean(session && business?.id)
  const reminderCandidates = context.overdueInvoices.length ? context.overdueInvoices : context.unpaidInvoices

  useEffect(() => {
    if (!open || !business?.id) return
    loadContext()
  }, [open, business?.id])

  if (!isVisible) return null

  async function loadContext() {
    if (!business?.id) return context
    setContextLoading(true)
    try {
      const nextContext = await getBizFlowAiContext(business)
      setContext(nextContext)
      return nextContext
    } catch (error) {
      console.error('[BizFlowAI:context]', error)
      toast.error('BizFlow AI could not refresh business context right now.')
      return context
    } finally {
      setContextLoading(false)
    }
  }

  async function sendPrompt(question) {
    const trimmed = question.trim()
    if (!trimmed) return
    const nextContext = business?.id ? await loadContext() : context
    const answer = buildBizFlowAiReply(trimmed, business, nextContext, session)
    setMessages((current) => [
      ...current,
      { role: 'user', text: trimmed },
      { role: 'assistant', ...answer },
    ])
    setInput('')
    setOpen(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendPrompt(input)
  }

  function resetChat() {
    setMessages([])
    setInput('')
  }

  function handleActionClick(action) {
    if (action.kind === 'link') {
      setOpen(false)
      return
    }

    if (action.intent === 'create_invoice') {
      setInvoiceForm({
        ...defaultInvoiceForm,
        clientName: context.clients[0]?.name || '',
        clientEmail: context.clients[0]?.email || '',
        clientAddress: context.clients[0]?.address || '',
      })
    }

    if (action.intent === 'send_reminder') {
      setSelectedReminderInvoiceId(reminderCandidates[0]?.id || '')
    }

    setPendingAction(action)
  }

  async function confirmAction() {
    if (!pendingAction) return
    setExecutingAction(true)

    try {
      let result

      if (pendingAction.intent === 'create_invoice') {
        if (!invoiceForm.clientName.trim()) {
          toast.error('Add a client name before creating the invoice.')
          return
        }
        if (!invoiceForm.description.trim()) {
          toast.error('Add a line-item description before creating the invoice.')
          return
        }
        if (!Number(invoiceForm.amount)) {
          toast.error('Enter a valid invoice amount before continuing.')
          return
        }

        result = await createInvoiceViaAi({
          business,
          context,
          payload: invoiceForm,
        })
        toast.success('Draft invoice created.')
      }

      if (pendingAction.intent === 'send_reminder') {
        const selectedInvoice = reminderCandidates.find((invoice) => invoice.id === selectedReminderInvoiceId)
        if (!selectedInvoice) {
          toast.error('Choose an invoice to remind first.')
          return
        }
        result = sendReminderViaAi(selectedInvoice)
        toast.success('Reminder draft opened.')
      }

      if (pendingAction.intent === 'fetch_report') {
        const freshContext = await loadContext()
        result = createReportSnapshot(freshContext)
      }

      if (result) {
        const nextMessage = buildActionResultMessage(pendingAction, result)
        setMessages((current) => [...current, nextMessage])
      }

      await loadContext()
      setPendingAction(null)
    } catch (error) {
      console.error(`[BizFlowAI:${pendingAction.intent}]`, error)
      toast.error(error.message || 'BizFlow AI could not complete that action.')
    } finally {
      setExecutingAction(false)
    }
  }

  function renderAction(action) {
    if (action.kind === 'link') {
      return (
        <Link key={`${action.kind}-${action.label}`} className="btn-primary" to={action.to} onClick={() => setOpen(false)}>
          {action.label}
        </Link>
      )
    }

    return (
      <button
        key={`${action.kind}-${action.label}`}
        type="button"
        className="btn-primary"
        onClick={() => handleActionClick(action)}
      >
        {action.label}
      </button>
    )
  }

  function renderActionBody() {
    if (!pendingAction) return null

    if (pendingAction.intent === 'create_invoice') {
      return (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            BizFlow AI will create a draft invoice so you can review it before sending. Nothing goes to the client until you approve it yourself.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white">
              <span>Client name</span>
              <input
                type="text"
                value={invoiceForm.clientName}
                onChange={(event) => setInvoiceForm((current) => ({ ...current, clientName: event.target.value }))}
                placeholder="Amaka Obi"
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white">
              <span>Client email</span>
              <input
                type="email"
                value={invoiceForm.clientEmail}
                onChange={(event) => setInvoiceForm((current) => ({ ...current, clientEmail: event.target.value }))}
                placeholder="client@business.com"
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white md:col-span-2">
              <span>Description</span>
              <input
                type="text"
                value={invoiceForm.description}
                onChange={(event) => setInvoiceForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Brand strategy workshop"
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white">
              <span>Amount (NGN)</span>
              <input
                type="number"
                min="0"
                value={invoiceForm.amount}
                onChange={(event) => setInvoiceForm((current) => ({ ...current, amount: event.target.value }))}
                placeholder="250000"
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white">
              <span>Due date</span>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(event) => setInvoiceForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              />
            </label>
          </div>
        </div>
      )
    }

    if (pendingAction.intent === 'send_reminder') {
      return (
        <div className="space-y-4">
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            BizFlow AI will open a reminder email draft for the invoice you choose below. You stay in control and can edit the message before sending it.
          </p>
          {reminderCandidates.length ? (
            <label className="space-y-2 text-sm font-medium text-neutral-800 dark:text-white">
              <span>Select invoice</span>
              <select
                value={selectedReminderInvoiceId}
                onChange={(event) => setSelectedReminderInvoiceId(event.target.value)}
                className="w-full rounded-2xl border border-emerald-400/15 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-emerald-500 dark:bg-white/5 dark:text-white"
              >
                {reminderCandidates.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} — {getClientName(invoice)} — {formatCurrency(getBalance(invoice), invoice.currency || 'NGN')}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-400/20 bg-emerald-50/70 px-4 py-4 text-sm text-neutral-700 dark:bg-white/5 dark:text-neutral-200">
              There are no unpaid invoices available for reminders right now.
            </div>
          )}
        </div>
      )
    }

    if (pendingAction.intent === 'fetch_report') {
      return (
        <div className="space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          <p>
            BizFlow AI will refresh your live invoice, client, expense, and receivables data, then turn it into a short executive snapshot.
          </p>
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-50/70 px-4 py-4 dark:bg-white/5">
            <strong className="block text-neutral-900 dark:text-white">What you will get</strong>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Revenue and outstanding receivables summary</li>
              <li>Cash-flow pressure signals</li>
              <li>Client concentration insight</li>
              <li>Suggested next actions</li>
            </ul>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <button
        type="button"
        className="bizflow-ai-launcher"
        onClick={() => setOpen(true)}
        aria-label="Open BizFlow AI"
      >
        <span>✨</span>
        <strong>BizFlow AI</strong>
      </button>

      {open && (
        <div className="bizflow-ai-shell" role="dialog" aria-modal="true" aria-label="BizFlow AI assistant">
          <div className="bizflow-ai-backdrop" onClick={() => setOpen(false)} />
          <div className="bizflow-ai-panel">
            <div className="bizflow-ai-header">
              <div>
                <strong>BizFlow AI</strong>
                <p>{greeting}</p>
              </div>
              <div className="bizflow-ai-header-actions">
                <button type="button" onClick={resetChat}>New chat</button>
                <button type="button" onClick={() => setOpen(false)}>✕</button>
              </div>
            </div>

            <div className="bizflow-ai-body">
              {messages.length === 0 ? (
                <>
                  <div className="bizflow-ai-welcome">
                    <h3>What would you like help with?</h3>
                    <p>
                      BizFlow AI now acts like an operations assistant. It can review overdue invoices, create draft invoices, and fetch a live reporting snapshot with confirmation before execution.
                    </p>
                    {hasWorkspace ? (
                      <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-50/70 px-4 py-3 text-sm text-neutral-700 dark:bg-white/5 dark:text-neutral-200">
                        {contextLoading ? 'Refreshing live business context…' : `Live context: ${context.totalClients} clients, ${context.unpaidInvoices.length} unpaid invoices, ${formatCurrency(context.totalRevenue)} collected.`}
                      </div>
                    ) : null}
                  </div>
                  <div className="bizflow-ai-prompts">
                    {starterPrompts.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => sendPrompt(prompt)}>
                        {prompt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bizflow-ai-thread">
                  {messages.map((message, index) => (
                    message.role === 'user' ? (
                      <div key={`${message.role}-${index}`} className="bizflow-ai-message user">
                        <span>{message.text}</span>
                      </div>
                    ) : (
                      <div key={`${message.role}-${index}`} className="bizflow-ai-message assistant">
                        <h3>{message.title}</h3>
                        <p>{message.intro}</p>
                        {message.bullets?.length ? (
                          <ul>
                            {message.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                          </ul>
                        ) : null}
                        <div className="bizflow-ai-actions">
                          <button type="button" className="btn-outline" onClick={resetChat}>Back to prompts</button>
                          {message.actions?.map(renderAction)}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            <form className="bizflow-ai-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Ask about invoices, reminders, reports, or cash flow..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button type="submit" className="btn-primary">Ask</button>
            </form>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(pendingAction)}
        onClose={() => !executingAction && setPendingAction(null)}
        title={pendingAction?.intent === 'create_invoice'
          ? 'Confirm AI invoice creation'
          : pendingAction?.intent === 'send_reminder'
            ? 'Confirm reminder draft'
            : 'Confirm report snapshot'}
        footer={(
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={executingAction}>
              Cancel
            </Button>
            <Button onClick={confirmAction} disabled={executingAction || (pendingAction?.intent === 'send_reminder' && !reminderCandidates.length)}>
              {executingAction ? 'Working...' : 'Confirm and run'}
            </Button>
          </div>
        )}
      >
        {renderActionBody()}
      </Modal>
    </>
  )
}
