import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  CheckCheck,
  Filter,
  Grid2X2,
  List,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import useToast from '../../hooks/useToast'
import {
  bankOptions,
  buildStaffPayload,
  calculateGrossSalary,
  calculateAttendanceSummary,
  defaultLeaveBalances,
  documentCategories,
  employmentTypeOptions,
  employmentVariant,
  formatCurrency,
  formatDate,
  genderOptions,
  generateEmployeeId,
  getAvatarInitials,
  getSafeArray,
  getStaffFullName,
  leaveTypeOptions,
  relativeTime,
  staffAvatarTone,
  staffStatusOptions,
  statusVariant,
} from './staffShared'

const staffSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  personal_email: z.string().email('Enter a valid email').or(z.literal('')),
  home_address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  photo_url: z.string().optional(),
  job_title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  employment_type: z.enum(['Full-time', 'Part-time', 'Contract']),
  start_date: z.string().optional(),
  probation_end_date: z.string().optional(),
  reporting_manager_id: z.string().optional(),
  work_email: z.string().email('Enter a valid work email').or(z.literal('')),
  employee_id: z.string().min(1, 'Employee ID is required'),
  basic_salary: z.coerce.number().min(0, 'Salary cannot be negative'),
  housing_allowance: z.coerce.number().min(0),
  transport_allowance: z.coerce.number().min(0),
  other_allowances: z.array(z.object({
    label: z.string().optional(),
    amount: z.coerce.number().min(0),
  })),
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
  status: z.enum(['active', 'on leave', 'terminated']),
})

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  head_id: z.string().optional(),
})

const fallbackStaffValues = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  phone: '',
  personal_email: '',
  home_address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  photo_url: '',
  job_title: '',
  department: '',
  employment_type: 'Full-time',
  start_date: '',
  probation_end_date: '',
  reporting_manager_id: '',
  work_email: '',
  employee_id: '',
  basic_salary: 0,
  housing_allowance: 0,
  transport_allowance: 0,
  other_allowances: [],
  bank_name: '',
  account_number: '',
  account_name: '',
  status: 'active',
}

const leaveDecisionSchema = z.object({
  comment: z.string().optional(),
})

const minimalStaffPayload = (values, businessId) => ({
  business_id: businessId,
  name: `${values.first_name} ${values.last_name}`.trim(),
  role: values.job_title,
  email: values.work_email || values.personal_email || null,
  phone: values.phone || null,
  salary: Number(values.basic_salary || 0),
  status: values.status,
})

