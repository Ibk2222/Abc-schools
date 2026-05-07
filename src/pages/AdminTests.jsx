import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const EMPTY = { test_name: '', teacher_id: '', test_score: '', subject_id: '' }

const headers = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const AdminTests = () => {
    const [tests, setTests]       = useState([])
    const [teachers, setTeachers] = useState([])
    const [subjects, setSubjects] = useState([])
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
            axios.get(`${BASE}/all-tests`,    { headers: headers() }),
            axios.get(`${BASE}/all-teachers`, { headers: headers() }),
            axios.get(`${BASE}/all-subjects`, { headers: headers() }),
        ])
        .then(([tRes, tchRes, sRes]) => {
            if (tRes.data.status)   setTests(tRes.data.tests ?? [])
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
            test_name:  t.test_name              ?? '',
            teacher_id: t.teacher_id?._id ?? t.teacher_id ?? '',
            test_score: t.test_score             ?? '',
            subject_id: t.subject_id?._id ?? t.subject_id ?? '',
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        setSaving(true); setError('')
        const url = editing ? `${BASE}/update-test/${editing}` : `${BASE}/create-test`
        axios.post(url, form, { headers: headers() })
            .then((res) => { if (res.data.status) { setModal(false); fetchAll() } else setError(res.data.message ?? 'Error') })
            .catch(() => setError('Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this test?')) return
        axios.get(`${BASE}/delete-test/${id}`, { headers: headers() })
            .then(() => fetchAll()).catch(console.log)
    }

    const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

    const filtered = tests.filter(t => {
        const q = search.toLowerCase()
        return (t.test_name ?? '').toLowerCase().includes(q)
            || (t.teacher_id?.firstname ?? '').toLowerCase().includes(q)
            || (t.subject_id?.subject_name ?? '').toLowerCase().includes(q)
    })

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div>
                    <h1 className={style.pageTitle}>Tests</h1>
                    <p className={style.pageSubtitle}>{tests.length} records</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Test</button>
            </div>

            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input className={style.searchInput} placeholder="Search by test name…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className={style.clearBtn} onClick={() => setSearch('')}><X size={14} /></button>}
            </div>
        
            {loading ? <div className={style.loadingWrap}><div className={style.spinner} /></div> : (
                <div className={style.tableCard}>
                    <table className={style.table}>
                        <thead><tr>
                            <th>Test Name</th><th>Subject</th><th>Teacher</th><th>Score</th><th>Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#6b7a99', padding: '40px' }}>No test records found</td></tr>
                            ) : filtered.map(t => (
                                <tr key={t._id}>
                                    <td>{t.test_name ?? '—'}</td>
                                    <td>{t.subject_id?.subject_name ?? '—'}</td>
                                    <td>{t.teacher_id?.firstname ?? '—'} {t.teacher_id?.lastname ?? ''}</td>
                                    <td>{t.test_score ?? '—'}</td>
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
                <div className={style.overlay} onClick={ev => ev.target === ev.currentTarget && setModal(false)}>
                    <div className={style.modal}>
                        <div className={style.modalHeader}>
                            <h2>{editing ? 'Edit Test' : 'Add Test'}</h2>
                            <button className={style.closeBtn} onClick={() => setModal(false)}>×</button>
                        </div>
                        {error && <div className={style.errorMsg}>{error}</div>}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Test Name</label>
                                <input type="text" value={form.test_name} onChange={e => field('test_name', e.target.value)} placeholder="Enter test name" />
                            </div>
                            <div className={style.formGroup}>
                                <label>Score (out of 100)</label>
                                <input type="number" min="0" max="100" value={form.test_score} onChange={e => field('test_score', e.target.value)} />
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
                                <label>Subject</label>
                                <select value={form.subject_id} onChange={e => field('subject_id', e.target.value)}>
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
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

export default AdminTests
