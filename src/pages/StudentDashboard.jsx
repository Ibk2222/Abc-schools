import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useOutlet } from 'react-router-dom'
import { LayoutDashboard, Calendar, ClipboardList, CheckSquare, LogOut, User, FileEdit, Menu, X } from 'lucide-react'
import style from './Dashboard.module.css'

const navLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/dashboard/timetable', label: 'My Timetable', icon: Calendar },
    { to: '/student/dashboard/results', label: 'My Results', icon: ClipboardList },
    {to:'/student/dashboard/subjects', label:'My Subjects', icon: LayoutDashboard},
    { to: '/student/dashboard/exams', label: 'My Exams', icon: LayoutDashboard },
    {to:'/student/dashboard/tests', label:'My Tests', icon: LayoutDashboard},
    { to: '/student/dashboard/assignments', label: 'Assignments', icon: FileEdit },
    { to: '/student/dashboard/attendance', label: 'My Attendance', icon: CheckSquare },
    { to: '/student/dashboard/profile', label: 'Profile', icon: User },
]

const StudentDashboard = () => {
    const [student, setStudent] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const outlet = useOutlet()

    const closeSidebar = () => setSidebarOpen(false)

    useEffect(() => {
        getStudentDashboard()
        const beat = setInterval(() => {
            const token = localStorage.token
            if (token) axios.post('https://schoolpj-backend.onrender.com/students/heartbeat', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
        }, 60000)
        return () => clearInterval(beat)
    }, [])

    const getStudentDashboard = () => {
        const token = localStorage.token
        axios.get('https://schoolpj-backend.onrender.com/students/dashboardstudent', {
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
            {sidebarOpen && <div className={style.dropdownOverlay} onClick={closeSidebar} />}

            <aside className={style.sidebar}>
                <div className={style.sidebarHeader}>
                    <h1 className={style.schoolName}>ABC School</h1>
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
                <div className={style.mobileHeader}>
                    <div className={style.mobileTopBar}>
                        <button
                            className={style.hamburger}
                            onClick={() => setSidebarOpen(o => !o)}
                            aria-label="Toggle menu"
                        >
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <span className={style.mobileSchoolName}>ABC School</span>
                    </div>

                    <div className={`${style.mobileDropdown} ${sidebarOpen ? style.dropdownOpen : ''}`}>
                        <nav className={style.dropdownNav}>
                            {navLinks.map(({ to, label, icon: Icon, end }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    onClick={closeSidebar}
                                    className={({ isActive }) =>
                                        `${style.dropdownNavLink} ${isActive ? style.navLinkActive : ''}`
                                    }
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className={style.dropdownFooter}>
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
                    </div>
                </div>

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
