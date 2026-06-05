import { useState } from 'react'
import {
  Download, FileText, Table2, FileSpreadsheet,
  Loader2, CheckCircle2, AlertCircle, X,
  ChevronDown, Wand2, Trash2
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { useReportStore } from '@/store/useReportStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useExportStore, downloadBlob, downloadJsPDF } from '@/store/useExportStore'
import {
  generateBOQPDF, generateCostPDF, generateProgressPDF,
  type BOQSection, type CostBreakdown, type ProgressActivity,
} from '@/engines/pdfEngine'
import {
  generateStructuralReportPDF, generateCalcSheetPDF,
} from '@/engines/reactPdfEngine'
import {
  generateBOQExcel, generateCostExcel,
} from '@/engines/excelEngine'
import type { ExportFormat } from '@/lib/types'

// ─── Export Option Definitions ────────────────────────────────────

interface ExportOption {
  id: string
  label: string
  description: string
  format: ExportFormat
  engine: string
  icon: React.ElementType
  color: string
  category: 'pdf' | 'excel' | 'react-pdf'
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'structural-pdf',
    label: 'Structural Report',
    description: 'Full structural engineering report per BNBC 2020',
    format: 'pdf', engine: 'React-PDF', icon: FileText,
    color: 'bg-blue-50 text-blue-600 border-blue-100', category: 'react-pdf',
  },
  {
    id: 'calc-sheet',
    label: 'Calculation Sheet',
    description: 'Formal calculation sheet with member sizes & checks',
    format: 'pdf', engine: 'React-PDF', icon: FileText,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100', category: 'react-pdf',
  },
  {
    id: 'boq-pdf',
    label: 'BOQ Report (PDF)',
    description: 'Bill of Quantities with section subtotals',
    format: 'pdf', engine: 'jsPDF', icon: FileText,
    color: 'bg-green-50 text-green-600 border-green-100', category: 'pdf',
  },
  {
    id: 'cost-pdf',
    label: 'Cost Report (PDF)',
    description: 'Cost breakdown with KPI summary',
    format: 'pdf', engine: 'jsPDF', icon: FileText,
    color: 'bg-rose-50 text-rose-600 border-rose-100', category: 'pdf',
  },
  {
    id: 'progress-pdf',
    label: 'Progress Report (PDF)',
    description: 'Activity schedule with completion status',
    format: 'pdf', engine: 'jsPDF (Landscape)', icon: FileText,
    color: 'bg-amber-50 text-amber-700 border-amber-100', category: 'pdf',
  },
  {
    id: 'boq-excel',
    label: 'BOQ (Excel)',
    description: 'Full BOQ spreadsheet with formulas',
    format: 'xlsx', engine: 'SheetJS', icon: FileSpreadsheet,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100', category: 'excel',
  },
  {
    id: 'cost-excel',
    label: 'Cost Analysis (Excel)',
    description: 'Cost breakdown spreadsheet',
    format: 'xlsx', engine: 'SheetJS', icon: FileSpreadsheet,
    color: 'bg-teal-50 text-teal-600 border-teal-100', category: 'excel',
  },
]

// ─── Sample data generators (replace with real data from stores) ──

