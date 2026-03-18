import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole,    setUserRole]    = useState(null)
  const [displayName, setDisplayName] = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
      if (user) {
        getDoc(doc(db, 'users', user.uid))
          .then((snap) => {
            if (snap.exists()) {
              const data = snap.data()
              setUserRole(data.role || null)
              setDisplayName(data.displayName || user.displayName || user.email?.split('@')[0] || 'Admin')
            }
          })
          .catch(() => setUserRole(null))
      } else {
        setUserRole(null)
        setDisplayName('')
      }
    })
    return () => unsubscribe()
  }, [])

  const value = {
    currentUser, userRole, displayName, loading,
    isSuperAdmin: userRole === 'superAdmin',
    isStaffAdmin: userRole === 'staffAdmin' || userRole === 'superAdmin',
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? <TRCLoader /> : children}
    </AuthContext.Provider>
  )
}

function TRCLoader() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', background:'#111111',
      flexDirection:'column', gap:'20px',
    }}>
      <div style={{
        width:'110px', height:'110px', position:'relative',
        animation:'trc-orbit 2.8s linear infinite',
      }}>
        <img
          src="/trc-logo-full.png"
          alt="TRC Ministries"
          style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%' }}
        />
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontSize:'16px', fontWeight:'700', color:'#ffffff', fontFamily:'system-ui,sans-serif', letterSpacing:'0.04em', marginBottom:'3px' }}>
          The Revelation Church
        </p>
        <p style={{ fontSize:'12px', color:'#c9860a', fontFamily:'system-ui,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase' }}>
          TRC Ministries
        </p>
      </div>
      <div style={{ display:'flex', gap:'7px', marginTop:'4px' }}>
        {[0, 0.25, 0.5].map((delay, i) => (
          <span key={i} style={{
            width:'7px', height:'7px', borderRadius:'50%',
            background:'#c9860a', opacity:0.4,
            animation:`trc-pulse 1.2s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes trc-orbit {
          0%   { transform: rotate(0deg) scale(1);    }
          25%  { transform: rotate(90deg) scale(1.05); }
          50%  { transform: rotate(180deg) scale(1);  }
          75%  { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1);  }
        }
        @keyframes trc-pulse {
          0%,80%,100% { transform:scale(0.6); opacity:0.3; }
          40%          { transform:scale(1.2); opacity:1;   }
        }
      `}</style>
    </div>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
