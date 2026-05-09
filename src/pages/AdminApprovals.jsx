import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const STATUS_COLORS = {
    pending:  { bg: '#fef9c3', color: '#854d0e' },
    approved: { bg: '#dcfce7', color: '#166534' },
    rejected: { bg: '#fee2e2', color: '#991b1b' },
}

const AdminApprovals = () => {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading]   = useState(true)
    const [tab, setTab]           = useState('pending')
    const [search, setSearch]     = useState('')
    const [busy, setBusy]         = useState('')

    useEffect(() => { fetchTeachers() }, [])

    const fetchTeachers = () => {
        setLoading(true)
        axios.get(`${BASE}/all-teachers`, { headers: headers() })
            .then((res) => { if (res.data.status) setTeachers(res.data.teachers ?? []) })
            .catch(console.log)
            .finally(() => setLoading(false))
    }

    const handleAction = (id, action) => {
        setBusy(id + action)
        const url = action === 'approve'
            ? `${BASE}/approve-teacher/${id}`
            : `${BASE}/reject-teacher/${id}`
        axios.post(url, {}, { headers: headers() })
            .then(() => fetchTeachers())
            .catch(console.log)
            .finally(() => setBusy(''))
    }

    const filtered = teachers
        .filter(t => (t.approval_status ?? 'pending') === tab)
        .filter(t => {
            const q = search.toLowerCase()
            return (
                `${t.firstname ?? ''} ${t.lastname ?? ''}`.toLowerCase().includes(q) ||
                (t.email ?? '').toLowerCase().includes(q)
            )
        })

    const counts = {
        pending:  teachers.filter(t => (t.approval_status ?? 'pending') === 'pending').length,
        approved: teachers.filter(t => t.approval_status === 'approved').length,
        rejected: teachers.filter(t => t.approval_status === 'rejected').length,
    }

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Teacher Approvals</h1>
                    <p className={style.pageSubtitle}>Review and approve teacher registrations</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['pending', 'approved', 'rejected'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '7px 18px',
                            borderRadius: 8,
                            border: '1px solid',
                            borderColor: tab === t ? '#1451f0' : '#e2e8f0',
                            background: tab === t ? '#1451f0' : '#fff',
                            color: tab === t ? '#fff' : '#475569',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        <span style={{
                            background: tab === t ? 'rgba(255,255,255,0.25)' : STATUS_COLORS[t].bg,
                            color: tab === t ? '#fff' : STATUS_COLORS[t].color,
                            borderRadius: 99,
                            padding: '1px 8px',
                            fontSize: 12,
                            fontWeight: 700,
                        }}>{counts[t]}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input
                    className={style.searchInput}
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && <button className={style.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
            </div>

            {loading ? (
                <div className={style.loadingWrap}><div className={style.spinner} /></div>
            ) : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Registered</th>
                                <th>Status</th>
                                {tab === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={tab === 'pending' ? 7 : 6} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>
                                        No {tab} teachers
                                    </td>
                                </tr>
                            ) : filtered.map(t => {
                                const status = t.approval_status ?? 'pending'
                                const col = STATUS_COLORS[status]
                                return (
                                    <tr key={t._id}>
                                        <td>
                                            <strong>{t.title ? `${t.title} ` : ''}{t.firstname} {t.lastname}</strong>
                                        </td>
                                        <td>{t.email}</td>
                                        <td>{t.phone ?? '—'}</td>
                                        <td>{t.department ?? '—'}</td>
                                        <td>
                                            {t.createdAt
                                                ? new Date(t.createdAt).toLocaleDateString()
                                                : '—'
                                            }
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '3px 10px',
                                                borderRadius: 99,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: col.bg,
                                                color: col.color,
                                                textTransform: 'capitalize',
                                            }}>
                                                {status}
                                            </span>
                                        </td>
                                        {tab === 'pending' && (
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className={style.editBtn}
                                                    style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}
                                                    disabled={busy === t._id + 'approve'}
                                                    onClick={() => handleAction(t._id, 'approve')}
                                                >
                                                    {busy === t._id + 'approve' ? '…' : 'Approve'}
                                                </button>
                                                <button
                                                    className={style.deleteBtn}
                                                    disabled={busy === t._id + 'reject'}
                                                    onClick={() => handleAction(t._id, 'reject')}
                                                >
                                                    {busy === t._id + 'reject' ? '…' : 'Reject'}
                                                </button>
                                            </td>
                                        )}
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

export default AdminApprovals
