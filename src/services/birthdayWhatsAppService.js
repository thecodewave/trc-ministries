// ============================================================
// TRC Ministries — Birthday WhatsApp Scheduler
// services/birthdayWhatsAppService.js
//
// Sends WhatsApp messages at midnight on each member's birthday.
// Uses the WhatsApp Business Cloud API (Meta).
//
// Setup:
//   1. Go to developers.facebook.com → create a Meta App
//   2. Add WhatsApp product → get Phone Number ID + Access Token
//   3. Add to .env.local:
//        VITE_WHATSAPP_TOKEN=your_access_token
//        VITE_WHATSAPP_PHONE_ID=your_phone_number_id
//   4. In Firestore, the scheduler writes to 'birthday_logs' collection
//      to prevent duplicate sends.
// ============================================================

import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const WA_TOKEN    = import.meta.env.VITE_WHATSAPP_TOKEN
const WA_PHONE_ID = import.meta.env.VITE_WHATSAPP_PHONE_ID

// Format phone to E.164 — Ghanaian numbers: 024xxxxxxx → +23324xxxxxxx
export function toE164(phone) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('233')) return `+${digits}`
  if (digits.startsWith('0'))   return `+233${digits.slice(1)}`
  return `+233${digits}`
}

// Check if we already sent a birthday message to this member this year
async function alreadySentThisYear(memberId) {
  const year = new Date().getFullYear().toString()
  const q = query(
    collection(db, 'birthday_logs'),
    where('memberId', '==', memberId),
    where('year', '==', year)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

// Log a successful send so we don't double-send
async function logBirthdaySend(memberId, memberName, phone) {
  await addDoc(collection(db, 'birthday_logs'), {
    memberId,
    memberName,
    phone,
    year: new Date().getFullYear().toString(),
    sentAt: serverTimestamp(),
  })
}

// Send a single WhatsApp birthday message
export async function sendBirthdayWhatsApp(member) {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    throw new Error('WhatsApp API keys not configured. Add VITE_WHATSAPP_TOKEN and VITE_WHATSAPP_PHONE_ID to .env.local')
  }
  if (!member.phone) throw new Error(`No phone number for ${member.firstName}`)

  const to = toE164(member.phone)

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body:
        `🎂 Happy Birthday, ${member.firstName}! 🎉\n\n` +
        `On behalf of everyone at TRC Ministries, we celebrate you today and pray that this new year of your life is filled with God's richest blessings, good health, and overflowing joy.\n\n` +
        `We thank God for your life and your faithfulness to the house. May the Lord honour you greatly! 🙏\n\n` +
        `— The TRC Ministries Family`,
    },
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `WhatsApp API error ${res.status}`)
  }

  return res.json()
}

// ── Main scheduler ──────────────────────────────────────────
// Call this once when the admin dashboard mounts.
// It checks if today has any birthdays, fires messages for any
// not yet sent this year, and does nothing otherwise.
export async function runBirthdayScheduler(members) {
  const today = new Date()
  const todayMonth = today.getMonth()
  const todayDay   = today.getDate()

  const birthdayMembers = members.filter((m) => {
    if (!m.dob || !m.phone || m.isActive === false) return false
    const d = new Date(m.dob)
    return d.getMonth() === todayMonth && d.getDate() === todayDay
  })

  if (birthdayMembers.length === 0) return { sent: 0, skipped: 0, errors: [] }

  const results = { sent: 0, skipped: 0, errors: [] }

  for (const member of birthdayMembers) {
    try {
      const alreadySent = await alreadySentThisYear(member.id)
      if (alreadySent) { results.skipped++; continue }

      await sendBirthdayWhatsApp(member)
      await logBirthdaySend(member.id, `${member.firstName} ${member.lastName}`, member.phone)
      results.sent++
    } catch (err) {
      results.errors.push({ member: member.firstName, error: err.message })
    }
  }

  return results
}
