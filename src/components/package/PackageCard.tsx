import { Package, ChevronRight, Download, Edit2, Trash2, Clock, CheckCircle } from 'lucide-react'
import type { DocumentPackage } from '@/lib/types'
import { statusColor, packageTypeLabel } from '@/lib/utils'
import { getPackageConfig } from './packageConfig'

interface PackageCardProps {
  pkg: DocumentPackage
  onOpen: (pkg: DocumentPackage) => void
  onDelete: (id: string) => void
  onExport: (pkg: DocumentPackage) => void
}

export default function PackageCard({ pkg, onOpen, onDelete, onExport }: PackageCardProps) {
  const config = getPackageConfig(pkg.type)
  const totalDocs = pkg.documents?.length ?? 0
  const includedDocs = pkg.documents?.filter((d) => d.included).length ?? 0

  return (
    <div className={`card border-2 ${config.borderColor} hover:shadow-card-hover transition-all duration-200 flex flex-col gap-3`}>
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.color} ${config.borderColor}`}>
          {config.shortLabel}
        </div>
        <span className={`badge ${statusColor(pkg.status)}`}>{pkg.status}</span>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-display font-bold text-slate-900 text-sm leading-tight mb-1">{pkg.title}</h3>
        <p className="text-xs text-slate-400">{packageTypeLabel(pkg.type)}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Package size={11} />
          <span>{includedDocs}/{totalDocs} documents</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={11} />
          <span className="font-mono">{pkg.revision}</span>
        </div>
      </div>

      {/* Progress bar */}
      {totalDocs > 0 && (
        <div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${config.bgColor.replace('bg-', 'bg-').replace('-50', '-400')}`}
              style={{ width: `${(includedDocs / totalDocs) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {Math.round((includedDocs / totalDocs) * 100)}% documents included
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
        <button
          onClick={() => onOpen(pkg)}
          className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center"
        >
          <Edit2 size={12} /> Manage
        </button>
        <button
          onClick={() => onExport(pkg)}
          className="btn-secondary text-xs py-1.5 px-2.5"
          title="Export package"
        >
          <Download size={13} />
        </button>
        <button
          onClick={() => onDelete(pkg.id)}
          className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
