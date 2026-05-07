import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import style from './Myclasses.module.css'

const Myclasses = () => {
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        getAllClasses()
    }, [])

    const getAllClasses = () => {
        setLoading(true)
        const url = 'https://schoolpj-backend.onrender.com/teacher/all-classes'
        const token = localStorage.token
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
        .then((response) => {
            if (!response.data.status) {
                navigate('/dashboard')
            } else {
                setClasses(response.data.classes ?? [])
            }
        })
        .catch((error) => {
            console.log(error)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    const classesPerWeek = classes.reduce((sum, c) => sum + (c.schedule?.days?.length ?? 0), 0)

    const summaryCards = [
        { label: 'Total Classes', value: classes.length },
        { label: 'Academic Year', value: classes[0]?.academic_year ?? '—' },
        { label: 'Active Classes', value: classes.filter(c => c.is_active).length },
        { label: 'Sessions Per Week', value: classesPerWeek },
    ]

    const formatSchedule = (schedule) => {
        if (!schedule) return '—'
        const days = schedule.days?.join(', ') ?? ''
        const time = schedule.time
            ? new Date(schedule.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''
        return [days, time].filter(Boolean).join(' · ')
    }

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h1 className={style.title}>My Classes</h1>
                <p className={style.subtitle}>Manage all your assigned classes and sections</p>
            </div>

            <div className={style.summarySection}>
                <p className={style.sectionLabel}>Class Summary</p>
                <div className={style.summaryGrid}>
                    {summaryCards.map((card) => (
                        <div key={card.label} className={style.summaryCard}>
                            <p className={style.summaryValue}>{card.value}</p>
                            <p className={style.summaryLabel}>{card.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className={style.loadingWrap}>
                    <div className={style.spinner} />
                </div>
            ) : classes.length === 0 ? (
                <p className={style.empty}>No classes found.</p>
            ) : (
                <div className={style.classesGrid}>
                    {classes.map((cls) => (
                        <div key={cls._id} className={style.classCard}>
                            <div className={style.cardActions}>
                                <button
                                    className={style.btnPrimary}
                                    onClick={() => navigate(`/dashboard/myclasses/${cls._id}`)}
                                >
                                    View Details
                                </button>
                                <button
                                    className={style.btnSecondary}
                                    onClick={() => navigate(`/dashboard/myclasses/${cls._id}/edit`)}
                                >
                                    Edit
                                </button>
                            </div>

                            <div className={style.cardBody}>
                                <div className={style.cardMeta}>
                                    <span className={style.metaKey}>Academic Year</span>
                                    <span className={style.metaValue}>{cls.academic_year}</span>
                                </div>
                                <div className={style.cardMeta}>
                                    <span className={style.metaKey}>Schedule</span>
                                    <span className={style.metaValue}>{formatSchedule(cls.schedule)}</span>
                                </div>
                                <div className={style.cardMeta}>
                                    <span className={style.metaKey}>Status</span>
                                    <span className={style.metaValue}>{cls.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>

                            <div>
                                <p className={style.studentsCount}>{cls.schedule?.days?.length ?? 0}</p>
                                <p className={style.studentsLabel}>Sessions/Week</p>
                            </div>

                            <p className={style.className}>{cls.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Myclasses
