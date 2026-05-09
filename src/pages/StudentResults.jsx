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
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('https://schoolpj-backend.onrender.com/students/dashboardstudent', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.data.status) { navigate('/student/login'); return }
            const studentId = res.data.students._id
            return axios.get('https://schoolpj-backend.onrender.com/admin/all-results', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => {
                if (r.data.status) {
                    setResults(
                        r.data.results.filter((result) => String(result.student?._id) === String(studentId))
                    )
                }
            })
        })
        .catch(() => navigate('/student/login'))
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    return (
        <div className={s.container}>
            <div className={s.printHeader}>
                <h2>ABC School — Student Results</h2>
                <p>Printed on {new Date().toLocaleDateString()}</p>
            </div>

            <div className={s.header} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 className={s.title}>My Results</h1>
                    <p className={s.subtitle}>Your exam scores and grades</p>
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
                            <th>Score</th>
                            <th>Max Score</th>
                            <th>Grade</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0
                            ? <tr><td colSpan={7} className={s.empty}>No results found</td></tr>
                            : results.map((r, i) => (
                                <tr key={r._id}>
                                    <td>{i + 1}</td>
                                    <td>{r.exam?.subject_id?.subject_name ?? '—'}</td>
                                    <td>{r.exam?.start_date ? new Date(r.exam.start_date).toLocaleDateString() : '—'}</td>
                                    <td>{r.score ?? '—'}</td>
                                    <td>{r.exam?.max_score ?? '—'}</td>
                                    <td>
                                        <span className={`${s.badge} ${gradeColor(r.grade_level)}`}>
                                            {r.grade_level ?? '—'}
                                        </span>
                                    </td>
                                    <td>{r.teacher ? `${r.teacher.firstname} ${r.teacher.lastname}` : '—'}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentResults
