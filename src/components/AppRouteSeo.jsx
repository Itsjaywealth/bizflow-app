import React from 'react'
import { useLocation } from 'react-router-dom'
import Seo from './Seo'

const routeSeoMap = [
  {
    match: '/app/dashboard',
    title: 'Dashboard — BizFlow NG',
    description: 'Track revenue, invoices, clients, staff, and reminders from your BizFlow NG dashboard.',
  },
  {
    match: '/app/invoices',
    title: 'Invoices — BizFlow NG',
    description: 'Manage invoices, payment status, reminders, and collections in BizFlow NG.',
  },
  {
    match: '/app/clients',
    title: 'Clients — BizFlow NG',
    description: 'Manage your client relationships, records, and invoice history in BizFlow NG.',
  },
  {
    match: '/app/staff',
    title: 'Staff & HR — BizFlow NG',
    description: 'Organize staff records, attendance, leave, and HR operations in BizFlow NG.',
  },
  {
    match: '/app/payroll',
    title: 'Payroll — BizFlow NG',
    description: 'Run payroll, track deductions, and manage payslips in BizFlow NG.',
  },
  {
    match: '/app/products',
    title: 'Products — BizFlow NG',
    description: 'Manage products and services so your invoices stay fast and accurate.',
  },
  {
    match: '/app/expenses',
    title: 'Expenses — BizFlow NG',
    description: 'Track operating expenses and understand profitability with BizFlow NG.',
  },
  {
    match: '/app/reports',
    title: 'Reports & Analytics — BizFlow NG',
    description: 'See financial reports, invoice performance, client growth, and payroll analytics.',
  },
  {
    match: '/app/settings',
    title: 'Settings — BizFlow NG',
    description: 'Manage your BizFlow NG workspace profile, billing, notifications, integrations, and security.',
  },
  {
    match: '/app/billing',
    title: 'Billing — BizFlow NG',
    description: 'Review your subscription, payment details, and billing history in BizFlow NG.',
  },
]

export default function AppRouteSeo() {
  const location = useLocation()
  const match = routeSeoMap.find((item) => location.pathname.startsWith(item.match))

  return (
    <Seo
      title={match?.title || 'BizFlow NG App'}
      description={match?.description || 'Manage your business operations inside BizFlow NG.'}
      path={location.pathname}
      noindex
    />
  )
}
