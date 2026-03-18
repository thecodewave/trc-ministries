import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'sermons'

// Uses only where() — no compound index needed
export async function getPublishedSermons() {
  const snap = await getDocs(
    query(collection(db, COL), where('isPublished', '==', true))
  )
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  // Sort client-side by date desc
  return docs.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

export async function getAllSermons() {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function addSermon(data) {
  return await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() })
}

export async function updateSermon(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteSermon(id) {
  await deleteDoc(doc(db, COL, id))
}
