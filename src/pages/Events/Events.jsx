// ============================================================
// TRC Ministries — Events Page
// pages/Events/Events.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedEvents } from '../../services/eventService'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Events.css'

const TAG_MODS = {
  'Worship service': 'brand', 'Youth event': 'teal',
  'Conference': 'gold', 'Anniversary': 'rose',
  "Men's event": 'teal', "Women's event": 'rose', 'Other': 'brand',
}

function EventCard({ ev }) {
  const mod = TAG_MODS[ev.tag] || 'brand'
  const d   = ev.date ? new Date(ev.date) : null

  // If event has a poster — show it as the hero of the card
  if (ev.posterUrl) {
    return (
      <div className="event-card event-card--poster">
        <div className="event-card__poster-wrap">
          <img
            src={ev.posterUrl}
            alt={ev.title}
            className="event-card__poster-img"
            onError={(e) => { e.target.closest('.event-card__poster-wrap').style.display = 'none' }}
          />
          <span className={`event-card__poster-tag event-card__poster-tag--${mod}`}>{ev.tag}</span>
        </div>
        <div className="event-card__body event-card__body--poster">
          <div className="event-card__poster-date-row">
            <div className={`event-card__date-block event-card__date-block--${mod}`}>
              <span className={`event-card__day event-card__day--${mod}`}>{d ? d.getDate() : '—'}</span>
              <span className={`event-card__month event-card__month--${mod}`}>
                {d ? d.toLocaleString('default', { month: 'short' }) : '—'}
              </span>
            </div>
            <div>
              <h3 className="event-card__title">{ev.title}</h3>
              <div className="event-card__meta">
                {ev.time && <span className="event-card__meta-item">{ev.time}</span>}
                {ev.time && ev.location && <span className="event-card__meta-dot" />}
                {ev.location && <span className="event-card__meta-item">{ev.location}</span>}
              </div>
            </div>
          </div>
          {ev.description && <p className="event-card__desc">{ev.description}</p>}
        </div>
      </div>
    )
  }

  // No poster — show the date block layout
  return (
    <div className={`event-card event-card--${mod}`}>
      <div className={`event-card__date-block event-card__date-block--${mod}`}>
        <span className={`event-card__day event-card__day--${mod}`}>{d ? d.getDate() : '—'}</span>
        <span className={`event-card__month event-card__month--${mod}`}>
          {d ? d.toLocaleString('default', { month: 'short' }) : '—'}
        </span>
      </div>
      <div className="event-card__body">
        <div className="event-card__top-row">
          <span className={`event-card__tag event-card__tag--${mod}`}>{ev.tag}</span>
        </div>
        <h3 className="event-card__title">{ev.title}</h3>
        <div className="event-card__meta">
          {ev.time && <span className="event-card__meta-item">{ev.time}</span>}
          {ev.time && ev.location && <span className="event-card__meta-dot" />}
          {ev.location && <span className="event-card__meta-item">{ev.location}</span>}
        </div>
        {ev.description && <p className="event-card__desc">{ev.description}</p>}
      </div>
    </div>
  )
}

function Events() {
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeTag, setActiveTag] = useState('All events')

  useEffect(() => {
    getPublishedEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const tags     = ['All events', ...new Set(events.map((e) => e.tag).filter(Boolean))]
  const filtered = activeTag === 'All events' ? events : events.filter((e) => e.tag === activeTag)

  // Split into poster events and non-poster events for layout
  const posterEvents = filtered.filter((e) => e.posterUrl)
  const listEvents   = filtered.filter((e) => !e.posterUrl)

  return (
    <div className="events">
      <Navbar />

      <section className="events__hero">
        <div className="events__hero-deco events__hero-deco--1" />
        <div className="events__hero-deco events__hero-deco--2" />
        <div className="events__hero-inner">
          <p className="events__hero-eyebrow">What's on</p>
          <h1 className="events__hero-title">Upcoming events</h1>
          <p className="events__hero-sub">
            Stay connected with everything happening at TRC Ministries.
            Something is always going on — come be a part of it.
          </p>
        </div>
      </section>

      <section className="events__body">
        {loading ? (
          <div className="events__loading"><div className="events__spinner" /></div>
        ) : events.length === 0 ? (
          <div className="events__empty-state">
            <div className="events__empty-icon">📅</div>
            <h2 className="events__empty-title">Events coming soon</h2>
            <p className="events__empty-sub">
              No events are currently published. Check back soon for upcoming
              services, conferences, and special events.
            </p>
            <Link to="/contact" className="events__empty-btn">Contact us for more info</Link>
          </div>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="events__toolbar">
              <div className="events__filter-group">
                {tags.map((t) => (
                  <button
                    key={t}
                    className={`events__filter-pill ${activeTag === t ? 'events__filter-pill--active' : ''}`}
                    onClick={() => setActiveTag(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Poster events — displayed in a 2-column grid */}
            {posterEvents.length > 0 && (
              <div className="events__poster-grid">
                {posterEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)}
              </div>
            )}

            {/* Non-poster events — displayed as rows */}
            {listEvents.length > 0 && (
              <div className="events__grid">
                {listEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="events__empty">
                <p className="events__empty-text">No events in this category.</p>
              </div>
            )}

            <div className="events__cta">
              <p className="events__cta-text">Want to stay updated on all TRC events?</p>
              <Link to="/register" className="events__cta-btn">Register as a member</Link>
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  )
}

export default Events