export default function Staff({ business }) {
  const toast = useToast()
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [showStaffModal, setShowStaffModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [savingStaff, setSavingStaff] = useState(false)
  const [savingDepartment, setSavingDepartment] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [editingStaff, setEditingStaff] = useState(null)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [query, setQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [employmentFilter, setEmploymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date joined')
  const [pendingAction, setPendingAction] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [documentFiles, setDocumentFiles] = useState([])

  const staffForm = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: fallbackStaffValues,
  })

  const { fields: allowanceFields, append: appendAllowance, remove: removeAllowance } = useFieldArray({
    control: staffForm.control,
    name: 'other_allowances',
  })

  const departmentForm = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', head_id: '' },
  })

  const leaveForm = useForm({
    resolver: zodResolver(leaveDecisionSchema),
    defaultValues: { comment: '' },
  })

  useEffect(() => {
    if (!business?.id) return
    loadHrData()
  }, [business?.id])

  const watchedValues = staffForm.watch()
  const grossSalary = useMemo(() => calculateGrossSalary(watchedValues), [watchedValues])

  async function loadHrData() {
    setLoading(true)
    const [staffRes, departmentsRes, leaveRes, attendanceRes] = await Promise.all([
      supabase.from('staff').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('departments').select('*').eq('business_id', business.id).order('name'),
      supabase.from('leave_requests').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      supabase.from('attendance').select('*').eq('business_id', business.id).order('attendance_date', { ascending: false }),
    ])

    const staffRows = getSafeArray(staffRes)
    setStaff(staffRows)

    const departmentRows = getSafeArray(departmentsRes)
    const derivedDepartments = Array.from(new Set(staffRows.map((member) => member.department).filter(Boolean))).map((name) => ({
      id: name,
      name,
      business_id: business.id,
      head_id: '',
    }))
    setDepartments(departmentRows.length ? departmentRows : derivedDepartments)

    setLeaveRequests(getSafeArray(leaveRes))
    setAttendance(getSafeArray(attendanceRes))
    setLoading(false)
  }

  function resetStaffForm() {
    staffForm.reset({
      ...fallbackStaffValues,
      employee_id: generateEmployeeId(staff),
    })
    setPhotoFile(null)
    setDocumentFiles([])
    setEditingStaff(null)
  }

  function openAddStaff() {
    resetStaffForm()
    setShowStaffModal(true)
  }

  function openEditStaff(member) {
    setEditingStaff(member)
    staffForm.reset({
      first_name: member.first_name || member.name?.split(' ')?.[0] || '',
      last_name: member.last_name || member.name?.split(' ')?.slice(1).join(' ') || '',
      date_of_birth: member.date_of_birth || '',
      gender: member.gender || '',
      phone: member.phone || '',
      personal_email: member.personal_email || member.email || '',
      home_address: member.home_address || member.address || '',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || '',
      photo_url: member.photo_url || '',
      job_title: member.job_title || member.role || '',
      department: member.department || '',
      employment_type: member.employment_type || 'Full-time',
      start_date: member.start_date || '',
      probation_end_date: member.probation_end_date || '',
      reporting_manager_id: member.reporting_manager_id || '',
      work_email: member.work_email || member.email || '',
      employee_id: member.employee_id || generateEmployeeId(staff),
      basic_salary: member.basic_salary || member.salary || 0,
      housing_allowance: member.housing_allowance || 0,
      transport_allowance: member.transport_allowance || 0,
      other_allowances: Array.isArray(member.other_allowances) ? member.other_allowances : [],
      bank_name: member.bank_name || '',
      account_number: member.account_number || '',
      account_name: member.account_name || '',
      status: member.status || 'active',
    })
    setPhotoFile(null)
    setDocumentFiles([])
    setShowStaffModal(true)
  }

  async function uploadPhotoIfNeeded(values) {
    if (!photoFile || !business?.id) return values.photo_url || ''
    const path = `${business.id}/${Date.now()}-${photoFile.name}`
    const { error } = await supabase.storage.from('staff-photos').upload(path, photoFile, { upsert: true })
    if (error) {
      toast.error('Photo upload failed. Create the staff-photos bucket to enable images.')
      return values.photo_url || ''
    }
    const { data } = supabase.storage.from('staff-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadDocumentsIfNeeded(staffId) {
    if (!documentFiles.length || !business?.id || !staffId) return
    for (const item of documentFiles) {
      const path = `${business.id}/${staffId}/${Date.now()}-${item.file.name}`
      const uploadRes = await supabase.storage.from('staff-documents').upload(path, item.file, { upsert: true })
      if (uploadRes.error) {
        toast.error(`Could not upload ${item.file.name}. Create the staff-documents bucket to enable staff files.`)
        continue
      }
      await supabase.from('staff_documents').insert({
        business_id: business.id,
        staff_id: staffId,
        category: item.category,
        file_name: item.file.name,
        file_path: path,
      })
    }
  }

  async function onSaveStaff(values) {
    setSavingStaff(true)
    const photoUrl = await uploadPhotoIfNeeded(values)
    const payload = {
      ...buildStaffPayload({ ...values, photo_url: photoUrl }),
      business_id: business.id,
    }

    let result = editingStaff
      ? await supabase.from('staff').update(payload).eq('id', editingStaff.id).select().single()
      : await supabase.from('staff').insert(payload).select().single()

    if (result.error) {
      const fallback = minimalStaffPayload(values, business.id)
      result = editingStaff
        ? await supabase.from('staff').update(fallback).eq('id', editingStaff.id).select().single()
        : await supabase.from('staff').insert(fallback).select().single()
    }

    setSavingStaff(false)

    if (result.error) {
      toast.error(result.error.message || 'We could not save this staff profile yet.')
      return
    }

    await uploadDocumentsIfNeeded(result.data.id)
    toast.success(editingStaff ? 'Staff member updated.' : 'Staff member added.')
    setShowStaffModal(false)
    resetStaffForm()
    loadHrData()
  }

  function openDepartmentModal(department = null) {
    setEditingDepartment(department)
    departmentForm.reset({
      name: department?.name || '',
      head_id: department?.head_id || '',
    })
    setShowDepartmentModal(true)
  }

  async function onSaveDepartment(values) {
    setSavingDepartment(true)
    const payload = { business_id: business.id, name: values.name, head_id: values.head_id || null }
    const result = editingDepartment
      ? await supabase.from('departments').update(payload).eq('id', editingDepartment.id)
      : await supabase.from('departments').insert(payload)
    setSavingDepartment(false)

    if (result.error) {
      toast.error(result.error.message || 'Department changes could not be saved.')
      return
    }

    toast.success(editingDepartment ? 'Department updated.' : 'Department created.')
    setShowDepartmentModal(false)
    setEditingDepartment(null)
    loadHrData()
  }

  async function deleteDepartment(id) {
    if (!window.confirm('Delete this department?')) return
    const result = await supabase.from('departments').delete().eq('id', id)
    if (result.error) {
      toast.error(result.error.message || 'Department could not be deleted.')
      return
    }
    toast.success('Department deleted.')
    loadHrData()
  }

  async function deleteStaff(id) {
    if (!window.confirm('Delete this staff member?')) return
    const result = await supabase.from('staff').delete().eq('id', id)
    if (result.error) {
      toast.error(result.error.message || 'Staff member could not be deleted.')
      return
    }
    toast.success('Staff member deleted.')
    loadHrData()
  }

  async function bulkDelete() {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected staff record(s)?`)) return
    const result = await supabase.from('staff').delete().in('id', selectedIds)
    if (result.error) {
      toast.error(result.error.message || 'Selected staff records could not be deleted.')
      return
    }
    setSelectedIds([])
    toast.success('Selected staff records deleted.')
    loadHrData()
  }

  async function applyLeaveDecision(values) {
    if (!pendingAction) return
    const payload = {
      status: pendingAction.nextStatus,
      manager_comment: values.comment || null,
      reviewed_at: new Date().toISOString(),
    }
    const result = await supabase.from('leave_requests').update(payload).eq('id', pendingAction.request.id)
    if (result.error) {
      toast.error(result.error.message || 'Leave request could not be updated.')
      return
    }
    toast.success(`Leave request ${pendingAction.nextStatus}.`)
    setPendingAction(null)
    leaveForm.reset({ comment: '' })
    loadHrData()
  }

  const activeStaff = useMemo(() => staff.filter((member) => member.status === 'active'), [staff])
  const onLeaveStaff = useMemo(() => staff.filter((member) => member.status === 'on leave'), [staff])
  const departmentNames = useMemo(() => Array.from(new Set([...departments.map((item) => item.name), ...staff.map((member) => member.department).filter(Boolean)])), [departments, staff])
  const departmentCount = departmentNames.length

  const filteredStaff = useMemo(() => {
    const rows = staff.filter((member) => {
      const haystack = `${getStaffFullName(member)} ${member.role || ''} ${member.department || ''}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      const matchesDepartment = departmentFilter === 'all' || (member.department || '') === departmentFilter
      const matchesStatus = statusFilter === 'all' || (member.status || '') === statusFilter
      const matchesType = employmentFilter === 'all' || (member.employment_type || '') === employmentFilter
      return matchesQuery && matchesDepartment && matchesStatus && matchesType
    })

    return rows.sort((left, right) => {
      if (sortBy === 'name') return getStaffFullName(left).localeCompare(getStaffFullName(right))
      if (sortBy === 'salary') return Number(right.gross_salary || right.salary || 0) - Number(left.gross_salary || left.salary || 0)
      return new Date(right.start_date || right.created_at || 0) - new Date(left.start_date || left.created_at || 0)
    })
  }, [staff, query, departmentFilter, statusFilter, employmentFilter, sortBy])

  const pendingLeaves = useMemo(() => leaveRequests.filter((request) => request.status === 'pending'), [leaveRequests])
  const attendanceSummary = useMemo(() => calculateAttendanceSummary(attendance), [attendance])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="page-header">
        <div>
          <div className="page-title">Staff &amp; HR</div>
          <div className="page-sub">Manage your people, departments, leave approvals, payroll details, and staff records from one polished HR workspace.</div>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" leftIcon={<Building2 className="h-4 w-4" />} onClick={() => openDepartmentModal()}>
            Manage Departments
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAddStaff}>
            Add Staff Member
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} variant="card" className="h-32 rounded-3xl" />) : (
          <>
            <StatCard icon={<Users className="h-5 w-5" />} tone="bg-primary/10 text-primary" label="Total Staff" value={staff.length} note="Everyone in your HR directory" />
            <StatCard icon={<CheckCheck className="h-5 w-5" />} tone="bg-emerald-100 text-emerald-700" label="Active" value={activeStaff.length} note="Currently active employees" />
            <StatCard icon={<CalendarDays className="h-5 w-5" />} tone="bg-amber-100 text-amber-700" label="On Leave" value={onLeaveStaff.length} note={`${pendingLeaves.length} leave request${pendingLeaves.length === 1 ? '' : 's'} pending`} />
            <StatCard icon={<BriefcaseBusiness className="h-5 w-5" />} tone="bg-violet-100 text-violet-700" label="Departments" value={departmentCount} note={`${attendanceSummary.rate}% attendance recorded`} />
          </>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="rounded-[32px]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">Staff directory</h2>
              <p className="mt-1 text-sm text-neutral-500">Switch between the visual directory and a structured HR table without losing context.</p>
            </div>
            <div className="inline-flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1">
              <button type="button" onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}><Grid2X2 className="h-4 w-4" /> Grid</button>
              <button type="button" onClick={() => setViewMode('table')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500'}`}><List className="h-4 w-4" /> Table</button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-5">
            <Input
              label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or role"
              prefixIcon={<Search className="h-4 w-4" />}
            />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Department</span>
              <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="all">All departments</option>
                {departmentNames.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="all">All status</option>
                {staffStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Employment type</span>
              <select value={employmentFilter} onChange={(event) => setEmploymentFilter(event.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="all">All types</option>
                {employmentTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="name">Name</option>
                <option value="date joined">Date joined</option>
                <option value="salary">Salary</option>
              </select>
            </label>
          </div>

          {selectedIds.length > 0 ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-primary">{selectedIds.length} selected</p>
              <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={bulkDelete}>Delete selected</Button>
            </div>
          ) : null}

          <div className="mt-6">
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} variant="row" className="w-full rounded-2xl" />)}</div>
            ) : filteredStaff.length === 0 ? (
              <EmptyState illustration={<Users className="h-14 w-14 text-primary" />} title="No staff members yet" description="Build your HR base with employee details, payroll setup, leave tracking, and reporting structure." ctaLabel="Add Staff Member" onCta={openAddStaff} />
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredStaff.map((member) => (
                  <Card key={member.id} className="rounded-[28px] border border-neutral-200 transition-transform duration-200 hover:-translate-y-1 hover:shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={getStaffFullName(member)} className="h-14 w-14 rounded-2xl object-cover" />
                        ) : (
                          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black ${staffAvatarTone(getStaffFullName(member))}`}>
                            {getAvatarInitials(member)}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-neutral-950">{getStaffFullName(member)}</p>
                          <p className="text-sm text-neutral-500">{member.job_title || member.role || 'No job title yet'}</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={selectedIds.includes(member.id)} onChange={() => setSelectedIds((current) => current.includes(member.id) ? current.filter((item) => item !== member.id) : [...current, member.id])} />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge variant="info">{member.department || 'No department'}</Badge>
                      <Badge variant={statusVariant(member.status || 'active')}>{member.status || 'active'}</Badge>
                      <Badge variant={employmentVariant(member.employment_type || 'Full-time')}>{member.employment_type || 'Full-time'}</Badge>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-neutral-600">
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-neutral-400" /> {member.work_email || member.email || 'No work email'}</div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> {member.phone || 'No phone number'}</div>
                      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-neutral-400" /> Joined {formatDate(member.start_date || member.created_at)}</div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Gross pay</p>
                        <p className="mt-1 text-lg font-black text-neutral-950">{formatCurrency(member.gross_salary || member.salary || 0)}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button as={Link} to={`/app/staff/${member.id}`} variant="outline" size="sm">View Profile</Button>
                        <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => openEditStaff(member)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => deleteStaff(member.id)}>Delete</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th />
                      <th>Staff</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Salary</th>
                      <th>Start Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr key={member.id}>
                        <td><input type="checkbox" checked={selectedIds.includes(member.id)} onChange={() => setSelectedIds((current) => current.includes(member.id) ? current.filter((item) => item !== member.id) : [...current, member.id])} /></td>
                        <td>
                          <div className="flex items-center gap-3">
                            {member.photo_url ? (
                              <img src={member.photo_url} alt={getStaffFullName(member)} className="h-11 w-11 rounded-2xl object-cover" />
                            ) : (
                              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black ${staffAvatarTone(getStaffFullName(member))}`}>{getAvatarInitials(member)}</div>
                            )}
                            <div>
                              <div className="font-semibold text-neutral-900">{getStaffFullName(member)}</div>
                              <div className="text-xs text-neutral-500">{member.work_email || member.email || 'No work email'}</div>
                            </div>
                          </div>
                        </td>
                        <td>{member.job_title || member.role || '—'}</td>
                        <td>{member.department || '—'}</td>
                        <td><Badge variant={employmentVariant(member.employment_type || 'Full-time')}>{member.employment_type || 'Full-time'}</Badge></td>
                        <td className="font-semibold text-neutral-900">{formatCurrency(member.gross_salary || member.salary || 0)}</td>
                        <td>{formatDate(member.start_date || member.created_at)}</td>
                        <td><Badge variant={statusVariant(member.status || 'active')}>{member.status || 'active'}</Badge></td>
                        <td>
                          <div className="action-row">
                            <Button as={Link} to={`/app/staff/${member.id}`} variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm" onClick={() => openEditStaff(member)}>Edit</Button>
                            <Button variant="danger" size="sm" onClick={() => deleteStaff(member.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[32px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">Pending leave approvals</h2>
                <p className="mt-1 text-sm text-neutral-500">Manager view for requests waiting on action.</p>
              </div>
              <Badge variant={pendingLeaves.length ? 'warning' : 'success'}>{pendingLeaves.length} pending</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-neutral-500">No leave requests are waiting for approval.</p>
              ) : pendingLeaves.slice(0, 5).map((request) => {
                const member = staff.find((item) => item.id === request.staff_id)
                return (
                  <div key={request.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">{member ? getStaffFullName(member) : 'Team member'}</p>
                        <p className="mt-1 text-sm text-neutral-500">{request.leave_type || 'Leave request'} • {formatDate(request.from_date)} to {formatDate(request.to_date)}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => setPendingAction({ request, nextStatus: 'approved' })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => setPendingAction({ request, nextStatus: 'rejected' })}>Reject</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-950">Departments</h2>
                <p className="mt-1 text-sm text-neutral-500">Simple CRUD for business units and department heads.</p>
              </div>
              <Button size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={() => openDepartmentModal()}>
                Add
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {departmentNames.length === 0 ? (
                <p className="text-sm text-neutral-500">No departments yet. Add one to group your team.</p>
              ) : (departments.length ? departments : departmentNames.map((name) => ({ id: name, name, head_id: '' }))).map((department) => {
                const head = staff.find((item) => item.id === department.head_id)
                return (
                  <div key={department.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div>
                      <p className="font-semibold text-neutral-900">{department.name}</p>
                      <p className="mt-1 text-sm text-neutral-500">{head ? `Head: ${getStaffFullName(head)}` : 'No department head assigned yet'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDepartmentModal(department)}>Edit</Button>
                      {departments.length ? <Button size="sm" variant="danger" onClick={() => deleteDepartment(department.id)}>Delete</Button> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={showStaffModal} onClose={() => setShowStaffModal(false)} title={editingStaff ? 'Edit staff profile' : 'Add staff member'}>
        <form onSubmit={staffForm.handleSubmit(onSaveStaff)} className="space-y-6">
          <SectionTitle title="Personal details" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" error={staffForm.formState.errors.first_name?.message} {...staffForm.register('first_name')} />
            <Input label="Last name" error={staffForm.formState.errors.last_name?.message} {...staffForm.register('last_name')} />
            <Input label="Date of birth" type="date" error={staffForm.formState.errors.date_of_birth?.message} {...staffForm.register('date_of_birth')} />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Gender</span>
              <select {...staffForm.register('gender')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="">Select gender</option>
                {genderOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <Input label="Phone number" error={staffForm.formState.errors.phone?.message} {...staffForm.register('phone')} />
            <Input label="Personal email" type="email" error={staffForm.formState.errors.personal_email?.message} {...staffForm.register('personal_email')} />
          </div>
          <Input label="Home address" error={staffForm.formState.errors.home_address?.message} {...staffForm.register('home_address')} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Emergency contact name" error={staffForm.formState.errors.emergency_contact_name?.message} {...staffForm.register('emergency_contact_name')} />
            <Input label="Emergency contact phone" error={staffForm.formState.errors.emergency_contact_phone?.message} {...staffForm.register('emergency_contact_phone')} />
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Upload photo</span>
            <input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700" />
          </label>

          <SectionTitle title="Employment info" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Job title" error={staffForm.formState.errors.job_title?.message} {...staffForm.register('job_title')} />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Department</span>
              <div className="flex gap-2">
                <select {...staffForm.register('department')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                  <option value="">Select department</option>
                  {departmentNames.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={() => openDepartmentModal()}>Add new</Button>
              </div>
              {staffForm.formState.errors.department?.message ? <span className="text-sm font-medium text-danger">{staffForm.formState.errors.department?.message}</span> : null}
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Employment type</span>
              <select {...staffForm.register('employment_type')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                {employmentTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <Input label="Start date" type="date" error={staffForm.formState.errors.start_date?.message} {...staffForm.register('start_date')} />
            <Input label="Probation end date" type="date" error={staffForm.formState.errors.probation_end_date?.message} {...staffForm.register('probation_end_date')} />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Reporting manager</span>
              <select {...staffForm.register('reporting_manager_id')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="">Select manager</option>
                {staff.filter((member) => !editingStaff || member.id !== editingStaff.id).map((member) => <option key={member.id} value={member.id}>{getStaffFullName(member)}</option>)}
              </select>
            </label>
            <Input label="Work email" type="email" error={staffForm.formState.errors.work_email?.message} {...staffForm.register('work_email')} />
            <Input label="Employee ID" error={staffForm.formState.errors.employee_id?.message} {...staffForm.register('employee_id')} />
          </div>

          <SectionTitle title="Salary & benefits" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Basic salary (₦)" type="number" error={staffForm.formState.errors.basic_salary?.message} {...staffForm.register('basic_salary')} />
            <Input label="Housing allowance (₦)" type="number" error={staffForm.formState.errors.housing_allowance?.message} {...staffForm.register('housing_allowance')} />
            <Input label="Transport allowance (₦)" type="number" error={staffForm.formState.errors.transport_allowance?.message} {...staffForm.register('transport_allowance')} />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Gross total</span>
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{formatCurrency(grossSalary)}</div>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">Other allowances</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => appendAllowance({ label: '', amount: 0 })}>Add row</Button>
            </div>
            {allowanceFields.length === 0 ? <p className="text-sm text-neutral-500">No extra allowances added yet.</p> : allowanceFields.map((field, index) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input label={`Allowance ${index + 1}`} {...staffForm.register(`other_allowances.${index}.label`)} />
                <Input label="Amount (₦)" type="number" {...staffForm.register(`other_allowances.${index}.amount`)} />
                <div className="flex items-end">
                  <Button type="button" variant="danger" size="sm" onClick={() => removeAllowance(index)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-neutral-700">Bank name</span>
              <select {...staffForm.register('bank_name')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                <option value="">Select bank</option>
                {bankOptions.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
              </select>
            </label>
            <Input label="Account number" {...staffForm.register('account_number')} />
            <Input label="Account name" {...staffForm.register('account_name')} />
          </div>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Status</span>
            <select {...staffForm.register('status')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
              {staffStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <SectionTitle title="Documents (optional)" />
          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            {documentFiles.length === 0 ? <p className="text-sm text-neutral-500">Attach NIN, ID card, guarantor form, or contracts.</p> : documentFiles.map((item, index) => (
              <div key={`${item.file.name}-${index}`} className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div>
                  <p className="font-medium text-neutral-900">{item.file.name}</p>
                  <p className="text-xs text-neutral-500">{item.category}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDocumentFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}>Remove</Button>
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
              <select id="doc-category" className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
                {documentCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  const category = document.getElementById('doc-category')?.value || documentCategories[0]
                  if (file) setDocumentFiles((current) => [...current, { file, category }])
                  event.target.value = ''
                }}
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowStaffModal(false)}>Cancel</Button>
            <Button type="submit" loading={savingStaff}>{editingStaff ? 'Save Staff Changes' : 'Add Staff Member'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} title={editingDepartment ? 'Edit department' : 'Add department'}>
        <form onSubmit={departmentForm.handleSubmit(onSaveDepartment)} className="space-y-5">
          <Input label="Department name" error={departmentForm.formState.errors.name?.message} {...departmentForm.register('name')} />
          <label className="space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Department head</span>
            <select {...departmentForm.register('head_id')} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900">
              <option value="">Select department head</option>
              {staff.map((member) => <option key={member.id} value={member.id}>{getStaffFullName(member)}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setShowDepartmentModal(false)}>Cancel</Button>
            <Button type="submit" loading={savingDepartment}>{editingDepartment ? 'Save Department' : 'Create Department'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} title={pendingAction?.nextStatus === 'approved' ? 'Approve leave request' : 'Reject leave request'}>
        <form onSubmit={leaveForm.handleSubmit(applyLeaveDecision)} className="space-y-4">
          <p className="text-sm text-neutral-600">
            {pendingAction ? `You are about to ${pendingAction.nextStatus} ${pendingAction.request.leave_type || 'this leave request'} for ${(() => {
              const member = staff.find((item) => item.id === pendingAction.request.staff_id)
              return member ? getStaffFullName(member) : 'this team member'
            })()}.` : ''}
          </p>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">{pendingAction?.nextStatus === 'rejected' ? 'Reason for rejection' : 'Manager comment (optional)'}</span>
            <textarea {...leaveForm.register('comment')} rows={4} className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900" />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setPendingAction(null)}>Cancel</Button>
            <Button type="submit">{pendingAction?.nextStatus === 'approved' ? 'Approve leave' : 'Reject leave'}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}

Staff.propTypes = {
  business: PropTypes.object,
}

function StatCard({ icon, tone, label, value, note }) {
  return (
    <Card className="rounded-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-neutral-950">{value}</p>
          <p className="mt-2 text-sm text-neutral-500">{note}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  tone: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  note: PropTypes.string.isRequired,
}

function SectionTitle({ title }) {
  return <h3 className="text-base font-bold text-neutral-950">{title}</h3>
}

SectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
}