function sampleBOQSections(): BOQSection[] {
  return [
    {
      title: 'Substructure',
      items: [
        { slNo: 1, description: 'Excavation & Earthwork', unit: 'm³', qty: 450, rate: 800, amount: 360000 },
        { slNo: 2, description: 'Plain Cement Concrete (PCC)', unit: 'm³', qty: 35, rate: 6500, amount: 227500 },
        { slNo: 3, description: 'Reinforced Cement Concrete (RCC) Foundation', unit: 'm³', qty: 120, rate: 12000, amount: 1440000 },
        { slNo: 4, description: 'Foundation Reinforcement (Grade 60)', unit: 'MT', qty: 15, rate: 95000, amount: 1425000 },
      ],
    },
    {
      title: 'Superstructure',
      items: [
        { slNo: 5, description: 'RCC Column (f\'c=25MPa)', unit: 'm³', qty: 85, rate: 14000, amount: 1190000 },
        { slNo: 6, description: 'RCC Beam', unit: 'm³', qty: 140, rate: 13500, amount: 1890000 },
        { slNo: 7, description: 'RCC Slab (125mm)', unit: 'm³', qty: 320, rate: 12500, amount: 4000000 },
        { slNo: 8, description: 'Structural Steel Reinforcement', unit: 'MT', qty: 95, rate: 95000, amount: 9025000 },
      ],
    },
    {
      title: 'Finishing',
      items: [
        { slNo: 9, description: 'Brick Masonry (250mm wall)', unit: 'm³', qty: 280, rate: 8500, amount: 2380000 },
        { slNo: 10, description: 'Plaster (Internal)', unit: 'm²', qty: 3200, rate: 350, amount: 1120000 },
        { slNo: 11, description: 'Ceramic Tile Flooring', unit: 'm²', qty: 1800, rate: 1200, amount: 2160000 },
        { slNo: 12, description: 'Doors & Windows (Aluminium)', unit: 'nos', qty: 45, rate: 18000, amount: 810000 },
      ],
    },
  ]
}

function sampleCostBreakdown(): { breakdown: CostBreakdown[]; total: number } {
  const breakdown: CostBreakdown[] = [
    {
      category: 'A. Substructure',
      subItems: [
        { name: 'Excavation & Earthwork', amount: 360000 },
        { name: 'Foundation Concrete', amount: 1667500 },
        { name: 'Foundation Steel', amount: 1425000 },
      ],
    },
    {
      category: 'B. Superstructure',
      subItems: [
        { name: 'RCC Frame (Column + Beam)', amount: 3080000 },
        { name: 'Slab Works', amount: 4000000 },
        { name: 'Structural Reinforcement', amount: 9025000 },
      ],
    },
    {
      category: 'C. Finishing',
      subItems: [
        { name: 'Brick Masonry', amount: 2380000 },
        { name: 'Plaster & Paint', amount: 1120000 },
        { name: 'Flooring', amount: 2160000 },
        { name: 'Doors & Windows', amount: 810000 },
      ],
    },
    {
      category: 'D. Services',
      subItems: [
        { name: 'Electrical Works', amount: 1500000 },
        { name: 'Plumbing & Sanitary', amount: 900000 },
      ],
    },
  ]
  const total = breakdown.reduce(
    (s, c) => s + c.subItems.reduce((ss, i) => ss + i.amount, 0), 0
  )
  return { breakdown, total }
}

function sampleActivities(): ProgressActivity[] {
  return [
    { activity: 'Site Preparation & Leveling', plannedStart: '01 Jan 2024', plannedEnd: '15 Jan 2024', completion: 100, status: 'completed' },
    { activity: 'Foundation Excavation', plannedStart: '16 Jan 2024', plannedEnd: '31 Jan 2024', completion: 100, status: 'completed' },
    { activity: 'Foundation Concrete (PCC+RCC)', plannedStart: '01 Feb 2024', plannedEnd: '28 Feb 2024', completion: 100, status: 'completed' },
    { activity: 'Ground Floor Column & Slab', plannedStart: '01 Mar 2024', plannedEnd: '31 Mar 2024', completion: 80, status: 'in-progress' },
    { activity: '1st Floor Column & Slab', plannedStart: '01 Apr 2024', plannedEnd: '30 Apr 2024', completion: 30, status: 'in-progress' },
    { activity: '2nd Floor Column & Slab', plannedStart: '01 May 2024', plannedEnd: '31 May 2024', completion: 0, status: 'not-started' },
    { activity: 'Brick Masonry (All Floors)', plannedStart: '01 Jun 2024', plannedEnd: '31 Jul 2024', completion: 0, status: 'not-started' },
    { activity: 'Finishing Works', plannedStart: '01 Aug 2024', plannedEnd: '30 Sep 2024', completion: 0, status: 'not-started' },
  ]
}

