import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const starterPrompts = [
  'How can I grow my revenue?',
  'How do I get paid faster?',
  'How do I set up BizFlow?',
  'Which plan is right for me?',
  'How do I reduce business expenses?'
]

function buildAnswer(question, business) {
  const q = question.toLowerCase()
  const businessName = business?.name ? ` for ${business.name}` : ''

  if (q.includes('revenue') || q.includes('grow')) {
    return {
      title: `Quick revenue growth strategies${businessName}`,
      intro: 'Here are the highest-impact moves most small businesses can make quickly:',
      bullets: [
        'Increase customer value by bundling related products or services.',
        'Follow up pending invoices faster with WhatsApp reminders and clearer payment instructions.',
        'Review your best-selling offers and test a small price increase.',
        'Ask happy clients for referrals and reward introductions.',
        'Track repeat customers and create offers that bring them back sooner.'
      ],
      actions: [
        { label: 'Open invoices', to: '/invoices' },
        { label: 'View dashboard', to: '/dashboard' }
      ]
    }
  }

  if (q.includes('paid') || q.includes('invoice') || q.includes('cashflow')) {
    return {
      title: 'How to get paid faster',
      intro: 'Try this payment follow-up workflow inside BizFlow NG:',
      bullets: [
        'Send invoices immediately after work is completed.',
        'Add clear bank details or payment link in your business settings.',
        'Use WhatsApp invoice sharing instead of waiting on email only.',
        'Set due dates and send reminders before invoices become overdue.',
        'Track part payments so you know exactly what is still outstanding.'
      ],
      actions: [
        { label: 'Create invoice', to: '/invoices' },
        { label: 'Update settings', to: '/settings' }
      ]
    }
  }

  if (q.includes('set up') || q.includes('setup') || q.includes('onboard')) {
    return {
      title: 'Getting started with BizFlow',
      intro: 'The fastest way to get value from BizFlow NG is:',
      bullets: [
        'Add your business details and payment information.',
        'Create one client or add the client directly while making your first invoice.',
        'Save your top products or services for faster invoicing.',
        'Record your first expense so your dashboard starts reflecting real business activity.',
        'Review the dashboard after your first invoice and expense are saved.'
      ],
      actions: [
        { label: 'Complete setup', to: '/settings' },
        { label: 'Open onboarding', to: '/onboarding' }
      ]
    }
  }

  if (q.includes('plan') || q.includes('pricing') || q.includes('subscription')) {
    return {
      title: 'Which BizFlow plan fits best?',
      intro: 'A simple guide:',
      bullets: [
        'Starter is best for solo founders and small teams that mainly need invoices and customer records.',
        'Growth is better when you also want staff records, expenses, and clearer reporting.',
        'Setup Support is ideal if you want guided onboarding and help structuring your workflow.'
      ],
      actions: [
        { label: 'See pricing', to: '/pricing' },
        { label: 'Billing page', to: '/billing' }
      ]
    }
  }

  if (q.includes('expense') || q.includes('reduce cost') || q.includes('profit')) {
    return {
      title: 'Ways to reduce business expenses',
      intro: 'Use BizFlow to spot the easiest savings first:',
      bullets: [
        'Record every business expense consistently so leaks become visible.',
        'Review recurring costs monthly and remove what does not generate value.',
        'Compare delivery, vendor, and staff costs against paid revenue.',
        'Separate one-off costs from repeat monthly costs so decisions are clearer.',
        'Focus on improving profit, not only sales.'
      ],
      actions: [
        { label: 'Open expenses', to: '/expenses' },
        { label: 'View reports', to: '/reports' }
      ]
    }
  }

  return {
    title: 'BizFlow AI can help with that',
    intro: 'Try asking about one of these:',
    bullets: [
      'Growing revenue',
      'Getting paid faster',
      'Setting up your workspace',
      'Choosing the right plan',
      'Reducing business expenses'
    ],
    actions: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Support', to: '/support' }
    ]
  }
}

export default function BizFlowAI({ business, session }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])

  const hiddenRoutes = ['/verify-email']
  const isVisible = !hiddenRoutes.includes(location.pathname) && location.pathname !== '/invoice/:token'

  const greeting = useMemo(() => {
    if (business?.name) return `Ask me anything about ${business.name}`
    if (session) return 'Ask me anything about your business'
    return 'Ask me anything about BizFlow NG'
  }, [business, session])

  if (!isVisible) return null

  function sendPrompt(question) {
    const trimmed = question.trim()
    if (!trimmed) return
    const answer = buildAnswer(trimmed, business)
    setMessages([
      { role: 'user', text: trimmed },
      { role: 'assistant', ...answer }
    ])
    setInput('')
    setOpen(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendPrompt(input)
  }

  function resetChat() {
    setMessages([])
    setInput('')
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
                    <p>I can help with revenue, invoices, setup, pricing, and business decisions inside BizFlow NG.</p>
                  </div>
                  <div className="bizflow-ai-prompts">
                    {starterPrompts.map(prompt => (
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
                        <ul>
                          {message.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
                        </ul>
                        <div className="bizflow-ai-actions">
                          <button type="button" className="btn-outline" onClick={resetChat}>Back to prompts</button>
                          {message.actions.map(action => (
                            <Link key={action.label} className="btn-primary" to={action.to} onClick={() => setOpen(false)}>
                              {action.label}
                            </Link>
                          ))}
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
                placeholder="Ask about revenue, invoices, setup, pricing..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" className="btn-primary">Ask</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
