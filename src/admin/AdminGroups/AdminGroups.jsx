// ============================================================
// TRC Ministries — Admin Groups Management
// admin/AdminGroups/AdminGroups.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllGroups, addGroup, updateGroup, deleteGroup } from '../../services/groupService'
import './AdminGroups.css'

const COLOR_MODS = ['brand','teal','rose','gold','purple']
const EMPTY = { name:'', description:'', leader:'', schedule:'', frequency:'Weekly', memberCount:'', colorMod:'brand', order:1 }

function AdminGroups() {
  const [groups,   setGroups]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    getAllGroups().then(setGroups).catch(console.error).finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const data = { ...form, order: parseInt(form.order) || 1, memberCount: form.memberCount ? parseInt(form.memberCount) : null }
    if (editId) {
      await updateGroup(editId, data)
      setGroups((prev) => prev.map((g) => g.id === editId ? { ...g, ...data } : g))
    } else {
      await addGroup(data)
      const fresh = await getAllGroups()
      setGroups(fresh)
    }
    setForm(EMPTY); setEditId(null); setShowForm(false); setSaving(false)
  }

  function handleEdit(group) {
    setForm({ name: group.name || '', description: group.description || '', leader: group.leader || '', schedule: group.schedule || '', frequency: group.frequency || 'Weekly', memberCount: group.memberCount || '', colorMod: group.colorMod || 'brand', order: group.order || 1 })
    setEditId(group.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    await deleteGroup(id)
    setGroups((prev) => prev.filter((g) => g.id !== id))
  }

  const MOD_BG = { brand:'var(--color-brand-pale)', teal:'var(--color-teal-light)', rose:'var(--color-rose-light)', gold:'var(--color-gold-pale)', purple:'#f5f0ff' }

  return (
    <div className="admin-groups">
      <div className="admin-groups__topbar">
        <div>
          <h1 className="admin-groups__title">Groups &amp; Ministries</h1>
          <p className="admin-groups__sub">{groups.length} groups · shown on public website</p>
        </div>
        <button className="admin-groups__btn-primary" onClick={() => { setShowForm((p) => !p); setEditId(null); setForm(EMPTY) }}>
          {showForm && !editId ? 'Cancel' : '+ Add group'}
        </button>
      </div>

      <div className="admin-groups__content">

        {showForm && (
          <div className="admin-groups__form-card">
            <p className="admin-groups__form-title">{editId ? 'Edit group' : 'Add new group'}</p>
            <form className="admin-groups__form" onSubmit={handleSubmit}>
              <div className="admin-groups__form-row">
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Group name *</label>
                  <input name="name" className="admin-groups__form-input" placeholder="Youth Ministry" value={form.name} onChange={handleChange} required />
                </div>
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Leader</label>
                  <input name="leader" className="admin-groups__form-input" placeholder="Pastor Kweku Mensah" value={form.leader} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-groups__form-field">
                <label className="admin-groups__form-label">Description</label>
                <textarea name="description" className="admin-groups__form-textarea" placeholder="Describe the group..." value={form.description} onChange={handleChange} rows={3} />
              </div>
              <div className="admin-groups__form-row">
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Schedule</label>
                  <input name="schedule" className="admin-groups__form-input" placeholder="Fridays · 6:00 PM" value={form.schedule} onChange={handleChange} />
                </div>
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Frequency</label>
                  <select name="frequency" className="admin-groups__form-select" value={form.frequency} onChange={handleChange}>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Every Sunday">Every Sunday</option>
                  </select>
                </div>
              </div>
              <div className="admin-groups__form-row">
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Member count (optional)</label>
                  <input name="memberCount" className="admin-groups__form-input" type="number" placeholder="48" value={form.memberCount} onChange={handleChange} />
                </div>
                <div className="admin-groups__form-field">
                  <label className="admin-groups__form-label">Display order</label>
                  <input name="order" className="admin-groups__form-input" type="number" min="1" value={form.order} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-groups__form-field">
                <label className="admin-groups__form-label">Card colour</label>
                <div className="admin-groups__color-row">
                  {COLOR_MODS.map((mod) => (
                    <button key={mod} type="button"
                      className={`admin-groups__color-swatch ${form.colorMod === mod ? 'admin-groups__color-swatch--active' : ''}`}
                      style={{ background: MOD_BG[mod] }}
                      onClick={() => setForm((p) => ({ ...p, colorMod: mod }))}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
              <div className="admin-groups__form-actions">
                <button type="button" className="admin-groups__btn-ghost" onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</button>
                <button type="submit" className="admin-groups__btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Save changes' : 'Add group'}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="admin-groups__loading"><div className="admin-groups__spinner" /></div>
        ) : groups.length === 0 ? (
          <div className="admin-groups__empty"><p>No groups yet. Add your first group above.</p></div>
        ) : (
          <div className="admin-groups__list">
            {groups.map((g) => (
              <div key={g.id} className="admin-groups__row" style={{ borderLeft:`4px solid var(--color-${g.colorMod || 'brand'})` }}>
                <div className="admin-groups__row-info">
                  <p className="admin-groups__row-name">{g.name}</p>
                  <p className="admin-groups__row-meta">{g.leader ? `Led by ${g.leader}` : ''}{g.schedule ? ` · ${g.schedule}` : ''}{g.memberCount ? ` · ${g.memberCount} members` : ''}</p>
                  <p className="admin-groups__row-desc">{g.description?.substring(0, 120)}{g.description?.length > 120 ? '...' : ''}</p>
                </div>
                <div className="admin-groups__row-actions">
                  <button className="admin-groups__action-btn" onClick={() => handleEdit(g)}>Edit</button>
                  <button className="admin-groups__action-btn admin-groups__action-btn--danger" onClick={() => handleDelete(g.id, g.name)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default AdminGroups
