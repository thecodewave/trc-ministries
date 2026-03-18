// ============================================================
// TRC Ministries — Admin Dashboard
// admin/Dashboard/Dashboard.jsx
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllMembers } from '../../services/memberService'
import { getAllServices, getAttendanceForService } from '../../services/attendanceService'
import { runBirthdayScheduler } from '../../services/birthdayWhatsAppService'
import './Dashboard.css'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTodayDate() {
  return new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function isBirthdayThisWeek(dob) {
  if (!dob) return false
  const today = new Date()
  const birth = new Date(dob)
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  const diff = Math.round((next - today) / (1000 * 60 * 60 * 24))
  return diff <= 7
}

function Dashboard() {
  const { displayName }  = useAuth()
  const [members,        setMembers]        = useState([])
  const [services,       setServices]       = useState([])
  const [todayAttAll,    setTodayAttAll]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const midnightRef = useRef(null)

  // ── Midnight birthday scheduler ───────────────────────────
  // Runs once on mount (catches up if page was open at midnight),
  // then schedules itself to fire again exactly at next midnight.
  useEffect(() => {
    function scheduleAtMidnight(memberList) {
      const now  = new Date()
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) // 00:00:05 tomorrow
      const msUntilMidnight = next - now

      midnightRef.current = setTimeout(async () => {
        try { await runBirthdayScheduler(memberList) } catch (_) {}
        scheduleAtMidnight(memberList)   // reschedule for next midnight
      }, msUntilMidnight)
    }

    // Run immediately on mount (handles today's birthdays if not yet sent)
    getAllMembers().then((m) => {
      runBirthdayScheduler(m).catch(() => {})
      scheduleAtMidnight(m)
    }).catch(() => {})

    return () => clearTimeout(midnightRef.current)
  }, [])

  useEffect(() => {
    Promise.all([getAllMembers(), getAllServices()])
      .then(async ([m, s]) => {
        setMembers(m)
        setServices(s)

        // Get all services that happened today
        const todayStr    = getTodayISO()
        const todaySvcs   = s.filter((svc) => svc.date === todayStr)

        if (todaySvcs.length > 0) {
          // Fetch attendance for all today's services in parallel
          const attArrays = await Promise.all(todaySvcs.map((svc) => getAttendanceForService(svc.id)))
          // Deduplicate by memberId — a person who attended multiple services counts once
          const seen     = new Set()
          const combined = []
          attArrays.flat().forEach((a) => {
            if (!seen.has(a.memberId)) {
              seen.add(a.memberId)
              combined.push(a)
            }
          })
          setTodayAttAll(combined)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const activeMembers  = members.filter((m) => m.isActive !== false)
  const birthdaysWeek  = members.filter((m) => isBirthdayThisWeek(m.dob))

  // Today's services for the topbar tag
  const todayStr      = getTodayISO()
  const todaySvcs     = services.filter((s) => s.date === todayStr)
  const serviceTagLabel = todaySvcs.length === 0
    ? null
    : todaySvcs.length === 1
      ? todaySvcs[0].name
      : `${todaySvcs.length} services today`

  // Only compute check-in / absent data if a service exists today
  const checkedInIds  = new Set(todayAttAll.map((a) => a.memberId))
  const absentees     = todaySvcs.length > 0
    ? activeMembers.filter((m) => !checkedInIds.has(m.id))
    : []

  const STATS = [
    { label:'Total members',      value: loading ? '...' : members.length.toString(),                              mod:'default' },
    { label:"Today's check-ins",  value: loading ? '...' : todaySvcs.length > 0 ? todayAttAll.length.toString() : '—',  mod:'teal'    },
    { label:'Absent',             value: loading ? '...' : todaySvcs.length > 0 ? absentees.length.toString()    : '—',  mod:'rose'    },
  ]

  const AV_MODS = ['brand','teal','rose','gold']
  function avMod(id) { return AV_MODS[(id || '').charCodeAt(0) % AV_MODS.length] }
  function initials(f='',l='') { return `${f[0]||''}${l[0]||''}`.toUpperCase() }

  return (
    <div className="dashboard">
      <div className="dashboard__topbar">
        <div>
          <h1 className="dashboard__greeting">{getGreeting()}, {displayName}</h1>
          <p className="dashboard__date">{getTodayDate()}</p>
        </div>
        {serviceTagLabel && (
          <div className="dashboard__service-tag-wrap">
            <span className="dashboard__service-tag">{serviceTagLabel}</span>
            {todaySvcs.length > 1 && (
              <span className="dashboard__service-tag-sub">{todayAttAll.length} unique attendees combined</span>
            )}
          </div>
        )}
      </div>

      <div className="dashboard__content">
        <div className="dashboard__stats">
          {STATS.map(({ label, value, mod }) => (
            <div key={label} className={`dashboard__stat dashboard__stat--${mod}`}>
              <p className="dashboard__stat-label">{label}</p>
              <p className={`dashboard__stat-value dashboard__stat-value--${mod}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="dashboard__bottom-grid">
          <div className="dashboard__bottom-card">
            <p className="dashboard__bottom-card-title">Absent — need follow up</p>
            {loading ? (
              <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>Loading...</p>
            ) : absentees.length === 0 && todaySvcs.length > 0 ? (
              <p style={{fontSize:'13px',color:'var(--color-teal)'}}>Everyone attended today! 🎉</p>
            ) : todaySvcs.length === 0 ? (
              <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>No service opened today yet.</p>
            ) : absentees.slice(0, 5).map((m) => (
              <div key={m.id} className="dashboard__absent-row">
                <div className={`dashboard__absent-av dashboard__absent-av--${avMod(m.id)}`}>{initials(m.firstName, m.lastName)}</div>
                <div className="dashboard__absent-info">
                  <p className="dashboard__absent-name">{m.firstName} {m.lastName}</p>
                  <p className="dashboard__absent-group">{m.group || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard__bottom-card">
            <p className="dashboard__bottom-card-title">Birthdays this week</p>
            {loading ? (
              <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>Loading...</p>
            ) : birthdaysWeek.length === 0 ? (
              <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>No birthdays this week.</p>
            ) : birthdaysWeek.map((m) => (
              <div key={m.id} className="dashboard__bday-row">
                <div className={`dashboard__bday-av dashboard__bday-av--${avMod(m.id)}`}>{initials(m.firstName, m.lastName)}</div>
                <p className="dashboard__bday-name">{m.firstName} {m.lastName}</p>
                <p className="dashboard__bday-date">{m.dob ? new Date(m.dob).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
