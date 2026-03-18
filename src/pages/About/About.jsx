import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './About.css'

const STATS = [
  { num:'284', label:'Registered members', mod:'brand' },
  { num:'10+', label:'Years of ministry',   mod:'teal'  },
  { num:'8',   label:'Cell groups',         mod:'gold'  },
]

const VALUES = [
  { title:'Spirit-led worship',  sub:'Encountering God in praise', color:'brand' },
  { title:'Biblical teaching',   sub:'Grounded in scripture',       color:'teal'  },
  { title:'Community care',      sub:'Loving one another',          color:'gold'  },
  { title:'Missions',            sub:'Reaching the unreached',      color:'rose'  },
]

function About() {
  return (
    <div className="about">
      <Navbar />

      {/* Hero with church background pattern */}
      <section className="about__hero">
        <div className="about__hero-overlay" />
        <div className="about__hero-inner">
          <p className="about__hero-eyebrow">Our story</p>
          <h1 className="about__hero-title">About The Revelation Church</h1>
          <p className="about__hero-sub">A Spirit-filled community rooted in the Word, growing in faith, and reaching the world from East Legon, Accra.</p>
          <span className="about__hero-pill">The Olive Place · 6 Garden Link, East Legon · Accra</span>
        </div>
      </section>

      {/* Visual banner strip */}
      <div className="about__visual-strip">
        <div className="about__visual-card about__visual-card--1">
          <div className="about__visual-icon">🙏</div>
          <p className="about__visual-label">Prayer</p>
        </div>
        <div className="about__visual-card about__visual-card--2">
          <div className="about__visual-icon">📖</div>
          <p className="about__visual-label">The Word</p>
        </div>
        <div className="about__visual-card about__visual-card--3">
          <div className="about__visual-icon">🔥</div>
          <p className="about__visual-label">Holy Spirit</p>
        </div>
        <div className="about__visual-card about__visual-card--4">
          <div className="about__visual-icon">🌍</div>
          <p className="about__visual-label">Missions</p>
        </div>
        <div className="about__visual-card about__visual-card--5">
          <div className="about__visual-icon">🤝</div>
          <p className="about__visual-label">Community</p>
        </div>
      </div>

      <div className="about__body">
        <div className="about__stats-row">
          {STATS.map(({ num, label, mod }) => (
            <div key={label} className={`about__stat about__stat--${mod}`}>
              <span className={`about__stat-num about__stat-num--${mod}`}>{num}</span>
              <span className="about__stat-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="about__mission">
          <p className="about__mission-label">Our mission</p>
          <p className="about__mission-text">
            To raise a generation of Spirit-filled believers who impact their families, communities,
            and nations through the power of the Holy Spirit and the Word of God.
          </p>
        </div>

        {/* About image block */}
        <div className="about__image-block">
          <div className="about__image-left">
            <div className="about__image-placeholder about__image-placeholder--main">
              <div className="about__image-inner">
                <img src="/trc-logo-full.png" alt="TRC Ministries" className="about__logo-large" />
                <p className="about__image-caption">The Revelation Church</p>
                <p className="about__image-sub">The Olive Place · East Legon · Accra</p>
              </div>
            </div>
          </div>
          <div className="about__image-right">
            <div className="about__image-placeholder about__image-placeholder--sm about__image-placeholder--brand">
              <div className="about__image-inner">
                <span style={{fontSize:'48px'}}>🏛️</span>
                <p className="about__image-caption">Sunday Service</p>
              </div>
            </div>
            <div className="about__image-placeholder about__image-placeholder--sm about__image-placeholder--gold">
              <div className="about__image-inner">
                <span style={{fontSize:'48px'}}>🎶</span>
                <p className="about__image-caption">Worship &amp; Praise</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about__section-title">Our core values</div>
        <div className="about__values-grid">
          {VALUES.map(({ title, sub, color }) => (
            <div key={title} className="about__value">
              <div className={`about__value-dot about__value-dot--${color}`} />
              <div>
                <h4 className="about__value-title">{title}</h4>
                <p className="about__value-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="about__history">
          <h2 className="about__history-title">Our history</h2>
          <p className="about__history-text">
            The Revelation Church (TRC Ministries) was founded by Pastor Gabby Ibe in East Legon, Accra.
            What began as a small prayer gathering has, by the grace of God, grown into a thriving
            congregation of over 280 registered members, multiple ministry groups, and a community
            deeply committed to the Word and the Spirit.
          </p>
          <p className="about__history-text">
            TRC Ministries has seen countless salvations, healings, and life transformations.
            Our vision remains unchanged — to be a house of prayer for all people, a centre of
            revival, and a launchpad for those called to missions and ministry.
            We meet every Sunday at The Olive Place, 6 Garden Link, East Legon.
          </p>
        </div>

        <div className="about__cta">
          <Link to="/register" className="about__cta-btn about__cta-btn--primary">Join the family</Link>
          <Link to="/contact"  className="about__cta-btn about__cta-btn--ghost">Get in touch</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
export default About
