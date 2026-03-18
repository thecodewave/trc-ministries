import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../../services/firebase'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Register.css'

const GROUPS = ['Youth Ministry', "Women's Fellowship", "Men's Fellowship", 'Praise & Worship Team', "Children's Ministry", 'Prayer & Intercession']
const HOW    = ['Friend or family', 'Social media', 'Walk-in', 'Online search', 'Other']

const INITIAL = { firstName:'', lastName:'', dob:'', gender:'', phone:'', email:'', address:'', group:'', howFound:'' }

function Register() {
  const [form,    setForm]    = useState(INITIAL)
  const [status,  setStatus]  = useState('idle')   // idle | loading | success | error
  const [errMsg,  setErrMsg]  = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    // Basic validation
    if (!form.phone || form.phone.length < 9) {
      setErrMsg('Please enter a valid phone number.')
      setStatus('error')
      return
    }

    try {
      // Check if phone already registered
      const q = query(collection(db, 'members'), where('phone', '==', form.phone))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setErrMsg('A member with this phone number already exists.')
        setStatus('error')
        return
      }

      // Save to Firestore
      await addDoc(collection(db, 'members'), {
        firstName:  form.firstName.trim(),
        lastName:   form.lastName.trim(),
        dob:        form.dob,
        gender:     form.gender,
        phone:      form.phone.trim(),
        email:      form.email.trim().toLowerCase(),
        address:    form.address.trim(),
        group:      form.group,
        howFound:   form.howFound,
        isActive:   true,
        joinDate:   new Date().toISOString().split('T')[0],
        createdAt:  serverTimestamp(),
      })

      setStatus('success')
      setForm(INITIAL)
    } catch (err) {
      console.error(err)
      setErrMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="register">
        <Navbar />
        <div className="register__success">
          <div className="register__success-icon" aria-hidden="true">
            <div className="register__success-tick" />
          </div>
          <h2 className="register__success-title">Welcome to TRC Ministries!</h2>
          <p className="register__success-sub">You are now a registered member. Your phone number is your check-in ID every Sunday. We look forward to seeing you!</p>
          <div className="register__success-btns">
            <Link to="/" className="register__success-btn register__success-btn--primary">Go to homepage</Link>
            <Link to="/events" className="register__success-btn register__success-btn--ghost">See upcoming events</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="register">
      <Navbar />
      <section className="register__hero">
        <div className="register__hero-deco register__hero-deco--1" aria-hidden="true" />
        <div className="register__hero-inner">
          <p className="register__hero-eyebrow">Membership</p>
          <h1 className="register__hero-title">Join TRC Ministries</h1>
          <p className="register__hero-sub">Register to become an official member of the TRC family. Your phone number will be your Sunday check-in ID.</p>
        </div>
      </section>

      <section className="register__body">
        <form className="register__form" onSubmit={handleSubmit} noValidate>

          <div className="register__section-title">Personal information</div>
          <div className="register__row">
            <div className="register__field">
              <label className="register__label" htmlFor="firstName">First name</label>
              <input id="firstName" name="firstName" className="register__input" type="text" placeholder="Emmanuel" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className="register__field">
              <label className="register__label" htmlFor="lastName">Last name</label>
              <input id="lastName" name="lastName" className="register__input" type="text" placeholder="Asante" value={form.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div className="register__row">
            <div className="register__field">
              <label className="register__label" htmlFor="dob">Date of birth</label>
              <input id="dob" name="dob" className="register__input" type="date" value={form.dob} onChange={handleChange} required />
            </div>
            <div className="register__field">
              <label className="register__label" htmlFor="gender">Gender</label>
              <select id="gender" name="gender" className="register__select" value={form.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="register__section-title">Contact details</div>
          <div className="register__field">
            <label className="register__label register__label--highlight" htmlFor="phone">
              Phone number <span className="register__label-note">(this is your Sunday check-in ID)</span>
            </label>
            <input id="phone" name="phone" className="register__input register__input--highlight" type="tel" placeholder="024 456 7890" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="register__row">
            <div className="register__field">
              <label className="register__label" htmlFor="email">Email address</label>
              <input id="email" name="email" className="register__input" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="register__field">
              <label className="register__label" htmlFor="address">Residential address</label>
              <input id="address" name="address" className="register__input" type="text" placeholder="East Legon, Accra" value={form.address} onChange={handleChange} />
            </div>
          </div>

          <div className="register__section-title">Church details</div>
          <div className="register__row">
            <div className="register__field">
              <label className="register__label" htmlFor="group">Ministry / group</label>
              <select id="group" name="group" className="register__select" value={form.group} onChange={handleChange}>
                <option value="">Select a group</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="register__field">
              <label className="register__label" htmlFor="howFound">How did you find us?</label>
              <select id="howFound" name="howFound" className="register__select" value={form.howFound} onChange={handleChange}>
                <option value="">Select an option</option>
                {HOW.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {errMsg && <p className="register__error" role="alert">{errMsg}</p>}

          <button type="submit" className="register__submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Registering...' : 'Register as a member'}
          </button>

          <p className="register__note">
            Already a member? Your phone number is your check-in ID every Sunday.
            Contact us at <Link to="/contact" className="register__note-link">our contact page</Link> if you need help.
          </p>
        </form>
      </section>
      <Footer />
    </div>
  )
}
export default Register