// ═══════════════════════════════════════════════════════════════════
// Main Exports Page
// ═══════════════════════════════════════════════════════════════════

export default function ExportsPage() {
  const { currentProject } = useProjectStore()
  const { user } = useAuthStore()
  const { jobs, addJob, updateJob, clearCompleted } = useExportStore()
  const [activeCategory, setActiveCategory] = useState<'all' | 'pdf' | 'excel'>('all')

  const filtered = EXPORT_OPTIONS.filter(
    (o) => activeCategory === 'all' || o.category === activeCategory || (activeCategory === 'pdf' && o.category === 'react-pdf')
  )

  const handleExport = async (option: ExportOption) => {
    if (!currentProject) {
      alert('Please select a project first.')
      return
    }

    const jobId = addJob(option.label, option.format)
    const rev = 'Rev 00'

    try {
      updateJob(jobId, { progress: 20 })

      switch (option.id) {
        case 'structural-pdf': {
          updateJob(jobId, { progress: 50 })
          const blob = await generateStructuralReportPDF(
            currentProject,
            {
              concreteGrade: "f'c = 25 MPa",
              steelGrade: 'Grade 60 (415 MPa)',
              soilBearing: 150,
              seismicZone: 'Zone 2',
              windSpeed: 150,
              exposureCategory: 'B',
              buildingHeight: currentProject.floors * 3,
              foundationType: 'Isolated Footing',
              slabSystem: 'Two-way flat slab',
              analysisMethod: 'Direct Stiffness Method',
              software: 'CivilOS Structural',
              checks: [
                { item: 'Slab flexure',    result: 'As,req = 650 mm²/m', status: 'pass' },
                { item: 'Beam shear',      result: 'Vu < φVc + φVs',    status: 'pass' },
                { item: 'Column capacity', result: 'φPn > Pu',           status: 'pass' },
                { item: 'Footing bearing', result: 'q = 142 < 150 kN/m²',status: 'pass' },
              ],
            },
            rev
          )
          updateJob(jobId, { progress: 90 })
          downloadBlob(blob, `Structural_Report_${currentProject.projectNumber}_${rev}.pdf`)
          break
        }

        case 'calc-sheet': {
          updateJob(jobId, { progress: 50 })
          const blob = await generateCalcSheetPDF(currentProject, {
            concreteGrade: "f'c = 25 MPa",
            steelGrade: 'fy = 415 MPa',
            soilBearing: 150,
            slabThk: 125,
            beamSize: '250×450 mm',
            colSize: '300×300 mm',
            footSize: '1500×1500 mm',
            seismicZone: 'Zone 2',
            windSpeed: 150,
            revision: rev,
          })
          updateJob(jobId, { progress: 90 })
          downloadBlob(blob, `Calc_Sheet_${currentProject.projectNumber}_${rev}.pdf`)
          break
        }

        case 'boq-pdf': {
          updateJob(jobId, { progress: 50 })
          const doc = generateBOQPDF(currentProject, sampleBOQSections(), rev)
          updateJob(jobId, { progress: 90 })
          downloadJsPDF(doc, `BOQ_${currentProject.projectNumber}_${rev}.pdf`)
          break
        }

        case 'cost-pdf': {
          updateJob(jobId, { progress: 50 })
          const { breakdown, total } = sampleCostBreakdown()
          const doc = generateCostPDF(currentProject, breakdown, total, rev)
          updateJob(jobId, { progress: 90 })
          downloadJsPDF(doc, `Cost_${currentProject.projectNumber}_${rev}.pdf`)
          break
        }

        case 'progress-pdf': {
          updateJob(jobId, { progress: 50 })
          const doc = generateProgressPDF(currentProject, sampleActivities(), 42, rev)
          updateJob(jobId, { progress: 90 })
          downloadJsPDF(doc, `Progress_${currentProject.projectNumber}_${rev}.pdf`)
          break
        }

        case 'boq-excel': {
          updateJob(jobId, { progress: 60 })
          generateBOQExcel(currentProject, sampleBOQSections(), rev)
          break
        }

        case 'cost-excel': {
          updateJob(jobId, { progress: 60 })
          const { breakdown, total } = sampleCostBreakdown()
          generateCostExcel(currentProject, breakdown, total, rev)
          break
        }
      }

      updateJob(jobId, { status: 'success', progress: 100 })
    } catch (err) {
      console.error(err)
      updateJob(jobId, { status: 'error', error: 'Export failed. Please try again.' })
    }
  }

  const activeJobs = jobs.filter((j) => j.status === 'generating')
  const doneJobs   = jobs.filter((j) => j.status !== 'generating')

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Export Center</h1>
          <p className="page-subtitle">
            {currentProject
              ? `${currentProject.name} · Generate professional documents`
              : 'Select a project to start exporting'}
          </p>
        </div>
        {doneJobs.length > 0 && (
          <button onClick={clearCompleted} className="btn-ghost text-xs">
            <Trash2 size={13} /> Clear history
          </button>
        )}
      </div>

      {/* No project warning */}
      {!currentProject && (
        <div className="card border-amber-200 bg-amber-50 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            No project selected. Go to <strong>Projects</strong> and click on one to activate it.
          </p>
        </div>
      )}

      {/* Job Queue */}
      {jobs.length > 0 && (
        <div className="mb-6 space-y-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-5">
        {(['all', 'pdf', 'excel'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Formats' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Export Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((option) => (
          <ExportCard
            key={option.id}
            option={option}
            disabled={!currentProject}
            onExport={() => handleExport(option)}
          />
        ))}
      </div>

      {/* Engine legend */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Engines Used</p>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          {[
            { label: 'jsPDF + AutoTable', desc: 'BOQ, Cost, Progress tables' },
            { label: 'React-PDF',         desc: 'Structural, Calculation (layout)' },
            { label: 'SheetJS',           desc: 'Excel BOQ, Cost Analysis' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              <span className="font-medium text-slate-700">{label}</span>
              <span>—</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────

function ExportCard({
  option, disabled, onExport,
}: { option: ExportOption; disabled: boolean; onExport: () => void }) {
  const Icon = option.icon
  const formatBadge = option.format === 'xlsx' ? 'XLSX' : 'PDF'
  const formatColor = option.format === 'xlsx'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-red-100 text-red-700'

  return (
    <div className="card flex flex-col gap-3 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${option.color}`}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`badge text-[10px] ${formatColor}`}>{formatBadge}</span>
          <span className="badge bg-slate-100 text-slate-500 text-[10px]">{option.engine}</span>
        </div>
      </div>
      <div>
        <h3 className="font-display font-bold text-slate-900 text-sm">{option.label}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{option.description}</p>
      </div>
      <button
        onClick={onExport}
        disabled={disabled}
        className="btn-primary w-full justify-center text-xs py-2 mt-auto"
      >
        <Download size={13} /> Export
      </button>
    </div>
  )
}

function JobCard({ job }: { job: ReturnType<typeof useExportStore.getState>['jobs'][0] }) {
  const { removeJob } = useExportStore()
  const isGenerating = job.status === 'generating'
  const isSuccess    = job.status === 'success'
  const isError      = job.status === 'error'

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
      isSuccess ? 'bg-green-50 border-green-100' :
      isError   ? 'bg-red-50 border-red-100' :
      'bg-white border-slate-100'
    }`}>
      {isGenerating && <Loader2 size={16} className="text-primary-500 animate-spin shrink-0" />}
      {isSuccess    && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
      {isError      && <AlertCircle size={16} className="text-red-500 shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{job.label}</p>
        {isGenerating && (
          <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}
        {isError && <p className="text-xs text-red-600 mt-0.5">{job.error}</p>}
        {isSuccess && <p className="text-xs text-green-600 mt-0.5">Downloaded successfully</p>}
      </div>

      <span className="badge bg-slate-100 text-slate-500 text-[10px] uppercase shrink-0">
        {job.format}
      </span>

      {!isGenerating && (
        <button onClick={() => removeJob(job.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
