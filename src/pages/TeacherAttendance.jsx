import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/teacher'
const EMPTY = { class_id: '', student_id: '', date: '', status: 'present', remarks: '' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const TeacherAttendance = () => {
    const [attendance, setAttendance] = useState([])
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [teacherId, setTeacherId] = useState(null)
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
            axios.get(`${BASE}/dashboard`, { headers: headers() }),
            axios.get(`${BASE}/all-attendance`, { headers: headers() }),
            axios.get(`${BASE}/all-students`, { headers: headers() }),
            axios.get(`${BASE}/all-classes`, { headers: headers() }),
        ])
        .then(([dRes, aRes, sRes, cRes]) => {
            const tid = dRes.data.teacher?._id ?? null
            setTeacherId(tid)
            if (aRes.data.status) {
                const all = aRes.data.attendance ?? []
                setAttendance(tid ? all.filter(a => String(a.marked_by?._id ?? a.marked_by) === String(tid)) : all)
            }
            if (sRes.data.status) setStudents(sRes.data.students ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (a) => {
        setEditing(a._id)
        setForm({
            class_id:   a.class_id?._id   ?? a.class_id   ?? '',
            student_id: a.student_id?._id ?? a.student_id ?? '',
            date:       a.date ? a.date.slice(0, 10) : '',
            status:     a.status ?? 'present',
            remarks:    a.remarks ?? '',
        })
        setError('')
        setModal(true)
    }

    const save = () => {
        setSaving(true); setError('')
        const url = editing
            ? `${BASE}/update-attendance/${editing}`
            : `${BASE}/create-attendance`
        const payload = editing
            ? { status: form.status, remarks: form.remarks }
            : { ...form, marked_by: teacherId }

        axios.post(url, payload, { headers: headers() })
            .then((res) => {
                if (res.data.status === false) { setError(res.data.message ?? 'Error'); return }
                setModal(false)
                fetchAll()
            })
            .catch((err) => setError(err.response?.data?.message ?? 'Server error'))
            .finally(() => setSaving(false))
    }

    const remove = (id) => {
        if (!window.confirm('Delete this attendance record?')) return
        axios.get(`${BASE}/delete-attendance/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const filtered = attendance.filter(a => {
        const name = `${a.student_id?.firstname ?? ''} ${a.student_id?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) || (a.class_id?.name ?? '').toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div className={style.titleBlock}>
                    <h1 className={style.pageTitle}>Attendance</h1>
                    <p className={style.pageSubtitle}>{attendance.length} records</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Mark Attendance</button>
            </div>

            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input className={style.searchInput} placeholder="Search by student or class…" value={search} onChange={e => setSearch(e.target.value)} />
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
                                <th>Student</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr className={style.emptyRow}><td colSpan={7}>No attendance records found.</td></tr>
                            ) : filtered.map((a, i) => (
                                <tr key={a._id}>
                                    <td>{i + 1}</td>
                                    <td>{a.student_id?.firstname ?? '—'} {a.student_id?.lastname ?? ''}</td>
                                    <td>{a.class_id?.name ?? '—'}</td>
                                    <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <span className={a.status === 'present' ? style.badgeActive : style.badgeInactive}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ color: a.remarks ? '#c0cfe8' : '#4a5568', fontStyle: a.remarks ? 'normal' : 'italic' }}>
                                        {a.remarks || 'No remarks'}
                                    </td>
                                    <td>
                                        <div className={style.actions}>
                                            <button className={style.editBtn} onClick={() => openEdit(a)}>Edit</button>
                                            <button className={style.deleteBtn} onClick={() => remove(a._id)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modal && (
                <div className={style.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className={style.modal}>
                        <div className={style.modalHeader}>
                            <h2 className={style.modalTitle}>{editing ? 'Edit Record' : 'Mark Attendance'}</h2>
                            <button className={style.closeBtn} onClick={() => setModal(false)}>×</button>
                        </div>

                        {error && <div className={style.errorMsg}>{error}</div>}

                        {!editing && (
                            <>
                                <div className={style.formRow}>
                                    <div className={style.formGroup}>
                                        <label>Student</label>
                                        <select value={form.student_id} onChange={set('student_id')} required>
                                            <option value="">Select student</option>
                                            {students.map(s => (
                                                <option key={s._id} value={s._id}>{s.firstname} {s.lastname}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={style.formGroup}>
                                        <label>Class</label>
                                        <select value={form.class_id} onChange={set('class_id')} required>
                                            <option value="">Select class</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.formRow}>
                                    <div className={style.formGroup}>
                                        <label>Date</label>
                                        <input type="date" value={form.date} onChange={set('date')} required />
                                    </div>
                                    <div className={style.formGroup}>
                                        <label>Status</label>
                                        <select value={form.status} onChange={set('status')}>
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {editing && (
                            <div className={style.formRow}>
                                <div className={style.formGroup}>
                                    <label>Status</label>
                                    <select value={form.status} onChange={set('status')}>
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className={style.formGroup}>
                            <label>Remarks</label>
                            <textarea
                                value={form.remarks}
                                onChange={set('remarks')}
                                placeholder="Add remarks (optional)"
                                rows={3}
                                style={{ width: '100%', resize: 'vertical', padding: '8px 10px', borderRadius: 6, border: '1px solid #2a3550', background: '#0d1526', color: '#c0cfe8', fontSize: 13, fontFamily: 'inherit' }}
                            />
                        </div>

                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={() => setModal(false)}>Cancel</button>
                            <button className={style.saveBtn} onClick={save} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update' : 'Mark'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeacherAttendance
