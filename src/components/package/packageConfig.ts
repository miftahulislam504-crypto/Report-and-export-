import type { PackageType } from '@/lib/types'

export interface PackageTypeConfig {
  type: PackageType
  label: string
  shortLabel: string
  description: string
  authority: string
  color: string
  iconColor: string
  bgColor: string
  borderColor: string
  documents: PackageDocumentDef[]
  checklistItems: ChecklistItem[]
}

export interface PackageDocumentDef {
  id: string
  title: string
  required: boolean
  source: 'structural' | 'estimate' | 'drawings' | 'manual' | 'generated'
  engine: 'react-pdf' | 'jspdf' | 'excel' | 'upload'
  exportId?: string // matches ExportOption.id from Phase 3
}

export interface ChecklistItem {
  id: string
  category: string
  item: string
  required: boolean
}

// ─── All 4 Package Type Configs ───────────────────────────────────

export const PACKAGE_CONFIGS: PackageTypeConfig[] = [

  // ── 1. Authority Submission ──────────────────────────────────────
  {
    type: 'authority-submission',
    label: 'Authority Submission Package',
    shortLabel: 'Authority',
    description: 'Complete submission package for RAJUK / CDA / RDA / KDA approval',
    authority: 'RAJUK / CDA / RDA / KDA',
    color: 'text-blue-700',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    documents: [
      { id: 'cover',        title: 'Cover Page & Transmittal',   required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'index',        title: 'Drawing / Document Index',   required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'struct-report',title: 'Structural Engineering Report', required: true, source: 'structural', engine: 'react-pdf', exportId: 'structural-pdf' },
      { id: 'calc-sheet',   title: 'Structural Calculation Sheet',  required: true, source: 'structural', engine: 'react-pdf', exportId: 'calc-sheet' },
      { id: 'bnbc-check',   title: 'BNBC 2020 Compliance Report',   required: true, source: 'structural', engine: 'react-pdf' },
      { id: 'boq-summary',  title: 'BOQ Summary',                   required: true, source: 'estimate',   engine: 'jspdf',    exportId: 'boq-pdf' },
      { id: 'arch-drawings',title: 'Architectural Drawings',         required: true, source: 'drawings',   engine: 'upload' },
      { id: 'struct-drawings',title:'Structural Drawings',           required: true, source: 'drawings',   engine: 'upload' },
      { id: 'auth-forms',   title: 'Authority Application Forms',    required: true, source: 'manual',     engine: 'upload' },
    ],
    checklistItems: [
      { id: 'c1', category: 'Design',      item: 'Structural calculations per BNBC 2020',         required: true },
      { id: 'c2', category: 'Design',      item: 'Seismic design per BNBC 2020 Chapter 2',        required: true },
      { id: 'c3', category: 'Design',      item: 'Wind load analysis per BNBC 2020',              required: true },
      { id: 'c4', category: 'Design',      item: 'Foundation design with SBC verification',       required: true },
      { id: 'c5', category: 'Drawings',    item: 'Architectural floor plans (all floors)',         required: true },
      { id: 'c6', category: 'Drawings',    item: 'Structural framing plans',                       required: true },
      { id: 'c7', category: 'Drawings',    item: 'Foundation layout drawing',                      required: true },
      { id: 'c8', category: 'Drawings',    item: 'Column/beam/slab schedule',                      required: true },
      { id: 'c9', category: 'Compliance',  item: 'Setback compliance verified',                    required: true },
      { id:'c10', category: 'Compliance',  item: 'FAR (Floor Area Ratio) within limits',           required: true },
      { id:'c11', category: 'Compliance',  item: 'Building height per authority regulation',       required: true },
      { id:'c12', category: 'Documents',   item: 'Land ownership documents attached',              required: true },
      { id:'c13', category: 'Documents',   item: 'Engineer registration certificate',              required: true },
      { id:'c14', category: 'Documents',   item: 'Application forms completed & signed',           required: true },
    ],
  },

  // ── 2. Client Package ────────────────────────────────────────────
  {
    type: 'client-package',
    label: 'Client Presentation Package',
    shortLabel: 'Client',
    description: 'Professional summary package for client review and approval',
    authority: 'Client',
    color: 'text-teal-700',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    documents: [
      { id: 'cover',        title: 'Cover Page & Transmittal',   required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'client-summary',title:'Client Summary Report',      required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'cost-report',  title: 'Project Cost Report',        required: true,  source: 'estimate',  engine: 'jspdf',   exportId: 'cost-pdf' },
      { id: 'progress',     title: 'Progress Report',            required: false, source: 'generated', engine: 'jspdf',   exportId: 'progress-pdf' },
      { id: 'struct-summary',title:'Structural Report (Summary)',required: false, source: 'structural',engine: 'react-pdf',exportId: 'structural-pdf' },
      { id: 'drawings',     title: 'Architectural Drawings',     required: false, source: 'drawings',  engine: 'upload' },
      { id: '3d-renders',   title: '3D Renders / Visualizations',required: false, source: 'manual',    engine: 'upload' },
    ],
    checklistItems: [
      { id: 'cc1', category: 'Content',   item: 'Project summary and description',              required: true },
      { id: 'cc2', category: 'Content',   item: 'Cost breakdown and total estimate',            required: true },
      { id: 'cc3', category: 'Content',   item: 'Construction timeline / schedule',             required: true },
      { id: 'cc4', category: 'Content',   item: 'Structural specifications',                    required: false },
      { id: 'cc5', category: 'Drawings',  item: 'Floor plans included',                         required: true },
      { id: 'cc6', category: 'Drawings',  item: 'Elevations included',                          required: false },
      { id: 'cc7', category: 'Drawings',  item: '3D visualization / render',                    required: false },
      { id: 'cc8', category: 'Approval',  item: 'Client signature block included',              required: true },
      { id: 'cc9', category: 'Approval',  item: 'Revision history shown',                       required: true },
    ],
  },

  // ── 3. Tender Package ────────────────────────────────────────────
  {
    type: 'tender-package',
    label: 'Tender / Bidding Package',
    shortLabel: 'Tender',
    description: 'Complete tender package for contractor bidding',
    authority: 'Contractors',
    color: 'text-purple-700',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    documents: [
      { id: 'cover',       title: 'Cover Page & Transmittal',  required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'index',       title: 'Document Index',            required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'boq-full',    title: 'Bill of Quantities (Full)', required: true,  source: 'estimate',  engine: 'jspdf',   exportId: 'boq-pdf' },
      { id: 'boq-excel',   title: 'BOQ Excel (Editable)',      required: true,  source: 'estimate',  engine: 'excel',   exportId: 'boq-excel' },
      { id: 'tech-specs',  title: 'Technical Specifications',  required: true,  source: 'manual',    engine: 'upload' },
      { id: 'struct-draw', title: 'Structural Drawings',       required: true,  source: 'drawings',  engine: 'upload' },
      { id: 'arch-draw',   title: 'Architectural Drawings',    required: true,  source: 'drawings',  engine: 'upload' },
      { id: 'schedule',    title: 'Tender Schedule / Timeline',required: false, source: 'manual',    engine: 'upload' },
      { id: 'conditions',  title: 'General Conditions',        required: false, source: 'manual',    engine: 'upload' },
    ],
    checklistItems: [
      { id: 'ct1', category: 'BOQ',       item: 'All items with units and quantities',          required: true },
      { id: 'ct2', category: 'BOQ',       item: 'Rate schedule included',                       required: true },
      { id: 'ct3', category: 'Technical', item: 'Material specifications defined',              required: true },
      { id: 'ct4', category: 'Technical', item: 'Workmanship standards specified',              required: true },
      { id: 'ct5', category: 'Drawings',  item: 'All drawings properly titled and numbered',   required: true },
      { id: 'ct6', category: 'Drawings',  item: 'Revision numbers on all drawings',            required: true },
      { id: 'ct7', category: 'Legal',     item: 'Tender conditions and instructions',          required: true },
      { id: 'ct8', category: 'Legal',     item: 'Submission deadline clearly stated',          required: true },
    ],
  },

  // ── 4. Construction Package ──────────────────────────────────────
  {
    type: 'construction-package',
    label: 'Construction Package (IFC)',
    shortLabel: 'Construction',
    description: 'Issue For Construction package with BBS and method statements',
    authority: 'Site Engineer',
    color: 'text-amber-700',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    documents: [
      { id: 'cover',      title: 'Cover Page & Transmittal',  required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'index',      title: 'Drawing Index',             required: true,  source: 'generated', engine: 'react-pdf' },
      { id: 'ifc-arch',   title: 'IFC Architectural Drawings',required: true,  source: 'drawings',  engine: 'upload' },
      { id: 'ifc-struct', title: 'IFC Structural Drawings',   required: true,  source: 'drawings',  engine: 'upload' },
      { id: 'bbs',        title: 'Bar Bending Schedule (BBS)',required: true,  source: 'structural',engine: 'excel' },
      { id: 'method',     title: 'Method Statement',          required: true,  source: 'manual',    engine: 'upload' },
      { id: 'calc-sheet', title: 'Calculation Sheet',         required: true,  source: 'structural',engine: 'react-pdf', exportId: 'calc-sheet' },
      { id: 'material',   title: 'Material Specifications',   required: true,  source: 'manual',    engine: 'upload' },
      { id: 'qc-checklist',title:'Quality Control Checklist', required: false, source: 'manual',    engine: 'upload' },
    ],
    checklistItems: [
      { id: 'ci1', category: 'Drawings',  item: 'All drawings stamped IFC',                    required: true },
      { id: 'ci2', category: 'Drawings',  item: 'Drawing revision table updated',              required: true },
      { id: 'ci3', category: 'BBS',       item: 'Bar bending schedule complete',               required: true },
      { id: 'ci4', category: 'BBS',       item: 'Steel quantities verified',                   required: true },
      { id: 'ci5', category: 'Method',    item: 'Concrete mix design specified',               required: true },
      { id: 'ci6', category: 'Method',    item: 'Formwork procedure defined',                  required: true },
      { id: 'ci7', category: 'Method',    item: 'Curing method specified',                     required: true },
      { id: 'ci8', category: 'Approval',  item: 'Engineer approval signature obtained',        required: true },
      { id: 'ci9', category: 'Approval',  item: 'Client acknowledgment received',              required: false },
    ],
  },
]

export function getPackageConfig(type: PackageType): PackageTypeConfig {
  return PACKAGE_CONFIGS.find((c) => c.type === type) ?? PACKAGE_CONFIGS[0]
}
