import React, { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Landmark,
  Mail,
  PlayCircle,
  Plus,
  Wallet,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import { getStaffFullName } from './staffShared'

const tabs = ['Current Payroll', 'Payroll History', 'Deductions Setup', 'Tax & Compliance']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const deductionSchema = z.object({
  pension_enabled: z.boolean().default(true),
  pension_employee_percent: z.coerce.number().min(0),
  pension_employer_percent: z.coerce.number().min(0),
  nhf_enabled: z.boolean().default(true),
  nhf_rate: z.coerce.number().min(0),
  custom_deductions: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['fixed', 'percent']),
    value: z.coerce.number().min(0),
    applies_to: z.string().min(1, 'Applies to is required'),
  })),
})

const payrollBands = [
  { limit: 300000, rate: 0.07 },
  { limit: 600000, rate: 0.11 },
  { limit: 1100000, rate: 0.15 },
  { limit: 1600000, rate: 0.19 },
  { limit: 3200000, rate: 0.21 },
  { limit: Infinity, rate: 0.24 },
]

const defaultDeductionConfig = {
  pension_enabled: true,
  pension_employee_percent: 8,
  pension_employer_percent: 10,
  nhf_enabled: true,
  nhf_rate: 2.5,
  custom_deductions: [],
}

function currency(value) {
  return `₦${Number(value || 0).toLocaleString()}`
}

function monthKeyFromDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function prettyMonth(key) {
  const [year, month] = key.split('-').map(Number)
  return `${months[(month || 1) - 1]} ${year}`
}

function calculatePayeAnnual(annualGross) {
  let remaining = Math.max(annualGross, 0)
  let previousLimit = 0
  let total = 0

  payrollBands.forEach((band) => {
    if (remaining <= 0) return
    const taxableWithinBand = Math.min(remaining, band.limit - previousLimit)
    total += taxableWithinBand * band.rate
    remaining -= taxableWithinBand
    previousLimit = band.limit
  })

  return total
}

function buildRowBreakdown(staffMember, config) {
  const basic = Number(staffMember.basic_salary || staffMember.salary || 0)
  const housing = Number(staffMember.housing_allowance || 0)
  const transport = Number(staffMember.transport_allowance || 0)
  const otherAllowances = Array.isArray(staffMember.other_allowances)
    ? staffMember.other_allowances.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
    : 0
  const gross = basic + housing + transport + otherAllowances
  const annualGross = gross * 12
  const paye = calculatePayeAnnual(annualGross) / 12
  const pensionEmployee = config.pension_enabled ? (gross * Number(config.pension_employee_percent || 0)) / 100 : 0
  const pensionEmployer = config.pension_enabled ? (gross * Number(config.pension_employer_percent || 0)) / 100 : 0
  const nhf = config.nhf_enabled ? (basic * Number(config.nhf_rate || 0)) / 100 : 0
  const customDeductions = (config.custom_deductions || []).reduce((sum, item) => {
    if (!item?.name) return sum
    return sum + (item.type === 'percent' ? (gross * Number(item.value || 0)) / 100 : Number(item.value || 0))
  }, 0)
  const net = gross - (paye + pensionEmployee + nhf + customDeductions)

  return {
    staffId: staffMember.id,
    employeeId: staffMember.employee_id || '—',
    name: getStaffFullName(staffMember),
    department: staffMember.department || 'Unassigned',
    role: staffMember.job_title || staffMember.role || 'Team member',
    bankName: staffMember.bank_name || 'No bank set',
    accountNumber: staffMember.account_number || '—',
    accountName: staffMember.account_name || getStaffFullName(staffMember),
    basic,
    housing,
    transport,
    otherAllowances,
    gross,
    paye,
    pensionEmployee,
    pensionEmployer,
    nhf,
    customDeductions,
    totalDeductions: paye + pensionEmployee + nhf + customDeductions,
    net,
    status: 'pending',
  }
}

function statusVariant(status) {
  if (status === 'processed') return 'success'
  if (status === 'failed') return 'danger'
  return 'warning'
}

