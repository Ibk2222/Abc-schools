import React from 'react'
import { useNavigate } from 'react-router-dom'
import style from './LandingPage.module.css'

const features = [
    { icon: '✅', title: 'Attendance Tracking', description: 'Monitor daily student attendance with real-time updates and detailed reports.' },
    { icon: '🗓️', title: 'Timetable Management', description: 'View and manage class schedules for teachers and students seamlessly.' },
    { icon: '📝', title: 'Exams & Assessments', description: 'Create, manage, and grade exams and tests all in one place.' },
    { icon: '📊', title: 'Results & Reports', description: 'Generate comprehensive academic results and performance reports instantly.' },
    { icon: '📚', title: 'Assignments', description: 'Assign and submit classwork digitally, keeping teachers and students in sync.' },
    { icon: '🏫', title: 'Class Management', description: 'Organise classes, subjects, and student rosters with ease.' },
]

const portals = [
    {
        role: 'Teacher',
        icon: '👨‍🏫',
        description: 'Take attendance, upload results, manage assignments and timetables.',
        loginPath: '/login',
        signupPath: '/signup',
        color: '#1451f0',
        gradient: 'linear-gradient(135deg, rgba(20,81,240,0.15) 0%, rgba(96,165,250,0.08) 100%)',
    },
    {
        role: 'Student',
        icon: '🎒',
        description: 'View your timetable, results, assignments, and school updates.',
        loginPath: '/student/login',
        signupPath: '/student/signup',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.08) 100%)',
    },
]

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className={style.page}>

            {/* ── Topbar ── */}
            <div className={style.topbar}>
                <span>🎓 Nurturing Excellence in Every Child</span>
            </div>

            {/* ── Navbar ── */}
            <nav className={style.nav}>
                <div className={style.navBrand}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="School logo"
                        className={style.navLogo}
                    />
                    <div className={style.navBrandText}>
                        <span className={style.navBrandName}>ABC School</span>
                        <span className={style.navBrandSub}>Nursery &amp; Primary</span>
                    </div>
                </div>
                <div className={style.navLinks}>
                    <a href="#features">Features</a>
                    <a href="#portals">Portals</a>
                    <a href="#about">About</a>
                </div>
                <div className={style.navActions}>
                    <button className={style.navOutline} onClick={() => navigate('/signup')}>Register</button>
                    <button className={style.navCta} onClick={() => navigate('/login')}>Sign In</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className={style.hero}>
                <div className={style.heroBg} />
                <div className={style.heroContent}>
                    <div className={style.heroLeft}>
                        <div className={style.heroBadge}>
                            <span className={style.heroBadgeDot} />
                            Official School Management Portal
                        </div>
                        <h1 className={style.heroTitle}>
                            Where Learning<br />
                            Meets <span className={style.heroAccent}>Excellence</span>
                        </h1>
                        <p className={style.heroSub}>
                            ABC Nursery &amp; Primary School's digital platform — connecting
                            teachers, students, and parents for a smarter, more organised
                            learning experience.
                        </p>
                        <div className={style.heroActions}>
                            <button className={style.heroPrimary} onClick={() => navigate('/student/login')}>
                                Student Portal →
                            </button>
                            <button className={style.heroSecondary} onClick={() => navigate('/login')}>
                                Teacher Portal
                            </button>
                        </div>
                        <div className={style.heroStats}>
                            <div className={style.stat}>
                                <span className={style.statNum}>2</span>
                                <span className={style.statLabel}>Portals</span>
                            </div>
                            <div className={style.statDivider} />
                            <div className={style.stat}>
                                <span className={style.statNum}>10+</span>
                                <span className={style.statLabel}>Features</span>
                            </div>
                            <div className={style.statDivider} />
                            <div className={style.stat}>
                                <span className={style.statNum}>24/7</span>
                                <span className={style.statLabel}>Access</span>
                            </div>
                        </div>
                    </div>
                    <div className={style.heroRight}>
                        <div className={style.heroCard}>
                            <img
                                src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                                alt="ABC School"
                                className={style.heroLogo}
                            />
                            <h2 className={style.heroCardTitle}>ABC Nursery &amp; Primary School</h2>
                            <p className={style.heroCardSub}>Est. in Nigeria — Building Futures</p>
                            <div className={style.heroCardDivider} />
                            <div className={style.heroCardStats}>
                                <div className={style.heroCardStat}>
                                    <span>👨‍🏫</span> Qualified Teachers
                                </div>
                                <div className={style.heroCardStat}>
                                    <span>🎒</span> Enrolled Students
                                </div>
                                <div className={style.heroCardStat}>
                                    <span>📋</span> Daily Attendance
                                </div>
                                <div className={style.heroCardStat}>
                                    <span>🏆</span> Academic Excellence
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className={style.features} id="features">
                <div className={style.sectionInner}>
                    <div className={style.sectionEyebrow}>Platform Features</div>
                    <h2 className={style.sectionTitle}>Everything You Need to Run Your School</h2>
                    <p className={style.sectionSub}>
                        A complete suite of tools designed for modern primary education management.
                    </p>
                    <div className={style.featuresGrid}>
                        {features.map((f, i) => (
                            <div className={style.featureCard} key={f.title}>
                                <div className={style.featureIconWrap}>
                                    <span className={style.featureIcon}>{f.icon}</span>
                                </div>
                                <h3 className={style.featureTitle}>{f.title}</h3>
                                <p className={style.featureDesc}>{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Portals ── */}
            <section className={style.portals} id="portals">
                <div className={style.sectionInner}>
                    <div className={style.sectionEyebrow}>Access Portals</div>
                    <h2 className={style.sectionTitle}>Choose Your Portal</h2>
                    <p className={style.sectionSub}>Select the portal that matches your role to get started.</p>
                    <div className={style.portalsGrid}>
                        {portals.map((p) => (
                            <div
                                className={style.portalCard}
                                key={p.role}
                                style={{ '--accent': p.color, '--gradient': p.gradient }}
                            >
                                <div className={style.portalAccentBar} />
                                <div className={style.portalIconWrap}>
                                    <span className={style.portalIcon}>{p.icon}</span>
                                </div>
                                <h3 className={style.portalRole}>{p.role} Portal</h3>
                                <p className={style.portalDesc}>{p.description}</p>
                                <div className={style.portalActions}>
                                    <button className={style.portalLogin} onClick={() => navigate(p.loginPath)}>
                                        Log In
                                    </button>
                                    <button className={style.portalSignup} onClick={() => navigate(p.signupPath)}>
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── About strip ── */}
            <section className={style.about} id="about">
                <div className={style.aboutInner}>
                    <div className={style.aboutText}>
                        <div className={style.sectionEyebrow}>About Us</div>
                        <h2 className={style.aboutTitle}>Committed to Quality Education</h2>
                        <p className={style.aboutDesc}>
                            ABC Nursery &amp; Primary School is dedicated to providing a nurturing
                            and academically rigorous environment for young learners. Our digital
                            portal brings school management into the modern age — making it easy
                            for teachers to track progress and students to stay engaged.
                        </p>
                        <button className={style.heroPrimary} onClick={() => navigate('/student/signup')}>
                            Enrol Your Child →
                        </button>
                    </div>
                    <div className={style.aboutValues}>
                        {[
                            { icon: '🌟', label: 'Excellence', desc: 'We set high standards for every student.' },
                            { icon: '🤝', label: 'Integrity', desc: 'Honest, transparent school management.' },
                            { icon: '💡', label: 'Innovation', desc: 'Modern tools for modern education.' },
                            { icon: '❤️', label: 'Care', desc: 'Every child matters to us.' },
                        ].map(v => (
                            <div className={style.valueCard} key={v.label}>
                                <span className={style.valueIcon}>{v.icon}</span>
                                <div>
                                    <p className={style.valueLabel}>{v.label}</p>
                                    <p className={style.valueDesc}>{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className={style.footer}>
                <div className={style.footerTop}>
                    <div className={style.footerBrand}>
                        <img
                            src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                            alt="School logo"
                            className={style.footerLogo}
                        />
                        <div>
                            <p className={style.footerName}>ABC Nursery &amp; Primary School</p>
                            <p className={style.footerTagline}>Nurturing Excellence in Every Child</p>
                        </div>
                    </div>
                    <div className={style.footerLinks}>
                        <p className={style.footerLinkHead}>Quick Access</p>
                        <span onClick={() => navigate('/login')}>Teacher Login</span>
                        <span onClick={() => navigate('/student/login')}>Student Login</span>
                        <span onClick={() => navigate('/signup')}>Teacher Register</span>
                        <span onClick={() => navigate('/student/signup')}>Student Register</span>
                    </div>
                </div>
                <div className={style.footerBottom}>
                    <p>© {new Date().getFullYear()} ABC Nursery &amp; Primary School. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
