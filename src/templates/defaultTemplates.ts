import type { ReportTemplate } from '@/lib/types'

// ─── Built-in Default Templates ───────────────────────────────────

export const DEFAULT_TEMPLATES: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [

  // ── 1. Structural Report ─────────────────────────────────────────
  {
    name: 'Structural Engineering Report',
    type: 'structural',
    description: 'Complete structural analysis report per BNBC 2020',
    isDefault: true,
    variables: [
      { key: 'projectName',    label: 'Project Name',     source: 'project',    type: 'string' },
      { key: 'projectNumber',  label: 'Project Number',   source: 'project',    type: 'string' },
      { key: 'client',         label: 'Client Name',      source: 'project',    type: 'string' },
      { key: 'engineer',       label: 'Lead Engineer',    source: 'project',    type: 'string' },
      { key: 'concreteGrade',  label: 'Concrete Grade',   source: 'structural', type: 'string' },
      { key: 'steelGrade',     label: 'Steel Grade',      source: 'structural', type: 'string' },
      { key: 'soilBearing',    label: 'SBC (kN/m²)',      source: 'structural', type: 'number' },
      { key: 'seismicZone',    label: 'Seismic Zone',     source: 'structural', type: 'string' },
      { key: 'floors',         label: 'No. of Floors',    source: 'project',    type: 'number' },
      { key: 'reportDate',     label: 'Report Date',      source: 'project',    type: 'date'   },
    ],
    content: `STRUCTURAL ENGINEERING REPORT
===============================

PROJECT:    {{projectName}}
REF NO:     {{projectNumber}}
CLIENT:     {{client}}
ENGINEER:   {{engineer}}
DATE:       {{reportDate}}
AUTHORITY:  {{upper authority}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROJECT DESCRIPTION
   Building Type : {{buildingType}}
   Location      : {{location}}
   No. of Floors : {{floors}}
   Total Area    : {{formatNumber area}} m²
   Height        : {{default buildingHeight "—"}} m

2. DESIGN PARAMETERS (BNBC 2020)
   Concrete Grade      : {{default concreteGrade "f'c = 25 MPa"}}
   Steel Grade         : {{default steelGrade "Grade 60 (415 MPa)"}}
   Soil Bearing Cap.   : {{default soilBearing "150"}} kN/m²
   Seismic Zone        : {{default seismicZone "Zone 2"}}
   Wind Speed          : {{default windSpeed "150"}} km/h
   Exposure Category   : {{default exposureCategory "B"}}

3. LOAD COMBINATIONS (BNBC 2020 Sec 2.7)
   1.4D
   1.2D + 1.6L
   1.2D + 1.0W + 1.0L
   0.9D + 1.0W
   1.2D + 1.0E + 1.0L

4. STRUCTURAL SYSTEM
   Primary Frame     : Reinforced Concrete
   Foundation Type   : {{default foundationType "Isolated/Combined Footing"}}
   Slab System       : {{default slabSystem "Two-way flat slab"}}

5. BNBC COMPLIANCE SUMMARY
   Seismic Design    : ✓ Per BNBC 2020 Chapter 2
   Wind Design       : ✓ Per BNBC 2020 Chapter 2
   Fire Safety       : ✓ Per BNBC 2020 Chapter 4
   Accessibility     : ✓ Per BNBC 2020 Chapter 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prepared by: {{engineer}}
Date: {{reportDate}}
`,
  },

  // ── 2. Design Basis Report ───────────────────────────────────────
  {
    name: 'Design Basis Report',
    type: 'design-basis',
    description: 'Design basis for authority submission (RAJUK/CDA)',
    isDefault: true,
    variables: [
      { key: 'projectName',   label: 'Project Name',   source: 'project',    type: 'string' },
      { key: 'authority',     label: 'Authority',      source: 'project',    type: 'string' },
      { key: 'concreteGrade', label: 'Concrete Grade', source: 'structural', type: 'string' },
      { key: 'steelGrade',    label: 'Steel Grade',    source: 'structural', type: 'string' },
    ],
    content: `DESIGN BASIS REPORT
===================

Project : {{projectName}}
Ref No  : {{projectNumber}}
Client  : {{client}}
Date    : {{reportDate}}

Submitted to: {{upper authority}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. APPLICABLE CODES & STANDARDS
   • Bangladesh National Building Code (BNBC) 2020
   • ACI 318-19 (Concrete Design)
   • AISC 360-16 (Steel Design, if applicable)
   • ASCE 7-16 (Load Standards)
   • IS 1893 (Seismic, supplementary)

2. SITE DATA
   Location        : {{location}}
   Authority       : {{upper authority}}
   Seismic Zone    : {{default seismicZone "Zone 2"}}
   Wind Speed      : {{default windSpeed "150"}} km/h
   Soil Type       : {{default soilType "Type C"}}
   SBC             : {{default soilBearing "150"}} kN/m²

3. MATERIAL SPECIFICATIONS
   Concrete        : {{default concreteGrade "f'c = 25 MPa (Normal)"}}
   Reinforcement   : {{default steelGrade "Grade 60, fy = 415 MPa"}}
   Cover (Slab)    : 20 mm
   Cover (Beam)    : 40 mm
   Cover (Column)  : 40 mm
   Cover (Footing) : 75 mm

4. LOADING CRITERIA
   Dead Load       : Per BNBC 2020 Table 2.2
   Live Load       : Per BNBC 2020 Table 2.3
   Wind Load       : Per BNBC 2020 Sec 2.4
   Seismic Load    : Per BNBC 2020 Sec 2.5
   EQ Zone         : {{default seismicZone "Zone 2"}}

5. STRUCTURAL SYSTEM
   Floors          : {{floors}}
   Total Area      : {{formatNumber area}} m²
   Frame System    : RC Moment Frame
   Foundation      : {{default foundationType "Isolated Footing"}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Engineer: {{engineer}}  |  Date: {{reportDate}}
`,
  },

  // ── 3. BOQ Report ────────────────────────────────────────────────
  {
    name: 'Bill of Quantities (BOQ)',
    type: 'boq',
    description: 'Detailed Bill of Quantities with cost summary',
    isDefault: true,
    variables: [
      { key: 'totalCost',      label: 'Total Cost (BDT)',    source: 'estimate', type: 'number' },
      { key: 'civilCost',      label: 'Civil Work Cost',     source: 'estimate', type: 'number' },
      { key: 'structuralCost', label: 'Structural Cost',     source: 'estimate', type: 'number' },
      { key: 'finishingCost',  label: 'Finishing Cost',      source: 'estimate', type: 'number' },
      { key: 'costPerSqm',     label: 'Cost per sqm',        source: 'estimate', type: 'number' },
    ],
    content: `BILL OF QUANTITIES
==================

Project  : {{projectName}}
Ref No   : {{projectNumber}}
Client   : {{client}}
Location : {{location}}
Date     : {{reportDate}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Civil / Structural Work    :  {{formatCurrency (default civilCost 0)}}
  Architectural / Finishing  :  {{formatCurrency (default finishingCost 0)}}
  ─────────────────────────────────────────────
  TOTAL ESTIMATED COST       :  {{formatCurrency (default totalCost 0)}}

  Total Built-up Area        :  {{formatNumber area}} m²
  Cost per m²                :  {{formatCurrency (default costPerSqm 0)}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE:
• Rates are based on current Dhaka market ({{reportYear}})
• VAT & AIT not included unless stated
• Quantities subject to final drawing verification

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prepared by: {{engineer}}
`,
  },

  // ── 4. Progress Report ───────────────────────────────────────────
  {
    name: 'Monthly Progress Report',
    type: 'progress',
    description: 'Monthly construction progress report',
    isDefault: true,
    variables: [
      { key: 'completionPercent', label: 'Completion %',        source: 'manual', type: 'number' },
      { key: 'currentPhase',      label: 'Current Phase',       source: 'manual', type: 'string' },
      { key: 'startDate',         label: 'Project Start Date',  source: 'manual', type: 'date'   },
      { key: 'expectedCompletion',label: 'Expected Completion', source: 'manual', type: 'date'   },
    ],
    content: `MONTHLY PROGRESS REPORT
========================

Project  : {{projectName}}
Ref No   : {{projectNumber}}
Client   : {{client}}
Date     : {{reportDate}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROJECT STATUS
   Overall Completion  : {{default completionPercent 0}}%
   Current Phase       : {{default currentPhase "Foundation"}}
   Project Start       : {{formatDate (default startDate reportDate)}}
   Expected Completion : {{default expectedCompletion "TBD"}}

2. THIS MONTH ACTIVITIES
   • {{default activity1 "Structural works in progress"}}
   • {{default activity2 "Material procurement ongoing"}}
   • {{default activity3 "Quality inspection completed"}}

3. NEXT MONTH PLAN
   • {{default plan1 "Continue structural frame"}}
   • {{default plan2 "Start brick masonry work"}}

4. ISSUES & RISKS
   {{default issues "No major issues reported."}}

5. PHOTO DOCUMENTATION
   [Attached separately]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Engineer: {{engineer}}  |  Date: {{reportDate}}
`,
  },

  // ── 5. BNBC Compliance Report ─────────────────────────────────────
  {
    name: 'BNBC Compliance Checklist',
    type: 'compliance',
    description: 'BNBC 2020 compliance verification report',
    isDefault: true,
    variables: [
      { key: 'seismicZone', label: 'Seismic Zone', source: 'structural', type: 'string' },
      { key: 'authority',   label: 'Authority',    source: 'project',    type: 'string' },
    ],
    content: `BNBC 2020 COMPLIANCE REPORT
============================

Project   : {{projectName}}
Ref No    : {{projectNumber}}
Client    : {{client}}
Authority : {{upper authority}}
Date      : {{reportDate}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLIANCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PART 2 — LOADS AND FORCES
  [✓] Dead Load per Table 2.2
  [✓] Live Load per Table 2.3
  [✓] Wind Load per Sec 2.4 (V = {{default windSpeed 150}} km/h)
  [✓] Seismic Load per Sec 2.5 (Zone {{default seismicZone "2"}})
  [✓] Load Combinations per Sec 2.7

PART 3 — SOILS & FOUNDATIONS
  [✓] Soil Investigation Report provided
  [✓] SBC = {{default soilBearing 150}} kN/m²
  [✓] Foundation design per Sec 3.8

PART 4 — FIRE SAFETY
  [✓] Occupancy classification determined
  [✓] Exit requirements per Sec 4.3
  [✓] Fire rating of structural elements

PART 5 — ACCESSIBILITY
  [✓] Accessible entrance provided
  [✓] Lift/ramp per Sec 5.2 (if ≥ 4 floors)

PART 6 — ENERGY EFFICIENCY
  [✓] Building orientation considered
  [✓] Glazing ratio within limits

SETBACK COMPLIANCE ({{upper authority}})
  Front Setback  : {{default frontSetback "Per approved plan"}}
  Side Setback   : {{default sideSetback "Per approved plan"}}
  Rear Setback   : {{default rearSetback "Per approved plan"}}
  FAR            : {{default far "As approved"}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERDICT: COMPLIANT WITH BNBC 2020
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Engineer: {{engineer}}  |  Date: {{reportDate}}
`,
  },

  // ── 6. Calculation Sheet ─────────────────────────────────────────
  {
    name: 'Structural Calculation Sheet',
    type: 'calculation',
    description: 'Formal calculation sheet for authority submission',
    isDefault: true,
    variables: [
      { key: 'concreteGrade', label: 'Concrete Grade', source: 'structural', type: 'string' },
      { key: 'soilBearing',   label: 'SBC (kN/m²)',    source: 'structural', type: 'number' },
    ],
    content: `STRUCTURAL CALCULATION SHEET
==============================

Project  : {{projectName}}
Ref No   : {{projectNumber}}
Client   : {{client}}
Engineer : {{engineer}}
Date     : {{reportDate}}
Rev      : {{default revision "Rev 00"}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MATERIAL PROPERTIES
   ─────────────────────────────────────────────
   Concrete : {{default concreteGrade "f'c = 25 MPa"}}
   Steel    : {{default steelGrade "fy = 415 MPa"}}
   Es       : 200,000 MPa
   Ec       : 23,500 MPa (approx.)

2. DESIGN LOADS
   ─────────────────────────────────────────────
   Dead Load (slab)   : {{default slabDL "3.5"}} kN/m²
   Dead Load (beam)   : {{default beamDL "2.0"}} kN/m²
   Live Load (floor)  : {{default floorLL "2.0"}} kN/m²
   Live Load (roof)   : {{default roofLL "1.5"}} kN/m²
   Wind Load          : {{default windSpeed "150"}} km/h
   Seismic Zone       : {{default seismicZone "Zone 2"}}

3. FOUNDATION DATA
   ─────────────────────────────────────────────
   Soil Bearing Cap.  : {{default soilBearing "150"}} kN/m²
   Foundation Depth   : {{default foundDepth "1.5"}} m
   Foundation Type    : {{default foundationType "Isolated Footing"}}

4. STRUCTURAL CHECKS
   ─────────────────────────────────────────────
   Slab Thickness     : {{default slabThk "125"}} mm   [OK]
   Column Size        : {{default colSize "300×300"}} mm [OK]
   Beam Size          : {{default beamSize "250×450"}} mm [OK]
   Footing Size       : {{default footSize "1500×1500"}} mm [OK]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checked by: {{engineer}}  |  Date: {{reportDate}}
`,
  },

  // ── 7. Cost Report ───────────────────────────────────────────────
  {
    name: 'Project Cost Report',
    type: 'cost',
    description: 'Detailed project cost breakdown report',
    isDefault: true,
    variables: [
      { key: 'totalCost',  label: 'Total Cost (BDT)', source: 'estimate', type: 'number' },
      { key: 'costPerSqm', label: 'Cost per sqm',     source: 'estimate', type: 'number' },
    ],
    content: `PROJECT COST REPORT
====================

Project  : {{projectName}}
Ref No   : {{projectNumber}}
Client   : {{client}}
Date     : {{reportDate}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COST BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  A. SUBSTRUCTURE
     Foundation Work       :  {{formatCurrency (default foundationCost 0)}}
     Ground Floor Slab     :  {{formatCurrency (default gfSlabCost 0)}}

  B. SUPERSTRUCTURE
     RCC Frame (Col+Beam)  :  {{formatCurrency (default frameCost 0)}}
     Slab Works            :  {{formatCurrency (default slabCost 0)}}
     Staircase             :  {{formatCurrency (default stairCost 0)}}

  C. FINISHING
     Brick Masonry         :  {{formatCurrency (default masonryCost 0)}}
     Plaster & Paint       :  {{formatCurrency (default plasterCost 0)}}
     Flooring              :  {{formatCurrency (default flooringCost 0)}}
     Doors & Windows       :  {{formatCurrency (default doorCost 0)}}

  D. SERVICES
     Electrical            :  {{formatCurrency (default electricalCost 0)}}
     Plumbing              :  {{formatCurrency (default plumbingCost 0)}}
     ─────────────────────────────────────────
     GRAND TOTAL           :  {{formatCurrency (default totalCost 0)}}

  Total Area              :  {{formatNumber area}} m²
  Rate per m²             :  {{formatCurrency (default costPerSqm 0)}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTE: Rates based on Dhaka market — {{reportYear}}
`,
  },

  // ── 8. Client Summary ────────────────────────────────────────────
  {
    name: 'Client Summary Report',
    type: 'client-summary',
    description: 'Executive summary for client presentation',
    isDefault: true,
    variables: [
      { key: 'totalCost',          label: 'Total Cost',         source: 'estimate', type: 'number' },
      { key: 'completionPercent',  label: 'Completion %',       source: 'manual',   type: 'number' },
      { key: 'expectedCompletion', label: 'Expected Completion',source: 'manual',   type: 'date'   },
    ],
    content: `CLIENT SUMMARY REPORT
======================
Project Summary

Project Name       : {{projectName}}
Reference / Ref No : {{projectNumber}}
Client             : {{client}}
Location           : {{location}}
Date               : {{reportDate}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT INFORMATION
  Building Type    : {{buildingType}}
  Authority        : {{upper authority}}
  Number of Floors : {{floors}}
  Total Area       : {{formatNumber area}} m²

CONSTRUCTION COST
  Total Estimated Cost : {{formatCurrency (default totalCost 0)}}
  Cost per Sqm         : {{formatCurrency (default costPerSqm 0)}}

CONSTRUCTION PROGRESS
  Completed           : {{default completionPercent 0}}%
  Current Phase       : {{default currentPhase "Planning"}}
  Expected Completion : {{default expectedCompletion "Not Determined"}}

STRUCTURAL SPECS
  Concrete Grade  : {{default concreteGrade "f'c = 25 MPa"}}
  Steel Grade     : {{default steelGrade "Grade 60"}}
  Foundation Type : {{default foundationType "Isolated Footing"}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Engineer: {{engineer}}
Date: {{reportDate}}
`,
  },
]
