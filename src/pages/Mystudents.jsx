import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './Myclasses.module.css'

const Mystudents = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = () => {
        setLoading(true)
        const token = localStorage.token
        axios.get('https://schoolproject-backend-ruiy.onrender.com/teacher/all-students', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then((res) => {
            if (res.data.status) setStudents(res.data.students ?? [])
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }

    const filtered = students.filter((s) => {
        const q = search.toLowerCase()
        return (
            `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
            (s.email ?? '').toLowerCase().includes(q) ||
            (s.class_name ?? '').toLowerCase().includes(q)
        )
    })

    const active   = students.filter(s => s.is_active).length
    const inactive = students.length - active

    const summaryCards = [
        { label: 'Total Students', value: students.length },
        { label: 'Active',         value: active },
        { label: 'Inactive',       value: inactive },
    ]

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>My Students</h1>
                <p className={style.subtitle}>All enrolled students</p>
            </div>

            <div className={style.summarySection}>
                <p className={style.sectionLabel}>Overview</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                    {summaryCards.map((card) => (
                        <div key={card.label} className={style.summaryCard}>
                            <p className={style.summaryValue}>{card.value}</p>
                            <p className={style.summaryLabel}>{card.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f1623',
                    border: '1px solid #1a2540',
                    borderRadius: 8,
                    color: '#c0cfe8',
                    fontSize: 14,
                    marginBottom: 24,
                    outline: 'none',
                    boxSizing: 'border-box',
                }}
            />

            {loading ? (
                <div className={style.loadingWrap}><div className={style.spinner} /></div>
            ) : filtered.length === 0 ? (
                <p className={style.empty}>No students found.</p>
            ) : (
                <div style={{ background: '#0f1623', border: '1px solid #1a2540', borderRadius: 14, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#080d18' }}>
                                {['#', 'Name', 'Email', 'Age', 'Phone', 'Status'].map((h) => (
                                    <th key={h} style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        color: '#6b7a99',
                                        fontWeight: 600,
                                        fontSize: 12,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid #1a2540',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => (
                                <tr key={s._id} style={{ borderBottom: '1px solid #111827' }}>
                                    <td style={td}>{i + 1}</td>
                                    <td style={{ ...td, color: '#fff', fontWeight: 600 }}>
                                        {s.image && (
                                            <img
                                                src={s.image}
                                                alt=""
                                                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle' }}
                                            />
                                        )}
                                        {s.firstname} {s.lastname}
                                    </td>
                                    <td style={td}>{s.email ?? '—'}</td>
                                    <td style={td}>{s.age ?? '—'}</td>
                                    <td style={td}>{s.phone ?? '—'}</td>
                                    <td style={td}>
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: s.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                            color: s.is_active ? '#22c55e' : '#ef4444',
                                        }}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const td = { padding: '12px 16px', color: '#c0cfe8' }

export default Mystudents
