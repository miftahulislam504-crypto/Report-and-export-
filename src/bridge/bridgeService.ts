// ─── Ecosystem Bridge Service ─────────────────────────────────────
// Reads data pushed by other CivilOS apps into shared Firestore
// Collections, then makes it available to the Reports app.

import {
  doc, collection, getDocs, getDoc,
  setDoc, onSnapshot, query, where,
  serverTimestamp, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import type {
  EcosystemData, SourceApp, SyncStatus,
  StructuralBridgeData, EstimateBridgeData,
  PMBridgeData, ArchitecturalBridgeData,
  BridgeRecord,
} from './bridgeTypes'

// ─── Firestore Collection Paths ───────────────────────────────────
// These must match what the other CivilOS apps write to.
const BRIDGE_COLLECTION = 'civilos_bridge'

function bridgeDocPath(projectId: string, app: SourceApp) {
  return `${BRIDGE_COLLECTION}/${projectId}_${app}`
}

// ═══════════════════════════════════════════════════════════════════
// READ — pull latest data from a source app
// ═══════════════════════════════════════════════════════════════════

export async function readBridgeData<T>(
  projectId: string,
  app: SourceApp
): Promise<T | null> {
  try {
    const ref  = doc(db, bridgeDocPath(projectId, app))
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    const record = snap.data() as BridgeRecord
    return record.data as T
  } catch (err) {
    console.error(`Bridge read error [${app}]:`, err)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════
// WRITE — push data to bridge (used by other apps, exposed here for testing)
// ═══════════════════════════════════════════════════════════════════

export async function writeBridgeData(
  projectId: string,
  app: SourceApp,
  dataType: string,
  data: Record<string, unknown>
): Promise<void> {
  const ref = doc(db, bridgeDocPath(projectId, app))
  const record: Omit<BridgeRecord, 'id'> = {
    projectId,
    sourceApp: app,
    dataType,
    data,
    syncedAt: new Date().toISOString(),
    version: Date.now(),
  }
  await setDoc(ref, { ...record, updatedAt: serverTimestamp() }, { merge: true })
}

// ═══════════════════════════════════════════════════════════════════
// REAL-TIME LISTENER — subscribe to live updates from all apps
// ═══════════════════════════════════════════════════════════════════

export function subscribeToEcosystem(
  projectId: string,
  onUpdate: (app: SourceApp, data: Record<string, unknown>) => void
): Unsubscribe {
  const apps: SourceApp[] = ['structural', 'estimate', 'project-management', 'architectural']
  const unsubs: Unsubscribe[] = []

  apps.forEach((app) => {
    const ref = doc(db, bridgeDocPath(projectId, app))
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const record = snap.data() as BridgeRecord
        onUpdate(app, record.data)
      }
    })
    unsubs.push(unsub)
  })

  return () => unsubs.forEach((u) => u())
}

// ═══════════════════════════════════════════════════════════════════
// FETCH ALL — pull complete ecosystem snapshot
// ═══════════════════════════════════════════════════════════════════

export async function fetchEcosystemData(projectId: string): Promise<EcosystemData> {
  const apps: SourceApp[] = ['structural', 'estimate', 'project-management', 'architectural']

  const results = await Promise.allSettled(
    apps.map((app) => readBridgeData<Record<string, unknown>>(projectId, app))
  )

  const syncStatus = {} as Record<SourceApp, SyncStatus>
  const syncedAt   = {} as Record<SourceApp, string>
  const appData: Record<string, unknown> = {}

  results.forEach((result, idx) => {
    const app = apps[idx]
    if (result.status === 'fulfilled' && result.value) {
      syncStatus[app] = 'synced'
      syncedAt[app]   = new Date().toISOString()
      appData[app]    = result.value
    } else {
      syncStatus[app] = result.status === 'rejected' ? 'error' : 'idle'
      syncedAt[app]   = ''
    }
  })

  return {
    projectId,
    lastSynced: new Date().toISOString(),
    structural:         appData['structural'] as StructuralBridgeData | undefined,
    estimate:           appData['estimate'] as EstimateBridgeData | undefined,
    projectManagement:  appData['project-management'] as PMBridgeData | undefined,
    architectural:      appData['architectural'] as ArchitecturalBridgeData | undefined,
    syncStatus,
    syncedAt,
  }
}

// ═══════════════════════════════════════════════════════════════════
// SEED — push sample data for testing/demo
// ═══════════════════════════════════════════════════════════════════

