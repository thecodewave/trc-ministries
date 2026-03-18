import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/',        label: 'Home'    },
  { to: '/about',   label: 'About'   },
  { to: '/pastors', label: 'Pastors' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events',  label: 'Events'  },
  { to: '/groups',  label: 'Groups'  },
  { to: '/give',    label: 'Give'    },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" onClick={close}>
          <img src="/trc-logo.jpg" alt="TRC Ministries" className="navbar__logo-img" />
          <span className="navbar__logo-name">TRC Ministries</span>
        </Link>

        <ul className="navbar__links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link to="/register" className="navbar__cta" onClick={close}>Join us</Link>

        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>
      </div>

      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? 'navbar__mobile-link navbar__mobile-link--active' : 'navbar__mobile-link'}
                onClick={close}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link to="/register" className="navbar__mobile-cta" onClick={close}>Join us</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
