import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const EMPTY = { name: '', teacher_id: '', academic_year: '', subject: '', room: '', schedule: { days: [], time: '' } }

const headers = () => ({
    Authorization: `Bearer ${localStorage.token}`,
    'Content-Type': 'application/json',
})

const AdminClasses = () => {
    const [classes, setClasses] = useState([])
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get('https://schoolpj-backend.onrender.com/admin/all-classes', { headers: headers() }),
            axios.get('https://schoolpj-backend.onrender.com/admin/all-teachers', { headers: headers() }),
        ])
        .then(([cRes, tRes]) => {
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (c) => {
        setEditing(c._id)
        setForm({
            name: c.name ?? '',
            teacher_id: c.teacher_id ?? '',
            academic_year: c.academic_year ?? '',
            subject: c.subject ?? '',
            room: c.room ?? '',
            schedule: {
                days: c.schedule?.days ?? [],
                time: c.schedule?.time ? new Date(c.schedule.time).toTimeString().slice(0, 5) : '',
            },
        })
        setError('')
        setModal(true)
    }

    const closeModal = () => { setModal(false); setError('') }
    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

    const toggleDay = (day) => {
        setForm(p => {
            const days = p.schedule.days.includes(day)
                ? p.schedule.days.filter(d => d !== day)
                : [...p.schedule.days, day]
            return { ...p, schedule: { ...p.schedule, days } }
        })
    }

    const save = () => {
        setSaving(true)
        setError('')
        const url = editing
            ? `https://schoolpj-backend.onrender.com/admin/update-class/${editing}`
            : 'https://schoolpj-backend.onrender.com/admin/create-class'
        const payload = {
            ...form,
            schedule: {
                days: form.schedule.days,
                time: form.schedule.time ? new Date(`1970-01-01T${form.schedule.time}:00`) : null,
            },
        }

        axios.post(url, payload, { headers: headers() })
            .then((res) => {
                if (res.data.status === false) { setError(res.data.message); return }
                closeModal()
                fetchAll()
            })
            .catch((err) => setError(err.response?.data?.message || 'Request failed. Please try again.'))
            .finally(() => setSaving(false))
    }

    const remove = (id) => {
        if (!window.confirm('Delete this class? This cannot be undone.')) return
        axios.get(`https://schoolpj-backend.onrender.com/admin/delete-class/${id}`, { headers: headers() })
            .then(() => fetchAll())
            .catch(console.log)
    }

    const filtered = classes.filter(c =>
        (c.name ?? '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div className={style.titleBlock}>
                    <h1 className={style.pageTitle}>Classes</h1>
                    <p className={style.pageSubtitle}>{classes.length} total classes</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Class</button>
            </div>

            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input className={style.searchInput} placeholder="Search by class name…" value={search} onChange={(e) => setSearch(e.target.value)} />
                {search && <button className={style.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
            </div>

            <div className={style.tableCard}>
                {loading ? (
                    <div className={style.loadingWrap}><div className={style.spinner} /></div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Class Name</th>
                                <th>Subject</th>
                                <th>Room</th>
                                <th>Academic Year</th>
                                <th>Schedule Days</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr className={style.emptyRow}><td colSpan={8}>No classes found.</td></tr>
                            ) : filtered.map((c, i) => (
                                <tr key={c._id}>
                                    <td>{i + 1}</td>
                                    <td>{c.name}</td>
                                    <td>{c.subject || '—'}</td>
                                    <td>{c.room || '—'}</td>
                                    <td>{c.academic_year}</td>
                                    <td>{c.schedule?.days?.join(', ') || '—'}</td>
                                    <td>
                                        <span className={c.is_active ? style.badgeActive : style.badgeInactive}>
                                            {c.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={style.actions}>
                                            <button className={style.editBtn} onClick={() => openEdit(c)}>Edit</button>
                                            <button className={style.deleteBtn} onClick={() => remove(c._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <div className={style.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className={style.modal}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>{editing ? 'Edit Class' : 'Add Class'}</h2>
                            <button className={style.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        {error && <div className={style.errorMsg}>{error}</div>}

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Class Name</label>
                                <input value={form.name} onChange={set('name')} placeholder="e.g. 10th Grade - Mathematics" required />
                            </div>
                            <div className={style.formGroup}>
                                <label>Academic Year</label>
                                <input value={form.academic_year} onChange={set('academic_year')} placeholder="2024-2025" required />
                            </div>
                        </div>

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Subject</label>
                                <input value={form.subject} onChange={set('subject')} placeholder="e.g. Mathematics" />
                            </div>
                            <div className={style.formGroup}>
                                <label>Room</label>
                                <input value={form.room} onChange={set('room')} placeholder="e.g. A101" />
                            </div>
                        </div>

                        <div className={style.formGroup}>
                            <label>Teacher</label>
                            <select value={form.teacher_id} onChange={set('teacher_id')} required>
                                <option value="">Select teacher</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.title} {t.firstname} {t.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={style.formGroup}>
                            <label>Schedule Days</label>
                            <div className={style.daysGrid}>
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`${style.dayChip} ${form.schedule.days.includes(day) ? style.dayChipActive : ''}`}
                                        onClick={() => toggleDay(day)}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={style.formGroup}>
                            <label>Class Time</label>
                            <input
                                type="time"
                                value={form.schedule.time}
                                onChange={(e) => setForm(p => ({ ...p, schedule: { ...p.schedule, time: e.target.value } }))}
                            />
                        </div>

                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={style.saveBtn} onClick={save} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update Class' : 'Add Class'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminClasses
