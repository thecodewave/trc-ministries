// ============================================================
// TRC Ministries — Pastors Page (Firestore powered)
// pages/Pastors/Pastors.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { getAllPastors } from '../../services/pastorService'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Pastors.css'

// ── Avatar component ─────────────────────────────────────────
// Shows the real photo if photoUrl is set and loads correctly.
// Falls back to styled initials if no URL or image fails to load.
function PastorAvatar({ pastor, size = 'lg' }) {
  const [imgFailed, setImgFailed] = useState(false)

  const initials = (pastor.name || '')
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Show photo if URL exists and hasn't failed
  if (pastor.photoUrl && !imgFailed) {
    return (
      <img
        src={pastor.photoUrl}
        alt={pastor.name}
        className={`pastor-avatar pastor-avatar--photo pastor-avatar--${size}`}
        onError={() => setImgFailed(true)}
      />
    )
  }

  // Fallback — initials circle
  return (
    <div className={`pastor-avatar pastor-avatar--initials pastor-avatar--${size}`}>
      {initials}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
function Pastors() {
  const [pastors, setPastors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    getAllPastors()
      .then(setPastors)
      .catch((err) => { console.error(err); setError(true) })
      .finally(() => setLoading(false))
  }, [])

  const senior     = pastors.find((p) => p.isSenior)
  const associates = pastors.filter((p) => !p.isSenior)

  return (
    <div className="pastors">
      <Navbar />

      <section className="pastors__hero">
        <div className="pastors__hero-deco pastors__hero-deco--1" />
        <div className="pastors__hero-inner">
          <p className="pastors__hero-eyebrow">Leadership</p>
          <h1 className="pastors__hero-title">Meet our pastors</h1>
          <p className="pastors__hero-sub">
            Servant leaders committed to guiding the TRC family in faith, love,
            and purpose. Each one called, consecrated, and committed to your
            spiritual growth.
          </p>
        </div>
      </section>

      <div className="pastors__body">

        {/* Loading */}
        {loading && (
          <div className="pastors__loading">
            <div className="pastors__spinner" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="pastors__empty">
            <p className="pastors__empty-title">Unable to load pastor profiles</p>
            <p className="pastors__empty-sub">Please check your connection and try again.</p>
          </div>
        )}

        {/* Empty — no pastors added yet */}
        {!loading && !error && pastors.length === 0 && (
          <div className="pastors__empty">
            <p className="pastors__empty-title">Meet our leadership team</p>
            <p className="pastors__empty-sub">
              Pastor profiles are being set up. Please check back soon, or visit us
              on Sunday and meet the team in person.
            </p>
          </div>
        )}

        {/* Pastors loaded */}
        {!loading && !error && pastors.length > 0 && (
          <>
            {/* ── Senior pastor featured section ── */}
            {senior && (
              <div className="pastors__featured">
                <div className="pastors__featured-avatar-wrap">
                  <PastorAvatar pastor={senior} size="xl" />
                  <span className="pastors__featured-badge">Senior Pastor</span>
                </div>
                <div className="pastors__featured-info">
                  <p className="pastors__featured-role">
                    Founder &amp; Senior Pastor · TRC Ministries
                  </p>
                  <h2 className="pastors__featured-name">{senior.name}</h2>
                  <p className="pastors__featured-bio">{senior.bio}</p>
                  {senior.tags && (
                    <div className="pastors__featured-tags">
                      {(typeof senior.tags === 'string'
                        ? senior.tags.split(',').map((t) => t.trim()).filter(Boolean)
                        : Array.isArray(senior.tags) ? senior.tags : []
                      ).map((tag) => (
                        <span key={tag} className="pastors__featured-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If no senior pastor, show all in grid */}
            {!senior && (
              <div className="pastors__associates-grid">
                {pastors.map((pastor) => (
                  <AssociateCard key={pastor.id} pastor={pastor} />
                ))}
              </div>
            )}

            {/* ── Associate pastors ── */}
            {associates.length > 0 && (
              <>
                <p className="pastors__section-label">Our team</p>
                <div className="pastors__associates-grid">
                  {associates.map((pastor) => (
                    <AssociateCard key={pastor.id} pastor={pastor} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

      </div>

      <Footer />
    </div>
  )
}

function AssociateCard({ pastor }) {
  return (
    <div className="pastors__associate-card">
      <div className="pastors__associate-avatar-wrap">
        <PastorAvatar pastor={pastor} size="lg" />
      </div>
      <div className="pastors__associate-bar" />
      <div className="pastors__associate-body">
        <h3 className="pastors__associate-name">{pastor.name}</h3>
        <span className="pastors__associate-role">{pastor.role}</span>
        <p className="pastors__associate-bio">{pastor.bio}</p>
      </div>
    </div>
  )
}

export default Pastors
