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
    const [admins, setAdmins]     = useState([])
    const [entity, setEntity]     = useState('teachers')   // 'teachers' | 'admins'
    const [tab, setTab]           = useState('pending')
    const [search, setSearch]     = useState('')
    const [loading, setLoading]   = useState(true)
    const [busy, setBusy]         = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE}/all-teachers`, { headers: headers() }),
            axios.get(`${BASE}/all-admins`,   { headers: headers() }),
        ])
        .then(([tRes, aRes]) => {
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
            if (aRes.data.status) setAdmins(aRes.data.admins ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const handleAction = (id, action) => {
        setBusy(id + action)
        const path = entity === 'teachers'
            ? (action === 'approve' ? `approve-teacher` : `reject-teacher`)
            : (action === 'approve' ? `approve-admin`   : `reject-admin`)
        axios.post(`${BASE}/${path}/${id}`, {}, { headers: headers() })
            .then(() => fetchAll())
            .catch(console.log)
            .finally(() => setBusy(''))
    }

    const list = entity === 'teachers' ? teachers : admins

    const filtered = list
        .filter(u => (u.approval_status ?? 'pending') === tab)
        .filter(u => {
            const q = search.toLowerCase()
            return (
                `${u.firstname ?? ''} ${u.lastname ?? ''}`.toLowerCase().includes(q) ||
                (u.email ?? '').toLowerCase().includes(q)
            )
        })

    const counts = (arr) => ({
        pending:  arr.filter(u => (u.approval_status ?? 'pending') === 'pending').length,
        approved: arr.filter(u => u.approval_status === 'approved').length,
        rejected: arr.filter(u => u.approval_status === 'rejected').length,
    })

    const tc = counts(teachers)
    const ac = counts(admins)
    const cur = entity === 'teachers' ? tc : ac

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Approvals</h1>
                    <p className={style.pageSubtitle}>Review and approve teacher and admin registrations</p>
                </div>
            </div>

            {/* Entity toggle: Teachers / Admins */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                    { key: 'teachers', label: 'Teachers', pending: tc.pending },
                    { key: 'admins',   label: 'Admins',   pending: ac.pending },
                ].map(e => (
                    <button
                        key={e.key}
                        onClick={() => { setEntity(e.key); setTab('pending'); setSearch('') }}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 8,
                            border: '2px solid',
                            borderColor: entity === e.key ? '#1451f0' : '#e2e8f0',
                            background: entity === e.key ? '#1451f0' : '#fff',
                            color: entity === e.key ? '#fff' : '#475569',
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        {e.label}
                        {e.pending > 0 && (
                            <span style={{
                                background: entity === e.key ? 'rgba(255,255,255,0.3)' : '#fef9c3',
                                color: entity === e.key ? '#fff' : '#854d0e',
                                borderRadius: 99,
                                padding: '1px 8px',
                                fontSize: 12,
                                fontWeight: 700,
                            }}>{e.pending}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Status tabs */}
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
                        }}>{cur[t]}</span>
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
                                <th>Registered</th>
                                <th>Status</th>
                                {tab === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={tab === 'pending' ? 6 : 5} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>
                                        No {tab} {entity}
                                    </td>
                                </tr>
                            ) : filtered.map(u => {
                                const status = u.approval_status ?? 'pending'
                                const col = STATUS_COLORS[status]
                                return (
                                    <tr key={u._id}>
                                        <td>
                                            <strong>
                                                {u.title ? `${u.title} ` : ''}{u.firstname} {u.lastname}
                                            </strong>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.phone ?? '—'}</td>
                                        <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
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
                                                    disabled={busy === u._id + 'approve'}
                                                    onClick={() => handleAction(u._id, 'approve')}
                                                >
                                                    {busy === u._id + 'approve' ? '…' : 'Approve'}
                                                </button>
                                                <button
                                                    className={style.deleteBtn}
                                                    disabled={busy === u._id + 'reject'}
                                                    onClick={() => handleAction(u._id, 'reject')}
                                                >
                                                    {busy === u._id + 'reject' ? '…' : 'Reject'}
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
