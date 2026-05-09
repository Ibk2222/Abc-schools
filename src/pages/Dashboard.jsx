import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useOutlet } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, Calendar, ClipboardList, CheckSquare, LogOut } from 'lucide-react'
import style from './Dashboard.module.css'

const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/myclasses', label: 'My Classes', icon: BookOpen },
    { to: '/dashboard/mystudents', label: 'My Students', icon: Users },
    { to: '/dashboard/mytimetable', label: 'My Timetable', icon: Calendar },
    { to: '/dashboard/results', label: 'Assignments', icon: ClipboardList },
    { to: '/dashboard/attendance', label: 'Attendance', icon: CheckSquare },
]

const Dashboard = () => {
    const [teacher, setTeacher] = useState(null)
    const [stats, setStats] = useState(null)
    const [loadError, setLoadError] = useState('')
    const navigate = useNavigate()
    const outlet = useOutlet()

    useEffect(() => {
        getTeacherDashboard()
    }, [])

    const getTeacherDashboard = () => {
        setLoadError('')
        const token = localStorage.token
        if (!token) { navigate('/login'); return }
        const url = 'https://schoolpj-backend.onrender.com/teacher/dashboard'
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })
        .then((response) => {
            if (!response.data.status) {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                navigate('/login')
            } else {
                setTeacher(response.data.teacher)
                setStats(response.data.stats)
            }
        })
        .catch(() => setLoadError('Could not connect to server. Please try again.'))
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    const teacherFullName = teacher
        ? `${teacher.firstname ?? ''} ${teacher.lastname ?? ''}`.trim()
        : '...'

    const teacherInitials = teacher
        ? `${(teacher.firstname ?? '')[0] ?? ''}${(teacher.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'

    const statCards = [
        {
            title: 'Total Classes',
            value: stats?.totalClasses ?? '—',
            description: 'Classes assigned',
            change: stats?.classesChange ?? '+2%',
        },
        {
            title: 'Total Students',
            value: stats?.totalStudents ?? '—',
            description: 'Active enrollments',
            change: stats?.studentsChange ?? '+8%',
        },
       
        {
            title: 'Avg. Class Rating',
            value: stats?.avgRating ?? '—',
            description: 'Student feedback',
            change: stats?.ratingChange ?? '+12%',
        },
    ]

    return (
        <div className={style.layout}>
            <aside className={style.sidebar}>
                <div className={style.sidebarHeader}>
                    <h1 className={style.schoolName}>ABC School</h1>
                    <p className={style.schoolSub}>Management System</p>
                </div>

                <nav className={style.nav}>
                    {navLinks.map(({ to, label, icon: Icon, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `${style.navLink} ${isActive ? style.navLinkActive : ''}`
                            }
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={style.sidebarFooter}>
                    <div className={style.teacherCard}>
                        <div className={style.avatar}>{teacherInitials}</div>
                        <div className={style.teacherMeta}>
                            <p className={style.teacherName}>{teacherFullName}</p>
                            <p className={style.teacherEmail}>{teacher?.email ?? ''}</p>
                        </div>
                    </div>
                    <button className={style.logoutBtn} onClick={handleLogout}>
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={style.main}>
                {outlet || (
                    <div className={style.dashboardContent}>
                        {loadError && (
                            <div className={style.errorBanner}>
                                <p>{loadError}</p>
                                <button className={style.retryBtn} onClick={getTeacherDashboard}>Retry</button>
                            </div>
                        )}
                        <div className={style.welcomeSection}>
                            <h1 className={style.welcomeTitle}>
                                Welcome, {teacherFullName}!
                            </h1>
                            <p className={style.department}>
                                Department: {teacher?.department ?? ''}
                            </p>
                        </div>

                        <div className={style.statsGrid}>
                            {statCards.map((card) => {
                                const isPositive = card.change.startsWith('+')
                                return (
                                    <div key={card.title} className={style.statCard}>
                                        <p className={style.cardTitle}>{card.title}</p>
                                        <h2 className={style.cardValue}>{card.value}</h2>
                                        <p className={style.cardDesc}>{card.description}</p>
                                        <span className={isPositive ? style.positive : style.negative}>
                                            {card.change}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Dashboard
