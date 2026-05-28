import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useOutlet } from 'react-router-dom'
import {
    LayoutDashboard, Users, BookOpen, BookMarked,
    Calendar, ClipboardList, FileText, CheckSquare,
    LogOut, GraduationCap, FlaskConical, ShieldCheck, Wifi, FileEdit, Menu, X,
} from 'lucide-react'
import style from './Dashboard.module.css'

const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/dashboard/teachers', label: 'Teachers', icon: Users, end: true },
    { to: '/admin/dashboard/students', label: 'Students', icon: GraduationCap, end: true },
    { to: '/admin/dashboard/classes', label: 'Classes', icon: BookOpen, end: true },
    { to: '/admin/dashboard/subjects', label: 'Subjects', icon: BookMarked, end: true },
    { to: '/admin/dashboard/timetables', label: 'Timetables', icon: Calendar },
    { to: '/admin/dashboard/results', label: 'Results', icon: ClipboardList },
    { to: '/admin/dashboard/exams', label: 'Exams', icon: FileText },
    { to: '/admin/dashboard/attendance', label: 'Attendance', icon: CheckSquare },
    { to: '/admin/dashboard/tests', label: 'Tests', icon: FlaskConical },
    { to: '/admin/dashboard/assignments', label: 'Assignments', icon: FileEdit },
    { to: '/admin/dashboard/approvals', label: 'Approvals', icon: ShieldCheck, end: true },
    { to: '/admin/dashboard/online', label: 'Online Now', icon: Wifi, end: true },
]

const AdminDashboard = () => {
    const [admin, setAdmin] = useState(null)
    const [stats, setStats] = useState(null)
    const [loadError, setLoadError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate()
    const outlet = useOutlet()

    const closeSidebar = () => setSidebarOpen(false)

    useEffect(() => {
        getAdminDashboard()
        const beat = setInterval(() => {
            const token = localStorage.token
            if (token) axios.post('https://schoolpj-backend.onrender.com/admin/heartbeat', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
        }, 60000)
        return () => clearInterval(beat)
    }, [])

    const getAdminDashboard = () => {
        setLoadError('')
        const token = localStorage.token
        if (!token) { navigate('/admin/login'); return }
        axios.get('https://schoolpj-backend.onrender.com/admin/dashboardadmin', {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        .then((res) => {
            if (!res.data.status) {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                navigate('/admin/login')
            } else {
                setAdmin(res.data.admin)
                setStats(res.data.stats)
            }
        })
        .catch((err) => {
            if (err.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                navigate('/admin/login')
            } else {
                setLoadError('Server is waking up — please click Retry in a moment.')
            }
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        navigate('/admin/login')
    }

    const adminFullName = admin
        ? `${admin.firstname ?? ''} ${admin.lastname ?? ''}`.trim()
        : '...'

    const adminInitials = admin
        ? `${(admin.firstname ?? '')[0] ?? ''}${(admin.lastname ?? '')[0] ?? ''}`.toUpperCase()
        : '?'

    const statCards = [
        { title: 'Total Teachers', value: stats?.totalTeachers ?? '—', description: 'Registered teachers', active: stats?.activeTeachers },
        { title: 'Total Students', value: stats?.totalStudents ?? '—', description: 'Enrolled students', active: stats?.activeStudents },
        { title: 'Total Classes', value: stats?.totalClasses ?? '—', description: 'Active classes' },
        { title: 'Total Subjects', value: stats?.totalSubjects ?? '—', description: 'Available subjects' },
    ]

    return (
        <div className={style.layout}>
            {sidebarOpen && <div className={style.dropdownOverlay} onClick={closeSidebar} />}

            <aside className={style.sidebar}>
                <div className={style.sidebarHeader}>
                    <h1 className={style.schoolName}>ABC School</h1>
                    <p className={style.schoolSub}>Admin Panel</p>
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
                        <div className={style.avatar}>{adminInitials}</div>
                        <div className={style.teacherMeta}>
                            <p className={style.teacherName}>{adminFullName}</p>
                            <p className={style.teacherEmail}>{admin?.email ?? ''}</p>
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
                                <div className={style.avatar}>{adminInitials}</div>
                                <div className={style.teacherMeta}>
                                    <p className={style.teacherName}>{adminFullName}</p>
                                    <p className={style.teacherEmail}>{admin?.email ?? ''}</p>
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
                        {loadError && (
                            <div className={style.errorBanner}>
                                <p>{loadError}</p>
                                <button className={style.retryBtn} onClick={getAdminDashboard}>Retry</button>
                            </div>
                        )}
                        <div className={style.welcomeSection}>
                            <h1 className={style.welcomeTitle}>
                                Welcome, {adminFullName}!
                            </h1>
                            <p className={style.department}>Role: Administrator</p>
                        </div>

                        <div className={style.statsGrid}>
                            {statCards.map((card) => (
                                <div key={card.title} className={style.statCard}>
                                    <p className={style.cardTitle}>{card.title}</p>
                                    <h2 className={style.cardValue}>{card.value}</h2>
                                    <p className={style.cardDesc}>{card.description}</p>
                                    {card.active !== undefined && (
                                        <span className={style.activeBadge}>
                                            ● {card.active} active
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default AdminDashboard
