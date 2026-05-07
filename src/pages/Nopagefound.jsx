import React from 'react'
import { useNavigate } from 'react-router-dom'

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
            fontFamily: "'Times New Roman', serif", background: '#f8fafc', color: '#1e293b',
            textAlign: 'center', padding: '24px',
        }}>
            <img
                src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                alt="School Logo"
                style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 24 }}
            />
            <h1 style={{ fontSize: 96, fontWeight: 800, margin: '0 0 8px', color: '#1e40af', lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Page Not Found</h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 360, margin: '0 0 32px' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <button
                onClick={() => navigate(home)}
                style={{
                    background: '#1e40af', color: '#fff', border: 'none',
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
