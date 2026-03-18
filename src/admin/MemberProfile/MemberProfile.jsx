// ============================================================
// TRC Ministries — Member Profile
// admin/MemberProfile/MemberProfile.jsx
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getMemberById, archiveMember } from '../../services/memberService'
import './MemberProfile.css'

function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase()
}

function DetailRow({ label, value }) {
  return (
    <div className="member-profile__detail-row">
      <span className="member-profile__detail-label">{label}</span>
      <span className="member-profile__detail-value">{value || '—'}</span>
    </div>
  )
}

function MemberProfile() {
  const { id }            = useParams()
  const navigate          = useNavigate()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    getMemberById(id)
      .then(setMember)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  async function handleArchive() {
    if (!window.confirm(`Archive ${member.firstName} ${member.lastName}? They will be marked inactive.`)) return
    setArchiving(true)
    await archiveMember(id)
    navigate('/admin/members')
  }

  if (loading) return (
    <div className="member-profile__loading">
      <div className="member-profile__spinner" />
      <p>Loading member...</p>
    </div>
  )

  if (!member) return (
    <div className="member-profile__not-found">
      <p>Member not found.</p>
      <Link to="/admin/members" className="member-profile__back-btn">← Back to members</Link>
    </div>
  )

  const fullName = `${member.firstName} ${member.lastName}`

  return (
    <div className="member-profile">
      <div className="member-profile__topbar">
        <div>
          <Link to="/admin/members" className="member-profile__back">← Back to members</Link>
          <h1 className="member-profile__title">{fullName}</h1>
          <p className="member-profile__sub">
            <span className={`member-profile__status member-profile__status--${member.isActive !== false ? 'active' : 'inactive'}`}>
              {member.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        <div className="member-profile__topbar-actions">
          <button className="member-profile__btn-archive" onClick={handleArchive} disabled={archiving}>
            {archiving ? 'Archiving...' : 'Archive member'}
          </button>
        </div>
      </div>

      <div className="member-profile__content">
        <div className="member-profile__layout">

          {/* Left — avatar + quick stats */}
          <div className="member-profile__left">
            <div className="member-profile__avatar-card">
              <div className="member-profile__avatar">{getInitials(member.firstName, member.lastName)}</div>
              <h2 className="member-profile__name">{fullName}</h2>
              <p className="member-profile__group">{member.group || 'No group assigned'}</p>
              <p className="member-profile__joined">Member since {member.joinDate || '—'}</p>
            </div>

            <div className="member-profile__details-card">
              <p className="member-profile__card-title">Details</p>
              <DetailRow label="Phone"    value={member.phone} />
              <DetailRow label="Email"    value={member.email} />
              <DetailRow label="Date of birth" value={member.dob} />
              <DetailRow label="Gender"   value={member.gender} />
              <DetailRow label="Address"  value={member.address} />
              <DetailRow label="Group"    value={member.group} />
              <DetailRow label="Found us" value={member.howFound} />
            </div>
          </div>

          {/* Right — attendance history placeholder */}
          <div className="member-profile__right">
            <div className="member-profile__attendance-card">
              <p className="member-profile__card-title">Attendance history</p>
              <p className="member-profile__coming-soon">
                Attendance records will appear here once the member has checked in on Sundays.
                Use the Check-in screen to record attendance.
              </p>
            </div>

            <div className="member-profile__checkin-card">
              <p className="member-profile__card-title">Sunday check-in ID</p>
              <div className="member-profile__phone-display">
                <p className="member-profile__phone-label">Phone number used for check-in</p>
                <p className="member-profile__phone-number">{member.phone}</p>
                <p className="member-profile__phone-hint">Usher types this number on the check-in tablet every Sunday.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MemberProfile
