import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const EMPTY = { student: '', exam: '', score: '', grade_level: '', teacher: '' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const AdminResults = () => {
    const [results, setResults]   = useState([])
    const [students, setStudents] = useState([])
    const [teachers, setTeachers] = useState([])
    const [exams, setExams]       = useState([])
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
            axios.get(`${BASE}/all-results`,  { headers: headers() }),
            axios.get(`${BASE}/all-students`, { headers: headers() }),
            axios.get(`${BASE}/all-teachers`, { headers: headers() }),
            axios.get(`${BASE}/all-exams`,    { headers: headers() }),
        ])
        .then(([rRes, sRes, tRes, eRes]) => {
            if (rRes.data.status) setResults(rRes.data.results ?? [])
            if (sRes.data.status) setStudents(sRes.data.students ?? [])
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
            if (eRes.data.status) setExams(eRes.data.exams ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (r) => {
        setEditing(r._id)
        setForm({
            student:     r.student?._id  ?? r.student  ?? '',
            exam:        r.exam?._id     ?? r.exam      ?? '',
            score:       r.score         ?? '',
            grade_level: r.grade_level   ?? '',
            teacher:     r.teacher?._id  ?? r.teacher  ?? '',
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        setSaving(true); setError('')
        const url = editing ? `${BASE}/update-result/${editing}` : `${BASE}/create-result`
        axios.post(url, form, { headers: headers() })
            .then((res) => { if (res.data.status) { setModal(false); fetchAll() } else setError(res.data.message ?? 'Error') })
            .catch(() => setError('Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this result?')) return
        axios.get(`${BASE}/delete-result/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const filtered = results.filter(r => {
        const q = search.toLowerCase()
        const name = `${r.student?.firstname ?? ''} ${r.student?.lastname ?? ''}`.toLowerCase()
        return name.includes(q) || (r.grade_level ?? '').toLowerCase().includes(q)
    })

    const examLabel = (e) => {
        if (!e) return '—'
        const date = e.start_date ? new Date(e.start_date).toLocaleDateString() : ''
        return `Score ${e.score ?? '?'}/${e.max_score ?? '?'}${date ? ' · ' + date : ''}`
    }

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Results</h1>
                    <p className={style.pageSubtitle}>{results.length} records</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Result</button>
            </div>

            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input className={style.searchInput} placeholder="Search by student name…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className={style.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
            </div>

            {loading ? <div className={style.loadingWrap}><div className={style.spinner} /></div> : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead><tr>
                            <th>Student</th><th>Grade Level</th><th>Score</th><th>Teacher</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>No results found</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r._id}>
                                    <td>{r.student?.firstname ?? '—'} {r.student?.lastname ?? ''}</td>
                                    <td>
                                        <span className={style.badgeActive}>{r.grade_level ?? '—'}</span>
                                    </td>
                                    <td>{r.score ?? '—'}</td>
                                    <td>{r.teacher?.firstname ?? '—'} {r.teacher?.lastname ?? ''}</td>
                                    <td>
                                        <button className={style.editBtn} onClick={() => openEdit(r)}>Edit</button>
                                        <button className={style.deleteBtn} onClick={() => handleDelete(r._id)}>Delete</button>
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
                            <h2>{editing ? 'Edit Result' : 'Add Result'}</h2>
                            <button className={style.closeBtn} onClick={() => setModal(false)}>×</button>
                        </div>
                        {error && <div className={style.errorMsg}>{error}</div>}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Student</label>
                                <select value={form.student} onChange={e => field('student', e.target.value)}>
                                    <option value="">Select student</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.firstname} {s.lastname}</option>)}
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
                                <label>Exam</label>
                                <select value={form.exam} onChange={e => field('exam', e.target.value)}>
                                    <option value="">Select exam</option>
                                    {exams.map(ex => (
                                        <option key={ex._id} value={ex._id}>{examLabel(ex)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Score</label>
                                <input type="number" value={form.score} onChange={e => field('score', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Grade Level</label>
                                <input type="text" value={form.grade_level} onChange={e => field('grade_level', e.target.value)} placeholder="e.g. A, B+, Pass" />
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

export default AdminResults
