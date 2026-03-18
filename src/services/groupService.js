import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'groups'

export async function getAllGroups() {
  const snap = await getDocs(collection(db, COL))
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (a.order || 99) - (b.order || 99))
}

export async function addGroup(data) {
  return await addDoc(collection(db, COL), { ...data, createdAt: serverTimestamp() })
}

export async function updateGroup(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteGroup(id) {
  await deleteDoc(doc(db, COL, id))
}
