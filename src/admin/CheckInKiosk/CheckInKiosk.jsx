// ============================================================
// TRC Ministries — Sunday Check-In Kiosk
// admin/CheckInKiosk/CheckInKiosk.jsx
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { getAllMembers } from '../../services/memberService'
import { getAllServices, checkInMember } from '../../services/attendanceService'
import './CheckInKiosk.css'

const GROUPS  = ['Youth Ministry', "Women's Fellowship", "Men's Fellowship", 'Praise & Worship Team', "Children's Ministry", 'Prayer & Intercession']
const INIT_GUEST = { firstName:'', lastName:'', phone:'', gender:'', group:'' }

function CheckInKiosk() {
  const [members,    setMembers]    = useState([])
  const [services,   setServices]   = useState([])
  const [search,     setSearch]     = useState('')
  const [results,    setResults]    = useState([])
  const [status,     setStatus]     = useState('idle')    // idle | success | duplicate | no_service | guest_form | guest_success
  const [checkedIn,  setCheckedIn]  = useState(null)
  const [todayCount, setTodayCount] = useState(0)
  const [loading,    setLoading]    = useState(true)
  // Guest registration form
  const [guestForm,  setGuestForm]  = useState(INIT_GUEST)
  const [guestErr,   setGuestErr]   = useState('')
  const [saving,     setSaving]     = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    Promise.all([getAllMembers(), getAllServices()])
      .then(([m, s]) => { setMembers(m); setServices(s) })
      .catch(console.error)
      .finally(() => {
        setLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      })
  }, [])

  // Live phone search — triggers after 3 digits
  useEffect(() => {
    const q = search.replace(/\s/g, '')
    if (q.length < 3) { setResults([]); return }
    setResults(
      members
        .filter((m) => m.phone?.replace(/\s/g, '').includes(q) && m.isActive !== false)
        .slice(0, 5)
    )
  }, [search, members])

  async function handleCheckIn(member) {
    const activeService = services.find((s) => !s.ended) || services[0]
    if (!activeService) { setStatus('no_service'); setTimeout(() => { setStatus('idle'); inputRef.current?.focus() }, 4000); return }

    const result = await checkInMember(activeService.id, member.id, null)
    setCheckedIn(member)
    setSearch('')
    setResults([])

    if (result.reason === 'already_checked_in') {
      setStatus('duplicate')
    } else {
      setStatus('success')
      setTodayCount((c) => c + 1)
    }

    setTimeout(() => { setStatus('idle'); setCheckedIn(null); inputRef.current?.focus() }, 3500)
  }

  function handleShowGuestForm() {
    // Pre-fill phone from current search if it looks like a number
    const phoneGuess = search.replace(/\s/g, '').length >= 9 ? search.trim() : ''
    setGuestForm({ ...INIT_GUEST, phone: phoneGuess })
    setGuestErr('')
    setStatus('guest_form')
  }

  function handleGuestChange(e) {
    setGuestForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleGuestSubmit(e) {
    e.preventDefault()
    if (!guestForm.firstName.trim() || !guestForm.lastName.trim() || !guestForm.phone.trim()) {
      setGuestErr('Please fill in your first name, last name, and phone number.')
      return
    }
    if (guestForm.phone.replace(/\D/g,'').length < 9) {
      setGuestErr('Please enter a valid phone number.')
      return
    }
    setSaving(true)
    setGuestErr('')
    try {
      // Check if phone already registered
      const q = query(collection(db, 'members'), where('phone', '==', guestForm.phone.trim()))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setGuestErr('This phone number is already registered. Please search for your number above.')
        setSaving(false)
        return
      }
      // Register as new member
      const ref = await addDoc(collection(db, 'members'), {
        firstName: guestForm.firstName.trim(),
        lastName:  guestForm.lastName.trim(),
        phone:     guestForm.phone.trim(),
        gender:    guestForm.gender,
        group:     guestForm.group,
        isActive:  true,
        joinDate:  new Date().toISOString().split('T')[0],
        howFound:  'Kiosk walk-in',
        createdAt: serverTimestamp(),
      })
      const newMember = {
        id: ref.id,
        firstName: guestForm.firstName.trim(),
        lastName:  guestForm.lastName.trim(),
        phone:     guestForm.phone.trim(),
        group:     guestForm.group,
      }
      // Add to local members list
      setMembers((prev) => [...prev, newMember])
      // Immediately check them in
      await handleCheckIn(newMember)
      setGuestForm(INIT_GUEST)
    } catch (err) {
      setGuestErr('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const activeService = services.find((s) => !s.ended) || services[0]
  const noMatch = status === 'idle' && search.replace(/\s/g,'').length >= 3 && results.length === 0

  if (!loading && !activeService) {
    return (
      <div className="kiosk">
        <div className="kiosk__no-service">
          <img src="/trc-logo-full.png" alt="TRC" className="kiosk__no-service-logo" />
          <h2 className="kiosk__no-service-title">Check-in not open yet</h2>
          <p className="kiosk__no-service-sub">An admin needs to open today's service before check-in is available.</p>
          <Link to="/admin/checkin" className="kiosk__no-service-btn">Admin → Open service</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="kiosk">
        <div className="kiosk__loading">
          <img src="/trc-logo-full.png" alt="TRC" className="kiosk__loading-logo" />
          <div className="kiosk__loading-dots">
            {[0,1,2].map((i) => <span key={i} className="kiosk__loading-dot" style={{ animationDelay:`${i * 0.2}s` }} />)}
          </div>
        </div>
      </div>
    )
  }

  // ── Guest registration screen ──────────────────────────────
  if (status === 'guest_form') {
    return (
      <div className="kiosk">
        <div className="kiosk__inner kiosk__inner--wide">
          <div className="kiosk__header">
            <img src="/trc-logo-full.png" alt="TRC Ministries" className="kiosk__logo" />
            <h1 className="kiosk__title">Welcome to TRC Ministries!</h1>
            <p className="kiosk__instruction">Looks like you're new here. Fill in your details to get registered and checked in.</p>
          </div>

          <form className="kiosk__guest-form" onSubmit={handleGuestSubmit}>
            <div className="kiosk__guest-row">
              <div className="kiosk__guest-field">
                <label className="kiosk__guest-label">First name *</label>
                <input className="kiosk__guest-input" name="firstName" value={guestForm.firstName} onChange={handleGuestChange} placeholder="John" autoFocus required />
              </div>
              <div className="kiosk__guest-field">
                <label className="kiosk__guest-label">Last name *</label>
                <input className="kiosk__guest-input" name="lastName" value={guestForm.lastName} onChange={handleGuestChange} placeholder="Mensah" required />
              </div>
            </div>

            <div className="kiosk__guest-field">
              <label className="kiosk__guest-label">Phone number *</label>
              <input className="kiosk__guest-input" name="phone" type="tel" value={guestForm.phone} onChange={handleGuestChange} placeholder="024 456 7890" required />
            </div>

            <div className="kiosk__guest-row">
              <div className="kiosk__guest-field">
                <label className="kiosk__guest-label">Gender</label>
                <select className="kiosk__guest-select" name="gender" value={guestForm.gender} onChange={handleGuestChange}>
                  <option value="">— select —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="kiosk__guest-field">
                <label className="kiosk__guest-label">Ministry group</label>
                <select className="kiosk__guest-select" name="group" value={guestForm.group} onChange={handleGuestChange}>
                  <option value="">— select —</option>
                  {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {guestErr && <p className="kiosk__guest-err">{guestErr}</p>}

            <div className="kiosk__guest-btns">
              <button type="button" className="kiosk__guest-back" onClick={() => { setStatus('idle'); setSearch(''); setTimeout(() => inputRef.current?.focus(), 50) }}>
                ← Back
              </button>
              <button type="submit" className="kiosk__guest-submit" disabled={saving}>
                {saving ? 'Registering…' : 'Register &amp; Check In →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ── Main kiosk screen ──────────────────────────────────────
  return (
    <div className="kiosk" onClick={() => inputRef.current?.focus()}>
      <Link to="/admin/checkin" className="kiosk__admin-link">← Admin</Link>

      <div className="kiosk__inner">
        <div className="kiosk__header">
          <img src="/trc-logo-full.png" alt="TRC Ministries" className="kiosk__logo" />
          <h1 className="kiosk__title">Welcome to TRC Ministries</h1>
          {activeService && <p className="kiosk__service">{activeService.name}</p>}
          <p className="kiosk__instruction">Type your phone number to check in</p>
        </div>

        <div className="kiosk__input-card">
          <input
            ref={inputRef}
            className="kiosk__input"
            type="tel"
            placeholder="024 456 7890"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          {search && (
            <button className="kiosk__clear-btn" onClick={(e) => { e.stopPropagation(); setSearch(''); setResults([]); inputRef.current?.focus() }}>✕</button>
          )}
        </div>

        {status === 'success' && checkedIn && (
          <div className="kiosk__feedback kiosk__feedback--success">
            <div className="kiosk__tick-wrap"><div className="kiosk__tick" /></div>
            <div>
              <p className="kiosk__feedback-name">Welcome, {checkedIn.firstName} {checkedIn.lastName}! 🙌</p>
              <p className="kiosk__feedback-sub">Checked in at {new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}{checkedIn.group ? ` · ${checkedIn.group}` : ''}</p>
            </div>
          </div>
        )}

        {status === 'duplicate' && checkedIn && (
          <div className="kiosk__feedback kiosk__feedback--duplicate">
            <span className="kiosk__feedback-emoji">👋</span>
            <div>
              <p className="kiosk__feedback-name">{checkedIn.firstName}, you're already checked in today!</p>
              <p className="kiosk__feedback-sub">God bless you — enjoy the service.</p>
            </div>
          </div>
        )}

        {status === 'no_service' && (
          <div className="kiosk__feedback kiosk__feedback--error">
            <span className="kiosk__feedback-emoji">⚠</span>
            <p className="kiosk__feedback-name">No service is open yet. Please ask an admin to open today's service.</p>
          </div>
        )}

        {status === 'idle' && results.length > 0 && (
          <div className="kiosk__results">
            {results.map((m) => (
              <button key={m.id} className="kiosk__result" onClick={(e) => { e.stopPropagation(); handleCheckIn(m) }}>
                <div className="kiosk__result-av">{(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}</div>
                <div className="kiosk__result-info">
                  <p className="kiosk__result-name">{m.firstName} {m.lastName}</p>
                  <p className="kiosk__result-group">{m.group || '—'} · {m.phone}</p>
                </div>
                <span className="kiosk__result-cta">Tap to check in →</span>
              </button>
            ))}
          </div>
        )}

        {/* No match — show register prompt */}
        {noMatch && (
          <div className="kiosk__not-found-card">
            <p className="kiosk__not-found-title">No member found for this number</p>
            <p className="kiosk__not-found-sub">First time here? Register in seconds and we'll check you in straight away.</p>
            <button className="kiosk__register-btn" onClick={(e) => { e.stopPropagation(); handleShowGuestForm() }}>
              Register as a new member →
            </button>
          </div>
        )}

        <div className="kiosk__footer">
          <span className="kiosk__footer-count">{todayCount > 0 ? `${todayCount} checked in this session` : 'Ready for check-in'}</span>
          <span className="kiosk__footer-dot">·</span>
          <span className="kiosk__footer-address">The Olive Place · 6 Garden Link, East Legon</span>
        </div>
      </div>
    </div>
  )
}

export default CheckInKiosk
