import React from 'react'
import { useNavigate } from 'react-router-dom'
import { schoolLogoUrl } from '../constants/school'

const Nopagefound = () => {
    const navigate = useNavigate()

    const role = localStorage.getItem('role')
    const home =
        role === 'admin'   ? '/admin/dashboard' :
        role === 'student' ? '/student/dashboard' :
        role === 'teacher' ? '/dashboard' : '/login'

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: 'linear-gradient(135deg, rgba(8, 19, 35, 0.86), rgba(4, 57, 97, 0.72)), var(--school-background-image) center / cover fixed no-repeat',
            color: '#fff',
            textAlign: 'center', padding: '24px',
        }}>
            <img
                src={schoolLogoUrl}
                alt="ABC School logo"
                style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 24 }}
            />
            <h1 style={{ fontSize: 96, fontWeight: 800, margin: '0 0 8px', color: 'var(--school-accent)', lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Page Not Found</h2>
            <p style={{ fontSize: 15, color: '#d6ecff', maxWidth: 360, margin: '0 0 32px' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <button
                onClick={() => navigate(home)}
                style={{
                    background: 'var(--school-accent)', color: '#fff', border: 'none',
                    padding: '12px 32px', borderRadius: 8, fontSize: 15,
                    fontWeight: 600, cursor: 'pointer',
                }}
            >
                Back to Dashboard
            </button>
        </div>
    )
}

export default Nopagefound
