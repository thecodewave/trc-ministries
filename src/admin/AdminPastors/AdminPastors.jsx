// ============================================================
// TRC Ministries — Admin Pastors Management
// admin/AdminPastors/AdminPastors.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllPastors, addPastor, updatePastor, deletePastor } from '../../services/pastorService'
import './AdminPastors.css'

const EMPTY = {
  name: '', role: '', bio: '', photoUrl: '',
  order: 1, isSenior: false, tags: ''
}

function AdminPastors() {
  const [pastors,  setPastors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    getAllPastors().then(setPastors).catch(console.error).finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, order: parseInt(form.order) || 1 }
    if (editId) {
      await updatePastor(editId, data)
      setPastors((prev) => prev.map((p) => p.id === editId ? { ...p, ...data } : p))
    } else {
      const ref = await addPastor(data)
      const fresh = await getAllPastors()
      setPastors(fresh)
    }
    setForm(EMPTY)
    setEditId(null)
    setShowForm(false)
    setSaving(false)
  }

  function handleEdit(pastor) {
    setForm({
      name: pastor.name || '', role: pastor.role || '',
      bio: pastor.bio || '', photoUrl: pastor.photoUrl || '',
      order: pastor.order || 1, isSenior: pastor.isSenior || false,
      tags: Array.isArray(pastor.tags) ? pastor.tags.join(', ') : pastor.tags || ''
    })
    setEditId(pastor.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete ${name}?`)) return
    await deletePastor(id)
    setPastors((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="admin-pastors">
      <div className="admin-pastors__topbar">
        <div>
          <h1 className="admin-pastors__title">Pastors</h1>
          <p className="admin-pastors__sub">{pastors.length} pastors · shown on public website</p>
        </div>
        <button className="admin-pastors__btn-primary" onClick={() => { setShowForm((p) => !p); setEditId(null); setForm(EMPTY) }}>
          {showForm && !editId ? 'Cancel' : '+ Add pastor'}
        </button>
      </div>

      <div className="admin-pastors__content">

        {showForm && (
          <div className="admin-pastors__form-card">
            <p className="admin-pastors__form-title">{editId ? 'Edit pastor' : 'Add new pastor'}</p>
            <form className="admin-pastors__form" onSubmit={handleSubmit}>

              <div className="admin-pastors__form-row">
                <div className="admin-pastors__form-field">
                  <label className="admin-pastors__form-label">Full name *</label>
                  <input name="name" className="admin-pastors__form-input" placeholder="Pastor Gabby Ibe" value={form.name} onChange={handleChange} required />
                </div>
                <div className="admin-pastors__form-field">
                  <label className="admin-pastors__form-label">Role / title *</label>
                  <input name="role" className="admin-pastors__form-input" placeholder="Senior Pastor" value={form.role} onChange={handleChange} required />
                </div>
              </div>

              <div className="admin-pastors__form-field">
                <label className="admin-pastors__form-label">Photo URL</label>
                <input name="photoUrl" className="admin-pastors__form-input" placeholder="https://... (paste a direct image link)" value={form.photoUrl} onChange={handleChange} />
                <p className="admin-pastors__form-hint">
                  Upload your photo to any free image host (e.g. imgbb.com, cloudinary.com) and paste the direct link here.
                </p>
                {form.photoUrl && (
                  <div className="admin-pastors__photo-preview">
                    <img src={form.photoUrl} alt="Preview" onError={(e) => { e.target.style.display='none' }} />
                  </div>
                )}
              </div>

              <div className="admin-pastors__form-field">
                <label className="admin-pastors__form-label">Bio</label>
                <textarea name="bio" className="admin-pastors__form-textarea" placeholder="Write a short bio..." value={form.bio} onChange={handleChange} rows={4} />
              </div>

              <div className="admin-pastors__form-row">
                <div className="admin-pastors__form-field">
                  <label className="admin-pastors__form-label">Tags (comma separated)</label>
                  <input name="tags" className="admin-pastors__form-input" placeholder="Evangelism, Prayer, Discipleship" value={form.tags} onChange={handleChange} />
                </div>
                <div className="admin-pastors__form-field">
                  <label className="admin-pastors__form-label">Display order</label>
                  <input name="order" className="admin-pastors__form-input" type="number" min="1" value={form.order} onChange={handleChange} />
                </div>
              </div>

              <div className="admin-pastors__form-check">
                <input id="isSenior" name="isSenior" type="checkbox" checked={form.isSenior} onChange={handleChange} />
                <label htmlFor="isSenior" className="admin-pastors__form-check-label">
                  Senior / Lead Pastor (featured prominently at top)
                </label>
              </div>

              <div className="admin-pastors__form-actions">
                <button type="button" className="admin-pastors__btn-ghost" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
                <button type="submit" className="admin-pastors__btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Save changes' : 'Add pastor'}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="admin-pastors__loading"><div className="admin-pastors__spinner" /></div>
        ) : pastors.length === 0 ? (
          <div className="admin-pastors__empty">
            <p>No pastors added yet. Add your first pastor above.</p>
            <p style={{fontSize:'13px',marginTop:'8px',color:'var(--color-text-3)'}}>Pastors you add here will appear on the public Pastors page.</p>
          </div>
        ) : (
          <div className="admin-pastors__list">
            {pastors.map((p) => (
              <div key={p.id} className="admin-pastors__row">
                <div className="admin-pastors__row-photo">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="admin-pastors__row-img" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  ) : null}
                  <div className="admin-pastors__row-initials" style={{display: p.photoUrl ? 'none' : 'flex'}}>
                    {p.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="admin-pastors__row-info">
                  <div className="admin-pastors__row-top">
                    <p className="admin-pastors__row-name">{p.name}</p>
                    {p.isSenior && <span className="admin-pastors__senior-badge">Senior Pastor</span>}
                  </div>
                  <p className="admin-pastors__row-role">{p.role}</p>
                  <p className="admin-pastors__row-bio">{p.bio?.substring(0, 100)}{p.bio?.length > 100 ? '...' : ''}</p>
                </div>
                <div className="admin-pastors__row-actions">
                  <button className="admin-pastors__action-btn" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="admin-pastors__action-btn admin-pastors__action-btn--danger" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPastors
