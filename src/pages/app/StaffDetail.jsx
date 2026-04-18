import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { ArrowLeft, CalendarCheck2, FileText, Mail, Phone, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import { uploadPresets, validateUploadFile } from '../../lib/uploadSecurity'
import {
  defaultLeaveBalances,
  documentCategories,
  employmentVariant,
  formatCurrency,
  formatDate,
  getAvatarInitials,
  getSafeArray,
  getStaffFullName,
  leaveTypeOptions,
  staffAvatarTone,
  statusVariant,
} from './staffShared'

const tabs = ['profile', 'attendance', 'leave', 'payroll', 'documents']

export default function StaffDetail({ business }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [member, setMember] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveBalances, setLeaveBalances] = useState([])
  const [payslips, setPayslips] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [notes, setNotes] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'Annual Leave',
    from_date: '',
    to_date: '',
    reason: '',
  })

  useEffect(() => {
    if (!business?.id || !id) return
    loadStaffDetail()
  }, [business?.id, id])

  async function loadStaffDetail() {
    setLoading(true)
    const [memberRes, attendanceRes, leaveRes, balanceRes, payslipRes, documentRes] = await Promise.all([
      supabase.from('staff').select('*').eq('id', id).single(),
      supabase.from('attendance').select('*').eq('staff_id', id).eq('business_id', business.id).order('attendance_date', { ascending: false }),
      supabase.from('leave_requests').select('*').eq('staff_id', id).eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('leave_balances').select('*').eq('staff_id', id).eq('business_id', business.id),
      supabase.from('payslips').select('*').eq('staff_id', id).eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('staff_documents').select('*').eq('staff_id', id).eq('business_id', business.id).order('created_at', { ascending: false }),
    ])

    const nextMember = memberRes.data || null
    setMember(nextMember)
    setNotes(nextMember?.notes || '')
    setAttendance(getSafeArray(attendanceRes))
    setLeaveRequests(getSafeArray(leaveRes))
    setLeaveBalances(balanceRes.error || !balanceRes.data?.length ? defaultLeaveBalances() : balanceRes.data)
    setPayslips(getSafeArray(payslipRes))
    setDocuments(getSafeArray(documentRes))
    setLoading(false)
  }

  async function saveInlineProfile() {
    if (!member) return
    const result = await supabase.from('staff').update({ notes }).eq('id', member.id)
    if (result.error) {
      toast.error(result.error.message || 'Profile notes could not be updated.')
      return
    }
    toast.success('Profile notes updated.')
    loadStaffDetail()
  }

  async function markAttendance(status) {
    const payload = {
      business_id: business.id,
      staff_id: member.id,
      attendance_date: new Date().toISOString().slice(0, 10),
      status,
      check_in_at: status === 'present' ? new Date().toISOString() : null,
    }
    const result = await supabase.from('attendance').insert(payload)
    if (result.error) {
      toast.error(result.error.message || 'Attendance could not be marked.')
      return
    }
    toast.success(`Attendance marked as ${status}.`)
    loadStaffDetail()
  }

  async function requestLeave(event) {
    event.preventDefault()
    const from = new Date(leaveForm.from_date)
    const to = new Date(leaveForm.to_date)
    const daysRequested = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1)
    const result = await supabase.from('leave_requests').insert({
      business_id: business.id,
      staff_id: member.id,
      leave_type: leaveForm.leave_type,
      from_date: leaveForm.from_date,
      to_date: leaveForm.to_date,
      reason: leaveForm.reason,
      days_requested: daysRequested,
      status: 'pending',
    })
    if (result.error) {
      toast.error(result.error.message || 'Leave request could not be created.')
      return
    }
    toast.success('Leave request submitted.')
    setShowLeaveModal(false)
    setLeaveForm({ leave_type: 'Annual Leave', from_date: '', to_date: '', reason: '' })
    loadStaffDetail()
  }

  async function uploadDocument(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      validateUploadFile(file, uploadPresets.staffDocument)
    } catch (error) {
      toast.error(error.message)
      return
    }
    setUploading(true)
    const category = documentCategories[0]
    const path = `${business.id}/${id}/${Date.now()}-${file.name}`
    const uploadRes = await supabase.storage.from('staff-documents').upload(path, file, { upsert: true })
    if (uploadRes.error) {
      setUploading(false)
      toast.error('Upload failed. Make sure the staff-documents bucket exists.')
      return
    }
    await supabase.from('staff_documents').insert({
      business_id: business.id,
      staff_id: id,
      category,
      file_name: file.name,
      file_path: path,
    })
    setUploading(false)
    toast.success('Document uploaded.')
    loadStaffDetail()
  }

  async function deleteStaffRecord() {
    if (!window.confirm('Delete this staff profile?')) return
    const result = await supabase.from('staff').delete().eq('id', id)
    if (result.error) {
      toast.error(result.error.message || 'Staff profile could not be deleted.')
      return
    }
    toast.success('Staff profile deleted.')
    navigate('/app/staff')
  }

  const attendanceSummary = useMemo(() => {
    const total = attendance.length
    const present = attendance.filter((item) => item.status === 'present').length
    const leave = attendance.filter((item) => item.status === 'leave').length
    return {
      rate: total ? Math.round((present / total) * 100) : 0,
      present,
      leave,
      total,
    }
  }, [attendance])

  if (loading) return <Skeleton variant="card" className="h-[820px] rounded-3xl" />
  if (!member) return <Card className="rounded-[32px]"><h2 className="text-xl font-bold text-neutral-950">Staff record not found</h2></Card>

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="page-header">
        <div>
          <Link to="/app/staff" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="h-4 w-4" /> Back to staff</Link>
          <div className="flex items-center gap-4">
            {member.photo_url ? (
              <img src={member.photo_url} alt={getStaffFullName(member)} className="h-20 w-20 rounded-3xl object-cover" />
            ) : (
              <div className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl text-xl font-black ${staffAvatarTone(getStaffFullName(member))}`}>
                {getAvatarInitials(member)}
              </div>
            )}
            <div>
              <div className="page-title">{getStaffFullName(member)}</div>
              <div className="page-sub">{member.job_title || member.role || 'Team member'} • {member.department || 'No department yet'}</div>
            </div>
          </div>
        </div>
        <div className="page-header-actions">
          <Badge variant={statusVariant(member.status || 'active')}>{member.status || 'active'}</Badge>
          <Badge variant={employmentVariant(member.employment_type || 'Full-time')}>{member.employment_type || 'Full-time'}</Badge>
          <Badge variant="info">{member.employee_id || 'No employee ID'}</Badge>
          <Button variant="outline" onClick={() => navigate('/app/staff')}>Edit</Button>
          <Button variant="outline" onClick={() => markAttendance('present')}>Mark attendance</Button>
          <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={deleteStaffRecord}>Delete</Button>
        </div>
      </section>

      <div className="inline-flex rounded-2xl border border-emerald-400/12 bg-neutral-50 p-1 dark:bg-white/5">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-brand-gradient text-white shadow-glow' : 'text-neutral-500 hover:bg-emerald-500/8 hover:text-primary'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[32px]">
            <h2 className="text-xl font-bold text-neutral-950">Profile</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoCard icon={<Mail className="h-4 w-4" />} label="Work email" value={member.work_email || member.email || 'Not added'} />
              <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value={member.phone || 'Not added'} />
              <InfoCard icon={<CalendarCheck2 className="h-4 w-4" />} label="Start date" value={formatDate(member.start_date || member.created_at)} />
              <InfoCard icon={<FileText className="h-4 w-4" />} label="Home address" value={member.home_address || member.address || 'Not added'} />
              <InfoCard label="Emergency contact" value={member.emergency_contact_name || 'Not added'} />
              <InfoCard label="Emergency phone" value={member.emergency_contact_phone || 'Not added'} />
              <InfoCard label="Bank" value={member.bank_name || 'Not added'} />
              <InfoCard label="Account number" value={member.account_number || 'Not added'} />
            </div>

            <h2 className="mt-8 text-xl font-bold text-neutral-950">Notes</h2>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} className="mt-4 w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
            <div className="mt-4">
              <Button onClick={saveInlineProfile}>Save profile notes</Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[32px]">
              <h2 className="text-xl font-bold text-neutral-950">Employment snapshot</h2>
              <div className="mt-5 grid gap-3">
                <SummaryRow label="Basic salary" value={formatCurrency(member.basic_salary || member.salary || 0)} />
                <SummaryRow label="Gross salary" value={formatCurrency(member.gross_salary || member.salary || 0)} />
                <SummaryRow label="Department" value={member.department || 'Not assigned'} />
                <SummaryRow label="Manager" value={member.reporting_manager_name || 'Not assigned'} />
              </div>
            </Card>

            <Card className="rounded-[32px]">
              <h2 className="text-xl font-bold text-neutral-950">Quick status</h2>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5">Attendance rate: <strong className="text-neutral-950">{attendanceSummary.rate}%</strong></div>
                <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5">Present records: <strong className="text-neutral-950">{attendanceSummary.present}</strong></div>
                <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 text-sm text-neutral-600 dark:bg-white/5">Leave days recorded: <strong className="text-neutral-950">{attendanceSummary.leave}</strong></div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === 'attendance' ? (
        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Attendance</h2>
              <p className="mt-1 text-sm text-neutral-500">Track present, absent, and leave days with a simple HR-ready log.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => markAttendance('present')}>Check in</Button>
              <Button variant="outline" onClick={() => markAttendance('leave')}>Mark leave</Button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <SummaryRowCard label="Attendance rate" value={`${attendanceSummary.rate}%`} />
            <SummaryRowCard label="Present days" value={attendanceSummary.present} />
            <SummaryRowCard label="Leave days" value={attendanceSummary.leave} />
          </div>
          <div className="mt-6 space-y-3">
            {attendance.length === 0 ? <p className="text-sm text-neutral-500">No attendance records yet.</p> : attendance.slice(0, 12).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <div>
                  <p className="font-semibold text-neutral-900">{formatDate(entry.attendance_date)}</p>
                  <p className="text-sm text-neutral-500">{entry.check_in_at ? `Checked in ${new Date(entry.check_in_at).toLocaleTimeString('en-NG')}` : 'No check-in time recorded'}</p>
                </div>
                <Badge variant={entry.status === 'present' ? 'success' : entry.status === 'leave' ? 'warning' : 'neutral'}>{entry.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {activeTab === 'leave' ? (
        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Leave management</h2>
              <p className="mt-1 text-sm text-neutral-500">Balances, history, and leave requests in one HR-ready view.</p>
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowLeaveModal(true)}>Request Leave</Button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {leaveBalances.map((balance) => (
              <Card key={balance.leave_type} className="rounded-3xl border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
                <p className="text-sm font-semibold text-neutral-500">{balance.leave_type}</p>
                <p className="mt-3 text-3xl font-black text-neutral-950">{balance.remaining_days}/{balance.total_days}</p>
                <p className="mt-2 text-sm text-neutral-500">days remaining</p>
              </Card>
            ))}
          </div>
          <div className="mt-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Approved by</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-sm text-neutral-500">No leave history yet.</td></tr>
                ) : leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.leave_type}</td>
                    <td>{formatDate(request.from_date)}</td>
                    <td>{formatDate(request.to_date)}</td>
                    <td>{request.days_requested || '—'}</td>
                    <td><Badge variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>{request.status}</Badge></td>
                    <td>{request.approved_by || request.manager_comment || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'payroll' ? (
        <Card className="rounded-[32px]">
          <h2 className="text-xl font-bold text-neutral-950">Payroll history</h2>
          <div className="mt-6 overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Gross</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-sm text-neutral-500">No payroll records yet.</td></tr>
                ) : payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td>{payslip.payroll_month}</td>
                    <td>{formatCurrency(payslip.gross)}</td>
                    <td>{formatCurrency((payslip.paye_tax || 0) + (payslip.pension_employee || 0) + (payslip.nhf || 0) + (payslip.other_deductions || 0))}</td>
                    <td>{formatCurrency(payslip.net_pay || 0)}</td>
                    <td><Badge variant={payslip.status === 'processed' ? 'success' : 'warning'}>{payslip.status || 'processed'}</Badge></td>
                    <td><Button variant="outline" size="sm" onClick={() => { setSelectedPayslip(payslip); setShowPayslipModal(true) }}>View Payslip</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'documents' ? (
        <Card className="rounded-[32px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Documents</h2>
              <p className="mt-1 text-sm text-neutral-500">Upload and organize ID, contracts, certificates, and HR files.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              <Plus className="mr-2 h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload document'}
              <input type="file" className="hidden" onChange={uploadDocument} />
            </label>
          </div>
          <div className="mt-6 grid gap-3">
            {documents.length === 0 ? <p className="text-sm text-neutral-500">No staff documents uploaded yet.</p> : documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
                <div>
                  <p className="font-semibold text-neutral-900">{document.file_name}</p>
                  <p className="text-sm text-neutral-500">{document.category || 'Document'} • uploaded {formatDate(document.created_at)}</p>
                </div>
                <Badge variant="info">{document.category || 'File'}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Modal open={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Request leave">
        <form onSubmit={requestLeave} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Leave type</span>
            <select value={leaveForm.leave_type} onChange={(event) => setLeaveForm((current) => ({ ...current, leave_type: event.target.value }))} className="w-full rounded-xl border border-emerald-400/12 bg-white/90 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5">
              {leaveTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="From date" type="date" value={leaveForm.from_date} onChange={(event) => setLeaveForm((current) => ({ ...current, from_date: event.target.value }))} />
            <Input label="To date" type="date" value={leaveForm.to_date} onChange={(event) => setLeaveForm((current) => ({ ...current, to_date: event.target.value }))} />
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Reason</span>
            <textarea rows={4} value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} className="w-full rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 dark:bg-white/5" />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
            <Button type="submit">Submit leave request</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showPayslipModal} onClose={() => setShowPayslipModal(false)} title="Payslip preview">
        {selectedPayslip ? (
          <div className="space-y-4">
            <div className="rounded-[28px] border border-emerald-400/15 bg-white/90 p-6 dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">BizFlow NG</p>
                  <h2 className="mt-2 text-3xl font-black text-neutral-950">PAYSLIP</h2>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">{business?.name || 'Business'}</p>
                  <p className="text-sm text-neutral-500">{selectedPayslip.payroll_month}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <InfoBox label="Employee" value={getStaffFullName(member)} />
                <InfoBox label="Employee ID" value={member.employee_id || selectedPayslip.employee_id || '—'} />
                <InfoBox label="Department" value={member.department || '—'} />
                <InfoBox label="Role" value={member.job_title || member.role || '—'} />
              </div>
              <div className="mt-6 rounded-3xl bg-primary/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Net Pay</p>
                <p className="mt-3 text-4xl font-black tracking-tight text-primary">{formatCurrency(selectedPayslip.net_pay || 0)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </motion.div>
  )
}

StaffDetail.propTypes = {
  business: PropTypes.object,
}

function InfoCard({ icon = null, label, value }) {
  return (
    <div className="rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

InfoCard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-emerald-400/12 bg-neutral-50 px-4 py-4 dark:bg-white/5">
      <span className="text-sm font-medium text-neutral-600">{label}</span>
      <strong className="text-sm font-bold text-neutral-950">{value}</strong>
    </div>
  )
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

function SummaryRowCard({ label, value }) {
  return (
    <Card className="rounded-3xl border border-emerald-400/12 bg-neutral-50 dark:bg-white/5">
      <p className="text-sm font-semibold text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-neutral-950">{value}</p>
    </Card>
  )
}

SummaryRowCard.propTypes = {
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
