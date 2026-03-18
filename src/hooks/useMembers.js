// ============================================================
// TRC Ministries — useMembers hook
// hooks/useMembers.js
// ============================================================

import { useState, useEffect } from 'react'
import { getAllMembers } from '../services/memberService'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function fetchMembers() {
    setLoading(true)
    try {
      const data = await getAllMembers()
      setMembers(data)
    } catch (err) {
      console.error('useMembers error:', err)
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  return { members, loading, error, refetch: fetchMembers }
}
