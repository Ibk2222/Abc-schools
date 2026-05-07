import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './AdminManage.module.css'

const BASE = 'https://schoolproject-backend-ruiy.onrender.com/admin'
const EMPTY = { title: '', firstname: '', lastname: '', email: '', age: '', phone: '', password: '' }

const headers = () => ({
    Authorization: `Bearer ${localStorage.token}`,
    'Content-Type': 'application/json',
})

const AdminTeachers = () => {
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchTeachers() }, [])

    const fetchTeachers = () => {
        setLoading(true)
        axios.get(`${BASE}/all-teachers`, { headers: headers() })
            .then((res) => { if (res.data.status) setTeachers(res.data.teachers ?? []) })
            .catch(console.log)
            .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }

    const openEdit = (t) => {
        setEditing(t._id)
        setForm({ title: t.title ?? '', firstname: t.firstname ?? '', lastname: t.lastname ?? '', email: t.email ?? '', age: t.age ?? '', phone: t.phone ?? '', password: '' })
        setError('')
        setModal(true)
    }

    const closeModal = () => { setModal(false); setError('') }
    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

    const save = () => {
        setSaving(true)
        setError('')
        const url = editing
            ? `${BASE}/update-teacher/${editing}`
            : `${BASE}/register`
        const payload = editing
            ? { title: form.title, firstname: form.firstname, lastname: form.lastname, email: form.email, age: form.age, phone: form.phone }
            : form

        axios.post(url, payload, { headers: headers() })
            .then((res) => {
                if (res.data.status === false) { setError(res.data.message); return }
                closeModal()
                fetchTeachers()
            })
            .catch(() => setError('Request failed. Please try again.'))
            .finally(() => setSaving(false))
    }

    const remove = (id) => {
        if (!window.confirm('Delete this teacher? This cannot be undone.')) return
        axios.get(`${BASE}/delete-teacher/${id}`, { headers: headers() })
            .then(() => fetchTeachers())
            .catch(console.log)
    }

    const filtered = teachers.filter(t =>
        `${t.firstname} ${t.lastname} ${t.email}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div className={style.titleBlock}>
                    <h1 className={style.pageTitle}>Teachers</h1>
                    <p className={style.pageSubtitle}>{teachers.length} registered teachers</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Teacher</button>
            </div>

            <input
                className={style.searchBar}
                placeholder="Search by name or emailâ€¦"
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr className={style.emptyRow}><td colSpan={8}>No teachers found.</td></tr>
                            ) : filtered.map((t, i) => (
                                <tr key={t._id}>
                                    <td>{i + 1}</td>
                                    <td>{t.title} {t.firstname} {t.lastname}</td>
                                    <td>{t.email}</td>
                                    <td>{t.age}</td>
                                    <td>{t.phone}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{t.role}</td>
                                    <td>
                                        <span className={t.is_active ? style.badgeActive : style.badgeInactive}>
                                            {t.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={style.actions}>
                                            <button className={style.editBtn} onClick={() => openEdit(t)}>Edit</button>
                                            <button className={style.deleteBtn} onClick={() => remove(t._id)}>Delete</button>
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
                            <h2 className={style.modalTitle}>{editing ? 'Edit Teacher' : 'Add Teacher'}</h2>
                            <button className={style.closeBtn} onClick={closeModal}>Ã—</button>
                        </div>

                        {error && <div className={style.errorMsg}>{error}</div>}

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Title</label>
                                <select value={form.title} onChange={set('title')} required>
                                    <option value="">Select</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                    <option value="Dr">Dr</option>
                                    <option value="Prof">Prof</option>
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Age</label>
                                <input type="number" value={form.age} onChange={set('age')} placeholder="Age" min="18" required />
                            </div>
                        </div>

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>First Name</label>
                                <input value={form.firstname} onChange={set('firstname')} placeholder="First name" required />
                            </div>
                            <div className={style.formGroup}>
                                <label>Last Name</label>
                                <input value={form.lastname} onChange={set('lastname')} placeholder="Last name" required />
                            </div>
                        </div>

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={set('email')} placeholder="Email address" required />
                            </div>
                            <div className={style.formGroup}>
                                <label>Phone</label>
                                <input value={form.phone} onChange={set('phone')} placeholder="+2348000000000" required />
                            </div>
                        </div>

                        {!editing && (
                            <div className={style.formGroup}>
                                <label>Password</label>
                                <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 chars, A-Z a-z 0-9" required />
                            </div>
                        )}

                        <div className={style.modalFooter}>
                            <button className={style.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={style.saveBtn} onClick={save} disabled={saving}>
                                {saving ? 'Savingâ€¦' : editing ? 'Update Teacher' : 'Add Teacher'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminTeachers
