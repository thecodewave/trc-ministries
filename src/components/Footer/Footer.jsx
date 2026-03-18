import { Link } from 'react-router-dom'
import './Footer.css'

const SOCIAL_LINKS = [
  { key:'facebook',  label:'Facebook',  href:'https://facebook.com/therevelationchurch',  svg: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' },
  { key:'instagram', label:'Instagram', href:'https://instagram.com/therevelationchurch', svg: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>' },
  { key:'youtube',   label:'YouTube',   href:'https://youtube.com/@therevelationchurch',  svg: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>' },
  { key:'twitter',   label:'X / Twitter', href:'https://twitter.com/revelationchurch', svg: '<path d="M4 4l16 16M4 20L20 4"/>' },
  { key:'tiktok',   label:'TikTok',     href:'https://tiktok.com/@therevelationchurch',  svg: '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.01a8.16 8.16 0 0 0 4.77 1.52V7.07a4.85 4.85 0 0 1-1-.38z"/>' },
]

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/trc-logo.jpg" alt="TRC Ministries" className="footer__logo-img" />
            <span className="footer__logo-name">TRC Ministries</span>
          </div>
          <p className="footer__tagline">The Revelation Church — A Spirit-filled community built on faith, fire, and purpose.</p>
          <p className="footer__address">
            The Olive Place - Revelation Church<br />
            6 Garden Link, East Legon<br />
            Accra, Ghana
          </p>
          {/* Social links */}
          <div className="footer__social">
            {SOCIAL_LINKS.map(({ key, label, href, svg }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label={label}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svg }} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer__column">
          <h4 className="footer__column-title">Quick links</h4>
          <ul className="footer__links">
            <li><Link to="/"        className="footer__link">Home</Link></li>
            <li><Link to="/about"   className="footer__link">About us</Link></li>
            <li><Link to="/pastors" className="footer__link">Our pastors</Link></li>
            <li><Link to="/groups"  className="footer__link">Groups</Link></li>
            <li><Link to="/sermons" className="footer__link">Sermons</Link></li>
            <li><Link to="/events"  className="footer__link">Events</Link></li>
          </ul>
        </div>

        <div className="footer__column">
          <h4 className="footer__column-title">Get involved</h4>
          <ul className="footer__links">
            <li><Link to="/register" className="footer__link">Become a member</Link></li>
            <li><Link to="/give"     className="footer__link">Give</Link></li>
            <li><Link to="/contact"  className="footer__link">Contact us</Link></li>
          </ul>
        </div>

        <div className="footer__column">
          <h4 className="footer__column-title">Service times</h4>
          <ul className="footer__services">
            <li className="footer__service"><span className="footer__service-day">Sunday</span><span className="footer__service-time">9:00 AM &amp; 11:00 AM</span></li>
            <li className="footer__service"><span className="footer__service-day">Sunday</span><span className="footer__service-time">6:00 PM</span></li>
            <li className="footer__service"><span className="footer__service-day">Wednesday</span><span className="footer__service-time">6:00 PM · Bible study</span></li>
          </ul>
          <p className="footer__contact-line">030 123 4567</p>
          <p className="footer__contact-line">info@trcministries.org</p>
          {/* Social in contact column too */}
          <div className="footer__social footer__social--sm" style={{marginTop:'var(--space-4)'}}>
            {SOCIAL_LINKS.map(({ key, label, href, svg }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label={label}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: svg }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-container">
          <p className="footer__copyright">&copy; {year} The Revelation Church (TRC Ministries). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
