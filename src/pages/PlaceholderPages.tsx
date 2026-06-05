import { LayoutTemplate, Package, Download, Hammer } from 'lucide-react'

function ComingSoon({ icon: Icon, title, description, phase }: {
  icon: React.ElementType
  title: string
  description: string
  phase: string
}) {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-400" />
        </div>
        <h2 className="font-display font-bold text-slate-700 text-lg mb-2">{title}</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full">
          <Hammer size={13} className="text-amber-500" />
          <span className="text-xs font-medium text-amber-600">{phase} — Coming Soon</span>
        </div>
      </div>
    </div>
  )
}

export function TemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      title="Template Engine"
      description="Dynamic Handlebars templates that auto-fill with project data to generate professional reports."
      phase="Phase 2"
    />
  )
}

export function PackagesPage() {
  return (
    <ComingSoon
      icon={Package}
      title="Package Builder"
      description="Build Authority Submission, Client, Tender, and Construction packages with one click."
      phase="Phase 4"
    />
  )
}

export function ExportsPage() {
  return (
    <ComingSoon
      icon={Download}
      title="Export Center"
      description="Export reports as PDF, XLSX, DOCX, PNG or build complete project archives."
      phase="Phase 5"
    />
  )
}
