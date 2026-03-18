import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import ProtectedRoute      from './components/ProtectedRoute/ProtectedRoute'

// Public pages
const Home        = lazy(() => import('./pages/Home/Home'))
const About       = lazy(() => import('./pages/About/About'))
const Pastors     = lazy(() => import('./pages/Pastors/Pastors'))
const Groups      = lazy(() => import('./pages/Groups/Groups'))
const Sermons     = lazy(() => import('./pages/Sermons/Sermons'))
const Events      = lazy(() => import('./pages/Events/Events'))
const Give        = lazy(() => import('./pages/Give/Give'))
const Register    = lazy(() => import('./pages/Register/Register'))
const Contact     = lazy(() => import('./pages/Contact/Contact'))
const NotFound    = lazy(() => import('./pages/NotFound/NotFound'))

// Admin pages
const AdminLogin        = lazy(() => import('./admin/Login/Login'))
const AdminLayout       = lazy(() => import('./admin/AdminLayout/AdminLayout'))
const Dashboard         = lazy(() => import('./admin/Dashboard/Dashboard'))
const Members           = lazy(() => import('./admin/Members/Members'))
const MemberProfile     = lazy(() => import('./admin/MemberProfile/MemberProfile'))
const Attendance        = lazy(() => import('./admin/Attendance/Attendance'))
const CheckIn           = lazy(() => import('./admin/CheckIn/CheckIn'))
const CheckInKiosk      = lazy(() => import('./admin/CheckInKiosk/CheckInKiosk'))
const AdminSermons      = lazy(() => import('./admin/AdminSermons/AdminSermons'))
const AdminEvents       = lazy(() => import('./admin/AdminEvents/AdminEvents'))
const Birthdays         = lazy(() => import('./admin/Birthdays/Birthdays'))
const Messages          = lazy(() => import('./admin/Messages/Messages'))
const Broadcast         = lazy(() => import('./admin/Broadcast/Broadcast'))
const StaffManagement   = lazy(() => import('./admin/StaffManagement/StaffManagement'))
const AdminPastors      = lazy(() => import('./admin/AdminPastors/AdminPastors'))
const AdminGroups       = lazy(() => import('./admin/AdminGroups/AdminGroups'))

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f7f7fb' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #eeeeff', borderTop:'3px solid #1a1654', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/pastors"  element={<Pastors />} />
            <Route path="/groups"   element={<Groups />} />
            <Route path="/sermons"  element={<Sermons />} />
            <Route path="/events"   element={<Events />} />
            <Route path="/give"     element={<Give />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact"  element={<Contact />} />

            {/* Admin login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Kiosk — public-facing screen at church entrance, no auth needed.
                 Members only check themselves in — no admin data is exposed. */}
            <Route path="/admin/kiosk" element={<CheckInKiosk />} />

            {/* Admin panel with sidebar */}
            <Route path="/admin" element={
              <ProtectedRoute><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"   element={<Dashboard />} />
              <Route path="members"     element={<Members />} />
              <Route path="members/:id" element={<MemberProfile />} />
              <Route path="attendance"  element={<Attendance />} />
              <Route path="checkin"     element={<CheckIn />} />
              <Route path="sermons"     element={<AdminSermons />} />
              <Route path="events"      element={<AdminEvents />} />
              <Route path="birthdays"   element={<Birthdays />} />
              <Route path="messages"    element={<Messages />} />
              <Route path="broadcast"   element={<Broadcast />} />
              <Route path="pastors"    element={<AdminPastors />} />
              <Route path="groups-admin" element={<AdminGroups />} />
              <Route path="staff"       element={
                <ProtectedRoute requireSuperAdmin={true}><StaffManagement /></ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App
