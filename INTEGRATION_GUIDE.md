# CivilOS Ecosystem Bridge — Integration Guide

## অন্য CivilOS Apps থেকে কীভাবে Data Push করবে

Reports App-এর Bridge এক-দিকে **read করে** — অন্য apps **write করে**।
যেকোনো CivilOS app এই একটা function call করলেই হবে।

---

## Push Function (যেকোনো app-এ paste করো)

```typescript
// bridgePush.ts — অন্য CivilOS apps-এ এই file রাখো

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase/config' // সেই app-এর firebase config

type SourceApp = 'structural' | 'estimate' | 'project-management' | 'architectural'

export async function pushToBridge(
  projectId: string,
  app: SourceApp,
  dataType: string,
  data: Record<string, unknown>
): Promise<void> {
  const docId = `${projectId}_${app}`
  await setDoc(
    doc(db, 'civilos_bridge', docId),
    {
      projectId,
      sourceApp: app,
      dataType,
      data,
      syncedAt: new Date().toISOString(),
      version: Date.now(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
```

---

## CivilOS Structural App থেকে Push

```typescript
// structural app-এ analysis complete হলে call করো:

await pushToBridge(projectId, 'structural', 'structural_analysis', {
  concreteGrade:       "f'c = 25 MPa",
  steelGrade:          'Grade 60 (fy = 415 MPa)',
  soilBearingCapacity: 150,
  foundationDepth:     1.5,
  foundationType:      'Isolated Footing',
  soilType:            'Type C',
  seismicZone:         'Zone 2',
  importanceFactor:    1.0,
  responseModFactor:   5.0,
  spectralAcceleration:0.28,
  windSpeed:           150,
  exposureCategory:    'B',
  terrainCategory:     'B',
  buildingHeight:      25.2,
  slabSystem:          'Two-way flat slab',
  analysisMethod:      'Direct Stiffness Method',
  software:            'CivilOS Structural',
  slabThickness:       125,
  typicalBeamSize:     '250×450',
  typicalColumnSize:   '300×300',
  typicalFootingSize:  '1500×1500',
  checks: [
    { member: 'Slab', check: 'Flexure', demand: 48.2, capacity: 55.8, ratio: 0.86, status: 'pass', unit: 'kN·m/m' },
    // ... more checks
  ],
  bnbcCompliance: {
    seismicDesign: true,
    windDesign: true,
    fireSafety: true,
    accessibility: true,
    setbackCompliance: true,
    farCompliance: true,
    remarks: ['All checks passed'],
  },
})
```

---

## CivilOS Estimate App থেকে Push

```typescript
await pushToBridge(projectId, 'estimate', 'cost_estimate', {
  totalCost:         28_450_000,
  civilCost:         12_800_000,
  structuralCost:     8_650_000,
  architecturalCost:  4_200_000,
  mepCost:            2_400_000,
  finishingCost:      3_200_000,
  contingency:        5,       // percentage
  costPerSqm:         9_483,
  rateYear:           '2024',
  rateLocation:       'Dhaka',
  categories: [
    {
      name: 'Substructure',
      amount: 3_452_500,
      percentage: 12.1,
      subItems: [
        { name: 'Excavation', amount: 360_000 },
        { name: 'Foundation Concrete', amount: 1_667_500 },
      ],
    },
    // ... more categories
  ],
  boqItems: [
    { slNo: 1, section: 'Substructure', description: 'Excavation', unit: 'm³', quantity: 450, rate: 800, amount: 360_000 },
    // ... more items
  ],
})
```

---

## CivilOS Project Management App থেকে Push

```typescript
await pushToBridge(projectId, 'project-management', 'project_progress', {
  startDate:              '2024-01-15',
  expectedCompletion:     '2024-12-31',
  contractDuration:       351,
  overallCompletion:      42,    // percent
  currentPhase:           'Structural Frame',
  currentPhaseCompletion: 65,
  delayDays:              0,
  openIssues:             3,
  resolvedIssues:         12,
  currentLabour:          45,
  peakLabour:             80,
  budgetSpent:            11_949_000,
  budgetRemaining:        16_501_000,
  earnedValue:            11_949_000,
  activities: [
    {
      id: 'a1',
      name: 'Foundation Works',
      plannedStart: '2024-02-01',
      plannedEnd: '2024-03-31',
      completion: 100,
      status: 'completed',
      criticalPath: true,
    },
    // ... more activities
  ],
})
```

---

## CivilOS Design App থেকে Push

```typescript
await pushToBridge(projectId, 'architectural', 'building_design', {
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
    { level: 'Basement', area: 280, usage: 'Parking', height: 2.8 },
    { level: 'Ground',   area: 380, usage: 'Commercial', height: 3.6 },
    { level: '1st–7th',  area: 340, usage: 'Residential', height: 3.0 },
  ],
})
```

---

## Firestore Collection Path

সব data এই collection-এ যাবে:
```
civilos_bridge/{projectId}_{sourceApp}
```

উদাহরণ:
```
civilos_bridge/abc123_structural
civilos_bridge/abc123_estimate
civilos_bridge/abc123_project-management
civilos_bridge/abc123_architectural
```

---

## Real-time Sync

Reports App automatically listen করে। যখনই কোনো app data push করবে,
Reports App-এর Bridge page **তৎক্ষণাৎ** আপডেট হবে।

No API needed. No webhook needed. শুধু Firestore write।
