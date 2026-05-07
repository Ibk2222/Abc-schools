import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './StudentPages.module.css'

const StudentExams = () => {
    const [exams, setExams] = useState([])
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
            return axios.get('https://schoolproject-backend-ruiy.onrender.com/admin/all-exams', {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => {
                if (r.data.status) {
                    setExams(
                        r.data.exams.filter((e) => String(e.student_id?._id) === String(studentId))
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
                <h1 className={s.title}>My Exams</h1>
                <p className={s.subtitle}>Your exam schedule and scores</p>
            </div>
            <div className={s.tableCard}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Score</th>
                            <th>Max</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.length === 0
                            ? <tr><td colSpan={8} className={s.empty}>No exams found</td></tr>
                            : exams.map((e, i) => (
                                <tr key={e._id}>
                                    <td>{i + 1}</td>
                                    <td>{e.subject_id?.subject_name ?? 'â€”'}</td>
                                    <td>{e.class_id?.name ?? 'â€”'}</td>
                                    <td>{e.start_date ? new Date(e.start_date).toLocaleDateString() : 'â€”'}</td>
                                    <td>{e.end_date ? new Date(e.end_date).toLocaleDateString() : 'â€”'}</td>
                                    <td>{e.score ?? 'â€”'}</td>
                                    <td>{e.max_score ?? 'â€”'}</td>
                                    <td>{e.teacher_id ? `${e.teacher_id.firstname} ${e.teacher_id.lastname}` : 'â€”'}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentExams
