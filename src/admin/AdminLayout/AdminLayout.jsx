import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to:'/admin/dashboard',  label:'Dashboard'  },
      { to:'/admin/members',    label:'Members'    },
      { to:'/admin/attendance', label:'Attendance' },
      { to:'/admin/checkin',    label:'Check-in'   },
    ],
  },
  {
    label: 'Content',
    items: [
      { to:'/admin/sermons',  label:'Sermons' },
      { to:'/admin/events',   label:'Events'  },
      { to:'/admin/pastors',       label:'Pastors' },
      { to:'/admin/groups-admin', label:'Groups'  },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to:'/admin/messages',  label:'Messages'  },
      { to:'/admin/broadcast', label:'Broadcast' },
    ],
  },
  {
    label: 'People',
    items: [
      { to:'/admin/birthdays', label:'Birthdays'                          },
      { to:'/admin/staff',     label:'Staff', superOnly:true              },
    ],
  },
]

function AdminLayout() {
  const { currentUser, displayName, isSuperAdmin } = useAuth()
  const navigate    = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try { await signOut(auth); navigate('/admin/login') }
    catch (err) { console.error(err); setSigningOut(false) }
  }

  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : 'AD'

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__sb-logo">
          <img src="/trc-logo.png" alt="TRC" className="admin-layout__sb-logo-img" />
          <div>
            <p className="admin-layout__sb-name">TRC Ministries</p>
            <p className="admin-layout__sb-sub">Admin panel</p>
          </div>
        </div>

        <nav className="admin-layout__sb-nav">
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              <p className="admin-layout__sb-section">{label}</p>
              {items.map(({ to, label: itemLabel, superOnly }) => {
                if (superOnly && !isSuperAdmin) return null
                return (
                  <NavLink key={to} to={to}
                    className={({ isActive }) => isActive ? 'admin-layout__sb-item admin-layout__sb-item--active' : 'admin-layout__sb-item'}
                  >
                    <span className="admin-layout__sb-pip" aria-hidden="true" />
                    {itemLabel}
                    {superOnly && <span className="admin-layout__sb-super-badge">Super</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="admin-layout__sb-footer">
          <div className="admin-layout__sb-user">
            <div className="admin-layout__sb-avatar">{initials}</div>
            <div>
              <p className="admin-layout__sb-uname">{displayName}</p>
              <p className="admin-layout__sb-urole">{isSuperAdmin ? 'Super Admin' : 'Staff Admin'}</p>
            </div>
          </div>
          <button className="admin-layout__sb-signout" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="admin-layout__main">
        <Outlet />
      </div>
    </div>
  )
}
export default AdminLayout
