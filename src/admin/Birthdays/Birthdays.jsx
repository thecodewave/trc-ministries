// ============================================================
// TRC Ministries — Admin Birthdays
// admin/Birthdays/Birthdays.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllMembers } from '../../services/memberService'
import { runBirthdayScheduler, sendBirthdayWhatsApp } from '../../services/birthdayWhatsAppService'
import './Birthdays.css'

function getAge(dob) {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function isBirthdayToday(dob) {
  if (!dob) return false
  const d = new Date(dob)
  const t = new Date()
  return d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

function isBirthdayThisWeek(dob) {
  if (!dob) return false
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    const bd = new Date(dob)
    if (bd.getMonth() === d.getMonth() && bd.getDate() === d.getDate()) return true
  }
  return false
}

function isBirthdayThisMonth(dob) {
  if (!dob) return false
  return new Date(dob).getMonth() === new Date().getMonth()
}

function formatBirthday(dob) {
  if (!dob) return '—'
  return new Date(dob).toLocaleDateString('en-GB', { day:'numeric', month:'long' })
}

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
}

const AV_MODS = ['brand', 'teal', 'rose', 'gold', 'purple']

function Birthdays() {
  const [members,       setMembers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState('week')
  const [schedulerLog,  setSchedulerLog]  = useState(null)   // result from auto-run
  const [sending,       setSending]       = useState(null)   // memberId being manually sent
  const [sendResults,   setSendResults]   = useState({})     // memberId -> 'sent' | 'error'
  const [waConfigured,  setWaConfigured]  = useState(false)

  useEffect(() => {
    // Check if WhatsApp is configured
    setWaConfigured(
      !!(import.meta.env.VITE_WHATSAPP_TOKEN && import.meta.env.VITE_WHATSAPP_PHONE_ID)
    )

    getAllMembers()
      .then(async (all) => {
        const withDob = all.filter((m) => m.dob)
        setMembers(withDob)

        // Auto-run scheduler for today's birthdays
        try {
          const result = await runBirthdayScheduler(withDob)
          if (result.sent > 0 || result.errors.length > 0) {
            setSchedulerLog(result)
          }
        } catch (e) {
          // Silently ignore if WA not configured — show banner instead
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleManualSend(member) {
    setSending(member.id)
    try {
      await sendBirthdayWhatsApp(member)
      setSendResults((p) => ({ ...p, [member.id]: 'sent' }))
    } catch (err) {
      setSendResults((p) => ({ ...p, [member.id]: 'error' }))
    } finally {
      setSending(null)
    }
  }

  const today     = members.filter((m) => isBirthdayToday(m.dob))
  const thisWeek  = members.filter((m) => isBirthdayThisWeek(m.dob) && !isBirthdayToday(m.dob))
  const thisMonth = members.filter((m) => isBirthdayThisMonth(m.dob) && !isBirthdayThisWeek(m.dob))

  const tabMembers = tab === 'week'
    ? [...today, ...thisWeek]
    : tab === 'month'
    ? [...today, ...thisWeek, ...thisMonth]
    : [...members].sort((a, b) => new Date(a.dob).getMonth() - new Date(b.dob).getMonth() || new Date(a.dob).getDate() - new Date(b.dob).getDate())

  return (
    <div className="birthdays">
      <div className="birthdays__topbar">
        <div>
          <h1 className="birthdays__title">Birthdays</h1>
          <p className="birthdays__sub">Auto-calculated from member date of birth</p>
        </div>
      </div>

      <div className="birthdays__content">

        {/* WhatsApp config banner */}
        {!waConfigured && (
          <div className="birthdays__wa-banner">
            <span className="birthdays__wa-banner-icon">💬</span>
            <div>
              <p className="birthdays__wa-banner-title">WhatsApp birthday messages not active</p>
              <p className="birthdays__wa-banner-sub">
                Add <code>VITE_WHATSAPP_TOKEN</code> and <code>VITE_WHATSAPP_PHONE_ID</code> to your
                <code>.env.local</code> file to enable automatic midnight birthday messages via the WhatsApp Business API.
              </p>
            </div>
          </div>
        )}

        {/* Scheduler auto-run result */}
        {schedulerLog && (
          <div className={`birthdays__scheduler-log ${schedulerLog.errors.length > 0 ? 'birthdays__scheduler-log--warn' : 'birthdays__scheduler-log--ok'}`}>
            <p className="birthdays__scheduler-log-title">
              {schedulerLog.sent > 0 ? `✓ Sent ${schedulerLog.sent} birthday message${schedulerLog.sent !== 1 ? 's' : ''} automatically` : ''}
              {schedulerLog.skipped > 0 ? ` · ${schedulerLog.skipped} already sent today` : ''}
            </p>
            {schedulerLog.errors.map((e, i) => (
              <p key={i} className="birthdays__scheduler-log-err">⚠ {e.member}: {e.error}</p>
            ))}
          </div>
        )}

        <div className="birthdays__stats">
          <div className="birthdays__stat birthdays__stat--gold">
            <p className="birthdays__stat-label">Today</p>
            <p className="birthdays__stat-value">{today.length}</p>
          </div>
          <div className="birthdays__stat birthdays__stat--brand">
            <p className="birthdays__stat-label">This week</p>
            <p className="birthdays__stat-value">{today.length + thisWeek.length}</p>
          </div>
          <div className="birthdays__stat birthdays__stat--default">
            <p className="birthdays__stat-label">This month</p>
            <p className="birthdays__stat-value">{today.length + thisWeek.length + thisMonth.length}</p>
          </div>
        </div>

        <div className="birthdays__tabs">
          {[['week','This week'],['month','This month'],['all','All birthdays']].map(([key, label]) => (
            <button key={key} className={`birthdays__tab ${tab === key ? 'birthdays__tab--active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="birthdays__loading"><div className="birthdays__spinner" /><p>Loading...</p></div>
        ) : tabMembers.length === 0 ? (
          <div className="birthdays__empty">
            <p>No birthdays {tab === 'week' ? 'this week' : tab === 'month' ? 'this month' : 'found'}.</p>
            <p className="birthdays__empty-hint">Make sure members fill in their date of birth when registering.</p>
          </div>
        ) : (
          <div className="birthdays__list">
            {tabMembers.map((m, i) => {
              const isToday   = isBirthdayToday(m.dob)
              const sentState = sendResults[m.id]
              return (
                <div key={m.id} className={`birthdays__card ${isToday ? 'birthdays__card--today' : ''}`}>
                  <div className={`birthdays__av birthdays__av--${AV_MODS[i % AV_MODS.length]}`}>
                    {getInitials(m.firstName, m.lastName)}
                  </div>
                  <div className="birthdays__info">
                    <p className="birthdays__name">
                      {m.firstName} {m.lastName}
                      {isToday && <span className="birthdays__today-badge">Today! 🎂</span>}
                    </p>
                    <p className="birthdays__detail">{formatBirthday(m.dob)} · {getAge(m.dob)} years old · {m.group || '—'}</p>
                  </div>
                  <div className="birthdays__actions">
                    <a href={`tel:${m.phone}`} className="birthdays__call-btn">Call</a>
                    {waConfigured && (
                      sentState === 'sent' ? (
                        <span className="birthdays__wa-sent">WhatsApp ✓</span>
                      ) : sentState === 'error' ? (
                        <span className="birthdays__wa-error">Failed</span>
                      ) : (
                        <button
                          className="birthdays__wa-btn"
                          onClick={() => handleManualSend(m)}
                          disabled={sending === m.id}
                        >
                          {sending === m.id ? 'Sending…' : 'Send WhatsApp'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default Birthdays
