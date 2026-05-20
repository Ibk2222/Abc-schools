import axios from 'axios'
import React, { useEffect, useState } from 'react'
import style from './Results.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/admin'
const hdrs = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const EMPTY_FORM = { title: '', description: '', class_id: '', subject_id: '', teacher_id: '', due_date: '', questions: [{ text: '', type: 'text', options: ['', ''] }] }

const AdminAssignment = () => {
    const [assignments, setAssignments] = useState([])
    const [classes, setClasses] = useState([])
    const [subjects, setSubjects] = useState([])
    const [teachers, setTeachers] = useState([])
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [subModal, setSubModal] = useState(null)
    const [subLoading, setSubLoading] = useState(false)

    useEffect(() => { fetchAll() }, [])

    const fetchAll = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE}/all-assignments`, { headers: hdrs() }),
            axios.get(`${BASE}/all-classes`, { headers: hdrs() }),
            axios.get(`${BASE}/all-subjects`, { headers: hdrs() }),
            axios.get(`${BASE}/all-teachers`, { headers: hdrs() }),
        ])
        .then(([aRes, cRes, sRes, tRes]) => {
            if (aRes.data.status) setAssignments(aRes.data.assignments ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
            if (sRes.data.status) setSubjects(sRes.data.subjects ?? [])
            if (tRes.data.status) setTeachers(tRes.data.teachers ?? [])
        })
        .catch(console.log)
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModal(true) }

    const openEdit = (a) => {
        setEditing(a._id)
        setForm({
            title: a.title ?? '',
            description: a.description ?? '',
            class_id: a.class_id?._id ?? a.class_id ?? '',
            subject_id: a.subject_id?._id ?? a.subject_id ?? '',
            teacher_id: a.teacher_id?._id ?? a.teacher_id ?? '',
            due_date: a.due_date ? a.due_date.slice(0, 10) : '',
            questions: a.questions?.length
                ? a.questions.map(q => ({ text: q.text ?? '', type: q.type ?? 'text', options: q.options?.length ? [...q.options] : ['', ''] }))
                : [{ text: '', type: 'text', options: ['', ''] }],
        })
        setError(''); setModal(true)
    }

    const handleSave = () => {
        if (!form.title.trim() || !form.class_id || !form.subject_id || !form.due_date) {
            setError('Title, class, subject and due date are required.'); return
        }
        if (form.questions.some(q => !q.text.trim())) { setError('All questions must have text.'); return }
        setSaving(true); setError('')
        const req = editing
            ? axios.post(`${BASE}/update-assignment/${editing}`, form, { headers: hdrs() })
            : axios.post(`${BASE}/create-assignment`, form, { headers: hdrs() })
        req
            .then(res => { if (res.data.status === false) { setError(res.data.message ?? 'Error'); return } setModal(false); fetchAll() })
            .catch(err => setError(err.response?.data?.message ?? 'Server error'))
            .finally(() => setSaving(false))
    }

    const handleDelete = (id) => {
        if (!window.confirm('Delete this assignment? All student submissions will also be removed.')) return
        axios.delete(`${BASE}/delete-assignment/${id}`, { headers: hdrs() }).then(fetchAll).catch(console.log)
    }

    const openSubs = (a) => {
        setSubModal({ assignment: a, submissions: [] }); setSubLoading(true)
        axios.get(`${BASE}/assignment/${a._id}/submissions`, { headers: hdrs() })
            .then(res => { if (res.data.status) setSubModal({ assignment: a, submissions: res.data.submissions ?? [] }) })
            .catch(console.log)
            .finally(() => setSubLoading(false))
    }

    const setQ = (i, key, val) => setForm(f => { const qs = [...f.questions]; qs[i] = { ...qs[i], [key]: val }; return { ...f, questions: qs } })
    const addQ = () => setForm(f => ({ ...f, questions: [...f.questions, { text: '', type: 'text', options: ['', ''] }] }))
    const removeQ = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, idx) => idx !== i) }))
    const setOpt = (qi, oi, val) => setForm(f => { const qs = [...f.questions]; const opts = [...qs[qi].options]; opts[oi] = val; qs[qi] = { ...qs[qi], options: opts }; return { ...f, questions: qs } })
    const addOpt = (qi) => setForm(f => { const qs = [...f.questions]; qs[qi] = { ...qs[qi], options: [...qs[qi].options, ''] }; return { ...f, questions: qs } })
    const removeOpt = (qi, oi) => setForm(f => { const qs = [...f.questions]; qs[qi] = { ...qs[qi], options: qs[qi].options.filter((_, idx) => idx !== oi) }; return { ...f, questions: qs } })

    const inputSt = { background: '#131f35', border: '1px solid #1a2540', borderRadius: 8, color: '#c0cfe8', fontSize: 13, padding: '9px 12px', outline: 'none', width: '100%' }
    const smInputSt = { ...inputSt, fontSize: 12, padding: '7px 10px' }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 className={style.title}>Assignments</h1>
                        <p className={style.subtitle}>Manage all school assignments</p>
                    </div>
                    <button className={style.addBtn} onClick={openAdd}>+ New Assignment</button>
                </div>
            </div>

            {loading ? (
                <div className={style.loadingWrap}><div className={style.spinner} /></div>
            ) : (
                <div className={style.tableCard}>
                    <div className={style.tableHeader}>
                        <p className={style.tableTitle}>All Assignments</p>
                        <p className={style.tableSubtitle}>{assignments.length} total</p>
                    </div>
                    {assignments.length === 0 ? (
                        <p className={style.empty}>No assignments yet.</p>
                    ) : (
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Due Date</th>
                                    <th>Qs</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map((a, i) => (
                                    <tr key={a._id}>
                                        <td>{i + 1}</td>
                                        <td><strong style={{ color: '#c0cfe8' }}>{a.title}</strong>
                                            {a.description && <p style={{ color: '#6b7a99', fontSize: 11, margin: '2px 0 0' }}>{a.description}</p>}
                                        </td>
                                        <td>{a.class_id?.name ?? '—'}</td>
                                        <td>{a.subject_id?.subject_name ?? '—'}</td>
                                        <td>{a.teacher_id ? `${a.teacher_id.firstname} ${a.teacher_id.lastname}` : '—'}</td>
                                        <td>{a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</td>
                                        <td><span className={style.scoreBadge}>{a.questions?.length ?? 0}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <button className={style.viewBtn} onClick={() => openSubs(a)}>Submissions</button>
                                                <button className={style.viewBtn} onClick={() => openEdit(a)}>Edit</button>
                                                <button className={style.viewBtn} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => handleDelete(a._id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {modal && (
                <div className={style.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className={style.sheetModal} style={{ maxWidth: 700 }}>
                        <div className={style.sheetModalHead}>
                            <div>
                                <h2 className={style.sheetTitle}>{editing ? 'Edit Assignment' : 'New Assignment'}</h2>
                                <p className={style.sheetSub}>Fill in the details and add questions below</p>
                            </div>
                            <button className={style.sheetCloseBtn} onClick={() => setModal(false)}>×</button>
                        </div>

                        {error && <div className={style.addErrorMsg}>{error}</div>}

                        <div className={style.addFormRow} style={{ gridTemplateColumns: '1fr' }}>
                            <div className={style.addFormGroup}>
                                <label>Title</label>
                                <input type="text" style={inputSt} placeholder="Assignment title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                        </div>
                        <div className={style.addFormRow} style={{ gridTemplateColumns: '1fr' }}>
                            <div className={style.addFormGroup}>
                                <label>Description (optional)</label>
                                <textarea style={{ ...inputSt, resize: 'vertical', fontFamily: 'inherit' }} rows={2} placeholder="Brief description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                        <div className={style.addFormRow}>
                            <div className={style.addFormGroup}>
                                <label>Class</label>
                                <select style={inputSt} value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={style.addFormGroup}>
                                <label>Subject</label>
                                <select style={inputSt} value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                                    <option value="">Select subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subject_name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={style.addFormRow}>
                            <div className={style.addFormGroup}>
                                <label>Teacher (optional)</label>
                                <select style={inputSt} value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                                    <option value="">Select teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstname} {t.lastname}</option>)}
                                </select>
                            </div>
                            <div className={style.addFormGroup}>
                                <label>Due Date</label>
                                <input type="date" style={inputSt} value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                            </div>
                        </div>

                        <p style={{ color: '#8899aa', fontSize: 12, fontWeight: 600, margin: '16px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</p>

                        {form.questions.map((q, qi) => (
                            <div key={qi} style={{ background: '#131f35', border: '1px solid #1a2540', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                    <span style={{ color: '#6b7a99', fontSize: 11, fontWeight: 700, minWidth: 22 }}>Q{qi + 1}</span>
                                    <input type="text" style={{ ...inputSt, flex: 1 }} placeholder="Question text" value={q.text} onChange={e => setQ(qi, 'text', e.target.value)} />
                                    <select style={{ background: '#0f1623', border: '1px solid #1a2540', borderRadius: 8, color: '#8899aa', fontSize: 12, padding: '9px 10px', outline: 'none', cursor: 'pointer', flexShrink: 0 }} value={q.type} onChange={e => setQ(qi, 'type', e.target.value)}>
                                        <option value="text">Text answer</option>
                                        <option value="multiple_choice">Multiple choice</option>
                                    </select>
                                    {form.questions.length > 1 && (
                                        <button onClick={() => removeQ(qi)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                                    )}
                                </div>
                                {q.type === 'multiple_choice' && (
                                    <div style={{ paddingLeft: 30 }}>
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                                                <span style={{ color: '#6b7a99', fontSize: 11, minWidth: 16 }}>{String.fromCharCode(65 + oi)}.</span>
                                                <input type="text" style={{ ...smInputSt, flex: 1 }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => setOpt(qi, oi, e.target.value)} />
                                                {q.options.length > 2 && (
                                                    <button onClick={() => removeOpt(qi, oi)} style={{ background: 'transparent', border: 'none', color: '#6b7a99', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>×</button>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={() => addOpt(qi)} style={{ background: 'transparent', border: '1px dashed #1a2540', color: '#6b7a99', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>+ Add option</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={addQ} style={{ background: 'transparent', border: '1px dashed #1a2540', color: '#6b7a99', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', width: '100%', marginBottom: 16 }}>+ Add Question</button>

                        <div className={style.addModalFooter}>
                            <button className={style.closeSheetBtn} onClick={() => setModal(false)}>Cancel</button>
                            <button className={style.printBtn} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Assignment')}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Submissions Modal ── */}
            {subModal && (
                <div className={style.overlay} onClick={e => e.target === e.currentTarget && setSubModal(null)}>
                    <div className={style.sheetModal} style={{ maxWidth: 700 }}>
                        <div className={style.sheetModalHead}>
                            <div>
                                <h2 className={style.sheetTitle}>Submissions</h2>
                                <p className={style.sheetSub}>{subModal.assignment.title}</p>
                            </div>
                            <button className={style.sheetCloseBtn} onClick={() => setSubModal(null)}>×</button>
                        </div>
                        {subLoading ? (
                            <div className={style.loadingWrap}><div className={style.spinner} /></div>
                        ) : subModal.submissions.length === 0 ? (
                            <p className={style.empty}>No submissions yet.</p>
                        ) : (
                            subModal.submissions.map((sub) => (
                                <div key={sub._id} style={{ background: '#131f35', border: '1px solid #1a2540', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                                    <p style={{ color: '#c0cfe8', fontWeight: 600, margin: '0 0 2px' }}>{sub.student_id?.firstname ?? ''} {sub.student_id?.lastname ?? ''}</p>
                                    <p style={{ color: '#6b7a99', fontSize: 12, margin: '0 0 12px' }}>Submitted {new Date(sub.submitted_at).toLocaleString()}</p>
                                    {subModal.assignment.questions.map((q, qi) => {
                                        const ans = sub.answers.find(a => a.question_index === qi)
                                        return (
                                            <div key={qi} style={{ marginBottom: 8 }}>
                                                <p style={{ color: '#8899aa', fontSize: 12, margin: '0 0 2px' }}>Q{qi + 1}: {q.text}</p>
                                                <p style={{ color: '#c0cfe8', fontSize: 13, margin: 0, paddingLeft: 12 }}>{ans?.answer ?? <em style={{ color: '#6b7a99' }}>No answer</em>}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))
                        )}
                        <div className={style.sheetFooter}>
                            <button className={style.closeSheetBtn} onClick={() => setSubModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminAssignment
