import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'

// ─── Class Merging ────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ─── Date Helpers ─────────────────────────────────────────────────

export function formatDate(date: Date | Timestamp | string): string {
  const d = toDate(date)
  return format(d, 'dd MMM yyyy')
}

export function formatDateTime(date: Date | Timestamp | string): string {
  const d = toDate(date)
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function timeAgo(date: Date | Timestamp | string): string {
  const d = toDate(date)
  return formatDistanceToNow(d, { addSuffix: true })
}

function toDate(date: Date | Timestamp | string): Date {
  if (date instanceof Date) return date
  if (typeof date === 'string') return new Date(date)
  return date.toDate()
}

// ─── Number Helpers ───────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'BDT'): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-BD').format(num)
}

// ─── File Size ────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ─── Revision Helper ──────────────────────────────────────────────

export function nextRevision(current: string): string {
  const num = parseInt(current.replace(/\D/g, ''), 10)
  return `Rev ${String(num + 1).padStart(2, '0')}`
}

export function initialRevision(): string {
  return 'Rev 00'
}

// ─── Status Colors ────────────────────────────────────────────────

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    review: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    issued: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-amber-100 text-amber-700',
    archived: 'bg-slate-100 text-slate-500',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}

// ─── Report Type Labels ───────────────────────────────────────────

export function reportTypeLabel(type: string): string {
  const map: Record<string, string> = {
    structural: 'Structural Report',
    boq: 'BOQ Report',
    progress: 'Progress Report',
    cost: 'Cost Report',
    compliance: 'BNBC Compliance',
    calculation: 'Calculation Sheet',
    'design-basis': 'Design Basis Report',
    'client-summary': 'Client Summary',
  }
  return map[type] ?? type
}

// ─── Package Type Labels ──────────────────────────────────────────

export function packageTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'authority-submission': 'Authority Submission',
    'client-package': 'Client Package',
    'tender-package': 'Tender Package',
    'construction-package': 'Construction Package',
  }
  return map[type] ?? type
}
