// ============================================================
// TRC Ministries — Admin Members List
// admin/Members/Members.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllMembers } from '../../services/memberService'
import './Members.css'

const FILTERS = ['All groups', 'Youth Ministry', "Women's Fellowship", "Men's Fellowship", 'Praise & Worship Team', "Children's Ministry", 'Prayer & Intercession']

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
}

function getAvMod(index) {
  const mods = ['brand', 'teal', 'rose', 'gold', 'purple']
  return mods[index % mods.length]
}

function AttBadge({ rate }) {
  const mod = rate >= 80 ? 'good' : rate >= 60 ? 'medium' : 'low'
  return <span className={`members__att members__att--${mod}`}>{rate}%</span>
}

function Members() {
  const [members,      setMembers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('All groups')

  useEffect(() => {
    getAllMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter((m) => {
    const name        = `${m.firstName} ${m.lastName}`.toLowerCase()
    const okSearch    = name.includes(search.toLowerCase()) || m.phone?.includes(search)
    const okGroup     = activeFilter === 'All groups' || m.group === activeFilter
    return okSearch && okGroup
  })

  function exportCSV() {
    const header = 'First Name,Last Name,Phone,Email,Group,Join Date,Status'
    const rows   = members.map((m) =>
      `${m.firstName},${m.lastName},${m.phone},${m.email || ''},${m.group || ''},${m.joinDate || ''},${m.isActive ? 'Active' : 'Inactive'}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `trc-members-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const active   = members.filter((m) => m.isActive !== false).length
  const inactive = members.length - active

  return (
    <div className="members">
      <div className="members__topbar">
        <div>
          <h1 className="members__title">Members</h1>
          <p className="members__sub">{members.length} registered members</p>
        </div>
        <div className="members__topbar-actions">
          <button className="members__btn-ghost" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="members__content">
        <div className="members__stats">
          <div className="members__stat members__stat--default">
            <p className="members__stat-label">Total members</p>
            <p className="members__stat-value members__stat-value--default">{members.length}</p>
          </div>
          <div className="members__stat members__stat--teal">
            <p className="members__stat-label">Active</p>
            <p className="members__stat-value members__stat-value--teal">{active}</p>
          </div>
          <div className="members__stat members__stat--gold">
            <p className="members__stat-label">New this month</p>
            <p className="members__stat-value members__stat-value--gold">
              {members.filter((m) => {
                const d = m.joinDate || ''
                const thisMonth = new Date().toISOString().slice(0, 7)
                return d.startsWith(thisMonth)
              }).length}
            </p>
          </div>
          <div className="members__stat members__stat--rose">
            <p className="members__stat-label">Inactive</p>
            <p className="members__stat-value members__stat-value--rose">{inactive}</p>
          </div>
        </div>

        <div className="members__search-bar">
          <input
            className="members__search-input"
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="members__filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`members__filter-pill ${activeFilter === f ? 'members__filter-pill--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="members__loading">
            <div className="members__spinner" />
            <p>Loading members...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="members__empty">
            <p>{search || activeFilter !== 'All groups' ? 'No members match your search.' : 'No members registered yet.'}</p>
          </div>
        ) : (
          <div className="members__table-card">
            <table className="members__table">
              <thead>
                <tr>
                  <th className="members__th">Member</th>
                  <th className="members__th">Phone</th>
                  <th className="members__th">Group</th>
                  <th className="members__th">Joined</th>
                  <th className="members__th">Status</th>
                  <th className="members__th"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <tr key={m.id} className="members__tr">
                    <td className="members__td">
                      <div className="members__member-cell">
                        <div className={`members__av members__av--${getAvMod(i)}`}>
                          {getInitials(m.firstName, m.lastName)}
                        </div>
                        <div>
                          <p className="members__member-name">{m.firstName} {m.lastName}</p>
                          <p className="members__member-email">{m.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="members__td members__td--phone">{m.phone}</td>
                    <td className="members__td">
                      <span className="members__group-badge">{m.group || '—'}</span>
                    </td>
                    <td className="members__td members__td--muted">{m.joinDate || '—'}</td>
                    <td className="members__td">
                      <span className={`members__status-badge members__status-badge--${m.isActive !== false ? 'active' : 'inactive'}`}>
                        {m.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="members__td">
                      <Link to={`/admin/members/${m.id}`} className="members__action-btn">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Members
