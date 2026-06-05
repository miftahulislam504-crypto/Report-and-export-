# CivilOS Reports & Export

Professional Engineering Documentation Platform for Bangladesh (BNBC 2020)

## Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS
- Zustand (State)
- Firebase (Auth + Firestore + Storage)
- Vercel (Hosting)

## GitHub File Structure

```
civilos-reports/
├── package.json                              ← root
├── vite.config.ts                            ← root
├── tsconfig.json                             ← root
├── tsconfig.node.json                        ← root
├── tailwind.config.ts                        ← root
├── postcss.config.js                         ← root
├── vercel.json                               ← root
├── index.html                               ← root
├── .gitignore                               ← root
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── firebase/
    │   ├── config.ts
    │   └── firestore.ts
    ├── lib/
    │   ├── types.ts
    │   └── utils.ts
    ├── store/
    │   ├── useAuthStore.ts
    │   ├── useProjectStore.ts
    │   └── useReportStore.ts
    ├── components/
    │   └── layout/
    │       └── AppLayout.tsx
    └── pages/
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── ProjectsPage.tsx
        ├── ReportsPage.tsx
        └── PlaceholderPages.tsx
```

## Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Phases

| Phase | Module | Status |
|-------|--------|--------|
| 0 | Foundation & Firebase | ✅ Done |
| 1 | Dashboard + Projects + Reports | ✅ Done |
| 2 | Template Engine (Handlebars) | 🔜 Next |
| 3 | Report Generation Engines | 🔜 |
| 4 | Package Builder | 🔜 |
| 5 | Export & Automation Bridge | 🔜 |

## Development

```bash
npm install
npm run dev
```
