import type { Timestamp } from 'firebase/firestore'

// ─── Base ─────────────────────────────────────────────────────────

export interface BaseDocument {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Project ──────────────────────────────────────────────────────
// Matches Hub's projects collection fields
export interface Project extends BaseDocument {
  // Hub fields (primary)
  projectName:  string    // Hub uses projectName
  projectCode:  string
  clientName:   string    // Hub uses clientName
  location:     string
  description?: string
  status:       ProjectStatus
  startDate:    any       // Firestore Timestamp
  endDate?:     any       // Firestore Timestamp
  createdBy:    string    // Hub uses createdBy (not ownerId)

  // Report-app extras (optional, coexist with Hub fields)
  name?:          string  // alias — mapped from projectName for backward compat
  projectNumber?: string
  client?:        string  // alias — mapped from clientName
  buildingType?:  BuildingType
  floors?:        number
  area?:          number  // sqm
  authority?:     Authority
  engineer?:      string
  ownerId?:       string  // alias — mapped from createdBy for backward compat
}

export type BuildingType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'institutional'
  | 'mixed-use'

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'archived'

export type Authority = 'RAJUK' | 'CDA' | 'RDA' | 'KDA' | 'OTHER'

// ─── Report ───────────────────────────────────────────────────────

export interface Report extends BaseDocument {
  projectId: string
  type: ReportType
  title: string
  status: ReportStatus
  revision: string
  generatedBy: string
  data: Record<string, unknown>
  fileUrl?: string
}

export type ReportType =
  | 'structural'
  | 'boq'
  | 'progress'
  | 'cost'
  | 'compliance'
  | 'calculation'
  | 'design-basis'
  | 'client-summary'

export type ReportStatus = 'draft' | 'review' | 'approved' | 'issued'

// ─── Template ─────────────────────────────────────────────────────

export interface ReportTemplate extends BaseDocument {
  name: string
  type: ReportType
  description: string
  content: string // Handlebars template string
  variables: TemplateVariable[]
  isDefault: boolean
}

export interface TemplateVariable {
  key: string
  label: string
  source: 'project' | 'structural' | 'estimate' | 'manual'
  type: 'string' | 'number' | 'date' | 'boolean'
}

// ─── Package ──────────────────────────────────────────────────────

export interface DocumentPackage extends BaseDocument {
  projectId: string
  type: PackageType
  title: string
  status: ReportStatus
  revision: string
  documents: PackageDocument[]
  fileUrl?: string
}

export type PackageType =
  | 'authority-submission'
  | 'client-package'
  | 'tender-package'
  | 'construction-package'

export interface PackageDocument {
  reportId: string
  title: string
  order: number
  included: boolean
}

// ─── Revision ─────────────────────────────────────────────────────

export interface Revision extends BaseDocument {
  documentId: string
  documentType: 'report' | 'package'
  revNumber: string
  date: string
  author: string
  reason: string
  changes: string
}

// ─── Export ───────────────────────────────────────────────────────

export interface ExportRecord extends BaseDocument {
  projectId: string
  documentId: string
  format: ExportFormat
  fileUrl: string
  fileSize: number
  exportedBy: string
}

export type ExportFormat = 'pdf' | 'xlsx' | 'docx' | 'png' | 'svg' | 'csv'

// ─── Dashboard Stats ──────────────────────────────────────────────

export interface ProjectStats {
  totalReports: number
  generatedReports: number
  pendingReports: number
  approvedReports: number
  totalExports: number
  lastExport?: string
  lastRevision?: string
}
