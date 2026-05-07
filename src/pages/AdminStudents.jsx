import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import style from './AdminManage.module.css'

const EMPTY = {
    firstname: '', lastname: '', email: '', age: '',
    dob: '', gender: '', address: '', parent_phone: '',
    class_id: '', password: '',
}

const headers = () => ({
    Authorization: `Bearer ${localStorage.token}`,
    'Content-Type': 'application/json',
})

const AdminStudents = () => {
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
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
            axios.get('https://schoolpj-backend.onrender.com/admin/all-students', { headers: headers() }),
            axios.get('https://schoolpj-backend.onrender.com/admin/all-classes', { headers: headers() }),
        ])
        .then(([sRes, cRes]) => {
            if (sRes.data.status) setStudents(sRes.data.students ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => {
        setEditing(null)
        setForm(EMPTY)
        setError('')
        setModal(true)
    }

    const openEdit = (student) => {
        setEditing(student._id)
        setForm({
            firstname: student.firstname ?? '',
            lastname: student.lastname ?? '',
            email: student.email ?? '',
            age: student.age ?? '',
            dob: student.dob ? student.dob.slice(0, 10) : '',
            gender: student.gender ?? '',
            address: student.address ?? '',
            parent_phone: student.parent_phone ?? '',
            class_id: student.class_id ?? '',
            password: '',
        })
        setError('')
        setModal(true)
    }

    const closeModal = () => { setModal(false); setError('') }

    const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

    const save = () => {
        setSaving(true)
        setError('')
        const url = editing
            ? `https://schoolpj-backend.onrender.com/admin/update-student/${editing}`
            : 'https://schoolpj-backend.onrender.com/admin/registerstudent'
        const method = editing ? axios.post : axios.post
        const payload = editing
            ? { firstname: form.firstname, lastname: form.lastname, email: form.email, age: form.age, dob: form.dob, gender: form.gender, address: form.address, parent_phone: form.parent_phone, class_id: form.class_id }
            : { ...form, image: '' }

        method(url, payload, { headers: headers() })
            .then((res) => {
                if (res.data.status === false) { setError(res.data.message); return }
                closeModal()
                fetchAll()
            })
            .catch(() => setError('Request failed. Please try again.'))
            .finally(() => setSaving(false))
    }

    const remove = (id) => {
        if (!window.confirm('Delete this student? This cannot be undone.')) return
        axios.get(`https://schoolpj-backend.onrender.com/admin/delete-student/${id}`, { headers: headers() })
            .then(() => fetchAll())
            .catch(console.log)
    }

    const filtered = students.filter(s =>
        `${s.firstname} ${s.lastname} ${s.email}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={style.container}>
            <div className={style.pageHeader}>
                <div className={style.titleBlock}>
                    <h1 className={style.pageTitle}>Students</h1>
                    <p className={style.pageSubtitle}>{students.length} registered students</p>
                </div>
                <button className={style.addBtn} onClick={openAdd}>+ Add Student</button>
            </div>

            <div className={style.searchWrap}>
                <Search size={16} className={style.searchIcon} />
                <input className={style.searchInput} placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                                <th>Name</th>
                                <th>Email</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Parent Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr className={style.emptyRow}><td colSpan={8}>No students found.</td></tr>
                            ) : filtered.map((s, i) => (
                                <tr key={s._id}>
                                    <td>{i + 1}</td>
                                    <td>{s.firstname} {s.lastname}</td>
                                    <td>{s.email}</td>
                                    <td>{s.age}</td>
                                    <td>{s.gender}</td>
                                    <td>{s.parent_phone}</td>
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
                            <h2 className={style.modalTitle}>{editing ? 'Edit Student' : 'Add Student'}</h2>
                            <button className={style.closeBtn} onClick={closeModal}>×</button>
                        </div>

                        {error && <div className={style.errorMsg}>{error}</div>}

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
                                <label>Age</label>
                                <input type="number" value={form.age} onChange={set('age')} placeholder="Age" min="1" required />
                            </div>
                        </div>

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Date of Birth</label>
                                <input type="date" value={form.dob} onChange={set('dob')} required />
                            </div>
                            <div className={style.formGroup}>
                                <label>Gender</label>
                                <select value={form.gender} onChange={set('gender')} required>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label>Class</label>
                                <select value={form.class_id} onChange={set('class_id')} required>
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={style.formGroup}>
                                <label>Parent Phone</label>
                                <input value={form.parent_phone} onChange={set('parent_phone')} placeholder="+2348000000000" required />
                            </div>
                        </div>

                        <div className={style.formGroup}>
                            <label>Address</label>
                            <input value={form.address} onChange={set('address')} placeholder="Home address" required />
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
                                {saving ? 'Saving…' : editing ? 'Update Student' : 'Add Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminStudents
