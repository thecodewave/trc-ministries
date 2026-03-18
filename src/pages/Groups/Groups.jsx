// ============================================================
// TRC Ministries — Groups & Ministries (Firestore powered)
// pages/Groups/Groups.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllGroups } from '../../services/groupService'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Groups.css'

const MOD_COLORS = ['brand','rose','teal','gold','purple','brand']

function Groups() {
  const [groups,  setGroups]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllGroups()
      .then(setGroups)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="groups">
      <Navbar />
      <section className="groups__hero">
        <div className="groups__hero-deco groups__hero-deco--1" />
        <div className="groups__hero-deco groups__hero-deco--2" />
        <div className="groups__hero-inner">
          <p className="groups__hero-eyebrow">Ministries &amp; groups</p>
          <h1 className="groups__hero-title">Find your community</h1>
          <p className="groups__hero-sub">
            Every believer needs a place to belong. Find the group that fits
            where you are in your journey and take your next step with us.
          </p>
        </div>
      </section>

      <section className="groups__body">
        {loading ? (
          <div className="groups__loading"><div className="groups__spinner" /></div>
        ) : groups.length === 0 ? (
          <div className="groups__empty">
            <p className="groups__empty-title">Communities coming soon</p>
            <p className="groups__empty-sub">Our ministry groups are being listed. Check back soon or visit us on Sunday to learn more.</p>
          </div>
        ) : (
          <div className="groups__grid">
            {groups.map((group, i) => {
              const mod = group.colorMod || MOD_COLORS[i % MOD_COLORS.length]
              return (
                <div key={group.id} className={`groups__card groups__card--${mod}`}>
                  <div className="groups__card-header">
                    <div className={`groups__card-icon groups__card-icon--${mod}`}>
                      <div className={`groups__card-icon-dot groups__card-icon-dot--${mod}`} />
                    </div>
                    {group.memberCount && (
                      <span className={`groups__card-count groups__card-count--${mod}`}>
                        {group.memberCount} members
                      </span>
                    )}
                  </div>
                  <h2 className="groups__card-name">{group.name}</h2>
                  <p className="groups__card-desc">{group.description}</p>
                  <div className="groups__card-meta">
                    {group.schedule && <span className="groups__card-pill">{group.schedule}</span>}
                    {group.frequency && <span className="groups__card-pill">{group.frequency}</span>}
                  </div>
                  {group.leader && <p className="groups__card-leader">Led by {group.leader}</p>}
                </div>
              )
            })}
          </div>
        )}

        <div className="groups__cta">
          <h2 className="groups__cta-title">Not sure which group is right for you?</h2>
          <p className="groups__cta-sub">
            Come to a Sunday service and speak to any of our pastors.
            We will help you find where you fit best.
          </p>
          <div className="groups__cta-btns">
            <Link to="/register" className="groups__cta-btn groups__cta-btn--primary">Register as a member</Link>
            <Link to="/contact"  className="groups__cta-btn groups__cta-btn--ghost">Contact us</Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
export default Groups
