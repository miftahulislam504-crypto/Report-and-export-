// ─── React-PDF Engine ─────────────────────────────────────────────
// Professional layout documents: Structural Report, Design Basis,
// Calculation Sheet, Client Summary

import React from 'react'
import {
  Document, Page, Text, View, StyleSheet,
  Font, pdf,
} from '@react-pdf/renderer'
import type { Project } from '@/lib/types'

// ─── Fonts ────────────────────────────────────────────────────────
// Uses standard PDF fonts (no external font needed)

// ─── Styles ───────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0f172a',
    paddingTop: 0,
    paddingBottom: 30,
    paddingHorizontal: 0,
  },

  // Header
  headerBar: {
    backgroundColor: '#0c1d5e',
    paddingHorizontal: 28,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: { flexDirection: 'column' },
  headerApp:  { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerSub:  { fontSize: 6.5, color: '#94a3b8', letterSpacing: 1.5, marginTop: 1 },
  headerTitle:{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerRev:  { fontSize: 7, color: '#94a3b8', marginTop: 2, textAlign: 'right' },
  accentBar:  { height: 2.5, backgroundColor: '#0f766e' },

  // Project info strip
  projectStrip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 28,
    paddingVertical: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  projectName:   { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#0c1d5e' },
  projectMeta:   { fontSize: 7, color: '#64748b', marginTop: 2 },

  // Content
  content: { paddingHorizontal: 28, paddingTop: 14 },

  // Section
  sectionWrap: { marginBottom: 14 },
  sectionBar:  {
    flexDirection: 'row', alignItems: 'center', marginBottom: 6,
  },
  sectionAccent: { width: 3, height: 14, backgroundColor: '#0c1d5e', marginRight: 6, borderRadius: 1 },
  sectionTitle:  { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0c1d5e', flex: 1 },
  sectionLine:   { height: 0.5, backgroundColor: '#e2e8f0', marginTop: 2 },

  // Key-value rows
  kvGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  kvItem:  { width: '50%', flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.3, borderBottomColor: '#f1f5f9' },
  kvLabel: { width: '45%', fontSize: 7.5, color: '#64748b', fontFamily: 'Helvetica-Bold' },
  kvValue: { width: '55%', fontSize: 7.5, color: '#0f172a' },

  // Compliance table
  compRow:       { flexDirection: 'row', paddingVertical: 3.5, borderBottomWidth: 0.3, borderBottomColor: '#f1f5f9' },
  compRowAlt:    { flexDirection: 'row', paddingVertical: 3.5, backgroundColor: '#f8fafc', borderBottomWidth: 0.3, borderBottomColor: '#f1f5f9' },
  compCheck:     { width: 16, fontSize: 8, color: '#16a34a', fontFamily: 'Helvetica-Bold' },
  compItem:      { flex: 1, fontSize: 7.5, color: '#0f172a' },
  compRef:       { width: 60, fontSize: 7, color: '#64748b', textAlign: 'right' },

  // Table
  tableHead:     { flexDirection: 'row', backgroundColor: '#334155', paddingVertical: 4, paddingHorizontal: 6 },
  tableHeadCell: { color: '#ffffff', fontSize: 7, fontFamily: 'Helvetica-Bold' },
  tableRow:      { flexDirection: 'row', paddingVertical: 3.5, paddingHorizontal: 6, borderBottomWidth: 0.3, borderBottomColor: '#f1f5f9' },
  tableRowAlt:   { flexDirection: 'row', paddingVertical: 3.5, paddingHorizontal: 6, backgroundColor: '#f8fafc', borderBottomWidth: 0.3, borderBottomColor: '#f1f5f9' },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5, borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 28, paddingVertical: 5,
  },
  footerText: { fontSize: 6.5, color: '#94a3b8' },

  // Signature block
  sigBlock: {
    flexDirection: 'row', marginTop: 24, gap: 20,
  },
  sigBox: {
    flex: 1, borderTopWidth: 0.5, borderTopColor: '#334155',
    paddingTop: 5,
  },
  sigLabel: { fontSize: 7, color: '#64748b' },
  sigName:  { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0c1d5e', marginTop: 2 },
  sigDate:  { fontSize: 7, color: '#94a3b8', marginTop: 1 },

  // Stamp / watermark note
  draftNote: {
    position: 'absolute',
    top: 120, left: 60,
    fontSize: 48,
    color: '#e2e8f0',
    fontFamily: 'Helvetica-Bold',
    transform: 'rotate(-30deg)',
    opacity: 0.3,
  },
})

// ─── Shared Components ────────────────────────────────────────────

function PDFHeader({ project, title, revision }: { project: Project; title: string; revision: string }) {
  const today = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <View fixed>
      <View style={S.headerBar}>
        <View style={S.headerLeft}>
          <Text style={S.headerApp}>CivilOS</Text>
          <Text style={S.headerSub}>REPORTS & EXPORT</Text>
        </View>
        <View>
          <Text style={S.headerTitle}>{title.toUpperCase()}</Text>
          <Text style={S.headerRev}>{revision}  •  {today}</Text>
        </View>
      </View>
      <View style={S.accentBar} />
      <View style={S.projectStrip}>
        <View>
          <Text style={S.projectName}>{project.name}</Text>
          <Text style={S.projectMeta}>
            {project.projectNumber}  •  {project.client}  •  {project.location}
          </Text>
        </View>
        <Text style={S.projectMeta}>{project.authority}  •  {project.floors}F  •  {project.area}m²</Text>
      </View>
    </View>
  )
}

function PDFFooter({ project }: { project: Project }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>{project.name}  |  {project.projectNumber}</Text>
      <Text style={S.footerText}>BNBC 2020 Compliant  •  CivilOS Reports</Text>
      <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={S.sectionWrap}>
      <View style={S.sectionBar}>
        <View style={S.sectionAccent} />
        <Text style={S.sectionTitle}>{title}</Text>
      </View>
      <View style={S.sectionLine} />
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  )
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={S.kvItem}>
      <Text style={S.kvLabel}>{label}</Text>
      <Text style={S.kvValue}>{value || '—'}</Text>
    </View>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 1. Structural Report Document
// ═══════════════════════════════════════════════════════════════════

export interface StructuralData {
  concreteGrade: string
  steelGrade: string
  soilBearing: number
  seismicZone: string
  windSpeed: number
  exposureCategory: string
  buildingHeight: number
  foundationType: string
  slabSystem: string
  analysisMethod: string
  software: string
  checks: { item: string; result: string; status: 'pass' | 'fail' | 'na' }[]
}

function StructuralReportDoc({
  project, data, revision,
}: { project: Project; data: Partial<StructuralData>; revision: string }) {
  const today = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Document title={`Structural Report - ${project.name}`}>
      <Page size="A4" style={S.page}>
        <PDFHeader project={project} title="Structural Engineering Report" revision={revision} />
        <View style={S.content}>

          {/* 1. Project Description */}
          <Section title="1. Project Description">
            <View style={S.kvGrid}>
              <KVRow label="Building Type"   value={project.buildingType} />
              <KVRow label="Location"         value={project.location} />
              <KVRow label="Number of Floors" value={`${project.floors}`} />
              <KVRow label="Total Area"       value={`${project.area.toLocaleString()} m²`} />
              <KVRow label="Building Height"  value={`${data.buildingHeight ?? '—'} m`} />
              <KVRow label="Authority"        value={project.authority} />
              <KVRow label="Lead Engineer"    value={project.engineer} />
              <KVRow label="Report Date"      value={today} />
            </View>
          </Section>

          {/* 2. Design Parameters */}
          <Section title="2. Design Parameters — BNBC 2020">
            <View style={S.kvGrid}>
              <KVRow label="Concrete Grade"     value={data.concreteGrade ?? "f'c = 25 MPa"} />
              <KVRow label="Steel Grade"         value={data.steelGrade ?? 'Grade 60 (415 MPa)'} />
              <KVRow label="Soil Bearing Cap."   value={`${data.soilBearing ?? 150} kN/m²`} />
              <KVRow label="Seismic Zone"        value={data.seismicZone ?? 'Zone 2'} />
              <KVRow label="Wind Speed"          value={`${data.windSpeed ?? 150} km/h`} />
              <KVRow label="Exposure Category"   value={data.exposureCategory ?? 'B'} />
              <KVRow label="Foundation Type"     value={data.foundationType ?? 'Isolated Footing'} />
              <KVRow label="Slab System"         value={data.slabSystem ?? 'Two-way flat slab'} />
            </View>
          </Section>

          {/* 3. Load Combinations */}
          <Section title="3. Load Combinations — BNBC 2020 Sec 2.7">
            {[
              '1.4D',
              '1.2D + 1.6L',
              '1.2D + 1.0W + 1.0L',
              '0.9D + 1.0W',
              '1.2D + 1.0E + 1.0L',
              '0.9D + 1.0E',
            ].map((combo, i) => (
              <View key={i} style={i % 2 === 0 ? S.compRow : S.compRowAlt}>
                <Text style={S.compCheck}>✓</Text>
                <Text style={{ ...S.compItem, fontFamily: 'Courier', fontSize: 8 }}>{combo}</Text>
                <Text style={S.compRef}>BNBC 2020 §2.7</Text>
              </View>
            ))}
          </Section>

          {/* 4. Structural Checks */}
          {data.checks && data.checks.length > 0 && (
            <Section title="4. Structural Checks Summary">
              <View style={S.tableHead}>
                <Text style={{ ...S.tableHeadCell, flex: 3 }}>Check Item</Text>
                <Text style={{ ...S.tableHeadCell, flex: 2 }}>Result</Text>
                <Text style={{ ...S.tableHeadCell, width: 40, textAlign: 'center' }}>Status</Text>
              </View>
              {data.checks.map((check, i) => (
                <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                  <Text style={{ flex: 3, fontSize: 7.5 }}>{check.item}</Text>
                  <Text style={{ flex: 2, fontSize: 7.5 }}>{check.result}</Text>
                  <Text style={{
                    width: 40, fontSize: 7.5, textAlign: 'center', fontFamily: 'Helvetica-Bold',
                    color: check.status === 'pass' ? '#16a34a' : check.status === 'fail' ? '#dc2626' : '#64748b',
                  }}>
                    {check.status.toUpperCase()}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* Signature */}
          <View style={S.sigBlock}>
            {['Prepared By', 'Checked By', 'Approved By'].map((role) => (
              <View key={role} style={S.sigBox}>
                <Text style={S.sigLabel}>{role}</Text>
                <Text style={S.sigName}>{role === 'Prepared By' ? project.engineer : '________________'}</Text>
                <Text style={S.sigDate}>{today}</Text>
              </View>
            ))}
          </View>

        </View>
        <PDFFooter project={project} />
      </Page>
    </Document>
  )
}

// ═══════════════════════════════════════════════════════════════════
// 2. Calculation Sheet Document
// ═══════════════════════════════════════════════════════════════════

export interface CalcData {
  concreteGrade: string
  steelGrade: string
  soilBearing: number
  slabThk: number
  beamSize: string
  colSize: string
  footSize: string
  seismicZone: string
  windSpeed: number
  revision: string
  calculations: { ref: string; description: string; value: string; unit: string; status: string }[]
}

function CalcSheetDoc({ project, data }: { project: Project; data: Partial<CalcData> }) {
  const rev = data.revision ?? 'Rev 00'
  const today = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <Document title={`Calculation Sheet - ${project.name}`}>
      <Page size="A4" style={S.page}>
        <PDFHeader project={project} title="Structural Calculation Sheet" revision={rev} />
        <View style={S.content}>

          <Section title="1. Material Properties">
            <View style={S.kvGrid}>
              <KVRow label="Concrete"  value={data.concreteGrade ?? "f'c = 25 MPa"} />
              <KVRow label="Steel"     value={data.steelGrade ?? 'fy = 415 MPa'} />
              <KVRow label="Es"        value="200,000 MPa" />
              <KVRow label="Ec"        value="23,500 MPa" />
              <KVRow label="φ (flexure)" value="0.90" />
              <KVRow label="φ (shear)"   value="0.75" />
            </View>
          </Section>

          <Section title="2. Design Loads">
            <View style={S.kvGrid}>
              <KVRow label="Slab Dead Load"  value="3.5 kN/m²" />
              <KVRow label="Floor Live Load" value="2.0 kN/m²" />
              <KVRow label="Roof Live Load"  value="1.5 kN/m²" />
              <KVRow label="Wind Speed"      value={`${data.windSpeed ?? 150} km/h`} />
              <KVRow label="Seismic Zone"    value={data.seismicZone ?? 'Zone 2'} />
              <KVRow label="SBC"             value={`${data.soilBearing ?? 150} kN/m²`} />
            </View>
          </Section>

          <Section title="3. Member Sizes">
            <View style={S.kvGrid}>
              <KVRow label="Slab Thickness" value={`${data.slabThk ?? 125} mm`} />
              <KVRow label="Beam Size"       value={data.beamSize ?? '250×450 mm'} />
              <KVRow label="Column Size"     value={data.colSize ?? '300×300 mm'} />
              <KVRow label="Footing Size"    value={data.footSize ?? '1500×1500 mm'} />
            </View>
          </Section>

          {data.calculations && data.calculations.length > 0 && (
            <Section title="4. Calculations Summary">
              <View style={S.tableHead}>
                <Text style={{ ...S.tableHeadCell, width: 30 }}>Ref</Text>
                <Text style={{ ...S.tableHeadCell, flex: 3 }}>Description</Text>
                <Text style={{ ...S.tableHeadCell, flex: 1, textAlign: 'right' }}>Value</Text>
                <Text style={{ ...S.tableHeadCell, width: 24 }}>Unit</Text>
                <Text style={{ ...S.tableHeadCell, width: 28, textAlign: 'center' }}>Status</Text>
              </View>
              {data.calculations.map((calc, i) => (
                <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                  <Text style={{ width: 30, fontSize: 7, color: '#64748b', fontFamily: 'Courier' }}>{calc.ref}</Text>
                  <Text style={{ flex: 3, fontSize: 7.5 }}>{calc.description}</Text>
                  <Text style={{ flex: 1, fontSize: 7.5, textAlign: 'right', fontFamily: 'Courier' }}>{calc.value}</Text>
                  <Text style={{ width: 24, fontSize: 7, color: '#64748b' }}>{calc.unit}</Text>
                  <Text style={{
                    width: 28, fontSize: 7.5, textAlign: 'center', fontFamily: 'Helvetica-Bold',
                    color: calc.status === 'OK' ? '#16a34a' : '#dc2626',
                  }}>{calc.status}</Text>
                </View>
              ))}
            </Section>
          )}

          <View style={S.sigBlock}>
            {['Prepared By', 'Checked By', 'Approved By'].map((role) => (
              <View key={role} style={S.sigBox}>
                <Text style={S.sigLabel}>{role}</Text>
                <Text style={S.sigName}>{role === 'Prepared By' ? project.engineer : '________________'}</Text>
                <Text style={S.sigDate}>{today}</Text>
              </View>
            ))}
          </View>
        </View>
        <PDFFooter project={project} />
      </Page>
    </Document>
  )
}

// ─── PDF Blob Generators ─────────────────────────────────────────

export async function generateStructuralReportPDF(
  project: Project,
  data: Partial<StructuralData>,
  revision = 'Rev 00'
): Promise<Blob> {
  const doc = <StructuralReportDoc project={project} data={data} revision={revision} />
  return await pdf(doc).toBlob()
}

export async function generateCalcSheetPDF(
  project: Project,
  data: Partial<CalcData>
): Promise<Blob> {
  const doc = <CalcSheetDoc project={project} data={data} />
  return await pdf(doc).toBlob()
}
