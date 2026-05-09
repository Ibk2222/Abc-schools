import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer } from 'lucide-react'
import s from './StudentPages.module.css'

const gradeColor = (grade) => {
    if (!grade) return s.badgeBlue
    const g = grade.toUpperCase()
    if (g === 'A') return s.badgeGreen
    if (g === 'B') return s.badgeBlue
    if (g === 'C') return s.badgeOrange
    return s.badgeRed
}

const StudentResults = () => {
    const [results, setResults] = useState([])
    const [student, setStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('https://schoolpj-backend.onrender.com/students/dashboardstudent', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.data.status) { navigate('/student/login'); return }
            const studentData = res.data.students
            setStudent(studentData)
            return axios.get('https://schoolpj-backend.onrender.com/admin/all-results', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => {
                if (r.data.status) {
                    setResults(
                        r.data.results.filter((result) => String(result.student?._id) === String(studentData._id))
                    )
                }
            })
        })
        .catch(() => navigate('/student/login'))
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    const fullName = student ? `${student.firstname ?? ''} ${student.lastname ?? ''}`.trim() : ''
    const initials = student
        ? `${(student.firstname ?? '')[0] ?? ''}${(student.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'

    return (
        <div className={s.container}>
            {/* ── Screen-only school banner ── */}
            <div className={s.schoolBanner}>
                <img
                    src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                    alt="School Logo"
                    className={s.schoolBannerLogo}
                />
                <div>
                    <p className={s.schoolBannerName}>ABC Nursery and Primary School</p>
                    <p className={s.schoolBannerAddress}>No 28 Alegongo Akobo, Ibadan</p>
                </div>
            </div>

            {/* ── Print-only header ── */}
            <div className={s.printHeader}>
                <div className={s.printSchoolRow}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="School Logo"
                        className={s.printLogo}
                    />
                    <div>
                        <h2 className={s.printSchoolName}>ABC Nursery and Primary School</h2>
                        <p className={s.printAddress}>No 28 Alegongo Akobo, Ibadan</p>
                        <p className={s.printDate}>Printed on {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className={s.printStudentRow}>
                    {student?.image
                        ? <img src={student.image} alt={fullName} className={s.printStudentImg} />
                        : <div className={s.printStudentInitials}>{initials}</div>
                    }
                    <div>
                        <p className={s.printStudentName}>{fullName}</p>
                        <p className={s.printStudentEmail}>{student?.email ?? ''}</p>
                    </div>
                </div>
            </div>

            {/* ── Screen header ── */}
            <div className={s.header} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {student?.image
                        ? <img src={student.image} alt={fullName} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '2px solid #1a2540', flexShrink: 0 }} />
                        : <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgba(20,81,240,0.2)', color: 'rgb(100,150,255)', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>
                    }
                    <div>
                        <h1 className={s.title}>My Results</h1>
                        <p className={s.subtitle}>Your exam and test scores</p>
                    </div>
                </div>
                <button className={s.printBtn} onClick={() => window.print()}>
                    <Printer size={16} /> Print
                </button>
            </div>

            <div className={s.tableCard}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Subject</th>
                            <th>Exam Date</th>
                            <th>Exam Score</th>
                            <th>Test Score</th>
                            <th>Total</th>
                            <th>Grade</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0
                            ? <tr><td colSpan={8} className={s.empty}>No results found</td></tr>
                            : results.map((r, i) => {
                                const examScore = r.score ?? null
                                const testScore = r.test_score ?? null
                                const total = examScore != null && testScore != null
                                    ? examScore + testScore
                                    : examScore ?? '—'
                                return (
                                    <tr key={r._id}>
                                        <td>{i + 1}</td>
                                        <td>{r.exam?.subject_id?.subject_name ?? '—'}</td>
                                        <td>{r.exam?.start_date ? new Date(r.exam.start_date).toLocaleDateString() : '—'}</td>
                                        <td>{examScore ?? '—'}</td>
                                        <td>{testScore ?? '—'}</td>
                                        <td><strong>{total}</strong></td>
                                        <td>
                                            <span className={`${s.badge} ${gradeColor(r.grade_level)}`}>
                                                {r.grade_level ?? '—'}
                                            </span>
                                        </td>
                                        <td>{r.teacher ? `${r.teacher.firstname} ${r.teacher.lastname}` : '—'}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentResults
