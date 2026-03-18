// ============================================================
// TRC Ministries — Staff Management (Super Admin only)
// admin/StaffManagement/StaffManagement.jsx
//
// Staff accounts are created directly in Firebase Console.
// This page manages roles in Firestore and shows all staff.
// Creating via code logs out the current admin — so we
// direct the super admin to Firebase Console for account
// creation, then assign the role here.
// ============================================================

import { useState, useEffect } from 'react'
import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import './StaffManagement.css'

const ROLE_LABELS = { superAdmin: 'Super Admin', staffAdmin: 'Staff Admin' }
const ROLE_DESC   = {
  superAdmin: 'Full access including staff management',
  staffAdmin: 'Members, attendance, sermons, events, birthdays, messages',
}

function StaffManagement() {
  const { currentUser }    = useAuth()
  const [staff,    setStaff]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ uid: '', displayName: '', email: '', role: 'staffAdmin' })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  async function load() {
    const snap = await getDocs(collection(db, 'users'))
    setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load().catch(console.error) }, [])

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  // Add staff by their UID (after they are created in Firebase Console)
  async function handleAddStaff(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    if (!form.uid.trim()) { setError('UID is required.'); setSaving(false); return }
    try {
      // Use setDoc with UID as document ID — this is what AuthContext looks up
      await setDoc(doc(db, 'users', form.uid.trim()), {
        uid:         form.uid.trim(),
        email:       form.email.trim(),
        displayName: form.displayName.trim(),
        role:        form.role,
        createdAt:   serverTimestamp(),
      })
      setSuccess(`${form.displayName} added successfully. They can now log in.`)
      setForm({ uid: '', displayName: '', email: '', role: 'staffAdmin' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err.message || 'Failed to add staff.')
    }
    setSaving(false)
  }

  async function handleRemove(member) {
    if (member.id === currentUser?.uid) { alert('You cannot remove your own account.'); return }
    if (!window.confirm(`Remove ${member.displayName || member.email} from staff?`)) return
    await deleteDoc(doc(db, 'users', member.id))
    setStaff((prev) => prev.filter((s) => s.id !== member.id))
  }

  return (
    <div className="staff-mgmt">
      <div className="staff-mgmt__topbar">
        <div>
          <h1 className="staff-mgmt__title">Staff Management</h1>
          <p className="staff-mgmt__sub">Super Admin only · {staff.length} admin accounts</p>
        </div>
        <button className="staff-mgmt__btn-primary" onClick={() => { setShowForm((p) => !p); setError(''); setSuccess('') }}>
          {showForm ? 'Cancel' : '+ Add staff account'}
        </button>
      </div>

      <div className="staff-mgmt__content">

        {/* ── How to add staff ── */}
        <div className="staff-mgmt__how-card">
          <p className="staff-mgmt__how-title">📋 How to add a new staff account</p>
          <div className="staff-mgmt__how-steps">
            <div className="staff-mgmt__how-step">
              <span className="staff-mgmt__how-num">1</span>
              <div>
                <p className="staff-mgmt__how-step-title">Create account in Firebase Console</p>
                <p className="staff-mgmt__how-step-desc">Go to Firebase Console → Authentication → Users → Add user. Set their email and password.</p>
              </div>
            </div>
            <div className="staff-mgmt__how-step">
              <span className="staff-mgmt__how-num">2</span>
              <div>
                <p className="staff-mgmt__how-step-title">Copy their User UID</p>
                <p className="staff-mgmt__how-step-desc">After creating the user, copy the UID shown in the Users table (long string like abc123xyz...).</p>
              </div>
            </div>
            <div className="staff-mgmt__how-step">
              <span className="staff-mgmt__how-num">3</span>
              <div>
                <p className="staff-mgmt__how-step-title">Paste UID below and assign role</p>
                <p className="staff-mgmt__how-step-desc">Click "Add staff account" below, paste the UID, fill in their name and email, choose their role, and save.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Add form ── */}
        {showForm && (
          <div className="staff-mgmt__form-card">
            <p className="staff-mgmt__form-title">Add staff account</p>
            <form className="staff-mgmt__form" onSubmit={handleAddStaff}>
              <div className="staff-mgmt__form-grid">
                <div className="staff-mgmt__field">
                  <label className="staff-mgmt__label">User UID *</label>
                  <input className="staff-mgmt__input" name="uid" value={form.uid} onChange={handleChange} placeholder="Paste Firebase Auth UID here" required />
                  <p className="staff-mgmt__field-hint">Found in Firebase Console → Authentication → Users → UID column</p>
                </div>
                <div className="staff-mgmt__field">
                  <label className="staff-mgmt__label">Full name</label>
                  <input className="staff-mgmt__input" name="displayName" value={form.displayName} onChange={handleChange} placeholder="Pastor Linda Boateng" required />
                </div>
                <div className="staff-mgmt__field">
                  <label className="staff-mgmt__label">Email address</label>
                  <input className="staff-mgmt__input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="linda@trcministries.org" required />
                </div>
                <div className="staff-mgmt__field">
                  <label className="staff-mgmt__label">Role</label>
                  <select className="staff-mgmt__select" name="role" value={form.role} onChange={handleChange}>
                    <option value="staffAdmin">Staff Admin</option>
                    <option value="superAdmin">Super Admin</option>
                  </select>
                </div>
              </div>
              {error   && <p className="staff-mgmt__error">{error}</p>}
              {success && <p className="staff-mgmt__success">{success}</p>}
              <div className="staff-mgmt__form-actions">
                <button type="button" className="staff-mgmt__btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="staff-mgmt__btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add staff'}</button>
              </div>
            </form>
          </div>
        )}

        {success && !showForm && <p className="staff-mgmt__success-banner">{success}</p>}

        {/* ── Role info ── */}
        <div className="staff-mgmt__roles-info">
          <div className="staff-mgmt__role-card staff-mgmt__role-card--super">
            <p className="staff-mgmt__role-label">Super Admin</p>
            <p className="staff-mgmt__role-desc">{ROLE_DESC.superAdmin}</p>
          </div>
          <div className="staff-mgmt__role-card staff-mgmt__role-card--staff">
            <p className="staff-mgmt__role-label">Staff Admin</p>
            <p className="staff-mgmt__role-desc">{ROLE_DESC.staffAdmin}</p>
          </div>
        </div>

        {/* ── Staff list ── */}
        {loading ? (
          <div className="staff-mgmt__loading"><div className="staff-mgmt__spinner" /></div>
        ) : (
          <div className="staff-mgmt__list">
            {staff.map((s) => (
              <div key={s.id} className="staff-card">
                <div className="staff-card__av">{(s.displayName?.[0] || s.email?.[0] || 'A').toUpperCase()}</div>
                <div className="staff-card__info">
                  <p className="staff-card__name">{s.displayName || 'Unnamed'}</p>
                  <p className="staff-card__email">{s.email}</p>
                  <p className="staff-card__uid">UID: {s.id}</p>
                </div>
                <span className={`staff-card__role ${s.role === 'superAdmin' ? 'staff-card__role--super' : 'staff-card__role--staff'}`}>
                  {ROLE_LABELS[s.role] || s.role}
                </span>
                <p className="staff-card__access-desc">{ROLE_DESC[s.role] || ''}</p>
                <div className="staff-card__actions">
                  {s.id === currentUser?.uid ? (
                    <span className="staff-card__you-tag staff-card__you-tag--you">You</span>
                  ) : (
                    <button className="staff-card__remove-btn" onClick={() => handleRemove(s)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffManagement
