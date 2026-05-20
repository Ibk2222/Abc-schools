import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import style from './Results.module.css'

const GRADE_COLORS = {
    A: '#22c55e',
    B: '#3b82f6',
    C: '#f59e0b',
    D: '#f97316',
    F: '#ef4444',
}

const gradeColor = (g) => GRADE_COLORS[g] ?? '#6b7a99'

const gradeFromScore = (score) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
}

/* ── Donut chart ── */
const DonutChart = ({ segments, total }) => {
    const size = 140
    const cx = size / 2, cy = size / 2, r = 52, stroke = 22
    const circumference = 2 * Math.PI * r
    let cumulative = 0

    return (
        <div className={style.donut}>
            <svg width={size} height={size}>
                {segments.map((seg, i) => {
                    const frac = total ? seg.count / total : 0
                    const dash = frac * circumference
                    const offset = -(cumulative / (total || 1)) * circumference
                    cumulative += seg.count
                    return (
                        <circle
                            key={i}
                            cx={cx} cy={cy} r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={offset}
                            transform={`rotate(-90 ${cx} ${cy})`}
                        />
                    )
                })}
                {total === 0 && (
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2540" strokeWidth={stroke} />
                )}
            </svg>
            <div className={style.donutInner}>
                <span className={style.donutPct}>{total}</span>
                <span className={style.donutSub}>total</span>
            </div>
        </div>
    )
}

/* ── Line chart ── */
const LineChart = ({ points, color = 'rgb(20,81,240)', label }) => {
    if (!points.length) return <p className={style.empty}>No data</p>
    const W = 400, H = 120, PAD = 16
    const vals = points.map(p => p.y)
    const maxV = Math.max(...vals, 1)
    const minV = Math.min(...vals, 0)
    const range = maxV - minV || 1

    const x = (i) => PAD + (i / (points.length - 1 || 1)) * (W - PAD * 2)
    const y = (v) => H - PAD - ((v - minV) / range) * (H - PAD * 2)

    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.y)}`).join(' ')

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
            <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={`${d} L${x(points.length - 1)},${H} L${x(0)},${H} Z`}
                fill={`url(#grad-${label})`}
            />
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(p.y)} r="4" fill={color} />
                    <text x={x(i)} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7a99">
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    )
}

/* ── Bar chart ── */
const BarChart = ({ bars }) => {
    const maxVal = Math.max(...bars.map(b => b.value), 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
            <div className={style.yAxis}>
                {[100, 75, 50, 25, 0].map(v => (
                    <span key={v} className={style.yLabel}>{v}</span>
                ))}
            </div>
            {bars.map((bar) => (
                <div key={bar.label} className={style.barGroup}>
                    <span className={style.barValue}>{bar.value}%</span>
                    <div
                        className={style.bar}
                        style={{ height: `${(bar.value / maxVal) * 90}%` }}
                        title={`${bar.label}: ${bar.value}%`}
                    />
                    <span className={style.barLabel}>{bar.label}</span>
                </div>
            ))}
        </div>
    )
}

