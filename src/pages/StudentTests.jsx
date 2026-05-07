import axios from 'axios'
import React, { useEffect, useState } from 'react'
import s from './StudentPages.module.css'

const StudentTests = () => {
    const [tests, setTests] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('https://schoolproject-backend-ruiy.onrender.com/students/all-tests', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => { if (res.data.status) setTests(res.data.tests ?? []) })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Tests</h1>
                <p className={s.subtitle}>Upcoming and past tests</p>
            </div>
            <div className={s.tableCard}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Test Name</th>
                            <th>Subject</th>
                            <th>Score</th>
                            <th>Teacher</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tests.length === 0
                            ? <tr><td colSpan={5} className={s.empty}>No tests found</td></tr>
                            : tests.map((t, i) => (
                                <tr key={t._id}>
                                    <td>{i + 1}</td>
                                    <td>{t.test_name ?? 'â€”'}</td>
                                    <td>{t.subject_id?.subject_name ?? 'â€”'}</td>
                                    <td>{t.test_score ?? 'â€”'}</td>
                                    <td>{t.teacher_id ? `${t.teacher_id.firstname} ${t.teacher_id.lastname}` : 'â€”'}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentTests
