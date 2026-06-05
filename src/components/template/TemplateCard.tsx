import { FileText, Edit2, Trash2, Copy, Star } from 'lucide-react'
import type { ReportTemplate } from '@/lib/types'
import { reportTypeLabel } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  structural:      'bg-blue-50 text-blue-600 border-blue-100',
  'design-basis':  'bg-indigo-50 text-indigo-600 border-indigo-100',
  boq:             'bg-green-50 text-green-600 border-green-100',
  progress:        'bg-amber-50 text-amber-700 border-amber-100',
  compliance:      'bg-purple-50 text-purple-600 border-purple-100',
  calculation:     'bg-cyan-50 text-cyan-600 border-cyan-100',
  cost:            'bg-rose-50 text-rose-600 border-rose-100',
  'client-summary':'bg-teal-50 text-teal-600 border-teal-100',
}

interface TemplateCardProps {
  template: ReportTemplate
  onEdit: (t: ReportTemplate) => void
  onDuplicate: (t: ReportTemplate) => void
  onDelete: (id: string) => void
  onGenerate: (t: ReportTemplate) => void
}

export default function TemplateCard({
  template, onEdit, onDuplicate, onDelete, onGenerate
}: TemplateCardProps) {
  const colorClass = TYPE_COLORS[template.type] ?? 'bg-slate-50 text-slate-600 border-slate-100'
  const varCount = template.variables?.length ?? 0
  const lineCount = template.content.split('\n').length

  return (
    <div className="card group hover:shadow-card-hover transition-all duration-200 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
          {reportTypeLabel(template.type)}
        </div>
        {template.isDefault && (
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={11} fill="currentColor" />
            <span className="text-[10px] font-medium">Default</span>
          </div>
        )}
      </div>

      {/* Name + description */}
      <div>
        <h3 className="font-display font-bold text-slate-900 text-sm leading-tight mb-1">
          {template.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
          {varCount} variable{varCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          {lineCount} lines
        </span>
      </div>

      {/* Variable pills */}
      {varCount > 0 && (
        <div className="flex flex-wrap gap-1">
          {template.variables.slice(0, 4).map((v) => (
            <span
              key={v.key}
              className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono text-slate-500"
            >
              {v.key}
            </span>
          ))}
          {varCount > 4 && (
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] text-slate-400">
              +{varCount - 4} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-50">
        <button
          onClick={() => onGenerate(template)}
          className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center"
        >
          <FileText size={12} /> Use Template
        </button>
        <button
          onClick={() => onEdit(template)}
          className="btn-ghost p-1.5 text-slate-500"
          title="Edit template"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => onDuplicate(template)}
          className="btn-ghost p-1.5 text-slate-500"
          title="Duplicate"
        >
          <Copy size={13} />
        </button>
        {!template.isDefault && (
          <button
            onClick={() => onDelete(template.id)}
            className="btn-ghost p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
