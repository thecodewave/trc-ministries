// ============================================================
// TRC Ministries — Home Page
// pages/Home/Home.jsx
// Feature cards pull latest sermon + event from Firestore
// ============================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPublishedSermons } from '../../services/sermonService'
import { getPublishedEvents }  from '../../services/eventService'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Home.css'

const SERVICES = [
  { time:'9:00 AM',  label:'First service'   },
  { time:'11:00 AM', label:'Second service'  },
  { time:'6:00 PM',  label:'Evening service' },
]

const VALUES = [
  { title:'Spirit-led worship',  text:'Encountering God in praise and power every service.' },
  { title:'Biblical teaching',   text:'Grounded in the truth of scripture every week.'      },
  { title:'Community care',      text:'A family that loves and looks out for one another.'  },
  { title:'Missions',            text:'Reaching the unreached across Ghana and beyond.'     },
]

function Home() {
  const [latestSermon, setLatestSermon] = useState(null)
  const [nextEvent,    setNextEvent]    = useState(null)

  useEffect(() => {
    // Load latest published sermon
    getPublishedSermons()
      .then((sermons) => { if (sermons.length > 0) setLatestSermon(sermons[0]) })
      .catch(console.error)

    // Load next upcoming event
    getPublishedEvents()
      .then((events) => { if (events.length > 0) setNextEvent(events[0]) })
      .catch(console.error)
  }, [])

  return (
    <div className="home">
      <Navbar />

      {/* ── Hero ── */}
      <section className="home__hero">
        <div className="home__hero-overlay" aria-hidden="true" />
        <div className="home__hero-content">
          <div className="home__hero-eyebrow">
            <span className="home__hero-dot" aria-hidden="true" />
            Welcome to The Revelation Church
          </div>
          <h1 className="home__hero-title">
            A Community<br />Built on Faith<br />&amp; Fire
          </h1>
          <p className="home__hero-sub">
            Experience the power of God every Sunday. Join the TRC family
            at The Olive Place, 6 Garden Link, East Legon, Accra.
          </p>
          <div className="home__hero-btns">
            <Link to="/register" className="home__hero-btn home__hero-btn--primary">Plan your visit</Link>
            <Link to="/sermons"  className="home__hero-btn home__hero-btn--ghost">Watch sermons</Link>
          </div>
          <div className="home__services">
            {SERVICES.map(({ time, label }) => (
              <div key={time} className="home__service">
                <span className="home__service-time">{time}</span>
                <span className="home__service-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dynamic feature cards ── */}
      <section className="home__cards">
        <div className="home__cards-grid">

          {/* Latest sermon — dynamic */}
          <Link to="/sermons" className="home__card home__card--sermon">
            <span className="home__card-tag home__card-tag--brand">Latest sermon</span>
            {latestSermon ? (
              <>
                <h3 className="home__card-title">{latestSermon.title}</h3>
                <p className="home__card-meta">
                  {latestSermon.preacher} · {latestSermon.scripture} · {latestSermon.duration}
                </p>
              </>
            ) : (
              <>
                <h3 className="home__card-title">Sermons &amp; teachings</h3>
                <p className="home__card-meta">New messages added every Sunday</p>
              </>
            )}
            <span className="home__card-cta">Watch now →</span>
          </Link>

          {/* Upcoming event — dynamic */}
          <Link to="/events" className="home__card home__card--event">
            <span className="home__card-tag home__card-tag--teal">Upcoming event</span>
            {nextEvent ? (
              <>
                <h3 className="home__card-title">{nextEvent.title}</h3>
                <p className="home__card-meta">
                  {nextEvent.date ? new Date(nextEvent.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : ''}
                  {nextEvent.time ? ` · ${nextEvent.time}` : ''}
                  {nextEvent.location ? ` · ${nextEvent.location}` : ''}
                </p>
              </>
            ) : (
              <>
                <h3 className="home__card-title">Upcoming events</h3>
                <p className="home__card-meta">Services, conferences and special events</p>
              </>
            )}
            <span className="home__card-cta">See all events →</span>
          </Link>

          {/* Register CTA — always static */}
          <Link to="/register" className="home__card home__card--announce">
            <span className="home__card-tag home__card-tag--gold">Join us</span>
            <h3 className="home__card-title">Become a member</h3>
            <p className="home__card-meta">
              Register today and become an official part of the TRC family
            </p>
            <span className="home__card-cta">Register now →</span>
          </Link>

        </div>
      </section>

      {/* ── Welcome section ── */}
      <section className="home__welcome">
        <div className="home__welcome-grid">
          <div className="home__welcome-text">
            <span className="home__welcome-label">Who we are</span>
            <h2 className="home__welcome-title">You are welcome<br />at TRC Ministries</h2>
            <p className="home__welcome-body">
              We are a Spirit-filled, Pentecostal family rooted in the Word of God.
              Whether you are new to faith or have walked with God for years,
              there is a place for you here. Come as you are — you belong with us.
            </p>
            <Link to="/about" className="home__welcome-btn">Learn about us</Link>
          </div>
          <div className="home__values-grid">
            {VALUES.map(({ title, text }) => (
              <div key={title} className="home__value-card">
                <h4 className="home__value-title">{title}</h4>
                <p className="home__value-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="home__cta-banner">
        <div className="home__cta-banner-content">
          <h2 className="home__cta-banner-title">New here? Come join us this Sunday.</h2>
          <p className="home__cta-banner-sub">
            The Olive Place · 6 Garden Link, East Legon, Accra · Sundays 9 AM, 11 AM &amp; 6 PM
          </p>
          <Link to="/register" className="home__cta-banner-btn">Register as a member</Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
