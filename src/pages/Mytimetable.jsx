import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import style from './Mytimetable.module.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const Mytimetable = () => {
    const [timetables, setTimetables] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchTimetables()
    }, [])

    const fetchTimetables = () => {
        setLoading(true)
        const token = localStorage.token
        axios.get('https://schoolpj-backend.onrender.com/teacher/all-timetables', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
        .then((res) => {
            if (res.data.status) {
                setTimetables(res.data.timetables ?? [])
            }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }

    // Group entries by day and sort each day by start_time
    const byDay = {}
    DAYS.forEach(d => { byDay[d] = [] })
    timetables.forEach(t => {
        if (byDay[t.day_of_week]) {
            byDay[t.day_of_week].push(t)
        }
    })
    DAYS.forEach(d => {
        byDay[d].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })

    const activeDays = DAYS.filter(d => byDay[d].length > 0)

    const getClassName = (entry) => {
        if (entry.class?.name) return entry.class.name
        return 'Class Session'
    }

    const getSubject = (entry) => {
        if (entry.subject?.name) return entry.subject.name
        return ''
    }

    const getRoom = (entry) => {
        if (entry.class?.room) return `Room: ${entry.class.room}`
        return 'Room: —'
    }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>My Timetable</h1>
                <p className={style.subtitle}>Weekly schedule and class timings</p>
            </div>

            {loading ? (
                <div className={style.loadingWrap}>
                    <div className={style.spinner} />
                </div>
            ) : activeDays.length === 0 ? (
                <p className={style.empty}>No timetable entries found.</p>
            ) : (
                activeDays.map(day => (
                    <div key={day} className={style.daySection}>
                        <div className={style.dayHeader}>
                            <p className={style.dayName}>{day}</p>
                        </div>

                        {byDay[day].map((entry) => (
                            <div
                                key={entry._id}
                                className={`${style.entry} ${style.entryClass}`}
                            >
                                <div className={style.entryLeft}>
                                    <div className={style.entryMeta}>
                                        <span className={style.timeBadge}>
                                            {entry.start_time} - {entry.end_time}
                                        </span>
                                        {entry.class?.studentsCount != null && (
                                            <span className={style.studentsBadge}>
                                                {entry.class.studentsCount} students
                                            </span>
                                        )}
                                    </div>
                                    <p className={style.entryName}>
                                        {getClassName(entry)}
                                        {getSubject(entry) ? ` – ${getSubject(entry)}` : ''}
                                    </p>
                                    <p className={style.entryRoom}>{getRoom(entry)}</p>
                                </div>

                                <button
                                    className={style.viewLink}
                                    onClick={() => navigate(`/dashboard/myclasses/${entry.class?._id ?? ''}`)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    )
}

export default Mytimetable
