import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const EMPTY = { subject_name: '', classes_id: '', teachers_id: '' }

const headers = () => ({
    Authorization: `Bearer ${localStorage.token}`,
    'Content-Type': 'application/json',
})

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([])
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
            axios.get(`${BASE}/all-subjects`, { headers: headers() }),
            axios.get(`${BASE}/all-classes`, { headers: headers() }),
            axios.get(`${BASE}/all-teachers`, { headers: headers() }),
        ])
        .then(([sRes, cRes, tRes]) => {
            if (sRes.data.status) setSubjects(sRes.data.subjects ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (s) => {
        setEditing(s._id)
        setForm({ subject_name: s.subject_name ?? '', classes_id: s.classes_id ?? '', teachers_id: s.teachers_id ?? '' })
        setError('')
        setModal(true)
    }

    const closeModal = () => { setModal(false); setError('') }
    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

    const save = () => {
        setSaving(true)
        setError('')
        const url = editing
            ? `${BASE}/update-subject/${editing}`
            : `${BASE}/create-subject`

        axios.post(url, form, { headers: headers() })
            .then((res) => {
                if (res.data.status === false) { setError(res.data.message); return }
                closeModal()
                fetchAll()
            })
            .catch(() => setError('Request failed. Please try again.'))
            .finally(() => setSaving(false))
    }

    const remove = (id) => {
        if (!window.confirm('Delete this subject? This cannot be undone.')) return
        axios.get(`${BASE}/delete-subject/${id}`, { headers: headers() })
            .then(() => fetchAll())
            .catch(console.log)
    }

    const filtered = subjects.filter(s =>
        (s.subject_name ?? '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div className={style.titleBlock}>
                    <h1 className={style.pageTitle}>Subjects</h1>
                    <p className={style.pageSubtitle}>{subjects.length} total subjects</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Subject</button>
            </div>

            <input
                className={style.searchBar}
                placeholder="Search by subject name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className={style.tableCard}>
                {loading ? (
                    <div className={style.loadingWrap}><div className={style.spinner} /></div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Subject Name</th>
                                <th>Class</th>
                                <th>Teacher</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr className={style.emptyRow}><td colSpan={6}>No subjects found.</td></tr>
                            ) : filtered.map((s, i) => (
                                <tr key={s._id}>
                                    <td>{i + 1}</td>
                                    <td>{s.subject_name}</td>
                                    <td>{s.classes_id?.name ?? s.classes_id ?? '—'}</td>
                                    <td>
                                        {s.teachers_id?.firstname
                                            ? `${s.teachers_id.firstname} ${s.teachers_id.lastname}`
                                            : s.teachers_id ?? '—'}
                                    </td>
                                    <td>
                                        <span className={s.is_active ? style.badgeActive : style.badgeInactive}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={style.actions}>
                                            <button className={style.editBtn} onClick={() => openEdit(s)}>Edit</button>
                                            <button className={style.deleteBtn} onClick={() => remove(s._id)}>Delete</button>
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
                            <h2 className={style.modalTitle}>{editing ? 'Edit Subject' : 'Add Subject'}</h2>
                            <button className={style.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        {error && <div className={style.errorMsg}>{error}</div>}

                        <div className={style.formGroup}>
                            <label>Subject Name</label>
                            <input value={form.subject_name} onChange={set('subject_name')} placeholder="e.g. Mathematics" required />
                        </div>

                        <div className={style.formGroup}>
                            <label>Class</label>
                            <select value={form.classes_id} onChange={set('classes_id')} required>
                                <option value="">Select class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className={style.formGroup}>
                            <label>Teacher</label>
                            <select value={form.teachers_id} onChange={set('teachers_id')} required>
                                <option value="">Select teacher</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t._id}>
                                        {t.title} {t.firstname} {t.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={style.saveBtn} onClick={save} disabled={saving}>
                                {saving ? 'Saving…' : editing ? 'Update Subject' : 'Add Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminSubjects
