import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './config'

// ─── Generic CRUD ────────────────────────────────────────────────

export async function getDocument<T>(collectionName: string, id: string): Promise<T | null> {
  const ref = doc(db, collectionName, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as T
}

export async function getCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref = collection(db, collectionName)
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export async function createDocument<T extends object>(
  collectionName: string,
  data: T
): Promise<string> {
  const ref = collection(db, collectionName)
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateDocument<T extends object>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const ref = doc(db, collectionName, id)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const ref = doc(db, collectionName, id)
  await deleteDoc(ref)
}

// ─── CivilOS Collections ─────────────────────────────────────────

export const Collections = {
  PROJECTS: 'projects',
  REPORTS: 'reports',
  TEMPLATES: 'reportTemplates',
  PACKAGES: 'documentPackages',
  REVISIONS: 'revisions',
  EXPORTS: 'exports',
} as const

// ─── Query Helpers ────────────────────────────────────────────────

export { where, orderBy, serverTimestamp }