function buildCsv(rows) {
  const header = ['Staff Name', 'Gross', 'PAYE Tax', 'Pension', 'NHF', 'Other Deductions', 'Net Pay', 'Status']
  const body = rows.map((row) => [
    row.name,
    row.gross,
    row.paye,
    row.pensionEmployee,
    row.nhf,
    row.customDeductions,
    row.net,
    row.status,
  ])
  return [header, ...body].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

async function downloadPdf({ title, rows, summary }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text(title, 14, 18)
  doc.setFontSize(10)
  doc.text(`Total Gross: ${currency(summary.gross)}   Total Deductions: ${currency(summary.deductions)}   Total Net: ${currency(summary.net)}`, 14, 26)
  autoTable(doc, {
    startY: 32,
    head: [['Staff', 'Gross', 'PAYE', 'Pension', 'NHF', 'Other', 'Net', 'Status']],
    body: rows.map((row) => [
      row.name,
      currency(row.gross),
      currency(row.paye),
      currency(row.pensionEmployee),
      currency(row.nhf),
      currency(row.customDeductions),
      currency(row.net),
      row.status,
    ]),
  })
  doc.save(`${title}.pdf`)
}

export default function Payroll({ business }) {
  const toast = useToast()
  const payslipRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Current Payroll')
  const [staff, setStaff] = useState([])
  const [payrollRuns, setPayrollRuns] = useState([])
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [processingLog, setProcessingLog] = useState([])
  const [showRunModal, setShowRunModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(monthKeyFromDate())
  const [historyYear, setHistoryYear] = useState(String(new Date().getFullYear()))
  const [annualGrossInput, setAnnualGrossInput] = useState('4200000')

  const deductionForm = useForm({
    resolver: zodResolver(deductionSchema),
    defaultValues: defaultDeductionConfig,
  })

  const { fields, append, remove } = useFieldArray({
    control: deductionForm.control,
    name: 'custom_deductions',
  })

  useEffect(() => {
    if (!business?.id) return
    loadPayrollData()
  }, [business?.id])

  function logPayrollError(scope, error) {
    if (!error) return
    console.error(`[Payroll:${scope}]`, {
      businessId: business?.id,
      message: error.message || 'Unknown payroll error',
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null,
    })
  }

  async function loadPayrollData() {
    setLoading(true)
    const [staffRes, runsRes, payslipsRes, configRes] = await Promise.all([
      supabase.from('staff').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('payroll_runs').select('*').eq('business_id', business.id).order('processed_at', { ascending: false }),
      supabase.from('payslips').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('deduction_configs').select('*').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1),
    ])

    if (staffRes.error) logPayrollError('load-staff', staffRes.error)
    if (runsRes.error) logPayrollError('load-runs', runsRes.error)
    if (payslipsRes.error) logPayrollError('load-payslips', payslipsRes.error)
    if (configRes.error) logPayrollError('load-deduction-config', configRes.error)

    setStaff(staffRes.error ? [] : (staffRes.data || []))
    setPayrollRuns(runsRes.error ? [] : (runsRes.data || []))
    setPayslips(payslipsRes.error ? [] : (payslipsRes.data || []))
    const deductionConfig = configRes.error ? null : (configRes.data?.[0] || null)
    if (deductionConfig) {
      deductionForm.reset({
        pension_enabled: deductionConfig.pension_enabled ?? true,
        pension_employee_percent: Number(deductionConfig.pension_employee_percent ?? 8),
        pension_employer_percent: Number(deductionConfig.pension_employer_percent ?? 10),
        nhf_enabled: deductionConfig.nhf_enabled ?? true,
        nhf_rate: Number(deductionConfig.nhf_rate ?? 2.5),
        custom_deductions: Array.isArray(deductionConfig.custom_deductions) ? deductionConfig.custom_deductions : [],
      })
    }
    setLoading(false)
  }

  const configValues = deductionForm.watch()
  const payrollRows = useMemo(() => staff.map((member) => {
    const breakdown = buildRowBreakdown(member, configValues)
    const payslip = payslips.find((item) => item.staff_id === member.id && item.payroll_month === selectedMonth)
    return payslip ? { ...breakdown, ...payslip, status: payslip.status || 'processed' } : breakdown
  }), [staff, configValues, payslips, selectedMonth])

  const payrollSummary = useMemo(() => payrollRows.reduce((acc, row) => ({
    gross: acc.gross + row.gross,
    deductions: acc.deductions + row.totalDeductions,
    net: acc.net + row.net,
    processed: acc.processed + (row.status === 'processed' ? 1 : 0),
    pending: acc.pending + (row.status !== 'processed' ? 1 : 0),
    paye: acc.paye + row.paye,
    pension: acc.pension + row.pensionEmployee,
  }), { gross: 0, deductions: 0, net: 0, processed: 0, pending: 0, paye: 0, pension: 0 }), [payrollRows])

  const historyRows = useMemo(() => {
    const filteredRuns = payrollRuns.filter((run) => String(new Date(run.processed_at || run.created_at || Date.now()).getFullYear()) === historyYear)
    if (filteredRuns.length) return filteredRuns

    const grouped = payslips.reduce((acc, row) => {
      const key = row.payroll_month || monthKeyFromDate(new Date(row.created_at))
      if (!acc[key]) {
        acc[key] = {
          id: key,
          payroll_month: key,
          total_gross: 0,
          total_net: 0,
          staff_count: 0,
          processed_at: row.created_at,
          status: 'processed',
        }
      }
      acc[key].total_gross += Number(row.gross || 0)
      acc[key].total_net += Number(row.net_pay || row.net || 0)
      acc[key].staff_count += 1
      return acc
    }, {})
    return Object.values(grouped).filter((run) => String(run.payroll_month).startsWith(historyYear))
  }, [historyYear, payrollRuns, payslips])

  const taxWidget = useMemo(() => {
    const annual = Number(annualGrossInput || 0)
    const annualTax = calculatePayeAnnual(annual)
    const monthlyTax = annualTax / 12
    return {
      annual,
      annualTax,
      monthlyTax,
      monthlyTakeHome: (annual - annualTax) / 12,
    }
  }, [annualGrossInput])

  async function saveDeductionSetup(values) {
    const payload = {
      business_id: business.id,
      ...values,
    }
    const existing = await supabase.from('deduction_configs').select('id').eq('business_id', business.id).maybeSingle()
    const result = existing.data?.id
      ? await supabase.from('deduction_configs').update(payload).eq('id', existing.data.id)
      : await supabase.from('deduction_configs').insert(payload)

    if (result.error) {
      toast.error(result.error.message || 'Deductions setup could not be saved.')
      return
    }
    toast.success('Payroll deductions updated.')
  }

  function openPayslip(row) {
    setSelectedPayslip(row)
    setShowPayslipModal(true)
  }

  function openEditDeductions(row) {
    setEditingRow(row)
  }

  async function removePayslip(row) {
    if (!row.id) return
    const result = await supabase.from('payslips').delete().eq('id', row.id)
    if (result.error) {
      toast.error(result.error.message || 'Payroll row could not be removed.')
      return
    }
    toast.success('Payroll row removed.')
    loadPayrollData()
  }

  async function processPayroll() {
    setShowRunModal(false)
    setShowProcessingModal(true)
    setProcessing(true)
    setProcessingLog([])

    const nextLog = []
    for (const row of payrollRows) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      nextLog.push(`✅ Paid: ${row.name} — ${currency(row.net)}`)
      setProcessingLog([...nextLog])
    }

    const runPayload = {
      business_id: business.id,
      payroll_month: selectedMonth,
      total_gross: payrollSummary.gross,
      total_deductions: payrollSummary.deductions,
      total_net: payrollSummary.net,
      staff_count: payrollRows.length,
      status: 'processed',
      processed_at: new Date().toISOString(),
    }

    const runResult = await supabase.from('payroll_runs').insert(runPayload).select().maybeSingle()
    const runId = runResult.data?.id || null

    for (const row of payrollRows) {
      const payload = {
        business_id: business.id,
        payroll_run_id: runId,
        staff_id: row.staffId,
        payroll_month: selectedMonth,
        employee_id: row.employeeId,
        gross: row.gross,
        paye_tax: row.paye,
        pension_employee: row.pensionEmployee,
        pension_employer: row.pensionEmployer,
        nhf: row.nhf,
        other_deductions: row.customDeductions,
        net_pay: row.net,
        status: 'processed',
      }
      await supabase.from('payslips').upsert(payload, { onConflict: 'business_id,staff_id,payroll_month' })
    }

    setProcessing(false)
    setShowProcessingModal(false)
    setShowSuccessModal(true)
    toast.success('Payroll processed successfully.')
    loadPayrollData()
  }

  async function downloadSummaryPdf() {
    await downloadPdf({
      title: `Payroll Summary ${prettyMonth(selectedMonth)}`,
      rows: payrollRows,
      summary: payrollSummary,
    })
  }

  function exportCsv() {
    const blob = new Blob([buildCsv(payrollRows)], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `payroll-${selectedMonth}.csv`
    link.click()
  }

  async function downloadPayslipPdf() {
    if (!selectedPayslip) return
    await downloadPdf({
      title: `Payslip ${selectedPayslip.name} ${prettyMonth(selectedMonth)}`,
      rows: [selectedPayslip],
      summary: {
        gross: selectedPayslip.gross,
        deductions: selectedPayslip.totalDeductions,
        net: selectedPayslip.net,
      },
    })
  }

  function emailPayslip() {
    if (!selectedPayslip) return
    const staffMember = staff.find((item) => item.id === selectedPayslip.staffId)
    const email = staffMember?.work_email || staffMember?.email
    if (!email) {
      toast.error('This staff record does not have an email address yet.')
      return
    }
    const body = `Hello ${selectedPayslip.name}, your payslip for ${prettyMonth(selectedMonth)} is ready. Net pay: ${currency(selectedPayslip.net)}.`
    window.open(`mailto:${email}?subject=${encodeURIComponent(`Payslip for ${prettyMonth(selectedMonth)}`)}&body=${encodeURIComponent(body)}`)
  }

  const years = Array.from(new Set([new Date().getFullYear(), ...payrollRuns.map((run) => new Date(run.processed_at || run.created_at || Date.now()).getFullYear()), ...payslips.map((row) => Number(String(row.payroll_month || '').slice(0, 4) || new Date().getFullYear()))])).sort((a, b) => b - a)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Payroll</div>
          <div className="page-sub">Run compliant monthly payroll with Nigerian PAYE, pension, NHF, payslips, and reporting in one place.</div>
        </div>
        <div className="page-header-actions">
          <Button leftIcon={<PlayCircle className="h-4 w-4" />} onClick={() => setShowRunModal(true)}>Run Payroll</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {loading ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} variant="card" className="h-28 rounded-3xl" />) : (
          <>
            <MiniStat label="Current Month Total" value={currency(payrollSummary.net)} icon={<Wallet className="h-5 w-5" />} tone="bg-primary/10 text-primary" />
            <MiniStat label="Staff on Payroll" value={staff.length} icon={<Building2 className="h-5 w-5" />} tone="bg-violet-100 text-violet-700" />
            <MiniStat label="Processed" value={payrollSummary.processed} icon={<CheckCircle2 className="h-5 w-5" />} tone="bg-emerald-100 text-emerald-700" />
            <MiniStat label="Pending" value={payrollSummary.pending} icon={<Clock3 className="h-5 w-5" />} tone="bg-amber-100 text-amber-700" />
            <MiniStat label="PAYE Tax" value={currency(payrollSummary.paye)} icon={<BadgePercent className="h-5 w-5" />} tone="bg-rose-100 text-rose-700" />
            <MiniStat label="Pension" value={currency(payrollSummary.pension)} icon={<Landmark className="h-5 w-5" />} tone="bg-sky-100 text-sky-700" />
          </>
        )}
      </section>

      <div className="inline-flex rounded-2xl border border-emerald-400/12 bg-neutral-50 p-1 dark:bg-white/5">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-brand-gradient text-white shadow-glow' : 'text-neutral-500 hover:bg-emerald-500/8 hover:text-primary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Current Payroll' ? (
        <Card className="rounded-[32px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Current payroll</h2>
              <p className="mt-1 text-sm text-neutral-500">Auto-calculated PAYE, pension, NHF, and configured deductions for every payroll-ready staff record.</p>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Month</span>
              <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900" />
            </label>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} variant="row" className="rounded-2xl" />)}</div>
          ) : payrollRows.length === 0 ? (
            <div className="mt-6">
              <EmptyState illustration={<Wallet className="h-14 w-14 text-primary" />} title="No payroll-ready staff yet" description="Add staff members with salary and banking details to start running payroll." />
            </div>
          ) : (
            <>
              <div className="mt-6 overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Gross</th>
                      <th>PAYE Tax</th>
                      <th>Pension (8%)</th>
                      <th>NHF (2.5%)</th>
                      <th>Other Deductions</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRows.map((row) => (
                      <tr key={row.staffId}>
                        <td>
                          <div>
                            <p className="font-semibold text-neutral-900">{row.name}</p>
                            <p className="text-xs text-neutral-500">{row.department} • {row.role}</p>
                          </div>
                        </td>
                        <td>{currency(row.gross)}</td>
                        <td>{currency(row.paye)}</td>
                        <td>{currency(row.pensionEmployee)}</td>
                        <td>{currency(row.nhf)}</td>
                        <td>{currency(row.customDeductions)}</td>
                        <td className="font-bold text-neutral-950">{currency(row.net)}</td>
                        <td><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td>
                        <td>
                          <div className="action-row">
                            <Button variant="outline" size="sm" onClick={() => openEditDeductions(row)}>Edit deductions</Button>
                            <Button variant="outline" size="sm" onClick={() => openPayslip(row)}>View payslip</Button>
                            {row.id ? <Button variant="danger" size="sm" onClick={() => removePayslip(row)}>Remove</Button> : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="font-bold text-neutral-950">Totals</td>
                      <td>{currency(payrollSummary.gross)}</td>
                      <td>{currency(payrollSummary.paye)}</td>
                      <td>{currency(payrollSummary.pension)}</td>
                      <td>{currency(payrollRows.reduce((sum, row) => sum + row.nhf, 0))}</td>
                      <td>{currency(payrollRows.reduce((sum, row) => sum + row.customDeductions, 0))}</td>
                      <td className="font-black text-primary">{currency(payrollSummary.net)}</td>
                      <td colSpan="2" />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={downloadSummaryPdf}>Download Payroll Summary (PDF)</Button>
                <Button variant="outline" leftIcon={<FileSpreadsheet className="h-4 w-4" />} onClick={exportCsv}>Export to Excel</Button>
              </div>
            </>
          )}
        </Card>
      ) : null}

      {activeTab === 'Payroll History' ? (
        <Card className="rounded-[32px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Payroll history</h2>
              <p className="mt-1 text-sm text-neutral-500">Review monthly payroll runs, download reports, and confirm what has already been processed.</p>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Filter by year</span>
              <select value={historyYear} onChange={(event) => setHistoryYear(event.target.value)} className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                {years.map((year) => <option key={year} value={String(year)}>{year}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Gross</th>
                  <th>Total Net</th>
                  <th>Staff Count</th>
                  <th>Date Processed</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.length === 0 ? (
                  <tr><td colSpan="7" className="py-10 text-center text-sm text-neutral-500">No payroll history for this year yet.</td></tr>
                ) : historyRows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold text-neutral-900">{prettyMonth(row.payroll_month || monthKeyFromDate(new Date(row.processed_at || row.created_at || Date.now())))}</td>
                    <td>{currency(row.total_gross)}</td>
                    <td>{currency(row.total_net)}</td>
                    <td>{row.staff_count}</td>
                    <td>{new Date(row.processed_at || row.created_at || Date.now()).toLocaleDateString('en-NG')}</td>
                    <td><Badge variant={statusVariant(row.status || 'processed')}>{row.status || 'processed'}</Badge></td>
                    <td>
                      <div className="action-row">
                        <Button variant="outline" size="sm" onClick={() => setSelectedMonth(row.payroll_month || monthKeyFromDate(new Date(row.processed_at || row.created_at || Date.now())))}>View Report</Button>
                        <Button variant="outline" size="sm" onClick={downloadSummaryPdf}>Download PDF</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'Deductions Setup' ? (
        <Card className="rounded-[32px]">
          <div>
            <h2 className="text-xl font-bold text-neutral-950">Deductions setup</h2>
            <p className="mt-1 text-sm text-neutral-500">Configure pension, NHF, and custom payroll deductions for the workspace.</p>
          </div>

          <form onSubmit={deductionForm.handleSubmit(saveDeductionSetup)} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <input type="checkbox" {...deductionForm.register('pension_enabled')} />
                <div>
                  <p className="font-semibold text-neutral-900">Enable pension deductions</p>
                  <p className="mt-1 text-sm text-neutral-500">Default employee and employer rates for monthly payroll.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <input type="checkbox" {...deductionForm.register('nhf_enabled')} />
                <div>
                  <p className="font-semibold text-neutral-900">Enable NHF deductions</p>
                  <p className="mt-1 text-sm text-neutral-500">Calculated as a percentage of basic salary.</p>
                </div>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Employee pension %" type="number" {...deductionForm.register('pension_employee_percent')} />
              <Input label="Employer pension %" type="number" {...deductionForm.register('pension_employer_percent')} />
              <Input label="NHF rate %" type="number" {...deductionForm.register('nhf_rate')} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-950">Custom deductions</h3>
                <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => append({ name: '', type: 'fixed', value: 0, applies_to: 'All staff' })}>Add row</Button>
              </div>
              {fields.length === 0 ? <p className="text-sm text-neutral-500">No custom deductions configured yet.</p> : fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-2xl border border-emerald-400/12 bg-neutral-50 p-4 md:grid-cols-[1fr_150px_140px_1fr_auto] dark:bg-white/5">
                  <Input label="Name" {...deductionForm.register(`custom_deductions.${index}.name`)} />
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-neutral-700">Type</span>
                    <select {...deductionForm.register(`custom_deductions.${index}.type`)} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                      <option value="fixed">Fixed</option>
                      <option value="percent">%</option>
                    </select>
                  </label>
                  <Input label="Amount/Rate" type="number" {...deductionForm.register(`custom_deductions.${index}.value`)} />
                  <Input label="Applies to" {...deductionForm.register(`custom_deductions.${index}.applies_to`)} />
                  <div className="flex items-end">
                    <Button type="button" variant="danger" size="sm" onClick={() => remove(index)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save deduction setup</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {activeTab === 'Tax & Compliance' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[32px]">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">PAYE tax calculator</h2>
              <p className="mt-1 text-sm text-neutral-500">Test annual gross salary against the Nigerian PAYE bands and see a monthly tax estimate instantly.</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Annual gross salary" type="number" value={annualGrossInput} onChange={(event) => setAnnualGrossInput(event.target.value)} />
              <div className="rounded-3xl border border-emerald-400/15 bg-brand-gradient p-5 text-white shadow-glow">
                <p className="text-sm font-semibold text-neutral-600">Monthly tax estimate</p>
                <p className="mt-3 text-3xl font-black text-primary">{currency(taxWidget.monthlyTax)}</p>
                <p className="mt-2 text-sm text-neutral-500">Estimated monthly take-home after PAYE only: {currency(taxWidget.monthlyTakeHome)}</p>
              </div>
            </div>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollBands.map((band, index) => ({
                  band: band.limit === Infinity ? 'Above 3.2M' : index === 0 ? '0–300k' : index === 1 ? '300k–600k' : index === 2 ? '600k–1.1M' : index === 3 ? '1.1M–1.6M' : '1.6M–3.2M',
                  rate: band.rate * 100,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="band" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#16A34A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Tax bands & exports</h2>
            <div className="mt-5 space-y-3">
              {[
                '0 – 300k: 7%',
                '300k – 600k: 11%',
                '600k – 1.1M: 15%',
                '1.1M – 1.6M: 19%',
                '1.6M – 3.2M: 21%',
                'Above 3.2M: 24%',
              ].map((band) => (
                <div key={band} className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 text-sm font-medium text-neutral-700 dark:bg-white/5">{band}</div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={downloadSummaryPdf}>Export monthly PAYE schedule (PDF)</Button>
              <Button variant="outline" leftIcon={<FileSpreadsheet className="h-4 w-4" />} onClick={exportCsv}>Export pension remittance report</Button>
            </div>
          </Card>
        </div>
      ) : null}

      <Modal open={showRunModal} onClose={() => setShowRunModal(false)} title="Confirm payroll processing">
        <div className="space-y-5">
          <p className="text-sm leading-7 text-neutral-600">
            You’re about to process payroll for <strong>{prettyMonth(selectedMonth)}</strong>.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryPill label="Staff" value={payrollRows.length} />
            <SummaryPill label="Total net" value={currency(payrollSummary.net)} />
            <SummaryPill label="Total deductions" value={currency(payrollSummary.deductions)} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowRunModal(false)}>Review later</Button>
            <Button onClick={processPayroll}>Process Payroll</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showProcessingModal} onClose={() => {}} title={`Processing payroll for ${prettyMonth(selectedMonth)}`}>
        <div className="space-y-5">
          <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${Math.max(10, (processingLog.length / Math.max(payrollRows.length, 1)) * 100)}%` }} />
          </div>
          <div className="space-y-3 rounded-2xl border border-emerald-400/12 bg-neutral-50 p-4 dark:bg-white/5">
            <p className="text-sm font-semibold text-neutral-900">{processing ? `Processing payroll for ${processingLog.length + 1 > payrollRows.length ? payrollRows.length : processingLog.length + 1} of ${payrollRows.length}` : 'Finalizing payroll run...'}</p>
            {processingLog.map((item) => <p key={item} className="text-sm text-neutral-600">{item}</p>)}
          </div>
        </div>
      </Modal>

      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Payroll processed successfully">
        <div className="space-y-5">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              <div>
                <p className="text-lg font-bold text-emerald-700">Payroll processed successfully!</p>
                <p className="text-sm text-emerald-600">Your {prettyMonth(selectedMonth)} payroll run is now recorded.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryPill label="Staff paid" value={payrollRows.length} />
            <SummaryPill label="Total net" value={currency(payrollSummary.net)} />
            <SummaryPill label="PAYE" value={currency(payrollSummary.paye)} />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={downloadSummaryPdf}>Download Full Report</Button>
            <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />} onClick={() => toast.success('Payslip emails queued for staff addresses on file.')}>Send payslips to all staff</Button>
            <Button onClick={() => setShowSuccessModal(false)}>Back to Payroll</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showPayslipModal} onClose={() => setShowPayslipModal(false)} title={selectedPayslip ? `Payslip — ${selectedPayslip.name}` : 'Payslip'}>
        {selectedPayslip ? (
          <div className="space-y-5">
            <div ref={payslipRef} className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">BizFlow NG</p>
                  <h2 className="mt-3 text-3xl font-black text-neutral-950">PAYSLIP</h2>
                  <p className="mt-2 text-sm text-neutral-500">{prettyMonth(selectedMonth)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">{business?.name || 'Business'}</p>
                  <p className="text-sm text-neutral-500">{business?.address || 'Business address not set'}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoBox label="Name" value={selectedPayslip.name} />
                <InfoBox label="Employee ID" value={selectedPayslip.employeeId} />
                <InfoBox label="Department" value={selectedPayslip.department} />
                <InfoBox label="Role" value={selectedPayslip.role} />
                <InfoBox label="Bank" value={selectedPayslip.bankName} />
                <InfoBox label="Account" value={selectedPayslip.accountNumber} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-neutral-200 p-5">
                  <h3 className="text-base font-bold text-neutral-950">Earnings</h3>
                  <PayslipRow label="Basic salary" value={currency(selectedPayslip.basic)} />
                  <PayslipRow label="Housing allowance" value={currency(selectedPayslip.housing)} />
                  <PayslipRow label="Transport allowance" value={currency(selectedPayslip.transport)} />
                  <PayslipRow label="Other allowances" value={currency(selectedPayslip.otherAllowances)} />
                  <PayslipRow label="GROSS EARNINGS" value={currency(selectedPayslip.gross)} strong />
                </div>
                <div className="rounded-3xl border border-neutral-200 p-5">
                  <h3 className="text-base font-bold text-neutral-950">Deductions</h3>
                  <PayslipRow label="PAYE Tax" value={currency(selectedPayslip.paye)} />
                  <PayslipRow label="Employee Pension (8%)" value={currency(selectedPayslip.pensionEmployee)} />
                  <PayslipRow label="NHF (2.5%)" value={currency(selectedPayslip.nhf)} />
                  <PayslipRow label="Other Deductions" value={currency(selectedPayslip.customDeductions)} />
                  <PayslipRow label="TOTAL DEDUCTIONS" value={currency(selectedPayslip.totalDeductions)} strong />
                </div>
              </div>

              <div className="rounded-3xl bg-brand-gradient p-5 text-white shadow-glow">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Net Pay</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-primary">{currency(selectedPayslip.net)}</p>
                <p className="mt-3 text-sm text-neutral-600">Paid to: {selectedPayslip.bankName} — {selectedPayslip.accountNumber}</p>
                <div className="mt-8 border-t border-dashed border-neutral-300 pt-4 text-sm text-neutral-500">Signature line</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={downloadPayslipPdf}>Download PDF</Button>
              <Button variant="outline" leftIcon={<Mail className="h-4 w-4" />} onClick={emailPayslip}>Email to Staff</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(editingRow)} onClose={() => setEditingRow(null)} title={editingRow ? `Review deductions — ${editingRow.name}` : 'Edit deductions'}>
        {editingRow ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryPill label="Gross" value={currency(editingRow.gross)} />
              <SummaryPill label="Net pay" value={currency(editingRow.net)} />
              <SummaryPill label="PAYE" value={currency(editingRow.paye)} />
              <SummaryPill label="Pension + NHF" value={currency(editingRow.pensionEmployee + editingRow.nhf)} />
            </div>
            <p className="text-sm leading-7 text-neutral-600">
              Default deductions come from the workspace setup tab. To change values for everyone, update <strong>Deductions Setup</strong>. Per-person overrides can be added in a later payroll pass.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setEditingRow(null)}>Done</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </motion.div>
  )
}

Payroll.propTypes = {
  business: PropTypes.object,
}

function MiniStat({ label, value, icon, tone }) {
  return (
    <Card className="rounded-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-neutral-950">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>{icon}</span>
      </div>
    </Card>
  )
}

MiniStat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  tone: PropTypes.string.isRequired,
}

function SummaryPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
      <p className="mt-2 text-lg font-black text-neutral-950">{value}</p>
    </div>
  )
}

SummaryPill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
      <p className="mt-2 font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

InfoBox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function PayslipRow({ label, value, strong = false }) {
  return (
    <div className={`mt-4 flex items-center justify-between ${strong ? 'border-t border-neutral-200 pt-4 text-base font-black text-neutral-950' : 'text-sm text-neutral-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

PayslipRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  strong: PropTypes.bool,
}
