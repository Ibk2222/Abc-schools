import axios from 'axios'
import React, { useEffect, useState } from 'react'
import s from './StudentPages.module.css'

const StudentSubjects = () => {
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('https://schoolproject-backend-ruiy.onrender.com/admin/subjects-list', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => { if (res.data.status) setSubjects(res.data.subjects ?? []) })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Subjects</h1>
                <p className={s.subtitle}>All subjects offered at ABC School</p>
            </div>
            {subjects.length === 0
                ? <p className={s.empty}>No subjects found.</p>
                : <div className={s.grid}>
                    {subjects.map((sub) => (
                        <div key={sub._id} className={s.subjectCard}>
                            <p className={s.subjectName}>{sub.subject_name}</p>
                            {sub.teachers_id && (
                                <p className={s.subjectMeta}>
                                    Teacher: {sub.teachers_id.firstname} {sub.teachers_id.lastname}
                                </p>
                            )}
                            {sub.classes_id && (
                                <p className={s.subjectMeta}>Class: {sub.classes_id.name}</p>
                            )}
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}

export default StudentSubjects
