// ============================================================
// TRC Ministries — Check-in Management
// admin/CheckIn/CheckIn.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllMembers } from '../../services/memberService'
import { createService, endService, getAllServices, getAttendanceForService } from '../../services/attendanceService'
import './CheckIn.css'

function CheckIn() {
  const [members,        setMembers]        = useState([])
  const [services,       setServices]       = useState([])
  const [activeService,  setActiveService]  = useState(null)
  const [todayLog,       setTodayLog]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showNewForm,    setShowNewForm]    = useState(false)
  const [newSvcName,     setNewSvcName]     = useState('')
  const [creating,       setCreating]       = useState(false)
  const [createError,    setCreateError]    = useState('')
  const [ending,         setEnding]         = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  useEffect(() => {
    Promise.all([getAllMembers(), getAllServices()])
      .then(([m, s]) => {
        setMembers(m)
        setServices(s)
        if (s.length > 0) {
          setActiveService(s[0])
          loadLog(s[0].id, m)
        } else {
          setLoading(false)
        }
      })
      .catch(console.error)
  }, [])

  async function loadLog(serviceId, memberList) {
    try {
      const att       = await getAttendanceForService(serviceId)
      const memberMap = Object.fromEntries((memberList || members).map((m) => [m.id, m]))
      setTodayLog(att.map((a) => ({ ...a, member: memberMap[a.memberId] })).filter((a) => a.member))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateService(e) {
    e.preventDefault()
    if (!newSvcName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      const today   = new Date()
      const dateStr = today.toISOString().split('T')[0]
      const id  = await createService(newSvcName.trim(), dateStr)
      const svc = { id, name: newSvcName.trim(), date: dateStr, ended: false }
      setServices((prev) => [svc, ...prev])
      setActiveService(svc)
      setTodayLog([])
      setNewSvcName('')
      setShowNewForm(false)
    } catch (err) {
      console.error('Create service error:', err)
      setCreateError('Failed to create service. Check your Firestore permissions.')
    } finally {
      setCreating(false)
    }
  }

  async function handleSelectService(svc) {
    setActiveService(svc)
    setLoading(true)
    await loadLog(svc.id, members)
  }

  async function handleEndService() {
    if (!activeService) return
    setEnding(true)
    try {
      await endService(activeService.id)
      const updated = { ...activeService, ended: true }
      setActiveService(updated)
      setServices((prev) => prev.map((s) => s.id === updated.id ? updated : s))
    } catch (err) {
      console.error('End service error:', err)
    } finally {
      setEnding(false)
      setShowEndConfirm(false)
    }
  }

  const activeMembers = members.filter((m) => m.isActive !== false)
  const absentCount   = Math.max(0, activeMembers.length - todayLog.length)
  const todayDate     = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const isEnded       = activeService?.ended === true

  return (
    <div className="checkin">
      <div className="checkin__topbar">
        <div>
          <h1 className="checkin__title">Check-in</h1>
          <p className="checkin__sub">{todayDate}</p>
        </div>
        <div className="checkin__topbar-actions">
          {activeService && !isEnded && (
            <Link to="/admin/kiosk" target="_blank" className="checkin__btn-kiosk">
              Open kiosk screen ↗
            </Link>
          )}
          {activeService && !isEnded && (
            <button className="checkin__btn-end" onClick={() => setShowEndConfirm(true)}>
              End service
            </button>
          )}
          <button
            className="checkin__btn-new"
            onClick={() => { setShowNewForm((p) => !p); setCreateError('') }}
          >
            {showNewForm ? 'Cancel' : '+ Open new service'}
          </button>
        </div>
      </div>

      <div className="checkin__content">

        {showNewForm && (
          <div className="checkin__new-form-card">
            <p className="checkin__new-form-title">Open a new service</p>
            <p className="checkin__new-form-hint">Give the service a name so you can identify it later.</p>
            <form className="checkin__new-form" onSubmit={handleCreateService}>
              <input
                className="checkin__new-form-input"
                placeholder="e.g. Sunday Service — First Service"
                value={newSvcName}
                onChange={(e) => setNewSvcName(e.target.value)}
                autoFocus
                required
              />
              <div className="checkin__new-form-btns">
                <button type="submit" className="checkin__new-form-btn" disabled={creating}>
                  {creating ? 'Creating...' : 'Open service'}
                </button>
                <button type="button" className="checkin__new-form-cancel" onClick={() => { setShowNewForm(false); setCreateError('') }}>
                  Cancel
                </button>
              </div>
              {createError && <p className="checkin__new-form-error">{createError}</p>}
            </form>
          </div>
        )}

        <div className="checkin__grid">

          {activeService ? (
            <div className={`checkin__active-card${isEnded ? ' checkin__active-card--ended' : ''}`}>
              <div className="checkin__active-header">
                <div>
                  <p className="checkin__active-label">{isEnded ? 'Ended service' : 'Active service'}</p>
                  <h2 className="checkin__active-name">{activeService.name}</h2>
                  <p className="checkin__active-date">{activeService.date}</p>
                </div>
                {isEnded
                  ? <span className="checkin__ended-badge">Ended</span>
                  : <span className="checkin__live-badge">Live</span>
                }
              </div>
              <div className="checkin__active-stats">
                <div className="checkin__active-stat">
                  <p className="checkin__active-stat-value checkin__active-stat-value--teal">{todayLog.length}</p>
                  <p className="checkin__active-stat-label">{isEnded ? 'Total checked in' : 'Checked in'}</p>
                </div>
                <div className="checkin__active-stat">
                  <p className="checkin__active-stat-value checkin__active-stat-value--rose">{absentCount}</p>
                  <p className="checkin__active-stat-label">{isEnded ? 'Absent' : 'Not yet'}</p>
                </div>
                <div className="checkin__active-stat">
                  <p className="checkin__active-stat-value checkin__active-stat-value--gold">{activeMembers.length}</p>
                  <p className="checkin__active-stat-label">Total active</p>
                </div>
              </div>
              {!isEnded && (
                <Link to="/admin/kiosk" target="_blank" className="checkin__kiosk-btn-full">
                  Open check-in screen for ushers ↗
                </Link>
              )}
              {isEnded && (
                <p className="checkin__ended-note">
                  This service has ended. Check-in is closed. View full attendance in the Attendance tab.
                </p>
              )}
            </div>
          ) : (
            <div className="checkin__no-service-card">
              <p className="checkin__no-service-icon">📋</p>
              <p className="checkin__no-service-title">No active service</p>
              <p className="checkin__no-service-sub">Click "Open new service" above to start today's check-in.</p>
            </div>
          )}

          <div className="checkin__past-card">
            <div className="checkin__past-card-header">
              <p className="checkin__card-title">Recent services</p>
              {services.length > 0 && (
                <span className="checkin__past-card-count">{services.length} total</span>
              )}
            </div>
            {services.length === 0 ? (
              <p className="checkin__past-empty">No services created yet. Open your first service above.</p>
            ) : (
              <div className="checkin__past-list">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className={`checkin__past-row${activeService?.id === s.id ? ' checkin__past-row--active' : ''}`}
                    onClick={() => handleSelectService(s)}
                  >
                    <div>
                      <p className="checkin__past-name">{s.name}</p>
                      <p className="checkin__past-date">{s.date}</p>
                    </div>
                    <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                      {s.ended && <span className="checkin__past-ended-pill">Ended</span>}
                      {activeService?.id === s.id && <span className="checkin__past-active-badge">Viewing</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {todayLog.length > 0 && (
          <div>
            <p className="checkin__section-label">Check-in log — {activeService?.name}</p>
            <div className="checkin__log-list">
              {todayLog.map((a) => (
                <div key={a.id || a.memberId} className="checkin__log-row">
                  <span className="checkin__log-time">
                    {a.checkedInAt?.toDate
                      ? a.checkedInAt.toDate().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
                      : 'Just now'}
                  </span>
                  <div className="checkin__log-av">
                    {(a.member?.firstName?.[0] || '') + (a.member?.lastName?.[0] || '')}
                  </div>
                  <p className="checkin__log-name">{a.member?.firstName} {a.member?.lastName}</p>
                  <p className="checkin__log-group">{a.member?.group || '—'}</p>
                  <span className="checkin__log-badge">Member</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showEndConfirm && (
        <div className="checkin__modal-overlay" onClick={() => setShowEndConfirm(false)}>
          <div className="checkin__modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="checkin__modal-title">End this service?</h3>
            <p className="checkin__modal-sub">
              <strong>{activeService?.name}</strong> will be marked as ended. Check-in will close
              and the final count of <strong>{todayLog.length} member{todayLog.length !== 1 ? 's' : ''}</strong> will be locked in.
            </p>
            <div className="checkin__modal-btns">
              <button className="checkin__modal-cancel" onClick={() => setShowEndConfirm(false)}>Cancel</button>
              <button className="checkin__modal-confirm" onClick={handleEndService} disabled={ending}>
                {ending ? 'Ending...' : 'Yes, end service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckIn
