// ============================================================
// TRC Ministries — Member Service
// services/memberService.js
// All Firestore operations for the members collection
// ============================================================

import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const COL = 'members'

export async function getAllMembers() {
  const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getMemberById(id) {
  const snap = await getDoc(doc(db, COL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateMember(id, data) {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() })
}

export async function archiveMember(id) {
  await updateDoc(doc(db, COL, id), { isActive: false, updatedAt: serverTimestamp() })
}

export async function getMemberByPhone(phone) {
  const q = query(collection(db, COL), where('phone', '==', phone))
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}
