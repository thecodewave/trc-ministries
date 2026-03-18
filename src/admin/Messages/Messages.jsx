import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, orderBy, query, deleteDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import './Messages.css'

function Messages() {
  const [messages,   setMessages]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activeId,   setActiveId]   = useState(null)
  const [showUnread, setShowUnread] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
    getDocs(q).then((snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))).catch(console.error).finally(() => setLoading(false))
  }, [])

  async function markRead(id) {
    await updateDoc(doc(db, 'messages', id), { read: true })
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this message?')) return
    await deleteDoc(doc(db, 'messages', id))
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (activeId === id) setActiveId(null)
  }

  function handleOpen(msg) {
    setActiveId(msg.id)
    if (!msg.read) markRead(msg.id)
  }

  const displayed   = showUnread ? messages.filter((m) => !m.read) : messages
  const unreadCount = messages.filter((m) => !m.read).length
  const active      = messages.find((m) => m.id === activeId)

  function formatDate(ts) {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="messages-page">
      <div className="messages-page__topbar">
        <div>
          <h1 className="messages-page__title">Messages</h1>
          <p className="messages-page__sub">{messages.length} total · {unreadCount} unread</p>
        </div>
        <button className={`messages-page__filter-btn ${showUnread ? 'messages-page__filter-btn--active' : ''}`} onClick={() => setShowUnread((p) => !p)}>
          {showUnread ? 'Show all' : `Unread (${unreadCount})`}
        </button>
      </div>

      <div className="messages-page__layout">
        <div className="messages-page__list">
          {loading ? (
            <div className="messages-page__loading"><div className="messages-page__spinner" /></div>
          ) : displayed.length === 0 ? (
            <div className="messages-page__empty"><p>{showUnread ? 'No unread messages.' : 'No messages yet.'}</p></div>
          ) : displayed.map((msg) => (
            <div key={msg.id} className={`message-item ${activeId === msg.id ? 'message-item--active' : ''} ${!msg.read ? 'message-item--unread' : ''}`} onClick={() => handleOpen(msg)}>
              <div className="message-item__avatar">{(msg.name?.[0] || '?').toUpperCase()}</div>
              <div className="message-item__info">
                <div className="message-item__top">
                  <p className="message-item__name">{msg.name || 'Unknown'}</p>
                  <p className="message-item__time">{formatDate(msg.createdAt)}</p>
                </div>
                <p className="message-item__subject">{msg.subject || '(No subject)'}</p>
                <p className="message-item__preview">{(msg.message || '').substring(0, 80)}...</p>
              </div>
              {!msg.read && <div className="message-item__dot" />}
            </div>
          ))}
        </div>

        <div className="messages-page__detail">
          {active ? (
            <div className="message-detail">
              <div className="message-detail__header">
                <div>
                  <h2 className="message-detail__subject">{active.subject || '(No subject)'}</h2>
                  <p className="message-detail__from">From: <strong>{active.name}</strong></p>
                </div>
                <button className="message-detail__delete-btn" onClick={() => handleDelete(active.id)}>Delete</button>
              </div>
              <div className="message-detail__meta-row">
                {active.email && <a href={`mailto:${active.email}`} className="message-detail__meta-pill">✉ {active.email}</a>}
                {active.phone && <a href={`tel:${active.phone}`} className="message-detail__meta-pill">📞 {active.phone}</a>}
                <span className="message-detail__meta-pill message-detail__meta-pill--time">{formatDate(active.createdAt)}</span>
              </div>
              <div className="message-detail__body">
                <p className="message-detail__text">{active.message}</p>
              </div>
              <div className="message-detail__actions">
                {active.email && <a href={`mailto:${active.email}?subject=Re: ${active.subject}`} className="message-detail__reply-btn">Reply via email</a>}
                {active.phone && <a href={`tel:${active.phone}`} className="message-detail__call-btn">Call {active.phone}</a>}
              </div>
            </div>
          ) : (
            <div className="messages-page__no-selection">
              <p className="messages-page__no-selection-icon">✉</p>
              <p className="messages-page__no-selection-text">Select a message to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Messages
