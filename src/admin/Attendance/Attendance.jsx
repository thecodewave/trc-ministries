// ============================================================
// TRC Ministries — Admin Attendance
// admin/Attendance/Attendance.jsx
// ============================================================

import { useState, useEffect, useMemo, useRef } from 'react'
import { getAllMembers } from '../../services/memberService'
import { getAllServices, getAttendanceForService, getFollowUpsForService, markFollowUp } from '../../services/attendanceService'
import { computeAbsenceStreaks } from '../../services/absenceStreakService'
import { useAuth } from '../../context/AuthContext'
import './Attendance.css'

// ── Tiny bar chart rendered in canvas ─────────────────────
function TrendChart({ data }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    const ctx    = canvas.getContext('2d')
    const W      = canvas.offsetWidth
    const H      = canvas.offsetHeight
    canvas.width  = W * window.devicePixelRatio
    canvas.height = H * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const max   = Math.max(...data.map((d) => d.count), 1)
    const count = data.length
    const gap   = 6
    const barW  = Math.max(8, Math.floor((W - gap * (count + 1)) / count))
    const padB  = 32   // bottom label space
    const padT  = 12

    ctx.clearRect(0, 0, W, H)

    data.forEach((d, i) => {
      const barH  = Math.round(((H - padB - padT) * d.count) / max)
      const x     = gap + i * (barW + gap)
      const y     = H - padB - barH

      // Bar
      ctx.fillStyle = d.isActive ? '#0d7a65' : '#9FE1CB'
      const r = Math.min(4, barW / 2)
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barW - r, y)
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
      ctx.lineTo(x + barW, y + barH)
      ctx.lineTo(x, y + barH)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()

      // Count label on top
      ctx.fillStyle = '#1a1a2e'
      ctx.font      = `bold ${Math.min(11, barW - 2)}px system-ui`
      ctx.textAlign = 'center'
      if (barH > 14) ctx.fillText(d.count, x + barW / 2, y - 3)

      // Date label below
      ctx.fillStyle = '#888'
      ctx.font      = `10px system-ui`
      ctx.fillText(d.label, x + barW / 2, H - 6)
    })
  }, [data])

  return <canvas ref={canvasRef} className="att-chart__canvas" />
}

function Attendance() {
  const { currentUser }           = useAuth()
  const [members,    setMembers]   = useState([])
  const [services,   setServices]  = useState([])
  const [activeId,   setActiveId]  = useState(null)
  const [checkedIn,  setCheckedIn] = useState([])
  const [followUps,  setFollowUps] = useState([])
  const [loading,    setLoading]   = useState(true)
  const [noteModal,  setNoteModal] = useState(null)
  const [note,       setNote]      = useState('')
  const [dateSearch, setDateSearch] = useState('')
  // Map of serviceId -> Set<memberId> for streak calc
  const [attMap,     setAttMap]    = useState({})
  const [attMapReady, setAttMapReady] = useState(false)

  useEffect(() => {
    Promise.all([getAllMembers(), getAllServices()])
      .then(async ([m, s]) => {
        setMembers(m)
        setServices(s)
        if (s.length > 0) {
          setActiveId(s[0].id)
          loadServiceData(s[0].id)
        }
        // Build attendance map for streak calculations (last 10 ended services)
        const ended = s.filter((svc) => svc.ended).slice(0, 10)
        const mapEntries = await Promise.all(
          ended.map(async (svc) => {
            const att = await getAttendanceForService(svc.id)
            return [svc.id, new Set(att.map((a) => a.memberId))]
          })
        )
        setAttMap(Object.fromEntries(mapEntries))
        setAttMapReady(true)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function loadServiceData(serviceId) {
    setLoading(true)
    const [att, fup] = await Promise.all([
      getAttendanceForService(serviceId),
      getFollowUpsForService(serviceId),
    ])
    setCheckedIn(att)
    setFollowUps(fup)
    setLoading(false)
  }

  async function handleSelectService(id) {
    setActiveId(id)
    await loadServiceData(id)
  }

  async function handleMarkFollowUp(memberId) {
    await markFollowUp(memberId, activeId, note, currentUser?.uid)
    setFollowUps((prev) => [...prev, { memberId, note }])
    setNoteModal(null)
    setNote('')
  }

  // ── Trend chart data — last 8 ended services ──────────────
  const trendData = useMemo(() => {
    const ended = services.filter((s) => s.ended).slice(0, 8).reverse()
    return ended.map((svc) => {
      const count = attMap[svc.id]?.size ?? 0
      const label = svc.date.slice(5)  // MM-DD
      const isActive = svc.id === activeId
      return { label, count, isActive, name: svc.name }
    })
  }, [services, attMap, activeId])

  // ── Absence streaks ───────────────────────────────────────
  const streaks = useMemo(() => {
    if (!attMapReady) return []
    return computeAbsenceStreaks(members, services, attMap, 2)
  }, [members, services, attMap, attMapReady])

  // ── Service groups ────────────────────────────────────────
  const servicesByDate = useMemo(() => {
    const map = {}
    services.forEach((s) => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [services])

  const filteredDates = useMemo(() => {
    const q = dateSearch.trim().toLowerCase()
    if (!q) return servicesByDate
    return servicesByDate.filter(([date, svcs]) =>
      date.includes(q) || svcs.some((s) => s.name.toLowerCase().includes(q))
    )
  }, [servicesByDate, dateSearch])

  const activeMembers = members.filter((m) => m.isActive !== false)
  const checkedInIds  = new Set(checkedIn.map((a) => a.memberId))
  const followUpIds   = new Set(followUps.map((f) => f.memberId))
  const absentees     = activeMembers.filter((m) => !checkedInIds.has(m.id))
  const checkedInList = activeMembers.filter((m) => checkedInIds.has(m.id))
  const turnout       = activeMembers.length > 0 ? Math.round((checkedIn.length / activeMembers.length) * 100) : 0
  const activeService = services.find((s) => s.id === activeId)

  const AV_MODS = ['brand','teal','rose','gold']
  function avMod(id) { return AV_MODS[(id || '').charCodeAt(0) % AV_MODS.length] }

  function streakLabel(n) {
    if (n >= 5) return 'att-streak__badge--critical'
    if (n >= 3) return 'att-streak__badge--warn'
    return 'att-streak__badge--mild'
  }

  return (
    <div className="attendance">
      <div className="attendance__topbar">
        <div>
          <h1 className="attendance__title">Attendance</h1>
          <p className="attendance__sub">Service logs, trends &amp; absentee tracking</p>
        </div>
      </div>

      <div className="attendance__content">
        {services.length === 0 ? (
          <div className="attendance__empty-state">
            <p className="attendance__empty-title">No services recorded yet.</p>
            <p className="attendance__empty-sub">Open a service from the Check-in page to start tracking attendance.</p>
          </div>
        ) : (
          <>
            {/* ── Trend chart ─────────────────────────────── */}
            {trendData.length > 0 && (
              <div className="att-chart">
                <div className="att-chart__header">
                  <p className="att-chart__title">Attendance trend</p>
                  <p className="att-chart__sub">Last {trendData.length} ended services</p>
                </div>
                <TrendChart data={trendData} />
                <div className="att-chart__legend">
                  <span className="att-chart__legend-dot att-chart__legend-dot--active" />
                  <span className="att-chart__legend-label">Selected service</span>
                  <span className="att-chart__legend-dot" />
                  <span className="att-chart__legend-label">Past services</span>
                </div>
              </div>
            )}

            {/* ── Absence streaks ──────────────────────────── */}
            {streaks.length > 0 && (
              <div className="att-streak">
                <div className="att-streak__header">
                  <p className="att-streak__title">⚠ Absence streaks</p>
                  <p className="att-streak__sub">{streaks.length} member{streaks.length !== 1 ? 's' : ''} missed 2+ services in a row</p>
                </div>
                <div className="att-streak__list">
                  {streaks.slice(0, 8).map(({ member, streak }) => (
                    <div key={member.id} className="att-streak__row">
                      <div className={`att-streak__av att-streak__av--${avMod(member.id)}`}>
                        {(member.firstName?.[0] || '') + (member.lastName?.[0] || '')}
                      </div>
                      <div className="att-streak__info">
                        <p className="att-streak__name">{member.firstName} {member.lastName}</p>
                        <p className="att-streak__group">{member.group || '—'}</p>
                      </div>
                      <span className={`att-streak__badge ${streakLabel(streak)}`}>
                        {streak} missed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Search ──────────────────────────────────── */}
            <div className="attendance__search-wrap">
              <span className="attendance__search-icon">🔍</span>
              <input
                className="attendance__search-input"
                type="text"
                placeholder="Search by date (e.g. 2025-03-17) or service name…"
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
              />
              {dateSearch && (
                <button className="attendance__search-clear" onClick={() => setDateSearch('')}>✕</button>
              )}
            </div>

            {/* ── Date groups ─────────────────────────────── */}
            <div className="attendance__date-groups-wrap">
              <div className="attendance__date-groups-header">
                <span className="attendance__date-groups-title">Services</span>
                <span className="attendance__date-groups-count">{services.length} total · scroll to browse</span>
              </div>
              <div className="attendance__date-groups">
                {filteredDates.length === 0 ? (
                  <p className="attendance__search-empty">No services match "{dateSearch}"</p>
                ) : (
                  filteredDates.map(([date, svcs]) => (
                    <div key={date} className="attendance__date-group">
                      <p className="attendance__date-group-label">{date}</p>
                      <div className="attendance__pill-row">
                        {svcs.map((s) => (
                          <button
                            key={s.id}
                            className={`attendance__date-pill ${activeId === s.id ? 'attendance__date-pill--active' : ''} ${s.ended ? 'attendance__date-pill--ended' : ''}`}
                            onClick={() => handleSelectService(s.id)}
                            title={s.name}
                          >
                            <span className="attendance__pill-name">{s.name}</span>
                            {s.ended && <span className="attendance__pill-ended-dot" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {activeService && (
              <div className="attendance__service-header">
                <p className="attendance__service-name">{activeService.name}</p>
                <p className="attendance__service-meta">{activeService.date}{activeService.ended ? ' · Ended' : ' · Live'}</p>
              </div>
            )}

            <div className="attendance__summary">
              <div className="attendance__summary-stat attendance__summary-stat--teal">
                <p className="attendance__summary-label">Checked in</p>
                <p className="attendance__summary-value attendance__summary-value--teal">{loading ? '…' : checkedIn.length}</p>
                <p className="attendance__summary-sub">of {activeMembers.length} members</p>
              </div>
              <div className="attendance__summary-stat attendance__summary-stat--rose">
                <p className="attendance__summary-label">Absent</p>
                <p className="attendance__summary-value attendance__summary-value--rose">{loading ? '…' : absentees.length}</p>
                <p className="attendance__summary-sub attendance__summary-sub--down">need follow-up</p>
              </div>
              <div className="attendance__summary-stat attendance__summary-stat--gold">
                <p className="attendance__summary-label">Turnout</p>
                <p className="attendance__summary-value attendance__summary-value--gold">{loading ? '…' : `${turnout}%`}</p>
              </div>
            </div>

            <div className="attendance__grid">
              <div>
                <p className="attendance__section-label">Absent — follow up</p>
                {loading ? (
                  <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>Loading…</p>
                ) : absentees.length === 0 ? (
                  <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>Everyone attended!</p>
                ) : (
                  <div className="attendance__absent-list">
                    {absentees.map((m) => (
                      <div key={m.id} className="attendance__absent-row">
                        <div className="attendance__absent-av">{(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}</div>
                        <div className="attendance__absent-info">
                          <p className="attendance__absent-name">{m.firstName} {m.lastName}</p>
                          <p className="attendance__absent-group">{m.group || '—'}</p>
                        </div>
                        {followUpIds.has(m.id) ? (
                          <span className="attendance__call-btn attendance__call-btn--done">Followed up ✓</span>
                        ) : (
                          <button className="attendance__call-btn" onClick={() => { setNoteModal(m.id); setNote('') }}>Mark followed up</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="attendance__section-label">Checked in</p>
                {loading ? (
                  <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>Loading…</p>
                ) : checkedInList.length === 0 ? (
                  <p style={{fontSize:'13px',color:'var(--color-text-2)'}}>No check-ins recorded yet.</p>
                ) : (
                  <div className="attendance__checkin-list">
                    {checkedInList.map((m) => (
                      <div key={m.id} className="attendance__checkin-row">
                        <div className="attendance__checkin-av">{(m.firstName?.[0] || '') + (m.lastName?.[0] || '')}</div>
                        <div className="attendance__checkin-info">
                          <p className="attendance__checkin-name">{m.firstName} {m.lastName}</p>
                          <p className="attendance__checkin-group">{m.group || '—'}</p>
                        </div>
                        <span className="attendance__checkin-badge">Present</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {noteModal && (
        <div className="attendance__modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="attendance__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="attendance__modal-title">Mark as followed up</h3>
            <p className="attendance__modal-sub">Add an optional note about the follow-up.</p>
            <textarea className="attendance__modal-textarea" placeholder="e.g. Called — out of town this weekend" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            <div className="attendance__modal-btns">
              <button className="attendance__modal-cancel" onClick={() => setNoteModal(null)}>Cancel</button>
              <button className="attendance__modal-confirm" onClick={() => handleMarkFollowUp(noteModal)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance
