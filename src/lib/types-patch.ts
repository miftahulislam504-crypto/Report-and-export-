// Add ownerId to ReportTemplate — paste this into src/lib/types.ts
// replacing the existing ReportTemplate interface

export interface ReportTemplate extends BaseDocument {
  name: string
  type: ReportType
  description: string
  content: string           // Handlebars template string
  variables: TemplateVariable[]
  isDefault: boolean
  ownerId: string           // ← NEW
}
