import { useState, useEffect } from 'react'
import {
  Plus, Package, X, ChevronRight,
  AlertCircle, Download, Loader2
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { usePackageStore } from '@/store/usePackageStore'
import { useAuthStore } from '@/store/useAuthStore'
import PackageCard from '@/components/package/PackageCard'
import PackageBuilder from '@/components/package/PackageBuilder'
import { PACKAGE_CONFIGS } from '@/components/package/packageConfig'
import { assemblePackage } from '@/engines/packageEngine'
import type { PackageType, DocumentPackage } from '@/lib/types'
import { packageTypeLabel } from '@/lib/utils'

export default function PackagesPage() {
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const {
    packages, loading,
    fetchPackages, createPackage, deletePackage,
  } = usePackageStore()

  const [showNew, setShowNew]       = useState(false)
  const [managing, setManaging]     = useState<DocumentPackage | null>(null)
  const [exporting, setExporting]   = useState<string | null>(null)
  const [newType, setNewType]       = useState<PackageType>('authority-submission')
  const [newTitle, setNewTitle]     = useState('')
  const [filterType, setFilterType] = useState<PackageType | 'all'>('all')

  useEffect(() => {
    if (currentProject) fetchPackages(currentProject.id)
  }, [currentProject])

  const filtered = filterType === 'all'
    ? packages
    : packages.filter((p) => p.type === filterType)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentProject) return
    const config = PACKAGE_CONFIGS.find((c) => c.type === newType)!
    await createPackage({
      projectId: currentProject.id,
      type: newType,
      title: newTitle || config.label,
      status: 'draft',
      revision: 'Rev 00',
      documents: config.documents.map((d, i) => ({
        reportId: d.id,
        title: d.title,
        order: i,
        included: d.required,
      })),
    })
    setShowNew(false)
    setNewTitle('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('এই package delete করবেন?')) return
    await deletePackage(id)
  }

  // Quick export without opening builder
  const handleQuickExport = async (pkg: DocumentPackage) => {
    if (!currentProject) return
    setExporting(pkg.id)
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')

      // Build placeholder docs for included items
      const config = PACKAGE_CONFIGS.find((c) => c.type === pkg.type)!
      const includedDefs = config.documents.filter((d) =>
        pkg.documents?.find((pd) => pd.reportId === d.id)?.included ?? d.required
      )

      const docsWithBytes = await Promise.all(
        includedDefs.map(async (d) => {
          const doc  = await PDFDocument.create()
          const page = doc.addPage([595, 842])
          const font = await doc.embedFont(StandardFonts.HelveticaBold)
          page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.97, 0.98, 0.99) })
          page.drawText(d.title, { x: 60, y: 420, font, size: 14, color: rgb(0.05, 0.11, 0.37) })
          return { title: d.title, drawingNo: d.id, revision: pkg.revision, pdfBytes: await doc.save() }
        })
      )

      const bytes = await assemblePackage(
        currentProject,
        {
          type: pkg.type, title: pkg.title, revision: pkg.revision,
          preparedBy: currentProject.engineer || 'Engineer',
          date: new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' }),
          includeCoverPage: true, includeTransmittal: true,
          includeDrawingIndex: true, includePageNumbers: true,
          includeWatermark: pkg.status !== 'issued',
          watermarkText: pkg.status === 'draft' ? 'DRAFT' : pkg.status === 'review' ? 'UNDER REVIEW' : '',
        },
        docsWithBytes
      )

      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `${pkg.title.replace(/\s+/g, '_')}_${pkg.revision}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Export failed.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Package Builder</h1>
          <p className="page-subtitle">
            {currentProject
              ? `${currentProject.name} · ${packages.length} package${packages.length !== 1 ? 's' : ''}`
              : 'Select a project to build packages'}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          disabled={!currentProject}
          className="btn-primary"
        >
          <Plus size={15} /> New Package
        </button>
      </div>

      {/* No project warning */}
      {!currentProject && (
        <div className="card border-amber-200 bg-amber-50 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            No project selected. Go to <strong>Projects</strong> and activate one.
          </p>
        </div>
      )}

      {/* Package type overview cards */}
      {packages.length === 0 && currentProject && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PACKAGE_CONFIGS.map((config) => (
            <button
              key={config.type}
              onClick={() => { setNewType(config.type); setShowNew(true) }}
              className={`card text-left hover:shadow-card-hover transition-all duration-200 border-2 ${config.borderColor} group`}
            >
              <div className={`w-10 h-10 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center mb-3`}>
                <Package size={18} className={config.iconColor} />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-sm mb-1">{config.shortLabel}</h3>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{config.description}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span>{config.documents.length} documents</span>
                <ChevronRight size={11} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      {packages.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({packages.length})
          </button>
          {PACKAGE_CONFIGS.map((c) => {
            const count = packages.filter((p) => p.type === c.type).length
            if (count === 0) return null
            return (
              <button
                key={c.type}
                onClick={() => setFilterType(c.type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterType === c.type ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.shortLabel} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Packages grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-52 bg-slate-50 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 && packages.length > 0 ? (
        <div className="empty-state">
          <Package size={36} className="text-slate-200 mb-3" />
          <p className="text-sm text-slate-400">No packages of this type</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pkg) => (
            <div key={pkg.id} className="relative">
              {exporting === pkg.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                  <Loader2 size={20} className="text-primary-500 animate-spin" />
                </div>
              )}
              <PackageCard
                pkg={pkg}
                onOpen={setManaging}
                onDelete={handleDelete}
                onExport={handleQuickExport}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* New Package Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900">New Package</h3>
              <button onClick={() => setShowNew(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              {/* Package type selector */}
              <div>
                <label className="form-label">Package Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {PACKAGE_CONFIGS.map((config) => (
                    <button
                      key={config.type}
                      type="button"
                      onClick={() => setNewType(config.type)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                        newType === config.type
                          ? `${config.borderColor} ${config.bgColor}`
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <Package size={14} className={newType === config.type ? config.iconColor : 'text-slate-400'} />
                      <div>
                        <p className={`text-xs font-semibold ${newType === config.type ? config.color : 'text-slate-700'}`}>
                          {config.shortLabel}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{config.documents.length} docs</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="form-label">Package Title</label>
                <input
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={PACKAGE_CONFIGS.find((c) => c.type === newType)?.label}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={!currentProject} className="btn-primary flex-1 justify-center">
                  <Plus size={14} /> Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Builder modal */}
      {managing && (
        <PackageBuilder
          pkg={managing}
          onClose={() => setManaging(null)}
          onSaved={() => {
            setManaging(null)
            if (currentProject) fetchPackages(currentProject.id)
          }}
        />
      )}
    </div>
  )
}
