import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
        axios.get('https://schoolproject-backend-ruiy.onrender.com/students/dashboardstudent', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            if (!res.data.status) { navigate('/student/login'); return }
            const studentId = res.data.students._id
            return axios.get('https://schoolproject-backend-ruiy.onrender.com/admin/all-results', {
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
            <div className={s.header}>
                <h1 className={s.title}>My Results</h1>
                <p className={s.subtitle}>Your exam scores and grades</p>
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
                                    <td>{r.exam?.subject_id?.subject_name ?? 'â€”'}</td>
                                    <td>{r.exam?.start_date ? new Date(r.exam.start_date).toLocaleDateString() : 'â€”'}</td>
                                    <td>{r.score ?? 'â€”'}</td>
                                    <td>{r.exam?.max_score ?? 'â€”'}</td>
                                    <td>
                                        <span className={`${s.badge} ${gradeColor(r.grade_level)}`}>
                                            {r.grade_level ?? 'â€”'}
                                        </span>
                                    </td>
                                    <td>{r.teacher ? `${r.teacher.firstname} ${r.teacher.lastname}` : 'â€”'}</td>
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
