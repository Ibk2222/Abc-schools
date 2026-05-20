import axios from 'axios'
import React, { useEffect, useState } from 'react'
import s from './StudentPages.module.css'

const BASE = 'https://schoolpj-backend.onrender.com/students'
const hdrs = () => ({ Authorization: `Bearer ${localStorage.token}`, 'Content-Type': 'application/json' })

const StudentAssignment = () => {
    const [assignments, setAssignments] = useState([])
    const [submitted, setSubmitted] = useState({})
    const [loading, setLoading] = useState(true)
    const [answerModal, setAnswerModal] = useState(null)
    const [viewModal, setViewModal] = useState(null)
    const [answers, setAnswers] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [viewLoading, setViewLoading] = useState(false)

    useEffect(() => {
        axios.get(`${BASE}/my-assignments`, { headers: hdrs() })
            .then(res => {
                if (res.data.status) {
                    const list = res.data.assignments ?? []
                    setAssignments(list)
                    const map = {}
                    list.forEach(a => { map[a._id] = false })
                    setSubmitted(map)
                    return Promise.all(list.map(a =>
                        axios.get(`${BASE}/assignment/${a._id}`, { headers: hdrs() })
                            .then(r => ({ id: a._id, done: r.data.already_submitted ?? false }))
                            .catch(() => ({ id: a._id, done: false }))
                    ))
                }
                return []
            })
            .then(results => {
                if (results.length) {
                    const map = {}
                    results.forEach(r => { map[r.id] = r.done })
                    setSubmitted(map)
                }
            })
            .catch(console.log)
            .finally(() => setLoading(false))
    }, [])

    const openAnswer = (a) => {
        setAnswers(a.questions.map((_, i) => ({ question_index: i, answer: '' })))
        setSubmitError('')
        setAnswerModal(a)
    }

    const openView = (a) => {
        setViewLoading(true)
        setViewModal({ assignment: a, submission: null })
        axios.get(`${BASE}/assignment/${a._id}/my-submission`, { headers: hdrs() })
            .then(res => { if (res.data.status) setViewModal({ assignment: a, submission: res.data.submission }) })
            .catch(console.log)
            .finally(() => setViewLoading(false))
    }

    const handleSubmit = () => {
        if (answers.some(a => !a.answer.trim())) { setSubmitError('Please answer all questions before submitting.'); return }
        setSubmitting(true); setSubmitError('')
        axios.post(`${BASE}/assignment/${answerModal._id}/submit`, { answers }, { headers: hdrs() })
            .then(res => {
                if (res.data.status === false) { setSubmitError(res.data.message ?? 'Error'); return }
                setSubmitted(s => ({ ...s, [answerModal._id]: true }))
                setAnswerModal(null)
            })
            .catch(err => setSubmitError(err.response?.data?.message ?? 'Server error'))
            .finally(() => setSubmitting(false))
    }

    const isOverdue = (due) => due && new Date(due) < new Date()

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Assignments</h1>
                <p className={s.subtitle}>View and answer assignments from your teachers</p>
            </div>

            <div className={s.tableCard}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Teacher</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length === 0 ? (
                            <tr><td colSpan={8} className={s.empty}>No assignments yet.</td></tr>
                        ) : assignments.map((a, i) => {
                            const done = submitted[a._id]
                            const overdue = isOverdue(a.due_date)
                            return (
                                <tr key={a._id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <strong>{a.title}</strong>
                                        {a.description && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{a.description}</p>}
                                    </td>
                                    <td>{a.subject_id?.subject_name ?? '—'}</td>
                                    <td>{a.class_id?.name ?? '—'}</td>
                                    <td>{a.teacher_id ? `${a.teacher_id.firstname} ${a.teacher_id.lastname}` : '—'}</td>
                                    <td style={{ color: overdue && !done ? '#ef4444' : undefined }}>
                                        {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                                        {overdue && !done && <span style={{ fontSize: 10, display: 'block', color: '#ef4444' }}>Overdue</span>}
                                    </td>
                                    <td>
                                        <span className={`${s.badge} ${done ? s.badgeGreen : overdue ? s.badgeRed : s.badgeBlue}`}>
                                            {done ? 'Submitted' : overdue ? 'Overdue' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {done ? (
                                            <button className={s.printBtn} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => openView(a)}>View Answer</button>
                                        ) : overdue ? (
                                            <span style={{ color: '#94a3b8', fontSize: 12 }}>Closed</span>
                                        ) : (
                                            <button className={s.printBtn} style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => openAnswer(a)}>Answer</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Answer Modal ── */}
            {answerModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && setAnswerModal(null)}>
                    <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{answerModal.title}</h2>
                                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{answerModal.subject_id?.subject_name ?? ''} · Due {answerModal.due_date ? new Date(answerModal.due_date).toLocaleDateString() : '—'}</p>
                                {answerModal.description && <p style={{ margin: '6px 0 0', fontSize: 13, color: '#475569' }}>{answerModal.description}</p>}
                            </div>
                            <button onClick={() => setAnswerModal(null)} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, flexShrink: 0 }}>×</button>
                        </div>

                        {submitError && <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{submitError}</div>}

                        {answerModal.questions.map((q, qi) => (
                            <div key={qi} style={{ marginBottom: 20 }}>
                                <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                                    <span style={{ color: '#1451f0', marginRight: 6 }}>Q{qi + 1}.</span>{q.text}
                                </p>
                                {q.type === 'multiple_choice' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {q.options.map((opt, oi) => (
                                            <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', border: `2px solid ${answers[qi]?.answer === opt ? '#1451f0' : '#e2e8f0'}`, borderRadius: 8, background: answers[qi]?.answer === opt ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s' }}>
                                                <input type="radio" name={`q-${qi}`} value={opt} checked={answers[qi]?.answer === opt} onChange={() => setAnswers(a => { const n = [...a]; n[qi] = { ...n[qi], answer: opt }; return n })} style={{ accentColor: '#1451f0' }} />
                                                <span style={{ fontSize: 13, color: '#334155' }}>{String.fromCharCode(65 + oi)}. {opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        rows={3}
                                        placeholder="Type your answer here…"
                                        value={answers[qi]?.answer ?? ''}
                                        onChange={e => setAnswers(a => { const n = [...a]; n[qi] = { ...n[qi], answer: e.target.value }; return n })}
                                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                    />
                                )}
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => setAnswerModal(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 22px', background: '#1451f0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Submitting…' : 'Submit Assignment'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── View Submission Modal ── */}
            {viewModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }} onClick={e => e.target === e.currentTarget && setViewModal(null)}>
                    <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: '#1e293b' }}>My Submission</h2>
                                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{viewModal.assignment.title}</p>
                            </div>
                            <button onClick={() => setViewModal(null)} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#94a3b8', lineHeight: 1, flexShrink: 0 }}>×</button>
                        </div>

                        {viewLoading ? (
                            <div className={s.loadingWrap}><div className={s.spinner} /></div>
                        ) : !viewModal.submission ? (
                            <p className={s.empty}>Submission not found.</p>
                        ) : (
                            <>
                                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>Submitted on {new Date(viewModal.submission.submitted_at).toLocaleString()}</p>
                                {viewModal.assignment.questions.map((q, qi) => {
                                    const ans = viewModal.submission.answers.find(a => a.question_index === qi)
                                    return (
                                        <div key={qi} style={{ marginBottom: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#1e293b', fontSize: 13 }}><span style={{ color: '#1451f0', marginRight: 6 }}>Q{qi + 1}.</span>{q.text}</p>
                                            <p style={{ margin: 0, fontSize: 13, color: '#334155', paddingLeft: 20 }}>{ans?.answer ?? <em style={{ color: '#94a3b8' }}>No answer recorded</em>}</p>
                                        </div>
                                    )
                                })}
                            </>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button onClick={() => setViewModal(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentAssignment
