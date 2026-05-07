import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useOutlet } from 'react-router-dom'
import { LayoutDashboard, Calendar, ClipboardList, CheckSquare, LogOut, User } from 'lucide-react'
import style from './Dashboard.module.css'

const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/dashboard/timetable', label: 'My Timetable', icon: Calendar },
    { to: '/student/dashboard/results', label: 'My Results', icon: ClipboardList },
    {to:'/student/dashboard/subjects', label:'My Subjects', icon: LayoutDashboard},
    { to: '/student/dashboard/exams', label: 'My Exams', icon: LayoutDashboard },
    {to:'/student/dashboard/tests', label:'My Tests', icon: LayoutDashboard},
    { to: '/student/dashboard/attendance', label: 'My Attendance', icon: CheckSquare },
    { to: '/student/dashboard/profile', label: 'Profile', icon: User },
]

const StudentDashboard = () => {
    const [student, setStudent] = useState(null)
    const navigate = useNavigate()
    const outlet = useOutlet()

    useEffect(() => {
        getStudentDashboard()
    }, [])

    const getStudentDashboard = () => {
        const token = localStorage.token
        axios.get('https://schoolproject-backend-ruiy.onrender.com/students/dashboardstudent', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        .then((res) => {
            if (!res.data.status) {
                navigate('/student/login')
            } else {
                setStudent(res.data.students)
            }
        })
        .catch(() => navigate('/student/login'))
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/student/login')
    }

    const studentFullName = student
        ? `${student.firstname ?? ''} ${student.lastname ?? ''}`.trim()
        : '...'

    const studentInitials = student
        ? `${(student.firstname ?? '')[0] ?? ''}${(student.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'

    const quickLinks = [
        { label: 'My Timetable', desc: 'View weekly schedule', path: '/student/dashboard/timetable', icon: Calendar },
        { label: 'My Results', desc: 'Check grades and scores', path: '/student/dashboard/results', icon: ClipboardList },
        { label: 'My Attendance', desc: 'View attendance record', path: '/student/dashboard/attendance', icon: CheckSquare },
        { label: 'Profile', desc: 'Manage your details', path: '/student/dashboard/profile', icon: User },
    ]

    return (
        <div className={style.layout}>
            <aside className={style.sidebar}>
                <div className={style.sidebarHeader}>
                    <h1 className={style.schoolName}>SchoolHub</h1>
                    <p className={style.schoolSub}>Student Portal</p>
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
                        <div className={style.avatar}>{studentInitials}</div>
                        <div className={style.teacherMeta}>
                            <p className={style.teacherName}>{studentFullName}</p>
                            <p className={style.teacherEmail}>{student?.email ?? ''}</p>
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
                        <div className={style.welcomeSection}>
                            <h1 className={style.welcomeTitle}>
                                Welcome, {studentFullName}!
                            </h1>
                            <p className={style.department}>Student Dashboard</p>
                        </div>

                        <div className={style.statsGrid}>
                            {quickLinks.map(({ label, desc, path, icon: Icon }) => (
                                <div
                                    key={label}
                                    className={style.statCard}
                                    onClick={() => navigate(path)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <p className={style.cardTitle}>{label}</p>
                                    <Icon size={28} color="rgb(20, 81, 240)" style={{ margin: '10px 0' }} />
                                    <p className={style.cardDesc}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudentDashboard
