import React from 'react'
import { useNavigate } from 'react-router-dom'
import style from './LandingPage.module.css'

const features = [
    {
        icon: '📋',
        title: 'Attendance Tracking',
        description: 'Monitor daily student attendance with real-time updates and detailed reports.',
    },
    {
        icon: '📅',
        title: 'Timetable Management',
        description: 'View and manage class schedules for teachers and students seamlessly.',
    },
    {
        icon: '📝',
        title: 'Exams & Assessments',
        description: 'Create, manage, and grade exams and tests all in one place.',
    },
    {
        icon: '📊',
        title: 'Results & Reports',
        description: 'Generate comprehensive academic results and performance reports.',
    },
    {
        icon: '📚',
        title: 'Assignments',
        description: 'Assign and submit classwork digitally, keeping teachers and students in sync.',
    },
    {
        icon: '🏫',
        title: 'Class Management',
        description: 'Organise classes, subjects, and student rosters with ease.',
    },
]

const portals = [
    {
        role: 'Admin',
        icon: '🛡️',
        description: 'Manage the entire school — staff, students, classes, and operations.',
        loginPath: '/admin/login',
        signupPath: '/admin/signup',
        color: '#1451f0',
    },
    {
        role: 'Teacher',
        icon: '👨‍🏫',
        description: 'Take attendance, upload results, manage assignments and timetables.',
        loginPath: '/login',
        signupPath: '/signup',
        color: '#0ea5e9',
    },
    {
        role: 'Student',
        icon: '🎒',
        description: 'View your timetable, results, assignments, and school updates.',
        loginPath: '/student/login',
        signupPath: '/student/signup',
        color: '#10b981',
    },
]

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className={style.page}>
            {/* ── Navbar ── */}
            <nav className={style.nav}>
                <div className={style.navBrand}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="School logo"
                        className={style.navLogo}
                    />
                    <span>ABC Nursery &amp; Primary School</span>
                </div>
                <div className={style.navLinks}>
                    <a href="#features">Features</a>
                    <a href="#portals">Portals</a>
                    <button className={style.navCta} onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className={style.hero}>
                <div className={style.heroBadge}>Welcome to Our School Portal</div>
                <h1 className={style.heroTitle}>
                    Empowering Education<br />
                    <span className={style.heroAccent}>at ABC School</span>
                </h1>
                <p className={style.heroSub}>
                    A modern school management platform connecting admins, teachers, and students
                    for a smarter, more organised learning experience.
                </p>
                <div className={style.heroActions}>
                    <button className={style.heroPrimary} onClick={() => navigate('/student/login')}>
                        Student Portal
                    </button>
                    <button className={style.heroSecondary} onClick={() => navigate('/login')}>
                        Teacher Portal
                    </button>
                </div>
                <div className={style.heroStats}>
                    <div className={style.stat}>
                        <span className={style.statNum}>3</span>
                        <span className={style.statLabel}>User Roles</span>
                    </div>
                    <div className={style.statDivider} />
                    <div className={style.stat}>
                        <span className={style.statNum}>10+</span>
                        <span className={style.statLabel}>Features</span>
                    </div>
                    <div className={style.statDivider} />
                    <div className={style.stat}>
                        <span className={style.statNum}>24/7</span>
                        <span className={style.statLabel}>Online Access</span>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className={style.features} id="features">
                <h2 className={style.sectionTitle}>Everything You Need</h2>
                <p className={style.sectionSub}>
                    A complete suite of tools to run your school efficiently.
                </p>
                <div className={style.featuresGrid}>
                    {features.map((f) => (
                        <div className={style.featureCard} key={f.title}>
                            <span className={style.featureIcon}>{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Portals ── */}
            <section className={style.portals} id="portals">
                <h2 className={style.sectionTitle}>Choose Your Portal</h2>
                <p className={style.sectionSub}>
                    Sign in to the portal that matches your role.
                </p>
                <div className={style.portalsGrid}>
                    {portals.map((p) => (
                        <div className={style.portalCard} key={p.role} style={{ '--accent': p.color }}>
                            <span className={style.portalIcon}>{p.icon}</span>
                            <h3 className={style.portalRole}>{p.role}</h3>
                            <p className={style.portalDesc}>{p.description}</p>
                            <div className={style.portalActions}>
                                <button
                                    className={style.portalLogin}
                                    onClick={() => navigate(p.loginPath)}
                                >
                                    Log In
                                </button>
                                <button
                                    className={style.portalSignup}
                                    onClick={() => navigate(p.signupPath)}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className={style.footer}>
                <img
                    src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                    alt="School logo"
                    className={style.footerLogo}
                />
                <p>© {new Date().getFullYear()} ABC Nursery &amp; Primary School. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default LandingPage
