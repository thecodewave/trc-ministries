// ============================================================
// TRC Ministries — Protected Route
// components/ProtectedRoute/ProtectedRoute.jsx
//
// Wraps any admin route. Redirects to /admin/login if:
//   - User is not authenticated
//   - User does not have the required role
// ============================================================

import { Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'

// requireSuperAdmin — pass true for Staff Management page only
function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { currentUser, isStaffAdmin, isSuperAdmin } = useAuth()

  // Not logged in at all → send to login
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />
  }

  // Logged in but not an admin (e.g. random Firebase user) → send to login
  if (!isStaffAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  // Page requires Super Admin and user is only Staff Admin → send to dashboard
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // All checks passed — render the protected page
  return children
}

export default ProtectedRoute
