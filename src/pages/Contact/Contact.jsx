import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Contact.css'

const SERVICES = [
  { day:'Sunday',    time:'9:00 AM & 11:00 AM', label:'First & second service' },
  { day:'Sunday',    time:'6:00 PM',             label:'Evening service'        },
  { day:'Wednesday', time:'6:00 PM',             label:'Midweek Bible study'    },
  { day:'Friday',    time:'6:00 PM',             label:'Youth service'          },
]

// Google Maps embed for 6 Garden Link East Legon Accra
const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.5!2d-0.1569!3d5.6372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzgnMTMuOSJOIDbCsDA5JzI1LjAiVw!5e0!3m2!1sen!2sgh!4v1234567890"
const MAPS_DIRECTIONS = "https://www.google.com/maps/dir/?api=1&destination=6+Garden+Link+East+Legon+Accra+Ghana"

function Contact() {
  const [form,   setForm]   = useState({ name:'', phone:'', email:'', subject:'', message:'' })
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    try {
      await addDoc(collection(db, 'messages'), {
        ...form,
        read: false,
        createdAt: serverTimestamp(),
      })
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="contact">
      <Navbar />
      <section className="contact__hero">
        <div className="contact__hero-deco contact__hero-deco--1" aria-hidden="true" />
        <div className="contact__hero-inner">
          <p className="contact__hero-eyebrow">Get in touch</p>
          <h1 className="contact__hero-title">Contact us</h1>
          <p className="contact__hero-sub">We would love to hear from you. Reach out and our team will get back to you within 24 hours.</p>
        </div>
      </section>

      <section className="contact__body">
        <div className="contact__grid">
          <div className="contact__info">
            <div className="contact__info-section">
              <p className="contact__info-label">Location</p>
              <div className="contact__info-item">
                <div className="contact__info-dot" />
                <div>
                  <p className="contact__info-text">The Olive Place - Revelation Church</p>
                  <p className="contact__info-sub">6 Garden Link, East Legon<br />Accra, Ghana</p>
                </div>
              </div>
            </div>

            <div className="contact__info-section">
              <p className="contact__info-label">Service times</p>
              {SERVICES.map(({ day, time, label }) => (
                <div key={`${day}-${time}`} className="contact__info-item">
                  <div className="contact__info-dot" />
                  <div>
                    <p className="contact__info-text">{day} · {time}</p>
                    <p className="contact__info-sub">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact__info-section">
              <p className="contact__info-label">Phone &amp; email</p>
              <div className="contact__info-item">
                <div className="contact__info-dot" />
                <div>
                  <p className="contact__info-text">030 123 4567</p>
                  <p className="contact__info-sub">Mon–Fri · 9 AM – 5 PM</p>
                </div>
              </div>
              <div className="contact__info-item">
                <div className="contact__info-dot" />
                <div>
                  <p className="contact__info-text">info@trcministries.org</p>
                  <p className="contact__info-sub">Email us anytime</p>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="contact__map">
              <iframe
                className="contact__map-iframe"
                title="TRC Ministries location"
                src={MAPS_EMBED}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={MAPS_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="contact__map-btn"
              >
                📍 Get directions · Open in Google Maps
              </a>
            </div>
          </div>

          <div className="contact__form-col">
            {status === 'success' ? (
              <div className="contact__form-success">
                <div className="contact__success-icon"><div className="contact__success-tick" /></div>
                <h3 className="contact__success-title">Message sent!</h3>
                <p className="contact__success-sub">Thank you for reaching out. We will get back to you within 24 hours.</p>
                <button className="contact__success-btn" onClick={() => { setStatus('idle'); setForm({ name:'', phone:'', email:'', subject:'', message:'' }) }}>Send another message</button>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit}>
                <h2 className="contact__form-title">Send us a message</h2>
                <div className="contact__field">
                  <label className="contact__label" htmlFor="c-name">Your name</label>
                  <input id="c-name" name="name" className="contact__input" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="contact__row">
                  <div className="contact__field">
                    <label className="contact__label" htmlFor="c-phone">Phone</label>
                    <input id="c-phone" name="phone" className="contact__input" type="tel" placeholder="024 000 0000" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="contact__field">
                    <label className="contact__label" htmlFor="c-email">Email</label>
                    <input id="c-email" name="email" className="contact__input" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="contact__field">
                  <label className="contact__label" htmlFor="c-subject">Subject</label>
                  <input id="c-subject" name="subject" className="contact__input" type="text" placeholder="What is this about?" value={form.subject} onChange={handleChange} required />
                </div>
                <div className="contact__field">
                  <label className="contact__label" htmlFor="c-message">Message</label>
                  <textarea id="c-message" name="message" className="contact__textarea" placeholder="Write your message here..." value={form.message} onChange={handleChange} required rows={5} />
                </div>
                {status === 'error' && <p className="contact__error">Something went wrong. Please try again.</p>}
                <button type="submit" className="contact__submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
export default Contact
