export const staffStatusOptions = ['active', 'on leave', 'terminated']
export const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract']
export const genderOptions = ['Male', 'Female', 'Prefer not to say']
export const leaveTypeOptions = ['Annual Leave', 'Sick Leave', 'Casual Leave']
export const documentCategories = ['ID', 'Contracts', 'Certificates']
export const bankOptions = ['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'Fidelity Bank', 'Moniepoint', 'Other']

export function formatCurrency(value) {
  return `₦${Number(value || 0).toLocaleString()}`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function relativeTime(value) {
  if (!value) return 'Just now'
  const now = Date.now()
  const then = new Date(value).getTime()
  const diffHours = Math.max(1, Math.round((now - then) / (1000 * 60 * 60)))
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return formatDate(value)
}

export function getStaffFullName(member) {
  const first = member.first_name || ''
  const last = member.last_name || ''
  const combined = `${first} ${last}`.trim()
  return combined || member.name || 'Team member'
}

export function getAvatarInitials(member) {
  const name = getStaffFullName(member)
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function staffAvatarTone(value = '') {
  const tones = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700',
  ]
  const index = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length
  return tones[index]
}

export function statusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'on leave') return 'warning'
  if (status === 'terminated') return 'danger'
  return 'neutral'
}

export function employmentVariant(type) {
  if (type === 'Full-time') return 'info'
  if (type === 'Part-time') return 'warning'
  if (type === 'Contract') return 'neutral'
  return 'neutral'
}

export function buildStaffPayload(values) {
  const allowances = [
    { label: 'Housing allowance', amount: Number(values.housing_allowance || 0) },
    { label: 'Transport allowance', amount: Number(values.transport_allowance || 0) },
    ...(values.other_allowances || []).filter((item) => item?.label || item?.amount).map((item) => ({
      label: item.label || 'Allowance',
      amount: Number(item.amount || 0),
    })),
  ]

  const firstName = values.first_name?.trim() || ''
  const lastName = values.last_name?.trim() || ''

  return {
    name: `${firstName} ${lastName}`.trim(),
    first_name: firstName,
    last_name: lastName,
    date_of_birth: values.date_of_birth || null,
    gender: values.gender || null,
    phone: values.phone || null,
    email: values.personal_email || null,
    personal_email: values.personal_email || null,
    home_address: values.home_address || null,
    emergency_contact_name: values.emergency_contact_name || null,
    emergency_contact_phone: values.emergency_contact_phone || null,
    photo_url: values.photo_url || null,
    role: values.job_title || null,
    job_title: values.job_title || null,
    department: values.department || null,
    employment_type: values.employment_type || null,
    start_date: values.start_date || null,
    probation_end_date: values.probation_end_date || null,
    reporting_manager_id: values.reporting_manager_id || null,
    work_email: values.work_email || null,
    employee_id: values.employee_id || null,
    salary: Number(values.basic_salary || 0),
    basic_salary: Number(values.basic_salary || 0),
    housing_allowance: Number(values.housing_allowance || 0),
    transport_allowance: Number(values.transport_allowance || 0),
    other_allowances: allowances,
    gross_salary: calculateGrossSalary(values),
    bank_name: values.bank_name || null,
    account_number: values.account_number || null,
    account_name: values.account_name || null,
    status: values.status || 'active',
  }
}

export function calculateGrossSalary(values) {
  const basic = Number(values.basic_salary || 0)
  const housing = Number(values.housing_allowance || 0)
  const transport = Number(values.transport_allowance || 0)
  const extras = (values.other_allowances || []).reduce((sum, item) => sum + Number(item?.amount || 0), 0)
  return basic + housing + transport + extras
}

export function generateEmployeeId(staff = []) {
  const nextNumber = staff.reduce((max, member) => {
    const match = String(member.employee_id || '').match(/EMP-(\d+)/)
    if (!match) return max
    return Math.max(max, Number(match[1]))
  }, 0) + 1
  return `EMP-${String(nextNumber).padStart(3, '0')}`
}

export function calculateAttendanceSummary(records = []) {
  const total = records.length
  const present = records.filter((item) => item.status === 'present').length
  const leave = records.filter((item) => item.status === 'leave').length
  return {
    total,
    present,
    leave,
    rate: total ? Math.round((present / total) * 100) : 0,
  }
}

export function defaultLeaveBalances() {
  return [
    { leave_type: 'Annual Leave', remaining_days: 12, total_days: 20 },
    { leave_type: 'Sick Leave', remaining_days: 8, total_days: 10 },
    { leave_type: 'Casual Leave', remaining_days: 3, total_days: 5 },
  ]
}

export function getSafeArray(result) {
  if (result?.error) return []
  return result?.data || []
}