export async function seedBridgeData(projectId: string, projectName: string): Promise<void> {
  const structural: StructuralBridgeData = {
    concreteGrade: "f'c = 25 MPa",
    steelGrade: 'Grade 60 (fy = 415 MPa)',
    exposureCategory: 'B',
    soilBearingCapacity: 150,
    foundationDepth: 1.5,
    foundationType: 'Isolated Footing',
    soilType: 'Type C',
    seismicZone: 'Zone 2',
    importanceFactor: 1.0,
    responseModFactor: 5.0,
    spectralAcceleration: 0.28,
    windSpeed: 150,
    terrainCategory: 'B',
    buildingHeight: 25.2,
    slabSystem: 'Two-way flat slab',
    analysisMethod: 'Direct Stiffness Method',
    software: 'CivilOS Structural',
    slabThickness: 125,
    typicalBeamSize: '250×450',
    typicalColumnSize: '300×300',
    typicalFootingSize: '1500×1500',
    checks: [
      { member: 'Slab',    check: 'Flexure',   demand: 48.2,  capacity: 55.8,  ratio: 0.86, status: 'pass', unit: 'kN·m/m' },
      { member: 'Beam',    check: 'Shear',     demand: 185.0, capacity: 220.5, ratio: 0.84, status: 'pass', unit: 'kN' },
      { member: 'Column',  check: 'Axial',     demand: 1250,  capacity: 1580,  ratio: 0.79, status: 'pass', unit: 'kN' },
      { member: 'Footing', check: 'Bearing',   demand: 142,   capacity: 150,   ratio: 0.95, status: 'pass', unit: 'kN/m²' },
      { member: 'Frame',   check: 'Drift',     demand: 0.008, capacity: 0.020, ratio: 0.40, status: 'pass', unit: 'rad' },
    ],
    bnbcCompliance: {
      seismicDesign: true,
      windDesign: true,
      fireSafety: true,
      accessibility: true,
      setbackCompliance: true,
      farCompliance: true,
      remarks: ['All checks passed per BNBC 2020', 'No critical issues identified'],
    },
  }

  const estimate: EstimateBridgeData = {
    totalCost:         28_450_000,
    civilCost:         12_800_000,
    structuralCost:     8_650_000,
    architecturalCost:  4_200_000,
    mepCost:            2_400_000,
    finishingCost:      3_200_000,
    contingency:        5,
    costPerSqm:         9_483,
    rateYear: '2024',
    rateLocation: 'Dhaka',
    categories: [
      {
        name: 'Substructure',
        amount: 3_452_500,
        percentage: 12.1,
        subItems: [
          { name: 'Excavation', amount: 360_000 },
          { name: 'Foundation Concrete', amount: 1_667_500 },
          { name: 'Foundation Steel', amount: 1_425_000 },
        ],
      },
      {
        name: 'Superstructure',
        amount: 18_105_000,
        percentage: 63.6,
        subItems: [
          { name: 'RCC Frame', amount: 3_080_000 },
          { name: 'Slab Works', amount: 4_000_000 },
          { name: 'Steel Reinforcement', amount: 9_025_000 },
          { name: 'Staircase', amount: 2_000_000 },
        ],
      },
      {
        name: 'Finishing',
        amount: 6_470_000,
        percentage: 22.7,
        subItems: [
          { name: 'Brick Masonry', amount: 2_380_000 },
          { name: 'Plaster & Paint', amount: 1_120_000 },
          { name: 'Flooring', amount: 2_160_000 },
          { name: 'Doors & Windows', amount: 810_000 },
        ],
      },
    ],
    boqItems: [
      { slNo: 1,  section: 'Substructure', description: 'Excavation & Earthwork', unit: 'm³', quantity: 450, rate: 800, amount: 360_000 },
      { slNo: 2,  section: 'Substructure', description: 'PCC Foundation', unit: 'm³', quantity: 35, rate: 6_500, amount: 227_500 },
      { slNo: 3,  section: 'Substructure', description: 'RCC Foundation', unit: 'm³', quantity: 120, rate: 12_000, amount: 1_440_000 },
      { slNo: 4,  section: 'Superstructure', description: 'RCC Column', unit: 'm³', quantity: 85, rate: 14_000, amount: 1_190_000 },
      { slNo: 5,  section: 'Superstructure', description: 'RCC Beam', unit: 'm³', quantity: 140, rate: 13_500, amount: 1_890_000 },
      { slNo: 6,  section: 'Superstructure', description: 'RCC Slab', unit: 'm³', quantity: 320, rate: 12_500, amount: 4_000_000 },
      { slNo: 7,  section: 'Superstructure', description: 'Steel Reinforcement', unit: 'MT', quantity: 95, rate: 95_000, amount: 9_025_000 },
      { slNo: 8,  section: 'Finishing', description: 'Brick Masonry', unit: 'm³', quantity: 280, rate: 8_500, amount: 2_380_000 },
      { slNo: 9,  section: 'Finishing', description: 'Ceramic Tile Flooring', unit: 'm²', quantity: 1_800, rate: 1_200, amount: 2_160_000 },
      { slNo: 10, section: 'Finishing', description: 'Doors & Windows', unit: 'nos', quantity: 45, rate: 18_000, amount: 810_000 },
    ],
  }

  const pm: PMBridgeData = {
    startDate:           '2024-01-15',
    expectedCompletion:  '2024-12-31',
    contractDuration:    351,
    overallCompletion:   42,
    currentPhase:        'Structural Frame',
    currentPhaseCompletion: 65,
    delayDays:           0,
    openIssues:          3,
    resolvedIssues:      12,
    currentLabour:       45,
    peakLabour:          80,
    budgetSpent:         11_949_000,
    budgetRemaining:     16_501_000,
    earnedValue:         11_949_000,
    activities: [
      { id: 'a1', name: 'Site Preparation',        plannedStart: '2024-01-15', plannedEnd: '2024-01-31', completion: 100, status: 'completed',   criticalPath: true },
      { id: 'a2', name: 'Foundation Excavation',   plannedStart: '2024-02-01', plannedEnd: '2024-02-28', completion: 100, status: 'completed',   criticalPath: true },
      { id: 'a3', name: 'Foundation Concrete',     plannedStart: '2024-03-01', plannedEnd: '2024-03-31', completion: 100, status: 'completed',   criticalPath: true },
      { id: 'a4', name: 'Ground Floor Frame',      plannedStart: '2024-04-01', plannedEnd: '2024-04-30', completion: 100, status: 'completed',   criticalPath: true },
      { id: 'a5', name: '1st–3rd Floor Frame',     plannedStart: '2024-05-01', plannedEnd: '2024-07-31', completion: 65,  status: 'in-progress', criticalPath: true },
      { id: 'a6', name: '4th–6th Floor Frame',     plannedStart: '2024-08-01', plannedEnd: '2024-09-30', completion: 0,   status: 'not-started', criticalPath: true },
      { id: 'a7', name: 'Brick Masonry',           plannedStart: '2024-08-01', plannedEnd: '2024-10-31', completion: 0,   status: 'not-started', criticalPath: false },
      { id: 'a8', name: 'Finishing Works',         plannedStart: '2024-10-01', plannedEnd: '2024-12-15', completion: 0,   status: 'not-started', criticalPath: false },
      { id: 'a9', name: 'MEP Installation',        plannedStart: '2024-09-01', plannedEnd: '2024-11-30', completion: 0,   status: 'not-started', criticalPath: false },
    ],
  }

  const architectural: ArchitecturalBridgeData = {
    buildingType:    'Residential',
    occupancyType:   'Group R-2',
    totalFloors:     8,
    basementFloors:  1,
    totalArea:       3_000,
    floorHeight:     3.15,
    frontSetback:    4.5,
    rearSetback:     3.0,
    sideSetback:     2.5,
    far:             3.2,
    groundCoverage:  55,
    openSpace:       180,
    floors: [
      { level: 'Basement',  area: 280,  usage: 'Parking',   height: 2.8 },
      { level: 'Ground',    area: 380,  usage: 'Commercial', height: 3.6 },
      { level: '1st–7th',   area: 340,  usage: 'Residential',height: 3.0 },
      { level: 'Roof',      area: 120,  usage: 'Utility',    height: 3.0 },
    ],
  }

  await writeBridgeData(projectId, 'structural',          'structural_analysis', structural as never)
  await writeBridgeData(projectId, 'estimate',            'cost_estimate',       estimate as never)
  await writeBridgeData(projectId, 'project-management',  'project_progress',    pm as never)
  await writeBridgeData(projectId, 'architectural',       'building_design',     architectural as never)
}
