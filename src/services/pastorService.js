import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'pastors'

export async function getAllPastors() {
  // Simple getDocs — no orderBy to avoid index requirement
  // Sort client-side by order field
  const snap = await getDocs(collection(db, COL))
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (a.order || 99) - (b.order || 99))
}

export async function addPastor(data) {
  return await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() })
}

export async function updatePastor(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deletePastor(id) {
  await deleteDoc(doc(db, COL, id))
}
