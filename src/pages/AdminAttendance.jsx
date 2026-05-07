import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const EMPTY = { class_id: '', student_id: '', date: '', marked_by: '', status: 'present' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([])
    const [students, setStudents]     = useState([])
    const [classes, setClasses]       = useState([])
    const [teachers, setTeachers]     = useState([])
    const [loading, setLoading]       = useState(false)
    const [search, setSearch]         = useState('')
    const [modal, setModal]           = useState(false)
    const [editing, setEditing]       = useState(null)
    const [form, setForm]             = useState(EMPTY)
    const [saving, setSaving]         = useState(false)
    const [error, setError]           = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE}/all-attendance`, { headers: headers() }),
            axios.get(`${BASE}/all-students`,   { headers: headers() }),
            axios.get(`${BASE}/all-classes`,    { headers: headers() }),
            axios.get(`${BASE}/all-teachers`,   { headers: headers() }),
        ])
        .then(([aRes, sRes, cRes, tRes]) => {
            if (aRes.data.status) setAttendance(aRes.data.attendance ?? [])
            if (sRes.data.status) setStudents(sRes.data.students ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
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
            marked_by:  a.marked_by?._id  ?? a.marked_by  ?? '',
            status:     a.status ?? 'present',
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        setSaving(true); setError('')
        const url    = editing ? `${BASE}/update-attendance/${editing}` : `${BASE}/create-attendance`
        const method = editing ? axios.post : axios.post
        method(url, form, { headers: headers() })
            .then((res) => { if (res.data.status) { setModal(false); fetchAll() } else setError(res.data.message ?? 'Error') })
            .catch(() => setError('Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this attendance record?')) return
        axios.get(`${BASE}/delete-attendance/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const filtered = attendance.filter(a => {
        const name = `${a.student_id?.firstname ?? ''} ${a.student_id?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) || (a.class_id?.name ?? '').toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Attendance</h1>
                    <p className={style.pageSubtitle}>{attendance.length} records</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Record</button>
            </div>

            <div className={style.searchBar}>
                <input placeholder="Search by student or class…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? <div className={style.loadingWrap}><div className={style.spinner} /></div> : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead><tr>
                            <th>Student</th><th>Class</th><th>Date</th>
                            <th>Status</th><th>Marked By</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>No records found</td></tr>
                            ) : filtered.map(a => (
                                <tr key={a._id}>
                                    <td>{a.student_id?.firstname ?? '—'} {a.student_id?.lastname ?? ''}</td>
                                    <td>{a.class_id?.name ?? '—'}</td>
                                    <td>{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <span className={a.status === 'present' ? style.badgeActive : style.badgeInactive}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td>{a.marked_by?.firstname ?? '—'} {a.marked_by?.lastname ?? ''}</td>
                                    <td>
                                        <button className={style.editBtn} onClick={() => openEdit(a)}>Edit</button>
                                        <button className={style.deleteBtn} onClick={() => handleDelete(a._id)}>Delete</button>
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
                            <h2>{editing ? 'Edit Record' : 'Add Attendance'}</h2>
                            <button className={style.closeBtn} onClick={() => setModal(false)}>×</button>
                        </div>
                        {error && <div className={style.errorMsg}>{error}</div>}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Student</label>
                                <select value={form.student_id} onChange={e => field('student_id', e.target.value)}>
                                    <option value="">Select student</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.firstname} {s.lastname}</option>)}
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Class</label>
                                <select value={form.class_id} onChange={e => field('class_id', e.target.value)}>
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Date</label>
                                <input type="date" value={form.date} onChange={e => field('date', e.target.value)} />
                            </div>
                            <div className={style.formGroup}>
                                <label>Status</label>
                                <select value={form.status} onChange={e => field('status', e.target.value)}>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Marked By (Teacher)</label>
                                <select value={form.marked_by} onChange={e => field('marked_by', e.target.value)}>
                                    <option value="">Select teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>)}
                                </select>
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

export default AdminAttendance
