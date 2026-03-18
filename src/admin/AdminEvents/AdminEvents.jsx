// ============================================================
// TRC Ministries — Admin Events Management
// admin/AdminEvents/AdminEvents.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllEvents, addEvent, updateEvent, deleteEvent } from '../../services/eventService'
import './AdminEvents.css'

const EMPTY_FORM = {
  title: '', date: '', time: '', location: '',
  description: '', tag: 'Worship service',
  posterUrl: '', isPublished: false
}

const TAGS = [
  'Worship service', 'Youth event', 'Conference',
  'Anniversary', "Men's event", "Women's event", 'Other'
]

const TAG_MODS = {
  'Worship service': 'brand', 'Youth event': 'teal',
  'Conference': 'gold', 'Anniversary': 'rose',
  "Men's event": 'teal', "Women's event": 'rose', 'Other': 'brand',
}

function AdminEvents() {
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [editId,   setEditId]   = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getAllEvents().then(setEvents).catch(console.error).finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    if (editId) {
      await updateEvent(editId, form)
      setEvents((prev) => prev.map((ev) => ev.id === editId ? { ...ev, ...form } : ev))
    } else {
      await addEvent(form)
      const fresh = await getAllEvents()
      setEvents(fresh)
    }
    setForm(EMPTY_FORM); setEditId(null); setShowForm(false); setSaving(false)
  }

  function handleEdit(ev) {
    setForm({
      title: ev.title || '', date: ev.date || '',
      time: ev.time || '', location: ev.location || '',
      description: ev.description || '', tag: ev.tag || 'Worship service',
      posterUrl: ev.posterUrl || '', isPublished: ev.isPublished || false
    })
    setEditId(ev.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return
    await deleteEvent(id)
    setEvents((prev) => prev.filter((ev) => ev.id !== id))
  }

  async function handleTogglePublish(ev) {
    const updated = { isPublished: !ev.isPublished }
    await updateEvent(ev.id, updated)
    setEvents((prev) => prev.map((e) => e.id === ev.id ? { ...e, ...updated } : e))
  }

  return (
    <div className="admin-events">
      <div className="admin-events__topbar">
        <div>
          <h1 className="admin-events__title">Events</h1>
          <p className="admin-events__sub">{events.length} events</p>
        </div>
        <button
          className="admin-events__btn-primary"
          onClick={() => { setShowForm((p) => !p); setEditId(null); setForm(EMPTY_FORM) }}
        >
          {showForm && !editId ? 'Cancel' : '+ Add event'}
        </button>
      </div>

      <div className="admin-events__content">

        {/* ── Form ── */}
        {showForm && (
          <div className="admin-events__form-card">
            <p className="admin-events__form-title">{editId ? 'Edit event' : 'Add new event'}</p>
            <form className="admin-events__form" onSubmit={handleSubmit}>

              <div className="admin-events__form-field">
                <label className="admin-events__form-label">Event title *</label>
                <input name="title" className="admin-events__form-input" placeholder="Easter Sunday Service" value={form.title} onChange={handleChange} required />
              </div>

              <div className="admin-events__form-row">
                <div className="admin-events__form-field">
                  <label className="admin-events__form-label">Date *</label>
                  <input name="date" className="admin-events__form-input" type="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className="admin-events__form-field">
                  <label className="admin-events__form-label">Time</label>
                  <input name="time" className="admin-events__form-input" placeholder="9:00 AM" value={form.time} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-events__form-row">
                <div className="admin-events__form-field">
                  <label className="admin-events__form-label">Location</label>
                  <input name="location" className="admin-events__form-input" placeholder="Main Auditorium" value={form.location} onChange={handleChange} />
                </div>
                <div className="admin-events__form-field">
                  <label className="admin-events__form-label">Category</label>
                  <select name="tag" className="admin-events__form-select" value={form.tag} onChange={handleChange}>
                    {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-events__form-field">
                <label className="admin-events__form-label">Description</label>
                <textarea name="description" className="admin-events__form-textarea" placeholder="Describe the event..." value={form.description} onChange={handleChange} rows={3} />
              </div>

              {/* ── Event poster ── */}
              <div className="admin-events__form-field">
                <label className="admin-events__form-label">Event poster / banner image URL</label>
                <input
                  name="posterUrl"
                  className="admin-events__form-input"
                  placeholder="https://i.ibb.co/... (upload to imgbb.com and paste the Direct link)"
                  value={form.posterUrl}
                  onChange={handleChange}
                />
                <p className="admin-events__form-hint">
                  Upload your poster to <strong>imgbb.com</strong> (free) → copy the <strong>Direct link</strong> → paste here.
                  Recommended size: 1200 × 630px (landscape) or square.
                </p>
                {form.posterUrl && (
                  <div className="admin-events__poster-preview">
                    <img
                      src={form.posterUrl}
                      alt="Poster preview"
                      className="admin-events__poster-img"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                    <div className="admin-events__poster-error" style={{ display:'none' }}>
                      ⚠ Image could not be loaded. Check the URL.
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-events__form-check">
                <input id="evPublished" name="isPublished" type="checkbox" checked={form.isPublished} onChange={handleChange} />
                <label htmlFor="evPublished" className="admin-events__form-check-label">
                  Publish immediately (visible on public site)
                </label>
              </div>

              <div className="admin-events__form-actions">
                <button type="button" className="admin-events__btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }}>Cancel</button>
                <button type="submit" className="admin-events__btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save changes' : 'Add event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Events list ── */}
        {loading ? (
          <div className="admin-events__loading"><div className="admin-events__spinner" /></div>
        ) : events.length === 0 ? (
          <div className="admin-events__empty"><p>No events yet. Add your first one above.</p></div>
        ) : (
          <div className="admin-events__list">
            {events.map((ev) => {
              const mod = TAG_MODS[ev.tag] || 'brand'
              const d   = ev.date ? new Date(ev.date) : null
              return (
                <div key={ev.id} className={`admin-events__row ${ev.isPublished ? '' : 'admin-events__row--draft'}`}>

                  {/* Poster thumbnail */}
                  {ev.posterUrl ? (
                    <div className="admin-events__row-poster">
                      <img
                        src={ev.posterUrl}
                        alt={ev.title}
                        className="admin-events__row-poster-img"
                        onError={(e) => { e.target.style.display='none' }}
                      />
                    </div>
                  ) : (
                    <div className={`admin-events__date-block admin-events__date-block--${mod}`}>
                      <span className={`admin-events__day admin-events__day--${mod}`}>{d ? d.getDate() : '—'}</span>
                      <span className={`admin-events__month admin-events__month--${mod}`}>
                        {d ? d.toLocaleString('default', { month: 'short' }) : '—'}
                      </span>
                    </div>
                  )}

                  <div className="admin-events__row-info">
                    <p className="admin-events__row-title">{ev.title}</p>
                    <p className="admin-events__row-meta">
                      {d ? d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                      {ev.time ? ` · ${ev.time}` : ''}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </p>
                    <span className={`admin-events__row-tag admin-events__row-tag--${mod}`}>{ev.tag || '—'}</span>
                  </div>

                  <span className={`admin-events__publish-badge admin-events__publish-badge--${ev.isPublished ? 'published' : 'draft'}`}>
                    {ev.isPublished ? 'Published' : 'Draft'}
                  </span>

                  <div className="admin-events__row-actions">
                    <button className="admin-events__action-btn" onClick={() => handleTogglePublish(ev)}>
                      {ev.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="admin-events__action-btn" onClick={() => handleEdit(ev)}>Edit</button>
                    <button className="admin-events__action-btn admin-events__action-btn--danger" onClick={() => handleDelete(ev.id, ev.title)}>Delete</button>
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

export default AdminEvents
