// ============================================================
// TRC Ministries — Admin Sermons
// admin/AdminSermons/AdminSermons.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllSermons, addSermon, updateSermon, deleteSermon } from '../../services/sermonService'
import './AdminSermons.css'

const EMPTY_FORM = { title:'', preacher:'', scripture:'', series:'', date:'', duration:'', youtubeUrl:'', isPublished:false }

function AdminSermons() {
  const [sermons,   setSermons]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [editId,    setEditId]    = useState(null)
  const [saving,    setSaving]    = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setSermons(await getAllSermons()) } catch(e) { console.error(e) }
    setLoading(false)
  }

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [e.target.name]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) { await updateSermon(editId, form) }
      else        { await addSermon(form) }
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null)
      await load()
    } catch(err) { console.error(err) }
    setSaving(false)
  }

  function startEdit(s) {
    setForm({ title:s.title||'', preacher:s.preacher||'', scripture:s.scripture||'', series:s.series||'', date:s.date||'', duration:s.duration||'', youtubeUrl:s.youtubeUrl||'', isPublished:s.isPublished||false })
    setEditId(s.id); setShowForm(true)
  }

  async function handleDelete(s) {
    if (!window.confirm(`Delete "${s.title}"?`)) return
    await deleteSermon(s.id)
    await load()
  }

  async function togglePublish(s) {
    await updateSermon(s.id, { isPublished: !s.isPublished })
    await load()
  }

  return (
    <div className="admin-sermons">
      <div className="admin-sermons__topbar">
        <div>
          <h1 className="admin-sermons__title">Sermons</h1>
          <p className="admin-sermons__sub">{sermons.length} sermons · YouTube links</p>
        </div>
        <button className="admin-sermons__add-btn" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}>
          + Add sermon
        </button>
      </div>

      <div className="admin-sermons__content">

        {/* Form */}
        {showForm && (
          <form className="admin-sermons__form" onSubmit={handleSubmit}>
            <p className="admin-sermons__form-title">{editId ? 'Edit sermon' : 'Add new sermon'}</p>
            <div className="admin-sermons__form-grid">
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Sermon title</label>
                <input className="admin-sermons__input" name="title" value={form.title} onChange={handleChange} placeholder="The Power of Pentecost" required />
              </div>
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Preacher</label>
                <input className="admin-sermons__input" name="preacher" value={form.preacher} onChange={handleChange} placeholder="Rev. Emmanuel Asante" required />
              </div>
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Scripture reference</label>
                <input className="admin-sermons__input" name="scripture" value={form.scripture} onChange={handleChange} placeholder="Acts 2:1–4" />
              </div>
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Series</label>
                <input className="admin-sermons__input" name="series" value={form.series} onChange={handleChange} placeholder="Pentecost Fire" />
              </div>
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Date preached</label>
                <input className="admin-sermons__input" name="date" type="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="admin-sermons__field">
                <label className="admin-sermons__label">Duration</label>
                <input className="admin-sermons__input" name="duration" value={form.duration} onChange={handleChange} placeholder="52 min" />
              </div>
            </div>
            <div className="admin-sermons__field admin-sermons__field--full">
              <label className="admin-sermons__label">YouTube URL</label>
              <input className="admin-sermons__input" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." required />
            </div>
            <div className="admin-sermons__publish-row">
              <label className="admin-sermons__checkbox-label">
                <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
                Publish immediately (visible on public site)
              </label>
            </div>
            <div className="admin-sermons__form-actions">
              <button type="submit" className="admin-sermons__save-btn" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update sermon' : 'Save sermon'}</button>
              <button type="button" className="admin-sermons__cancel-btn" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Sermon list */}
        {loading ? (
          <div className="admin-sermons__loading"><div className="admin-sermons__spinner" /><p>Loading sermons...</p></div>
        ) : sermons.length === 0 ? (
          <div className="admin-sermons__empty"><p>No sermons yet. Add your first sermon above.</p></div>
        ) : (
          <div className="admin-sermons__list">
            {sermons.map((s) => (
              <div key={s.id} className="admin-sermons__row">
                <div className="admin-sermons__row-thumb">
                  <div className="admin-sermons__play-btn"><div className="admin-sermons__play-tri" /></div>
                </div>
                <div className="admin-sermons__row-info">
                  <p className="admin-sermons__row-title">{s.title}</p>
                  <p className="admin-sermons__row-meta">{s.preacher} · {s.scripture} · {s.duration} · {s.date}</p>
                </div>
                <span className={`admin-sermons__row-badge admin-sermons__row-badge--${s.isPublished ? 'published' : 'draft'}`}>
                  {s.isPublished ? 'Published' : 'Draft'}
                </span>
                <div className="admin-sermons__row-actions">
                  <button className="admin-sermons__action-btn" onClick={() => togglePublish(s)}>
                    {s.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="admin-sermons__action-btn" onClick={() => startEdit(s)}>Edit</button>
                  <button className="admin-sermons__action-btn admin-sermons__action-btn--delete" onClick={() => handleDelete(s)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSermons
