# CivilOS Reports — Phase 5: Ecosystem Automation Bridge

## নতুন ফাইল (GitHub-এ ADD করো) — ৬টি

```
src/bridge/bridgeTypes.ts
src/bridge/bridgeService.ts
src/bridge/autoGenEngine.ts
src/store/useBridgeStore.ts
src/pages/BridgePage.tsx
INTEGRATION_GUIDE.md
```

## পুরানো ফাইল (EDIT করো) — ২টি

```
src/App.tsx                        ← /bridge route যোগ
src/components/layout/AppLayout.tsx ← Ecosystem nav item যোগ
```

## Firestore Rules আপডেট করো

Firebase Console → Firestore → Rules-এ `firestore.rules` ফাইলের content paste করো।

---

## Phase 5 Architecture

```
CivilOS Structural ──┐
CivilOS Estimate   ──┼──→ Firestore (civilos_bridge) ──→ Reports App
CivilOS Design     ──┤         ↑ real-time listener
CivilOS PM         ──┘

Reports App:
  Bridge Service → Auto-Gen Engine → Reports + Packages
```

---

## Features

| Feature | Details |
|---------|---------|
| **Bridge Types** | 4 source apps-এর সম্পূর্ণ data contract |
| **Real-time Listener** | Firestore onSnapshot — instant sync |
| **Auto-Gen Engine** | Ecosystem data → 7 report types compile করে |
| **Automation Level** | 4 app connectivity থেকে % calculate |
| **Demo Seed** | Test করার জন্য সম্পূর্ণ sample data |
| **Save to Reports** | Auto-generated content → Firestore reports |
| **Preview** | Generated report content inline দেখা যায় |
| **Flow Diagram** | Live connection status দেখায় |

---

## Automation Level Calculation

| App Connected | Contribution |
|---------------|-------------|
| Structural | 30% |
| Estimate | 25% |
| Project Mgmt | 25% |
| Architectural | 20% |
| **All 4** | **100%** |

---

## Integration

অন্য CivilOS apps কীভাবে data push করবে সেটা `INTEGRATION_GUIDE.md`-এ আছে।
শুধু একটা Firestore `setDoc` call — কোনো API বা webhook দরকার নেই।
