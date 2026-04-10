import React from 'react'
import PageUtilityNav from '../components/PageUtilityNav'

const content = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain the basic rules for using BizFlow NG while the product is in early access.',
    sections: [
      ['Use of the service', 'BizFlow NG helps businesses record clients, products, expenses, staff records, and invoices. You are responsible for the accuracy of the information you enter.'],
      ['Account responsibility', 'Keep your login details private. If you believe your account has been accessed without permission, contact support quickly.'],
      ['Payments and invoices', 'BizFlow NG can show invoice payment details and optional external payment links. Live payment collection is only available where you have connected and tested your own payment provider link.'],
      ['Changes to the product', 'Features may improve over time. We may update these terms as the product grows.']
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy explains how BizFlow NG treats business information entered into the app.',
    sections: [
      ['Information you provide', 'The app stores account, business, client, invoice, product, expense, and staff information so your workspace can function.'],
      ['How information is used', 'Your information is used to provide the app experience: authentication, dashboard records, invoices, and business management tools.'],
      ['Security', 'Authentication and database storage are handled through Supabase. You should still avoid entering unnecessary sensitive information into notes fields.'],
      ['Contact', 'For privacy requests or corrections, contact support through the support page.']
    ]
  },
  refund: {
    title: 'Refund Policy',
    intro: 'BizFlow NG is currently positioned as early access with guided onboarding. Public checkout is not enabled in the app yet.',
    sections: [
      ['Current billing status', 'If no payment has been collected inside BizFlow NG, no in-app refund process applies.'],
      ['Manual payments', 'If you pay directly for setup or support, refund terms should be agreed in writing before work begins.'],
      ['Future subscriptions', 'When subscription billing is launched, this page should be updated with plan-specific cancellation and refund rules.']
    ]
  }
}

export default function LegalPage({ type }) {
  const page = content[type] || content.terms

  return (
    <div className="legal-shell">
      <div className="legal-card">
        <PageUtilityNav />
        <h1>{page.title}</h1>
        <p className="legal-intro">{page.intro}</p>
        {page.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
