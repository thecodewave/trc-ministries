import {
  collection, addDoc, query,
  where, orderBy, getDocs, serverTimestamp,
  doc, updateDoc
} from 'firebase/firestore'
import { db } from './firebase'

export async function createService(name, date) {
  const ref = await addDoc(collection(db, 'services'), { name, date, createdAt: serverTimestamp(), ended: false })
  return ref.id
}

export async function endService(serviceId) {
  await updateDoc(doc(db, 'services', serviceId), { ended: true, endedAt: serverTimestamp() })
}

export async function getAllServices() {
  const q = query(collection(db, 'services'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function checkInMember(serviceId, memberId, checkedInBy) {
  const q = query(collection(db, 'attendance'), where('serviceId', '==', serviceId), where('memberId', '==', memberId))
  const existing = await getDocs(q)
  if (!existing.empty) return { success: false, reason: 'already_checked_in' }
  await addDoc(collection(db, 'attendance'), { serviceId, memberId, checkedInBy, checkedInAt: serverTimestamp() })
  return { success: true }
}

export async function getAttendanceForService(serviceId) {
  const q = query(collection(db, 'attendance'), where('serviceId', '==', serviceId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getAttendanceForMember(memberId) {
  const q = query(collection(db, 'attendance'), where('memberId', '==', memberId), orderBy('checkedInAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function markFollowUp(memberId, serviceId, note, followedUpBy) {
  await addDoc(collection(db, 'follow-ups'), { memberId, serviceId, note, followedUpBy, followedUpAt: serverTimestamp() })
}

export async function getFollowUpsForService(serviceId) {
  const q = query(collection(db, 'follow-ups'), where('serviceId', '==', serviceId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
