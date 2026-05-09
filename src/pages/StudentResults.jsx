import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer } from 'lucide-react'
import s from './StudentPages.module.css'

const SESSION = `${new Date().getFullYear() - 1}–${new Date().getFullYear()}`

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

    const fullName = student
        ? `${student.firstname ?? ''} ${student.lastname ?? ''}`.trim().toUpperCase()
        : ''
    const initials = student
        ? `${(student.firstname ?? '')[0] ?? ''}${(student.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'
    const dob = student?.dob ? new Date(student.dob).toLocaleDateString() : '—'
    const className = student?.class_id?.name ?? '—'

    const totalMarks = results.reduce((a, r) => a + ((r.score ?? 0) + (r.test_score ?? 0)), 0)
    const maxMarks = results.length * 100
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : '0.0'

    const overallGrade = (() => {
        const pct = parseFloat(percentage)
        if (pct >= 91) return 'A+'
        if (pct >= 81) return 'A'
        if (pct >= 71) return 'B+'
        if (pct >= 61) return 'B'
        if (pct >= 51) return 'C+'
        if (pct >= 41) return 'C'
        if (pct >= 32) return 'D'
        return 'F'
    })()

    return (
        <div className={s.rcPage}>
            {/* Print button — hidden on print */}
            <div className={s.rcPrintBar}>
                <button className={s.printBtn} onClick={() => window.print()}>
                    <Printer size={16} /> Print Report Card
                </button>
            </div>

            {/* ── Report Card Document ── */}
            <div className={s.rcDocument}>

                {/* School Header */}
                <div className={s.rcHeader}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="School Logo"
                        className={s.rcLogo}
                    />
                    <div className={s.rcSchoolMid}>
                        <h1 className={s.rcSchoolName}>ABC Nursery and Primary School</h1>
                        <p className={s.rcSchoolAddr}>No 28 Alegongo Akobo, Ibadan</p>
                        <p className={s.rcAcReport}>Academic Report</p>
                        <p className={s.rcSessionLine}>Academic Session : {SESSION}</p>
                        <p className={s.rcClassLine}>Class : {className}</p>
                    </div>
                    <div className={s.rcPassportWrap}>
                        {student?.image
                            ? <img src={student.image} alt={fullName} className={s.rcPassportImg} />
                            : <div className={s.rcPassportInitials}>{initials}</div>
                        }
                    </div>
                </div>

                {/* Student Info */}
                <div className={s.rcInfoBox}>
                    <div className={s.rcInfoCol}>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Name of Student</span>
                            <span>: {fullName}</span>
                        </div>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Address</span>
                            <span>: {student?.address ?? '—'}</span>
                        </div>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Parent Phone</span>
                            <span>: {student?.parent_phone ?? '—'}</span>
                        </div>
                    </div>
                    <div className={s.rcInfoCol}>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Date of Birth</span>
                            <span>: {dob}</span>
                        </div>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Gender</span>
                            <span>: {student?.gender ?? '—'}</span>
                        </div>
                        <div className={s.rcInfoRow}>
                            <span className={s.rcInfoKey}>Email</span>
                            <span>: {student?.email ?? '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Scholastic Areas Table */}
                <table className={s.rcTable}>
                    <thead>
                        <tr>
                            <th rowSpan={2} className={s.rcThArea}>Subjects</th>
                            <th colSpan={2} className={s.rcThGroup}>Term I</th>
                            <th colSpan={2} className={s.rcThGroup}>Overall</th>
                        </tr>
                        <tr>
                            <th className={s.rcThSub}>Test<br /><em>30</em></th>
                            <th className={s.rcThSub}>Exam<br /><em>70</em></th>
                            <th className={s.rcThSub}>Grand Total<br /><em>100</em></th>
                            <th className={s.rcThSub}>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0
                            ? <tr><td colSpan={5} className={s.rcEmpty}>No results found</td></tr>
                            : results.map((r, i) => {
                                const examScore = r.score ?? '—'
                                const testScore = r.test_score ?? '—'
                                const total = r.score != null && r.test_score != null
                                    ? r.score + r.test_score
                                    : r.score ?? '—'
                                return (
                                    <tr key={r._id} className={i % 2 === 1 ? s.rcRowAlt : ''}>
                                        <td className={s.rcTdSubject}>
                                            {r.exam?.subject_id?.subject_name?.toUpperCase() ?? '—'}
                                        </td>
                                        <td className={s.rcTdNum}>{testScore}</td>
                                        <td className={s.rcTdNum}>{examScore}</td>
                                        <td className={s.rcTdNum}><strong>{total}</strong></td>
                                        <td className={s.rcTdGrade}>{r.grade_level ?? '—'}</td>
                                    </tr>
                                )
                            })
                        }
                        {/* Totals row */}
                        <tr className={s.rcTotalsRow}>
                            <td className={s.rcTdAttend}>
                                <strong>Attendance</strong>&nbsp;&nbsp;0 / 160
                            </td>
                            <td colSpan={2} className={s.rcTdTotalCell}>
                                <strong>Total Marks</strong>&nbsp;&nbsp;{totalMarks} / {maxMarks}
                            </td>
                            <td className={s.rcTdPctCell}>
                                <strong>Percentage</strong>&nbsp;&nbsp;{percentage}%
                            </td>
                            <td className={s.rcTdGrade}>
                                <strong>Grade</strong>&nbsp;&nbsp;{overallGrade}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className={s.rcSignRow}>
                    <div className={s.rcSignBox}>
                        <div className={s.rcSignLine} />
                        <p>Sign. of Class Teacher</p>
                    </div>
                    <div className={s.rcSignBox}>
                        <div className={s.rcSignLine} />
                        <p>Sign. Of Principal</p>
                    </div>
                    <div className={s.rcSignBox}>
                        <div className={s.rcSignLine} />
                        <p>Sign. of Manager</p>
                    </div>
                </div>

                {/* Grading Scale */}
                <div className={s.rcGradeNote}>
                    <p>Grading scale for scholastic areas: Grades are awarded on an 8-point grading scale as follows:</p>
                    <table className={s.rcGradeTable}>
                        <thead>
                            <tr>
                                <th>Marks Range (%)</th>
                                <th>91–100</th>
                                <th>81–90</th>
                                <th>71–80</th>
                                <th>61–70</th>
                                <th>51–60</th>
                                <th>41–50</th>
                                <th>32–40</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Grade</td>
                                <td>A+</td>
                                <td>A</td>
                                <td>B+</td>
                                <td>B</td>
                                <td>C+</td>
                                <td>C</td>
                                <td>D</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}

export default StudentResults
