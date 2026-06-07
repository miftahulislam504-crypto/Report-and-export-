// ─── Ecosystem Bridge Types ───────────────────────────────────────
// Data contracts between CivilOS apps → Reports app

// ─── Source App IDs ───────────────────────────────────────────────
export type SourceApp = 'architectural' | 'structural' | 'estimate' | 'project-management'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'stale'

// ─── Bridge Record (stored in Firestore) ──────────────────────────
export interface BridgeRecord {
  id: string
  projectId: string
  sourceApp: SourceApp
  dataType: string
  data: Record<string, unknown>
  syncedAt: string        // ISO string
  version: number
  checksum?: string
}

// ═══════════════════════════════════════════════════════════════════
// STRUCTURAL APP DATA
// ═══════════════════════════════════════════════════════════════════

export interface StructuralBridgeData {
  // Materials
  concreteGrade: string         // "f'c = 25 MPa"
  steelGrade: string            // "Grade 60 (fy = 415 MPa)"
  exposureCategory: string      // "B"

  // Site
  soilBearingCapacity: number   // kN/m²
  foundationDepth: number       // m
  foundationType: string        // "Isolated Footing"
  soilType: string              // "Type C"

  // Seismic
  seismicZone: string           // "Zone 2"
  importanceFactor: number      // 1.0
  responseModFactor: number     // R
  spectralAcceleration: number  // Sa

  // Wind
  windSpeed: number             // km/h
  terrainCategory: string       // "B"

  // Building
  buildingHeight: number        // m
  slabSystem: string            // "Two-way flat slab"
  analysisMethod: string        // "Direct Stiffness"
  software: string              // "CivilOS Structural"

  // Member sizes
  slabThickness: number         // mm
  typicalBeamSize: string       // "250×450"
  typicalColumnSize: string     // "300×300"
  typicalFootingSize: string    // "1500×1500"

  // Checks (from analysis)
  checks: StructuralCheck[]

  // BNBC compliance
  bnbcCompliance: BNBCCompliance
}

export interface StructuralCheck {
  member: string
  check: string
  demand: number
  capacity: number
  ratio: number
  status: 'pass' | 'fail'
  unit: string
}

export interface BNBCCompliance {
  seismicDesign: boolean
  windDesign: boolean
  fireSafety: boolean
  accessibility: boolean
  setbackCompliance: boolean
  farCompliance: boolean
  remarks: string[]
}

// ═══════════════════════════════════════════════════════════════════
// ESTIMATE APP DATA
// ═══════════════════════════════════════════════════════════════════

export interface EstimateBridgeData {
  // Summary
  totalCost: number
  civilCost: number
  structuralCost: number
  architecturalCost: number
  mepCost: number               // Mechanical, Electrical, Plumbing
  finishingCost: number
  contingency: number           // %
  costPerSqm: number

  // Breakdown categories
  categories: CostCategory[]

  // BOQ items
  boqItems: BOQBridgeItem[]

  // Material rates
  rateYear: string              // "2024"
  rateLocation: string          // "Dhaka"
}

export interface CostCategory {
  name: string
  amount: number
  percentage: number
  subItems: { name: string; amount: number }[]
}

export interface BOQBridgeItem {
  slNo: number
  section: string
  description: string
  unit: string
  quantity: number
  rate: number
  amount: number
}

// ═══════════════════════════════════════════════════════════════════
// PROJECT MANAGEMENT APP DATA
// ═══════════════════════════════════════════════════════════════════

export interface PMBridgeData {
  // Timeline
  startDate: string
  expectedCompletion: string
  actualCompletion?: string
  contractDuration: number      // days

  // Progress
  overallCompletion: number     // 0-100
  currentPhase: string
  currentPhaseCompletion: number

  // Activities
  activities: PMActivity[]

  // Resources
  currentLabour: number
  peakLabour: number

  // Issues
  delayDays: number
  openIssues: number
  resolvedIssues: number

  // Budget
  budgetSpent: number
  budgetRemaining: number
  earnedValue: number
}

export interface PMActivity {
  id: string
  name: string
  plannedStart: string
  plannedEnd: string
  actualStart?: string
  actualEnd?: string
  completion: number
  status: 'completed' | 'in-progress' | 'not-started' | 'delayed'
  criticalPath: boolean
}

// ═══════════════════════════════════════════════════════════════════
// ARCHITECTURAL APP DATA
// ═══════════════════════════════════════════════════════════════════

export interface ArchitecturalBridgeData {
  // Building info
  buildingType: string
  occupancyType: string
  totalFloors: number
  basementFloors: number
  totalArea: number             // sqm
  floorHeight: number           // m

  // Areas per floor
  floors: FloorData[]

  // Setbacks
  frontSetback: number          // m
  rearSetback: number
  sideSetback: number

  // Compliance
  far: number                   // Floor Area Ratio
  groundCoverage: number        // %
  openSpace: number             // sqm
}

export interface FloorData {
  level: string                 // "Ground", "1st", etc.
  area: number
  usage: string
  height: number
}

// ═══════════════════════════════════════════════════════════════════
// COMBINED ECOSYSTEM DATA
// ═══════════════════════════════════════════════════════════════════

export interface EcosystemData {
  projectId: string
  lastSynced: string

  structural?: StructuralBridgeData
  estimate?: EstimateBridgeData
  projectManagement?: PMBridgeData
  architectural?: ArchitecturalBridgeData

  // Sync status per app
  syncStatus: Record<SourceApp, SyncStatus>
  syncedAt: Record<SourceApp, string>
}