/* ── Print result sheet in new window ── */
const printSheet = (student, studentResults) => {
    const fullName = `${student.firstname ?? ''} ${student.lastname ?? ''}`.trim().toUpperCase()
    const totalScore = studentResults.reduce((a, r) => a + (r.score ?? 0), 0)
    const maxScore   = studentResults.length * 100
    const aggPct     = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : '0.0'

    const rows = studentResults.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td style="text-align:left">${r.exam?.subject_id?.subject_name ?? `Subject ${i + 1}`}</td>
            <td>${r.score ?? '—'}</td>
            <td>100</td>
            <td><b>${r.grade_level || gradeFromScore(r.score)}</b></td>
        </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><title>Result Sheet — ${fullName}</title>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 50px; color: #000; }
        .header { text-align: center; padding-bottom: 14px; border-bottom: 3px double #000; margin-bottom: 20px; }
        .school { font-size: 34px; font-style: italic; font-weight: bold; margin: 0 0 4px; }
        .logo { width: 70px; height: 70px; object-fit: contain; margin-bottom: 6px; }
        .term { font-size: 15px; font-weight: bold; letter-spacing: 1px; margin: 8px 0 0; }
        .info { font-size: 13px; font-weight: bold; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
        .info-text span { display: block; margin-bottom: 6px; }
        .passport { width: 90px; height: 110px; object-fit: cover; border: 1px solid #000; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px; }
        th, td { border: 1px solid #000; padding: 7px 10px; text-align: center; }
        th { background: #efefef; font-weight: bold; font-size: 12px; letter-spacing: 0.04em; }
        .totals { font-size: 13px; font-weight: bold; text-align: center; padding: 6px 0; border-top: 2px solid #000; }
        .totals span { margin: 0 24px; }
        @media print { body { margin: 20px; } }
    </style></head><body>
    <div class="header">
        <img src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360" class="logo" alt="School Logo" />
        <p class="school">ABC Nursery and Primary School</p>
        <p>Ibara Housing, Abeokuta</p>
        <p class="term">RESULT SHEET {${new Date().getFullYear()}}</p>
    </div>
    <div class="info">
        <div class="info-text">
            <span>STUDENT'S NAME: ${fullName}</span>
            <span>ROLL NO. ${String(studentResults[0]?._id ?? '').slice(-5).toUpperCase()}</span>
        </div>
        ${student.image ? `<img src="${student.image}" class="passport" alt="Student Photo" />` : ''}
    </div>
    <table>
        <thead><tr><th>S.NO</th><th>SUBJECT</th><th>SCORE</th><th>TOTAL</th><th>GRADE</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
    <div class="totals">
        <span>GRAND TOTAL = ${totalScore}</span>
        <span>${totalScore}/${maxScore}</span>
        <span>AGGRE. PERCENTAGE % = ${aggPct}%</span>
    </div>
    </body></html>`

    const w = window.open('', '_blank', 'width=820,height=950')
    w.document.write(html)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 400)
}

const BASE_T = 'https://schoolpj-backend.onrender.com/teacher'
const ADD_EMPTY = { student: '', exam: '', score: '', test_score: '', grade_level: '' }

/* ── Main component ── */
const Results = () => {
    const [results, setResults] = useState([])
    const [classes, setClasses] = useState([])
    const [allStudents, setAllStudents] = useState([])
    const [allExams, setAllExams] = useState([])
    const [activeClass, setActiveClass] = useState('all')
    const [loading, setLoading] = useState(false)
    const [sheet, setSheet] = useState(null)
    const [addModal, setAddModal] = useState(false)
    const [addForm, setAddForm] = useState(ADD_EMPTY)
    const [addSaving, setAddSaving] = useState(false)
    const [addError, setAddError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
    })

    const fetchData = () => {
        setLoading(true)
        Promise.all([
            axios.get(`${BASE_T}/all-results`,  { headers: getHeaders() }),
            axios.get(`${BASE_T}/all-classes`,  { headers: getHeaders() }),
            axios.get(`${BASE_T}/all-students`, { headers: getHeaders() }),
            axios.get(`${BASE_T}/all-exams`,    { headers: getHeaders() }),
        ])
        .then(([rRes, cRes, sRes, eRes]) => {
            if (rRes.data.status) setResults(rRes.data.results ?? [])
            if (cRes.data.status) setClasses(cRes.data.classes ?? [])
            if (sRes.data.status) setAllStudents(sRes.data.students ?? [])
            if (eRes.data.status) setAllExams(eRes.data.exams ?? [])
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }

    const openAdd = () => { setAddForm(ADD_EMPTY); setAddError(''); setAddModal(true) }

    const handleAddSave = () => {
        if (!addForm.student || !addForm.exam) { setAddError('Student and Exam are required.'); return }
        setAddSaving(true); setAddError('')
        const payload = {
            student:     addForm.student,
            exam:        addForm.exam,
            grade_level: addForm.grade_level,
            score:       addForm.score !== '' ? Number(addForm.score) : undefined,
            test_score:  addForm.test_score !== '' ? Number(addForm.test_score) : null,
        }
        axios.post(`${BASE_T}/create-result`, payload, { headers: getHeaders() })
            .then((res) => {
                if (res.data.status === false) { setAddError(res.data.message ?? 'Error'); return }
                setAddModal(false); fetchData()
            })
            .catch((err) => setAddError(err.response?.data?.message ?? 'Server error'))
            .finally(() => setAddSaving(false))
    }

    const addField = (key, val) => setAddForm(f => ({ ...f, [key]: val }))

    /* ── Stats ── */
    const scores = results.map(r => r.score).filter(s => typeof s === 'number')
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const highest = scores.length ? Math.max(...scores) : 0
    const lowest = scores.length ? Math.min(...scores) : 0
    const passRate = scores.length
        ? ((scores.filter(s => s >= 50).length / scores.length) * 100).toFixed(1)
        : '0.0'
    const completionRate = results.length
        ? Math.round((results.filter(r => r.is_active).length / results.length) * 100)
        : 0
    const topPerformers = scores.filter(s => s >= 80).length

    /* ── Grade distribution ── */
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    results.forEach(r => {
        const g = r.grade_level || gradeFromScore(r.score)
        if (g in gradeCounts) gradeCounts[g]++
    })
    const gradeSegments = Object.entries(gradeCounts).map(([g, count]) => ({
        label: `${g} Grade`, color: gradeColor(g), count,
    }))
    const totalResults = results.length

    /* ── Performance trend (group by score buckets as trend points) ── */
    const buckets = ['0-59', '60-69', '70-79', '80-89', '90-100']
    const trendPoints = buckets.map(b => {
        const [lo, hi] = b.split('-').map(Number)
        return { label: b, y: scores.filter(s => s >= lo && s <= hi).length }
    })

    /* ── Score distribution for bar chart ── */
    const classBars = classes.length
        ? classes.slice(0, 6).map(c => ({
            label: c.name?.length > 12 ? c.name.slice(0, 12) + '…' : (c.name ?? '—'),
            value: avg,
        }))
        : [
            { label: 'Section A', value: avg || 0 },
            { label: 'Section B', value: avg ? avg - 5 : 0 },
            { label: 'Section C', value: avg ? avg - 10 : 0 },
            { label: 'Section D', value: avg ? avg + 3 : 0 },
        ]

    const summaryCards = [
        { label: 'Class Average', value: `${avg}%`, change: '+6%', up: true },
        { label: 'Highest Score', value: `${highest}%`, change: 'Top score', up: true },
        { label: 'Lowest Score', value: `${lowest}%`, change: 'Needs attention', up: false },
        { label: 'Pass Rate', value: `${passRate}%`, change: `${scores.filter(s=>s>=50).length} students`, up: true },
    ]

    const classTabs = [{ _id: 'all', name: 'All Classes' }, ...classes]

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>Grade Management</h1>
                <p className={style.subtitle}>Manage and track student grades across all classes</p>
            </div>

            {/* Class tabs */}
            <div className={style.tabs}>
                {classTabs.map(c => (
                    <button
                        key={c._id}
                        className={`${style.tab} ${activeClass === c._id ? style.tabActive : ''}`}
                        onClick={() => setActiveClass(c._id)}
                    >
                        {c.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={style.loadingWrap}><div className={style.spinner} /></div>
            ) : (
                <>
                    {/* Student Grades Table */}
                    <div className={style.tableCard}>
                        <div className={style.tableHeader}>
                            <div>
                                <p className={style.tableTitle}>
                                    {activeClass === 'all'
                                        ? 'All Classes'
                                        : (classes.find(c => c._id === activeClass)?.name ?? '')} – Student Grades
                                </p>
                                <p className={style.tableSubtitle}>{results.length} students</p>
                            </div>
                            <button className={style.addBtn} onClick={openAdd}>+ Add Grade</button>
                        </div>

                        {results.length === 0 ? (
                            <p className={style.empty}>No results found.</p>
                        ) : (
                            <table className={style.table}>
                                <thead>
                                    <tr>
                                        <th>Roll No.</th>
                                        <th>Student</th>
                                        <th>Exam Score</th>
                                        <th>Test Score</th>
                                        <th>Total</th>
                                        <th>Grade</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((r, i) => {
                                        const grade = r.grade_level || gradeFromScore(r.score)
                                        const studentName = r.student?.firstname
                                            ? `${r.student.firstname} ${r.student.lastname ?? ''}`
                                            : `Student ${i + 1}`
                                        const initials = r.student?.firstname
                                            ? `${r.student.firstname[0]}${r.student.lastname?.[0] ?? ''}`.toUpperCase()
                                            : '?'
                                        return (
                                            <tr key={r._id}>
                                                <td>{String(i + 1).padStart(3, '0')}</td>
                                                <td>
                                                    <div className={style.studentCell}>
                                                        {r.student?.image
                                                            ? <img src={r.student.image} alt={studentName} className={style.studentThumb} />
                                                            : <div className={style.studentInitials}>{initials}</div>
                                                        }
                                                        {studentName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={style.scoreBadge}>{r.score ?? '—'}</span>
                                                </td>
                                                <td>
                                                    <span className={style.scoreBadge} style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                                                        {r.test_score != null ? r.test_score : '—'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={style.scoreBadge} style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                                                        {r.score != null && r.test_score != null ? r.score + r.test_score : r.score ?? '—'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={style.gradeBadge}
                                                        style={{
                                                            background: gradeColor(grade) + '22',
                                                            color: gradeColor(grade),
                                                        }}
                                                    >
                                                        {grade}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={r.is_active ? style.statusActive : style.statusInactive}>
                                                        {r.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={style.viewBtn}
                                                        onClick={() => {
                                                            const sid = r.student?._id
                                                            const studentResults = results.filter(x => x.student?._id === sid)
                                                            setSheet({ student: r.student, results: studentResults })
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Grade Analysis */}
                    <div className={style.analysisGrid}>
                        <div className={style.analysisCard}>
                            <p className={style.analysisLabel}>Average Score</p>
                            <p className={style.analysisValue}>{avg}%</p>
                            <p className={style.analysisSub}>Across all students</p>
                        </div>
                        <div className={style.analysisCard}>
                            <p className={style.analysisLabel}>Completion Rate</p>
                            <p className={style.analysisValue}>{completionRate}%</p>
                            <p className={style.analysisSub}>Active results</p>
                        </div>
                        <div className={style.analysisCard}>
                            <p className={style.analysisLabel}>Top Performers</p>
                            <p className={style.analysisValue}>{topPerformers}</p>
                            <p className={style.analysisSub}>Scored 80% or above</p>
                        </div>
                    </div>
                </>
            )}

            {/* ── Add Grade modal ── */}
            {addModal && (
                <div className={style.overlay} onClick={e => e.target === e.currentTarget && setAddModal(false)}>
                    <div className={style.addGradeModal}>
                        <div className={style.sheetModalHead}>
                            <div>
                                <h2 className={style.sheetTitle}>Add Grade</h2>
                                <p className={style.sheetSub}>Enter exam and test scores for a student</p>
                            </div>
                            <button className={style.sheetCloseBtn} onClick={() => setAddModal(false)}>×</button>
                        </div>
                        {addError && <div className={style.addErrorMsg}>{addError}</div>}
                        <div className={style.addFormRow}>
                            <div className={style.addFormGroup}>
                                <label>Student</label>
                                <select value={addForm.student} onChange={e => addField('student', e.target.value)}>
                                    <option value="">Select student</option>
                                    {allStudents.map(s => (
                                        <option key={s._id} value={s._id}>{s.firstname} {s.lastname}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={style.addFormGroup}>
                                <label>Exam</label>
                                <select value={addForm.exam} onChange={e => addField('exam', e.target.value)}>
                                    <option value="">Select exam</option>
                                    {allExams.map(ex => (
                                        <option key={ex._id} value={ex._id}>
                                            {ex.subject_id?.subject_name ?? 'Exam'}{ex.start_date ? ' · ' + new Date(ex.start_date).toLocaleDateString() : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className={style.addFormRow}>
                            <div className={style.addFormGroup}>
                                <label>Exam Score (max 70)</label>
                                <input type="number" min="0" max="70" placeholder="0–70" value={addForm.score} onChange={e => addField('score', e.target.value)} />
                            </div>
                            <div className={style.addFormGroup}>
                                <label>Test Score (max 30)</label>
                                <input type="number" min="0" max="30" placeholder="0–30" value={addForm.test_score} onChange={e => addField('test_score', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.addFormRow}>
                            <div className={style.addFormGroup}>
                                <label>Grade Level</label>
                                <input type="text" placeholder="e.g. A, B+, Pass" value={addForm.grade_level} onChange={e => addField('grade_level', e.target.value)} />
                            </div>
                        </div>
                        <div className={style.addModalFooter}>
                            <button className={style.closeSheetBtn} onClick={() => setAddModal(false)}>Cancel</button>
                            <button className={style.printBtn} onClick={handleAddSave} disabled={addSaving}>
                                {addSaving ? 'Saving…' : 'Add Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Result sheet modal ── */}
            {sheet && (() => {
                const { student, results: sr } = sheet
                const fullName = `${student?.firstname ?? ''} ${student?.lastname ?? ''}`.trim()
                const totalScore = sr.reduce((a, r) => a + (r.score ?? 0), 0)
                const maxScore   = sr.length * 100
                const aggPct     = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : '0.0'
                const overallGrade = gradeFromScore(maxScore > 0 ? (totalScore / maxScore) * 100 : 0)
                return (
                    <div
                        className={style.overlay}
                        onClick={(e) => e.target === e.currentTarget && setSheet(null)}
                    >
                        <div className={style.sheetModal}>
                            <div className={style.sheetModalHead}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    {student?.image
                                        ? <img src={student.image} alt={fullName} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 6, border: '1px solid #1a2540', flexShrink: 0 }} />
                                        : <div style={{ width: 54, height: 54, borderRadius: 6, background: 'rgba(20,81,240,0.2)', color: 'rgb(100,150,255)', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {`${student?.firstname?.[0] ?? ''}${student?.lastname?.[0] ?? ''}`.toUpperCase()}
                                          </div>
                                    }
                                    <div>
                                        <h2 className={style.sheetTitle}>Result Sheet</h2>
                                        <p className={style.sheetSub}>{fullName} — {sr.length} subject{sr.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <button className={style.sheetCloseBtn} onClick={() => setSheet(null)}>×</button>
                            </div>

                            <div className={style.sheetInfoGrid}>
                                <div className={style.sheetInfoItem}>
                                    <p className={style.sheetInfoLabel}>Student Name</p>
                                    <p className={style.sheetInfoValue}>{fullName || '—'}</p>
                                </div>
                                <div className={style.sheetInfoItem}>
                                    <p className={style.sheetInfoLabel}>Email</p>
                                    <p className={style.sheetInfoValue}>{student?.email ?? '—'}</p>
                                </div>
                                <div className={style.sheetInfoItem}>
                                    <p className={style.sheetInfoLabel}>Roll No.</p>
                                    <p className={style.sheetInfoValue}>{String(sr[0]?._id ?? '').slice(-5).toUpperCase()}</p>
                                </div>
                                <div className={style.sheetInfoItem}>
                                    <p className={style.sheetInfoLabel}>Overall Grade</p>
                                    <p className={style.sheetInfoValue} style={{ color: gradeColor(overallGrade) }}>{overallGrade}</p>
                                </div>
                            </div>

                            <table className={style.sheetTable}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Subject</th>
                                        <th>Score</th>
                                        <th>Total</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sr.map((r, i) => {
                                        const g = r.grade_level || gradeFromScore(r.score)
                                        return (
                                            <tr key={r._id}>
                                                <td>{i + 1}</td>
                                                <td>{r.exam?.name ?? r.exam?.subject ?? `Subject ${i + 1}`}</td>
                                                <td>
                                                    <span className={style.scoreBadge}>{r.score ?? '—'}</span>
                                                </td>
                                                <td>100</td>
                                                <td>
                                                    <span
                                                        className={style.gradeBadge}
                                                        style={{ background: gradeColor(g) + '22', color: gradeColor(g) }}
                                                    >{g}</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            <div className={style.sheetTotalsBox}>
                                <div className={style.sheetTotalItem}>
                                    <p className={style.sheetTotalLabel}>Grand Total</p>
                                    <p className={style.sheetTotalValue}>{totalScore}/{maxScore}</p>
                                </div>
                                <div className={style.sheetTotalItem}>
                                    <p className={style.sheetTotalLabel}>Aggregate %</p>
                                    <p className={style.sheetTotalValue}>{aggPct}%</p>
                                </div>
                                <div className={style.sheetTotalItem}>
                                    <p className={style.sheetTotalLabel}>Overall Grade</p>
                                    <p className={style.sheetTotalValue} style={{ color: gradeColor(overallGrade) }}>{overallGrade}</p>
                                </div>
                            </div>

                            <div className={style.sheetFooter}>
                                <button className={style.closeSheetBtn} onClick={() => setSheet(null)}>Close</button>
                                <button className={style.printBtn} onClick={() => printSheet(student, sr)}>
                                    Print Result Sheet
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    )
}

export default Results
