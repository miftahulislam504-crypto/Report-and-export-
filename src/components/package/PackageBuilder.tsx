import { useState, useEffect } from 'react'
import {
  X, Package, Download, CheckSquare, Square,
  Upload, Wand2, AlertCircle, CheckCircle2,
  ChevronRight, Loader2, FileText, FileSpreadsheet,
} from 'lucide-react'
import type { DocumentPackage } from '@/lib/types'
import { useProjectStore } from '@/store/useProjectStore'
import { usePackageStore } from '@/store/usePackageStore'
import { getPackageConfig, type PackageDocumentDef, type ChecklistItem } from './packageConfig'
import { assemblePackage } from '@/engines/packageEngine'
import { statusColor } from '@/lib/utils'

// ─── Sample PDF bytes generator (placeholder until real engine data) ──
async function generatePlaceholderPDF(title: string): Promise<Uint8Array> {
  // Creates a minimal valid PDF placeholder
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const doc   = await PDFDocument.create()
  const page  = doc.addPage([595, 842])
  const font  = await doc.embedFont(StandardFonts.HelveticaBold)
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.97, 0.98, 0.99) })
  page.drawText(title, { x: 60, y: 420, font, size: 16, color: rgb(0.05, 0.11, 0.37) })
  page.drawText('[Document content from CivilOS engines]', { x: 60, y: 395, font, size: 10, color: rgb(0.4, 0.45, 0.55) })
  return doc.save()
}

interface PackageBuilderProps {
  pkg: DocumentPackage
  onClose: () => void
  onSaved: () => void
}

export default function PackageBuilder({ pkg, onClose, onSaved }: PackageBuilderProps) {
  const { currentProject } = useProjectStore()
  const { updatePackage } = usePackageStore()

  const config = getPackageConfig(pkg.type)

  // Document inclusion state
  const [included, setIncluded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    config.documents.forEach((d) => {
      const existing = pkg.documents?.find((pd) => pd.reportId === d.id)
      init[d.id] = existing ? existing.included : d.required
    })
    return init
  })

  // Checklist state
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    config.checklistItems.forEach((c) => { init[c.id] = false })
    return init
  })

  // Approval workflow
  const [status, setStatus] = useState(pkg.status)

  // Assembling state
  const [assembling, setAssembling] = useState(false)
  const [assembled, setAssembled]   = useState(false)
  const [error, setError]           = useState('')

  const totalDocs     = config.documents.length
  const includedCount = Object.values(included).filter(Boolean).length
  const requiredDone  = config.documents.filter((d) => d.required).every((d) => included[d.id])
  const checklistTotal  = config.checklistItems.length
  const checklistDone   = Object.values(checked).filter(Boolean).length
  const requiredChecked = config.checklistItems.filter((c) => c.required).every((c) => checked[c.id])

  const canAssemble = requiredDone && currentProject

  // ── Save document state to Firestore ──────────────────────────
  const handleSave = async () => {
    const documents = config.documents.map((d, idx) => ({
      reportId: d.id,
      title: d.title,
      order: idx,
      included: included[d.id] ?? d.required,
    }))
    await updatePackage(pkg.id, { documents, status })
    onSaved()
  }

  // ── Assemble & download package ───────────────────────────────
  const handleAssemble = async () => {
    if (!currentProject || !canAssemble) return
    setAssembling(true)
    setError('')

    try {
      // Build document list for included items
      const includedDocs = config.documents
        .filter((d) => included[d.id])
        .map((d) => ({
          title: d.title,
          drawingNo: d.id.toUpperCase(),
          revision: pkg.revision,
          pdfBytes: new Uint8Array(), // will be replaced below
        }))

      // Generate placeholder PDFs for each included doc
      const docsWithBytes = await Promise.all(
        includedDocs.map(async (d) => ({
          ...d,
          pdfBytes: await generatePlaceholderPDF(d.title),
        }))
      )

      const packageBytes = await assemblePackage(
        currentProject,
        {
          type: pkg.type,
          title: pkg.title,
          revision: pkg.revision,
          preparedBy: currentProject.engineer || 'Engineer',
          date: new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' }),
          includeCoverPage: true,
          includeTransmittal: true,
          includeDrawingIndex: true,
          includePageNumbers: true,
          includeWatermark: status !== 'issued',
          watermarkText: status === 'draft' ? 'DRAFT' : status === 'review' ? 'UNDER REVIEW' : '',
        },
        docsWithBytes
      )

      // Trigger download
      const blob = new Blob([packageBytes], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `${pkg.title.replace(/\s+/g, '_')}_${pkg.revision}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      setAssembled(true)
      await updatePackage(pkg.id, { status: status === 'draft' ? 'review' : status })
    } catch (e) {
      console.error(e)
      setError('Package assembly failed. Please try again.')
    } finally {
      setAssembling(false)
    }
  }

  // ── Group checklist by category ───────────────────────────────
  const checklistGroups = config.checklistItems.reduce<Record<string, ChecklistItem[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    }, {}
  )

  const engineIcon = (engine: PackageDocumentDef['engine']) => {
    switch (engine) {
      case 'react-pdf': return <FileText size={11} className="text-blue-500" />
      case 'jspdf':     return <FileText size={11} className="text-rose-500" />
      case 'excel':     return <FileSpreadsheet size={11} className="text-green-500" />
      case 'upload':    return <Upload size={11} className="text-slate-400" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-stretch">
      <div className="flex flex-col w-full max-w-5xl mx-auto my-4 bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${config.borderColor} ${config.bgColor}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
              <Package size={16} className={config.iconColor} />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-base">{pkg.title}</h2>
              <p className={`text-xs ${config.color} font-medium`}>
                {config.label}  ·  {pkg.revision}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${statusColor(status)}`}>{status}</span>
            <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
          <ProgressPill label="Documents" done={includedCount} total={totalDocs} color="bg-blue-500" />
          <ProgressPill label="Checklist" done={checklistDone} total={checklistTotal} color="bg-teal-500" />
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as never)}
              className="form-select text-xs py-1 px-2 w-32"
            >
              {['draft', 'review', 'approved', 'issued'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Body (2-col) ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Documents */}
          <div className="w-[55%] border-r border-slate-100 overflow-y-auto">
            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Package Documents ({includedCount}/{totalDocs})
              </h3>

              {!requiredDone && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                  <AlertCircle size={13} /> Some required documents are not included.
                </div>
              )}

              <div className="space-y-1.5">
                {config.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (!doc.required) setIncluded((i) => ({ ...i, [doc.id]: !i[doc.id] }))
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                      included[doc.id]
                        ? `${config.bgColor} ${config.borderColor}`
                        : 'bg-white border-slate-100'
                    } ${!doc.required ? 'cursor-pointer hover:border-slate-200' : ''}`}
                  >
                    {/* Checkbox */}
                    <div className={`shrink-0 ${included[doc.id] ? config.iconColor : 'text-slate-300'}`}>
                      {included[doc.id]
                        ? <CheckSquare size={16} />
                        : <Square size={16} />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${included[doc.id] ? 'text-slate-800' : 'text-slate-500'}`}>
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {engineIcon(doc.engine)}
                        <span className="text-[10px] text-slate-400 capitalize">{doc.engine}</span>
                        {doc.required && (
                          <span className="text-[10px] text-red-500 font-medium">Required</span>
                        )}
                      </div>
                    </div>

                    {/* Source badge */}
                    <span className="text-[10px] text-slate-400 shrink-0 capitalize">{doc.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checklist */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Submission Checklist ({checklistDone}/{checklistTotal})
              </h3>

              {Object.entries(checklistGroups).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
                        className={`flex items-start gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                          checked[item.id] ? 'bg-green-50 border border-green-100' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${checked[item.id] ? 'text-green-500' : 'text-slate-300'}`}>
                          {checked[item.id]
                            ? <CheckCircle2 size={14} />
                            : <Square size={14} />
                          }
                        </div>
                        <p className={`text-xs leading-relaxed ${checked[item.id] ? 'text-green-800 line-through decoration-green-300' : 'text-slate-600'}`}>
                          {item.item}
                          {item.required && !checked[item.id] && (
                            <span className="ml-1 text-red-400 no-underline">*</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 bg-white shrink-0">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={13} /> {error}
            </div>
          )}
          {assembled && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 size={13} /> Package downloaded!
            </div>
          )}
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-secondary">
            Save Progress
          </button>
          <button
            onClick={handleAssemble}
            disabled={!canAssemble || assembling}
            className="btn-primary ml-auto"
            title={!canAssemble ? 'Include all required documents first' : ''}
          >
            {assembling ? (
              <><Loader2 size={14} className="animate-spin" /> Assembling...</>
            ) : (
              <><Download size={14} /> Assemble & Download</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress Pill ─────────────────────────────────────────────────
function ProgressPill({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600">{done}/{total}</span>
    </div>
  )
}
