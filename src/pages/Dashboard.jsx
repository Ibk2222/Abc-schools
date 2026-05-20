import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useOutlet } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, Calendar, ClipboardList, CheckSquare, LogOut } from 'lucide-react'
import style from './Dashboard.module.css'

const GRADE_COLORS = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }
const gradeColor = (g) => GRADE_COLORS[g] ?? '#6b7a99'
const gradeFromScore = (s) => s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F'

const DonutChart = ({ segments, total }) => {
    const size = 140, cx = 70, cy = 70, r = 52, stroke = 22
    const circumference = 2 * Math.PI * r
    let cumulative = 0
    return (
        <div className={style.donut}>
            <svg width={size} height={size}>
                {segments.map((seg, i) => {
                    const frac = total ? seg.count / total : 0
                    const dash = frac * circumference
                    const offset = -(cumulative / (total || 1)) * circumference
                    cumulative += seg.count
                    return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke} strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={offset} transform={`rotate(-90 ${cx} ${cy})`} />
                })}
                {total === 0 && <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2540" strokeWidth={stroke} />}
            </svg>
            <div className={style.donutInner}>
                <span className={style.donutPct}>{total}</span>
                <span className={style.donutSub}>total</span>
            </div>
        </div>
    )
}

const LineChart = ({ points, color = 'rgb(20,81,240)', label }) => {
    if (!points.length) return <p className={style.chartEmpty}>No data</p>
    const W = 400, H = 120, PAD = 16
    const vals = points.map(p => p.y)
    const maxV = Math.max(...vals, 1), minV = Math.min(...vals, 0), range = maxV - minV || 1
    const x = (i) => PAD + (i / (points.length - 1 || 1)) * (W - PAD * 2)
    const y = (v) => H - PAD - ((v - minV) / range) * (H - PAD * 2)
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.y)}`).join(' ')
    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
            <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${d} L${x(points.length - 1)},${H} L${x(0)},${H} Z`} fill={`url(#grad-${label})`} />
            <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(p.y)} r="4" fill={color} />
                    <text x={x(i)} y={H - 2} textAnchor="middle" fontSize="10" fill="#6b7a99">{p.label}</text>
                </g>
            ))}
        </svg>
    )
}

const BarChart = ({ bars }) => {
    const maxVal = Math.max(...bars.map(b => b.value), 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
            <div className={style.yAxis}>
                {[100, 75, 50, 25, 0].map(v => <span key={v} className={style.yLabel}>{v}</span>)}
            </div>
            {bars.map((bar) => (
                <div key={bar.label} className={style.barGroup}>
                    <span className={style.barValue}>{bar.value}%</span>
                    <div className={style.bar} style={{ height: `${(bar.value / maxVal) * 90}%` }} title={`${bar.label}: ${bar.value}%`} />
                    <span className={style.barLabel}>{bar.label}</span>
                </div>
            ))}
        </div>
    )
}

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
    const [results, setResults] = useState([])
    const [loadError, setLoadError] = useState('')
    const navigate = useNavigate()
    const outlet = useOutlet()

    useEffect(() => {
        getTeacherDashboard()
        const beat = setInterval(() => {
            const token = localStorage.token
            if (token) axios.post('https://schoolpj-backend.onrender.com/teacher/heartbeat', {}, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
        }, 60000)
        return () => clearInterval(beat)
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
                axios.get('https://schoolpj-backend.onrender.com/teacher/all-results', {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                }).then((r) => { if (r.data.status) setResults(r.data.results ?? []) }).catch(() => {})
            }
        })
        .catch((err) => {
            if (err.response?.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                navigate('/login')
            } else {
                setLoadError('Server is waking up — please click Retry in a moment.')
            }
        })
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

    const scores = results.map(r => r.score).filter(s => typeof s === 'number')
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const highest = scores.length ? Math.max(...scores) : 0
    const passRate = scores.length ? ((scores.filter(s => s >= 50).length / scores.length) * 100).toFixed(1) : '0.0'

    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    results.forEach(r => { const g = r.grade_level || gradeFromScore(r.score); if (g in gradeCounts) gradeCounts[g]++ })
    const gradeSegments = Object.entries(gradeCounts).map(([g, count]) => ({ label: `${g} Grade`, color: gradeColor(g), count }))

    const buckets = ['0-59', '60-69', '70-79', '80-89', '90-100']
    const trendPoints = buckets.map(b => {
        const [lo, hi] = b.split('-').map(Number)
        return { label: b, y: scores.filter(s => s >= lo && s <= hi).length }
    })

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

                        {results.length > 0 && (
                            <>
                                <div className={style.chartsSectionHead}>
                                    <p className={style.chartsSectionTitle}>Grade Overview</p>
                                    <p className={style.chartsSectionSub}>Based on {results.length} result{results.length !== 1 ? 's' : ''} — Avg {avg}% · Highest {highest}% · Pass rate {passRate}%</p>
                                </div>

                                <div className={style.chartsRow}>
                                    <div className={style.chartCard}>
                                        <p className={style.chartTitle}>Grade Distribution</p>
                                        <div className={style.donutWrap}>
                                            <DonutChart segments={gradeSegments} total={results.length} />
                                            <div className={style.legend}>
                                                {gradeSegments.map(seg => (
                                                    <div key={seg.label} className={style.legendItem}>
                                                        <span className={style.legendDot} style={{ background: seg.color }} />
                                                        <span>{seg.label}</span>
                                                        <span className={style.legendCount}>{seg.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={style.chartCard}>
                                        <p className={style.chartTitle}>Performance Trend</p>
                                        <div className={style.lineChartLegend}>
                                            <div className={style.lineChartLegendItem}>
                                                <div className={style.lineChartLegendLine} style={{ background: 'rgb(20,81,240)' }} />
                                                <span>Score count</span>
                                            </div>
                                        </div>
                                        <div className={style.lineChartWrap}>
                                            <LineChart points={trendPoints} color="rgb(20,81,240)" label="avg" />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Dashboard
