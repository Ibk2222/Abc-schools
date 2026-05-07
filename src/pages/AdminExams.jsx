import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const EMPTY = { student_id: '', subject_id: '', teacher_id: '', class_id: '', score: '', max_score: '', passing_score: '', start_date: '', end_date: '' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const AdminExams = () => {
    const [exams, setExams]       = useState([])
    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [subjects, setSubjects] = useState([])
    const [classes, setClasses]   = useState([])
    const [loading, setLoading]   = useState(false)
    const [search, setSearch]     = useState('')
    const [modal, setModal]       = useState(false)
    const [editing, setEditing]   = useState(null)
    const [form, setForm]         = useState(EMPTY)
    const [saving, setSaving]     = useState(false)
    const [error, setError]       = useState('')

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE}/all-exams`,     { headers: headers() }),
            axios.get(`${BASE}/all-students`,  { headers: headers() }),
            axios.get(`${BASE}/all-teachers`,  { headers: headers() }),
            axios.get(`${BASE}/all-subjects`,  { headers: headers() }),
            axios.get(`${BASE}/all-classes`,   { headers: headers() }),
        ])
        .then(([eRes, sRes, tRes, subRes, cRes]) => {
            if (eRes.data.status)   setExams(eRes.data.exams ?? [])
            if (sRes.data.status)   setStudents(sRes.data.students ?? [])
            if (tRes.data.status)   setTeachers(tRes.data.teachers ?? [])
            if (subRes.data.status) setSubjects(subRes.data.subjects ?? [])
            if (cRes.data.status)   setClasses(cRes.data.classes ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (e) => {
        setEditing(e._id)
        setForm({
            student_id:    e.student_id?._id   ?? e.student_id   ?? '',
            subject_id:    e.subject_id?._id   ?? e.subject_id   ?? '',
            teacher_id:    e.teacher_id?._id   ?? e.teacher_id   ?? '',
            class_id:      e.class_id?._id     ?? e.class_id     ?? '',
            score:         e.score             ?? '',
            max_score:     e.max_score         ?? '',
            passing_score: e.passing_score     ?? '',
            start_date:    e.start_date ? e.start_date.slice(0, 10) : '',
            end_date:      e.end_date   ? e.end_date.slice(0, 10)   : '',
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        setSaving(true); setError('')
        const url = editing ? `${BASE}/update-exam/${editing}` : `${BASE}/create-exam`
        axios.post(url, form, { headers: headers() })
            .then((res) => { if (res.data.status) { setModal(false); fetchAll() } else setError(res.data.message ?? 'Error') })
            .catch(() => setError('Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this exam record?')) return
        axios.get(`${BASE}/delete-exam/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const filtered = exams.filter(e => {
        const q = search.toLowerCase()
        const name = `${e.student_id?.firstname ?? ''} ${e.student_id?.lastname ?? ''}`.toLowerCase()
        return name.includes(q)
            || (e.subject_id?.subject_name ?? '').toLowerCase().includes(q)
            || (e.class_id?.name ?? '').toLowerCase().includes(q)
    })

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Exams</h1>
                    <p className={style.pageSubtitle}>{exams.length} records</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Exam</button>
            </div>

            <div className={style.searchBar}>
                <input placeholder="Search by student, subject or class…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? <div className={style.loadingWrap}><div className={style.spinner} /></div> : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead><tr>
                            <th>Student</th><th>Subject</th><th>Class</th>
                            <th>Score</th><th>Max</th><th>Pass</th>
                            <th>Start</th><th>End</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>No exam records found</td></tr>
                            ) : filtered.map(e => (
                                <tr key={e._id}>
                                    <td>{e.student_id?.firstname ?? '—'} {e.student_id?.lastname ?? ''}</td>
                                    <td>{e.subject_id?.subject_name ?? '—'}</td>
                                    <td>{e.class_id?.name ?? '—'}</td>
                                    <td>{e.score ?? '—'}</td>
                                    <td>{e.max_score ?? '—'}</td>
                                    <td>{e.passing_score ?? '—'}</td>
                                    <td>{e.start_date ? new Date(e.start_date).toLocaleDateString() : '—'}</td>
                                    <td>{e.end_date   ? new Date(e.end_date).toLocaleDateString()   : '—'}</td>
                                    <td>
                                        <button className={style.editBtn} onClick={() => openEdit(e)}>Edit</button>
                                        <button className={style.deleteBtn} onClick={() => handleDelete(e._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className={style.overlay} onClick={ev => ev.target === ev.currentTarget && setModal(false)}>
                    <div className={style.modal}>
                        <div className={style.modalHeader}>
                            <h2>{editing ? 'Edit Exam' : 'Add Exam'}</h2>
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
                                <label>Subject</label>
                                <select value={form.subject_id} onChange={e => field('subject_id', e.target.value)}>
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Teacher</label>
                                <select value={form.teacher_id} onChange={e => field('teacher_id', e.target.value)}>
                                    <option value="">Select teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>)}
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
                                <label>Score</label>
                                <input type="number" value={form.score} onChange={e => field('score', e.target.value)} />
                            </div>
                            <div className={style.formGroup}>
                                <label>Max Score</label>
                                <input type="number" value={form.max_score} onChange={e => field('max_score', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Passing Score</label>
                                <input type="number" value={form.passing_score} onChange={e => field('passing_score', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Start Date</label>
                                <input type="date" value={form.start_date} onChange={e => field('start_date', e.target.value)} />
                            </div>
                            <div className={style.formGroup}>
                                <label>End Date</label>
                                <input type="date" value={form.end_date} onChange={e => field('end_date', e.target.value)} />
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

export default AdminExams
