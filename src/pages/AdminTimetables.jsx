import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const EMPTY = { class: '', teacher: '', subject: '', day_of_week: 'Monday', start_time: '', end_time: '', academic_year: '' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const AdminTimetables = () => {
    const [timetables, setTimetables] = useState([])
    const [classes, setClasses]       = useState([])
    const [teachers, setTeachers]     = useState([])
    const [subjects, setSubjects]     = useState([])
    const [loading, setLoading]       = useState(false)
    const [search, setSearch]         = useState('')
    const [dayFilter, setDayFilter]   = useState('')
    const [modal, setModal]           = useState(false)
    const [editing, setEditing]       = useState(null)
    const [form, setForm]             = useState(EMPTY)
    const [saving, setSaving]         = useState(false)
    const [error, setError]           = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE}/all-timetables`, { headers: headers() }),
            axios.get(`${BASE}/all-classes`,    { headers: headers() }),
            axios.get(`${BASE}/all-teachers`,   { headers: headers() }),
            axios.get(`${BASE}/all-subjects`,   { headers: headers() }),
        ])
        .then(([tRes, cRes, tchRes, sRes]) => {
            if (tRes.data.status)   setTimetables(tRes.data.timetables ?? [])
            if (cRes.data.status)   setClasses(cRes.data.classes ?? [])
            if (tchRes.data.status) setTeachers(tchRes.data.teachers ?? [])
            if (sRes.data.status)   setSubjects(sRes.data.subjects ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (t) => {
        setEditing(t._id)
        setForm({
            class:        t.class?._id        ?? t.class        ?? '',
            teacher:      t.teacher?._id      ?? t.teacher      ?? '',
            subject:      t.subject?._id      ?? t.subject      ?? '',
            day_of_week:  t.day_of_week       ?? 'Monday',
            start_time:   t.start_time        ?? '',
            end_time:     t.end_time          ?? '',
            academic_year: t.academic_year    ?? '',
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        setSaving(true); setError('')
        const url = editing ? `${BASE}/update-timetable/${editing}` : `${BASE}/create-timetable`
        axios.post(url, form, { headers: headers() })
            .then((res) => { if (res.data.status) { setModal(false); fetchAll() } else setError(res.data.message ?? 'Error') })
            .catch(() => setError('Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this timetable entry?')) return
        axios.get(`${BASE}/delete-timetable/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const filtered = timetables.filter(t => {
        const q = search.toLowerCase()
        const matchesSearch = !q
            || (t.class?.name ?? '').toLowerCase().includes(q)
            || (t.teacher?.firstname ?? '').toLowerCase().includes(q)
            || (t.teacher?.lastname ?? '').toLowerCase().includes(q)
            || (t.subject?.subject_name ?? '').toLowerCase().includes(q)
            || (t.day_of_week ?? '').toLowerCase().includes(q)
        const matchesDay = !dayFilter || t.day_of_week === dayFilter
        return matchesSearch && matchesDay
    })

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Timetables</h1>
                    <p className={style.pageSubtitle}>{timetables.length} entries</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Entry</button>
            </div>

            <div className={style.searchSection}>
                <div className={style.searchWrap}>
                    <Search size={16} className={style.searchIcon} />
                    <input
                        className={style.searchInput}
                        placeholder="Search classes, teachers"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className={style.clearBtn} onClick={() => setSearch('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className={style.dayChips}>
                    <button
                        className={`${style.dayFilterChip} ${dayFilter === '' ? style.dayFilterActive : ''}`}
                        onClick={() => setDayFilter('')}
                    >All</button>
                    {DAYS.map(d => (
                        <button
                            key={d}
                            className={`${style.dayFilterChip} ${dayFilter === d ? style.dayFilterActive : ''}`}
                            onClick={() => setDayFilter(prev => prev === d ? '' : d)}
                        >{d.slice(0, 3)}</button>
                    ))}
                </div>
            </div>

            {loading ? <div className={style.loadingWrap}><div className={style.spinner} /></div> : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead><tr>
                            <th>Day</th><th>Class</th><th>Subject</th>
                            <th>Teacher</th><th>Time</th><th>Year</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>No timetable entries found</td></tr>
                            ) : filtered.map(t => (
                                <tr key={t._id}>
                                    <td>{t.day_of_week ?? '—'}</td>
                                    <td>{t.class?.name ?? '—'}</td>
                                    <td>{t.subject?.subject_name ?? '—'}</td>
                                    <td>{t.teacher?.firstname ?? '—'} {t.teacher?.lastname ?? ''}</td>
                                    <td>{t.start_time ?? '—'} – {t.end_time ?? '—'}</td>
                                    <td>{t.academic_year ?? '—'}</td>
                                    <td>
                                        <button className={style.editBtn} onClick={() => openEdit(t)}>Edit</button>
                                        <button className={style.deleteBtn} onClick={() => handleDelete(t._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className={style.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className={style.modal}>
                        <div className={style.modalHeader}>
                            <h2>{editing ? 'Edit Entry' : 'Add Timetable'}</h2>
                            <button className={style.closeBtn} onClick={() => setModal(false)}>×</button>
                        </div>
                        {error && <div className={style.errorMsg}>{error}</div>}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Class</label>
                                <select value={form.class} onChange={e => field('class', e.target.value)}>
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Teacher</label>
                                <select value={form.teacher} onChange={e => field('teacher', e.target.value)}>
                                    <option value="">Select teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Subject</label>
                                <select value={form.subject} onChange={e => field('subject', e.target.value)}>
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Day of Week</label>
                                <select value={form.day_of_week} onChange={e => field('day_of_week', e.target.value)}>
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Start Time (HH:MM)</label>
                                <input type="time" value={form.start_time} onChange={e => field('start_time', e.target.value)} />
                            </div>
                            <div className={style.formGroup}>
                                <label>End Time (HH:MM)</label>
                                <input type="time" value={form.end_time} onChange={e => field('end_time', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Academic Year (e.g. 2024-2025)</label>
                                <input type="text" placeholder="YYYY-YYYY" value={form.academic_year} onChange={e => field('academic_year', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
                            <button className={style.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminTimetables
