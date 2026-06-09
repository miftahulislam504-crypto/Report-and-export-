// types-patch.ts — Re-exports updated ReportTemplate with ownerId field.
// The base types (BaseDocument, ReportType, TemplateVariable) live in types.ts.
// This file just augments the interface by re-exporting a patched version.

import type { BaseDocument, ReportType, TemplateVariable } from './types'

export interface ReportTemplate extends BaseDocument {
  name: string
  type: ReportType
  description: string
  content: string           // Handlebars template string
  variables: TemplateVariable[]
  isDefault: boolean
  ownerId: string           // ← NEW (added via patch)
}
