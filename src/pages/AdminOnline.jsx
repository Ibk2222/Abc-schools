import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const headers = () => ({ Authorization: `Bearer ${localStorage.token}` })

const ROLE_COLORS = {
    teacher: { bg: '#dbeafe', color: '#1d4ed8' },
    student: { bg: '#dcfce7', color: '#166534' },
    admin:   { bg: '#fef9c3', color: '#854d0e' },
}

const timeAgo = (date) => {
    const secs = Math.floor((Date.now() - new Date(date)) / 1000)
    if (secs < 10) return 'just now'
    if (secs < 60) return `${secs}s ago`
    return `${Math.floor(secs / 60)}m ago`
}

const AdminOnline = () => {
    const [online, setOnline] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState(null)

    const fetchOnline = () => {
        axios.get(`${BASE}/online-users`, { headers: headers() })
            .then(res => {
                if (res.data.status) setOnline(res.data.online ?? [])
            })
            .catch(console.log)
            .finally(() => {
                setLoading(false)
                setLastRefresh(new Date())
            })
    }

    useEffect(() => {
        fetchOnline()
        const interval = setInterval(fetchOnline, 30000)
        return () => clearInterval(interval)
    }, [])

    const byRole = (role) => online.filter(u => u.role === role)

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Online Now</h1>
                    <p className={style.pageSubtitle}>
                        Users active in the last 2 minutes &nbsp;·&nbsp;
                        <span style={{ color: '#22c55e', fontWeight: 700 }}>{online.length} online</span>
                        {lastRefresh && (
                            <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: 12 }}>
                                · refreshes every 30s
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchOnline() }}
                    style={{
                        padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                        background: '#fff', color: '#475569', fontWeight: 600,
                        fontSize: 13, cursor: 'pointer',
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* Summary badges */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { role: 'teacher', label: 'Teachers' },
                    { role: 'student', label: 'Students' },
                    { role: 'admin',   label: 'Admins' },
                ].map(({ role, label }) => {
                    const col = ROLE_COLORS[role]
                    const count = byRole(role).length
                    return (
                        <div key={role} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 20px', borderRadius: 10,
                            background: col.bg, color: col.color,
                            fontWeight: 700, fontSize: 14,
                        }}>
                            <span style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: count > 0 ? col.color : '#cbd5e1',
                                display: 'inline-block',
                            }} />
                            {count} {label}
                        </div>
                    )
                })}
            </div>

            {loading ? (
                <div className={style.loadingWrap}><div className={style.spinner} /></div>
            ) : online.length === 0 ? (
                <div className={style.tableCard} style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No one is online right now</p>
                    <p style={{ fontSize: 13 }}>Users appear here within 60 seconds of logging in</p>
                </div>
            ) : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Last Seen</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {online.map(u => {
                                const col = ROLE_COLORS[u.role]
                                return (
                                    <tr key={u._id}>
                                        <td><strong>{u.firstname} {u.lastname}</strong></td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '3px 10px',
                                                borderRadius: 99, fontSize: 12, fontWeight: 700,
                                                background: col.bg, color: col.color,
                                                textTransform: 'capitalize',
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: 13 }}>
                                            {timeAgo(u.lastSeen)}
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    background: '#22c55e', display: 'inline-block',
                                                }} />
                                                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>Online</span>
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminOnline
