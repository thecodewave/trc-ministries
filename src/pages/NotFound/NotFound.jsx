import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './NotFound.css'

function NotFound() {
  return (
    <div className="not-found">
      <Navbar />
      <section className="not-found__body">
        <div className="not-found__illustration" aria-hidden="true">
          <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="56" fill="#f5f0ff"/>
            <ellipse cx="60" cy="92" rx="28" ry="34" fill="#eeeeff"/>
            <rect x="54" y="74" width="12" height="16" rx="5" fill="#AFA9EC"/>
            <ellipse cx="60" cy="60" rx="22" ry="24" fill="#AFA9EC"/>
            <ellipse cx="60" cy="39" rx="22" ry="13" fill="#2d2a9e"/>
            <circle cx="51" cy="58" r="4" fill="#fff"/>
            <circle cx="69" cy="58" r="4" fill="#fff"/>
            <circle cx="52" cy="59" r="2.5" fill="#1a1654"/>
            <circle cx="70" cy="59" r="2.5" fill="#1a1654"/>
            <path d="M53 71 Q60 65 67 71" stroke="#9896bb" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="not-found__code">404</p>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__sub">Looks like this page has wandered off. Let us lead you back home.</p>
        <div className="not-found__btns">
          <Link to="/" className="not-found__btn not-found__btn--primary">Go to homepage</Link>
          <Link to="/sermons" className="not-found__btn not-found__btn--ghost">View sermons</Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
export default NotFound
