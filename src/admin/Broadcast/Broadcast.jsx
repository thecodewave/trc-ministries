// ============================================================
// TRC Ministries — Admin Broadcast
// admin/Broadcast/Broadcast.jsx
//
// Send email or SMS to all members.
// Email: EmailJS (free tier — 200 emails/month)
// SMS:   Arkesel (popular in Ghana, cheap rates)
//
// To activate:
//   Email → get API key from emailjs.com → add VITE_EMAILJS_SERVICE_ID,
//           VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY to .env.local
//   SMS   → get API key from arkesel.com → add VITE_ARKESEL_API_KEY to .env.local
// ============================================================

import { useState, useEffect } from 'react'
import { getAllMembers } from '../../services/memberService'
import './Broadcast.css'

const CHANNELS = [
  { key:'email', label:'Email blast',      icon:'✉',  desc:'Send to all members with email addresses' },
  { key:'sms',   label:'SMS broadcast',    icon:'📱',  desc:'Send to all members with phone numbers'   },
]

function Broadcast() {
  const [members,   setMembers]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [channel,   setChannel]   = useState('email')
  const [subject,   setSubject]   = useState('')
  const [message,   setMessage]   = useState('')
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState('')
  const [preview,   setPreview]   = useState(false)

  useEffect(() => {
    getAllMembers().then(setMembers).catch(console.error).finally(() => setLoading(false))
  }, [])

  const emailMembers = members.filter((m) => m.email && m.isActive !== false)
  const smsMembers   = members.filter((m) => m.phone && m.isActive !== false)
  const targetCount  = channel === 'email' ? emailMembers.length : smsMembers.length

  async function handleSend(e) {
    e.preventDefault()
    if (!message.trim()) { setError('Message cannot be empty.'); return }
    if (channel === 'email' && !subject.trim()) { setError('Subject is required for email.'); return }
    setSending(true)
    setError('')

    try {
      if (channel === 'email') {
        // EmailJS integration — add your keys to .env.local to activate
        const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
        const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

        if (!serviceId || !templateId || !publicKey) {
          throw new Error('Email API keys not configured yet. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY to your .env.local file.')
        }

        // Send to each email member
        let successCount = 0
        for (const member of emailMembers) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id:  serviceId,
              template_id: templateId,
              user_id:     publicKey,
              template_params: {
                to_name:    `${member.firstName} ${member.lastName}`,
                to_email:   member.email,
                subject:    subject,
                message:    message,
                from_name:  'TRC Ministries',
              }
            })
          })
          if (response.ok) successCount++
        }
        setSent(true)

      } else {
        // Arkesel SMS integration — add your key to .env.local to activate
        const arkeselKey = import.meta.env.VITE_ARKESEL_API_KEY

        if (!arkeselKey) {
          throw new Error('SMS API key not configured yet. Add VITE_ARKESEL_API_KEY to your .env.local file. Get your key from arkesel.com')
        }

        // Build recipients list for Arkesel
        const recipients = smsMembers.map((m) => m.phone.replace(/\s/g, '').replace(/^0/, '233')).join(',')

        const response = await fetch('https://sms.arkesel.com/sms/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action:    'send-sms',
            api_key:   arkeselKey,
            to:        recipients,
            from:      'TRCMinistries',
            sms:       message,
          })
        })
        setSent(true)
      }
    } catch (err) {
      setError(err.message || 'Failed to send. Please try again.')
    }

    setSending(false)
  }

  if (sent) {
    return (
      <div className="broadcast">
        <div className="broadcast__topbar">
          <div><h1 className="broadcast__title">Broadcast</h1></div>
        </div>
        <div className="broadcast__content">
          <div className="broadcast__success">
            <div className="broadcast__success-icon">✓</div>
            <h2 className="broadcast__success-title">Broadcast sent!</h2>
            <p className="broadcast__success-sub">Your {channel === 'email' ? 'email' : 'SMS'} was sent to {targetCount} members.</p>
            <button className="broadcast__success-btn" onClick={() => { setSent(false); setSubject(''); setMessage('') }}>
              Send another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="broadcast">
      <div className="broadcast__topbar">
        <div>
          <h1 className="broadcast__title">Broadcast</h1>
          <p className="broadcast__sub">Send a message to all members via email or SMS</p>
        </div>
      </div>

      <div className="broadcast__content">
        <div className="broadcast__api-notice">
          <p className="broadcast__api-notice-title">⚙ API keys required to send</p>
          <p className="broadcast__api-notice-text">
            <strong>Email (EmailJS):</strong> Free — 200 emails/month. Get keys at <strong>emailjs.com</strong> → add to .env.local<br />
            <strong>SMS (Arkesel):</strong> Ghana-based, cheap rates. Get key at <strong>arkesel.com</strong> → add to .env.local<br />
            The form is fully built — just add the API keys when you are ready to activate.
          </p>
        </div>

        <div className="broadcast__stats">
          <div className="broadcast__stat broadcast__stat--email">
            <p className="broadcast__stat-value">{loading ? '...' : emailMembers.length}</p>
            <p className="broadcast__stat-label">Members with email</p>
          </div>
          <div className="broadcast__stat broadcast__stat--sms">
            <p className="broadcast__stat-value">{loading ? '...' : smsMembers.length}</p>
            <p className="broadcast__stat-label">Members with phone</p>
          </div>
          <div className="broadcast__stat broadcast__stat--total">
            <p className="broadcast__stat-value">{loading ? '...' : members.filter((m) => m.isActive !== false).length}</p>
            <p className="broadcast__stat-label">Total active members</p>
          </div>
        </div>

        <div className="broadcast__channel-tabs">
          {CHANNELS.map(({ key, label, icon, desc }) => (
            <button
              key={key}
              className={`broadcast__channel-tab ${channel === key ? 'broadcast__channel-tab--active' : ''}`}
              onClick={() => setChannel(key)}
            >
              <span className="broadcast__channel-icon">{icon}</span>
              <div>
                <p className="broadcast__channel-label">{label}</p>
                <p className="broadcast__channel-desc">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <form className="broadcast__form" onSubmit={handleSend}>
          {channel === 'email' && (
            <div className="broadcast__field">
              <label className="broadcast__label">Email subject *</label>
              <input
                className="broadcast__input"
                placeholder="e.g. Sunday Service Reminder"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
          )}

          <div className="broadcast__field">
            <label className="broadcast__label">
              Message *
              {channel === 'sms' && <span className="broadcast__sms-count"> {message.length}/160</span>}
            </label>
            <textarea
              className="broadcast__textarea"
              placeholder={channel === 'email'
                ? 'Dear [Name],\n\nWrite your message here...\n\nGod bless,\nTRC Ministries'
                : 'Write your SMS message here (max 160 characters for standard rate)...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={channel === 'email' ? 8 : 4}
              required
            />
          </div>

          <div className="broadcast__recipient-info">
            <span className="broadcast__recipient-badge">
              Will be sent to <strong>{targetCount}</strong> {channel === 'email' ? 'email addresses' : 'phone numbers'}
            </span>
            <button type="button" className="broadcast__preview-btn" onClick={() => setPreview((p) => !p)}>
              {preview ? 'Hide preview' : 'Preview message'}
            </button>
          </div>

          {preview && message && (
            <div className="broadcast__preview">
              <p className="broadcast__preview-label">Preview</p>
              {channel === 'email' && subject && (
                <p className="broadcast__preview-subject"><strong>Subject:</strong> {subject}</p>
              )}
              <p className="broadcast__preview-text">{message}</p>
            </div>
          )}

          {error && <p className="broadcast__error">{error}</p>}

          <button type="submit" className="broadcast__send-btn" disabled={sending || loading}>
            {sending ? `Sending to ${targetCount} members...` : `Send ${channel === 'email' ? 'email' : 'SMS'} to ${targetCount} members`}
          </button>
        </form>
      </div>
    </div>
  )
}
export default Broadcast
