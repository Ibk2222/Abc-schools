import axios from 'axios'
import React, { useEffect, useState } from 'react'
import s from './StudentPages.module.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const StudentTimetable = () => {
    const [timetables, setTimetables] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get('https://schoolpj-backend.onrender.com/admin/all-timetables', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => { if (res.data.status) setTimetables(res.data.timetables ?? []) })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }, [])

    const byDay = {}
    DAYS.forEach((d) => { byDay[d] = [] })
    timetables.forEach((t) => { if (byDay[t.day_of_week]) byDay[t.day_of_week].push(t) })
    DAYS.forEach((d) => { byDay[d].sort((a, b) => a.start_time.localeCompare(b.start_time)) })
    const activeDays = DAYS.filter((d) => byDay[d].length > 0)

    if (loading) return <div className={s.loadingWrap}><div className={s.spinner} /></div>

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Timetable</h1>
                <p className={s.subtitle}>Weekly class schedule</p>
            </div>

            {activeDays.length === 0
                ? <p className={s.empty}>No timetable entries found.</p>
                : activeDays.map((day) => (
                    <div key={day} className={s.daySection}>
                        <div className={s.dayHeader}>
                            <p className={s.dayName}>{day}</p>
                        </div>
                        {byDay[day].map((entry) => (
                            <div key={entry._id} className={s.entry}>
                                <span className={s.timeBadge}>{entry.start_time} – {entry.end_time}</span>
                                <p className={s.entryName}>
                                    {entry.class?.name ?? 'Class'}
                                    {entry.subject?.subject_name ? ` – ${entry.subject.subject_name}` : ''}
                                </p>
                                <p className={s.entryTeacher}>
                                    {entry.teacher ? `${entry.teacher.firstname} ${entry.teacher.lastname}` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                ))
            }
        </div>
    )
}

export default StudentTimetable
