import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import s from './Studentprofile.module.css'

const BASE = 'https://schoolpj-backend.onrender.com'

const calcAge = (dob) => {
    if (!dob) return '—'
    const today = new Date()
    const birth = new Date(dob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

const Studentprofile = () => {
    const navigate = useNavigate()
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)

    // edit mode
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    // account settings (local only — backend has no toggle endpoints)
    const [emailNotif, setEmailNotif] = useState(true)
    const [twoFactor, setTwoFactor] = useState(false)
    const [parentAccess, setParentAccess] = useState(true)

    // password modal
    const [pwModal, setPwModal] = useState(false)
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
    const [pwError, setPwError] = useState('')
    const [pwSuccess, setPwSuccess] = useState('')
    const [pwSaving, setPwSaving] = useState(false)

    const overlayRef = useRef(null)

    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`${BASE}/students/dashboardstudent`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.data.status) {
                    setStudent(res.data.students)
                    const st = res.data.students
                    setForm({
                        firstname: st.firstname ?? '',
                        lastname: st.lastname ?? '',
                        email: st.email ?? '',
                        parent_phone: st.parent_phone ?? '',
                        address: st.address ?? '',
                    })
                } else {
                    navigate('/student/login')
                }
            })
            .catch(() => navigate('/student/login'))
            .finally(() => setLoading(false))
    }, [])

    const fullName = student
        ? `${student.firstname ?? ''} ${student.lastname ?? ''}`.trim()
        : '...'

    const initials = student
        ? `${(student.firstname ?? '')[0] ?? ''}${(student.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'

    const className = student?.class_id?.name ?? student?.class_id ?? '—'

    const handleField = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleSave = () => {
        setSaving(true)
        setSaveError('')
        axios.post(`${BASE}/students/update-student/${student._id}`, form, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.data.status) {
                    setStudent((prev) => ({ ...prev, ...form }))
                    setEditing(false)
                } else {
                    setSaveError(res.data.message ?? 'Update failed.')
                }
            })
            .catch(() => setSaveError('Server error. Try again.'))
            .finally(() => setSaving(false))
    }

    const handleCancel = () => {
        setEditing(false)
        setSaveError('')
        setForm({
            firstname: student.firstname ?? '',
            lastname: student.lastname ?? '',
            email: student.email ?? '',
            parent_phone: student.parent_phone ?? '',
            address: student.address ?? '',
        })
    }

    // password modal
    const openPwModal = () => {
        setPwForm({ current: '', next: '', confirm: '' })
        setPwError('')
        setPwSuccess('')
        setPwModal(true)
    }

    const handlePwChange = (e) =>
        setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handlePwSave = () => {
        if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
            setPwError('All fields are required.')
            return
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwError('New passwords do not match.')
            return
        }
        setPwSaving(true)
        setPwError('')
        axios.post(`${BASE}/students/change-password/${student._id}`, {
            currentPassword: pwForm.current,
            newPassword: pwForm.next,
        }, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                if (res.data.status) {
                    setPwSuccess('Password changed successfully.')
                    setPwForm({ current: '', next: '', confirm: '' })
                } else {
                    setPwError(res.data.message ?? 'Failed to change password.')
                }
            })
            .catch(() => setPwError('Server error. Try again.'))
            .finally(() => setPwSaving(false))
    }

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) setPwModal(false)
    }

    const handleDeactivate = () => {
        if (window.confirm('Are you sure you want to deactivate your account? This cannot be undone.')) {
            axios.post(`${BASE}/students/deactivate/${student._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(() => {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                navigate('/student/login')
            }).catch(() => alert('Failed to deactivate. Please try again.'))
        }
    }

    if (loading) {
        return (
            <div className={s.loadingWrap}>
                <div className={s.spinner} />
            </div>
        )
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Profile</h1>
                <p className={s.subtitle}>Manage your personal information and account settings</p>
            </div>

            {/* ── Top two-column row ── */}
            <div className={s.topRow}>
                {/* Avatar card */}
                <div className={s.avatarCard}>
                    <div className={s.avatarWrap}>
                        {student?.image
                            ? <img src={student.image} alt="avatar" className={s.avatarImg} />
                            : <span>{initials}</span>
                        }
                    </div>
                    <p className={s.avatarName}>{fullName}</p>
                    <p className={s.avatarEmail}>{student?.email ?? ''}</p>
                    <div className={s.divider} />
                    <p className={s.avatarRole}>Role: Student</p>
                </div>

                {/* Profile info card */}
                <div className={s.infoCard}>
                    <div className={s.cardHeader}>
                        <h2 className={s.cardTitle}>Profile Information</h2>
                        {editing ? (
                            <div>
                                <button className={s.cancelBtn} onClick={handleCancel}>Cancel</button>
                                <button className={s.editBtn} onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        ) : (
                            <button className={s.editBtn} onClick={() => setEditing(true)}>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {saveError && <div className={s.errorMsg}>{saveError}</div>}

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Full Name</p>
                        {editing ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className={s.fieldInput} name="firstname" value={form.firstname} onChange={handleField} placeholder="First name" />
                                <input className={s.fieldInput} name="lastname" value={form.lastname} onChange={handleField} placeholder="Last name" />
                            </div>
                        ) : (
                            <p className={s.fieldValue}>{fullName}</p>
                        )}
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Email Address</p>
                        {editing
                            ? <input className={s.fieldInput} name="email" value={form.email} onChange={handleField} placeholder="Email" />
                            : <p className={s.fieldValue}>{student?.email ?? '—'}</p>
                        }
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Parent / Guardian Phone</p>
                        {editing
                            ? <input className={s.fieldInput} name="parent_phone" value={form.parent_phone} onChange={handleField} placeholder="Parent phone number" />
                            : <p className={s.fieldValue}>{student?.parent_phone ?? '—'}</p>
                        }
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Address</p>
                        {editing
                            ? <input className={s.fieldInput} name="address" value={form.address} onChange={handleField} placeholder="Address" />
                            : <p className={s.fieldValue}>{student?.address ?? '—'}</p>
                        }
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Date of Birth</p>
                        <p className={s.fieldValue}>{student?.dob ? new Date(student.dob).toLocaleDateString() : '—'}</p>
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Age</p>
                        <p className={s.fieldValue}>{calcAge(student?.dob)} years old</p>
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Class</p>
                        <p className={s.fieldValue}>{className}</p>
                        <p className={s.fieldNote}>Contact your administrator to change class assignment</p>
                    </div>

                    <div className={s.fieldRow}>
                        <p className={s.fieldLabel}>Enrollment Status</p>
                        <span className={student?.is_active !== false ? s.badgeActive : s.badgeInactive}>
                            {student?.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Account Settings ── */}
            <div className={s.sectionCard}>
                <h2 className={s.sectionTitle}>Account Settings</h2>

                <div className={s.toggleRow}>
                    <div>
                        <p className={s.toggleLabel}>Email Notifications</p>
                        <p className={s.toggleDesc}>Receive updates about your results and attendance</p>
                    </div>
                    <label className={s.toggle}>
                        <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                        <span className={s.toggleSlider} />
                    </label>
                </div>

                <div className={s.toggleRow}>
                    <div>
                        <p className={s.toggleLabel}>Two-Factor Authentication</p>
                        <p className={s.toggleDesc}>Add an extra layer of security to your account</p>
                    </div>
                    <label className={s.toggle}>
                        <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} />
                        <span className={s.toggleSlider} />
                    </label>
                </div>

                <div className={s.toggleRow}>
                    <div>
                        <p className={s.toggleLabel}>Parent / Guardian Access</p>
                        <p className={s.toggleDesc}>Allow your parent or guardian to view your profile</p>
                    </div>
                    <label className={s.toggle}>
                        <input type="checkbox" checked={parentAccess} onChange={(e) => setParentAccess(e.target.checked)} />
                        <span className={s.toggleSlider} />
                    </label>
                </div>
            </div>

            {/* ── Danger Zone ── */}
            <div className={s.dangerCard}>
                <h2 className={s.dangerTitle}>Danger Zone</h2>
                <p className={s.dangerDesc}>These actions are permanent and cannot be undone</p>
                <div className={s.dangerActions}>
                    <button className={s.dangerBtn} onClick={openPwModal}>
                        Change Password
                    </button>
                    <button className={s.dangerBtn} onClick={handleDeactivate}>
                        Deactivate Account
                    </button>
                </div>
            </div>

            {/* ── Password modal ── */}
            {pwModal && (
                <div className={s.overlay} ref={overlayRef} onClick={handleOverlayClick}>
                    <div className={s.modal}>
                        <div className={s.modalHeader}>
                            <h3 className={s.modalTitle}>Change Password</h3>
                            <button className={s.closeBtn} onClick={() => setPwModal(false)}>×</button>
                        </div>

                        {pwError && <div className={s.errorMsg}>{pwError}</div>}
                        {pwSuccess && <div className={s.successMsg}>{pwSuccess}</div>}

                        <div className={s.modalGroup}>
                            <label>Current Password</label>
                            <input type="password" name="current" value={pwForm.current} onChange={handlePwChange} placeholder="Enter current password" />
                        </div>
                        <div className={s.modalGroup}>
                            <label>New Password</label>
                            <input type="password" name="next" value={pwForm.next} onChange={handlePwChange} placeholder="Enter new password" />
                        </div>
                        <div className={s.modalGroup}>
                            <label>Confirm New Password</label>
                            <input type="password" name="confirm" value={pwForm.confirm} onChange={handlePwChange} placeholder="Confirm new password" />
                        </div>

                        <div className={s.modalFooter}>
                            <button className={s.cancelBtn} onClick={() => setPwModal(false)}>Cancel</button>
                            <button className={s.saveBtn} onClick={handlePwSave} disabled={pwSaving}>
                                {pwSaving ? 'Saving…' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Studentprofile
