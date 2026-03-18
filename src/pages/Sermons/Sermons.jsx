// ============================================================
// TRC Ministries — Sermons Page
// pages/Sermons/Sermons.jsx
// Only shows sermons published from the admin panel.
// ============================================================

import { useState, useEffect } from 'react'
import { getPublishedSermons } from '../../services/sermonService'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Sermons.css'

function SermonCard({ sermon, featured }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className={`sermon-card ${featured ? 'sermon-card--featured' : ''}`}>
      <div className="sermon-card__media">
        {playing ? (
          <iframe
            className="sermon-card__iframe"
            src={`https://www.youtube.com/embed/${sermon.youtubeId}?autoplay=1`}
            title={sermon.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="sermon-card__thumbnail"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${sermon.title}`}
          >
            {sermon.youtubeId && (
              <img
                src={`https://img.youtube.com/vi/${sermon.youtubeId}/mqdefault.jpg`}
                alt=""
                className="sermon-card__yt-thumb"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}
            <div className="sermon-card__play-ring">
              <div className="sermon-card__play-tri" />
            </div>
            {featured && <span className="sermon-card__featured-badge">Latest sermon</span>}
          </button>
        )}
      </div>
      <div className="sermon-card__body">
        <div className="sermon-card__meta-row">
          <span className="sermon-card__series">{sermon.series || 'General'}</span>
          <span className="sermon-card__duration">{sermon.duration}</span>
        </div>
        <h3 className="sermon-card__title">{sermon.title}</h3>
        <p className="sermon-card__preacher">{sermon.preacher}</p>
        <p className="sermon-card__scripture">{sermon.scripture} · {sermon.date}</p>
      </div>
    </div>
  )
}

function Sermons() {
  const [sermons,        setSermons]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeSeries,   setActiveSeries]   = useState('All series')
  const [activePreacher, setActivePreacher] = useState('All preachers')

  useEffect(() => {
    // No fallback — only show what admin has published
    getPublishedSermons()
      .then(setSermons)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const series    = ['All series',    ...new Set(sermons.map((s) => s.series).filter(Boolean))]
  const preachers = ['All preachers', ...new Set(sermons.map((s) => s.preacher).filter(Boolean))]

  const filtered = sermons.filter((s) => {
    const okSeries   = activeSeries   === 'All series'    || s.series   === activeSeries
    const okPreacher = activePreacher === 'All preachers' || s.preacher === activePreacher
    return okSeries && okPreacher
  })

  const featured = filtered[0]
  const rest     = filtered.slice(1)

  return (
    <div className="sermons">
      <Navbar />

      <section className="sermons__hero">
        <div className="sermons__hero-deco sermons__hero-deco--1" />
        <div className="sermons__hero-deco sermons__hero-deco--2" />
        <div className="sermons__hero-inner">
          <p className="sermons__hero-eyebrow">Media library</p>
          <h1 className="sermons__hero-title">Sermons &amp; teachings</h1>
          <p className="sermons__hero-sub">
            Catch up on any message you missed or revisit a sermon that changed your life.
            New messages added every Sunday.
          </p>
        </div>
      </section>

      <section className="sermons__body">
        {loading ? (
          <div className="sermons__loading"><div className="sermons__spinner" /></div>
        ) : sermons.length === 0 ? (
          /* Empty state — no sermons published yet */
          <div className="sermons__empty-state">
            <div className="sermons__empty-icon">🎙</div>
            <h2 className="sermons__empty-title">Sermons coming soon</h2>
            <p className="sermons__empty-sub">
              Our media library is being set up. Check back soon for the latest messages from TRC Ministries.
            </p>
          </div>
        ) : (
          <>
            {/* Filters — only show if there are sermons */}
            <div className="sermons__filters">
              <div className="sermons__filter-group">
                {series.map((s) => (
                  <button
                    key={s}
                    className={`sermons__filter-pill ${activeSeries === s ? 'sermons__filter-pill--active' : ''}`}
                    onClick={() => setActiveSeries(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="sermons__filter-group">
                {preachers.map((p) => (
                  <button
                    key={p}
                    className={`sermons__filter-pill ${activePreacher === p ? 'sermons__filter-pill--active' : ''}`}
                    onClick={() => setActivePreacher(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {featured && (
              <div className="sermons__featured">
                <SermonCard sermon={featured} featured={true} />
              </div>
            )}

            {rest.length > 0 && (
              <div className="sermons__grid">
                {rest.map((s) => <SermonCard key={s.id} sermon={s} featured={false} />)}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="sermons__empty">
                <p className="sermons__empty-text">No sermons match this filter.</p>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default Sermons
