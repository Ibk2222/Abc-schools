import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import s from './StudentAttendance.module.css'

const BASE = 'https://schoolproject-backend-ruiy.onrender.com'
const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
]

const StudentAttendance = () => {
    const navigate = useNavigate()
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [monthFilter, setMonthFilter] = useState('all')

    const token = localStorage.getItem('token')

    useEffect(() => {
        axios.get(`${BASE}/students/my-attendance`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.data.status) {
                    setRecords(res.data.records)
                } else {
                    navigate('/student/login')
                }
            })
            .catch(() => navigate('/student/login'))
            .finally(() => setLoading(false))
    }, [])

    // â”€â”€ Summary stats â”€â”€
    const total        = records.length
    const presentCount = records.filter((r) => r.status === 'present').length
    const absentCount  = records.filter((r) => r.status === 'absent').length
    const overallPct   = total > 0 ? Math.round((presentCount / total) * 100) : 0

    // â”€â”€ Group by class â”€â”€
    const byClass = {}
    records.forEach((r) => {
        const key  = r.class_id?._id ?? 'unknown'
        const name = r.class_id?.name ?? 'Unknown'
        if (!byClass[key]) byClass[key] = { name, present: 0, absent: 0, total: 0 }
        byClass[key].total++
        if (r.status === 'present') byClass[key].present++
        else byClass[key].absent++
    })
    const classRows = Object.values(byClass)

    // â”€â”€ Group by month â”€â”€
    const byMonth = {}
    records.forEach((r) => {
        const d   = new Date(r.date)
        const key = `${d.getFullYear()}-${d.getMonth()}`
        if (!byMonth[key]) {
            byMonth[key] = {
                monthName:  MONTH_NAMES[d.getMonth()],
                monthIndex: d.getMonth(),
                year:       d.getFullYear(),
                present: 0,
                total:   0,
            }
        }
        byMonth[key].total++
        if (r.status === 'present') byMonth[key].present++
    })

    const monthRows = Object.values(byMonth).sort((a, b) =>
        a.year !== b.year ? a.year - b.year : a.monthIndex - b.monthIndex
    )

    const filteredMonths = monthFilter === 'all'
        ? monthRows
        : monthRows.filter((m) => m.monthName === monthFilter)

    const availableMonths = monthRows.map((m) => m.monthName)

    const barColor = (pct) =>
        pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444'

    if (loading) {
        return (
            <div className={s.loadingWrap}>
                <div className={s.spinner} />
            </div>
        )
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h1 className={s.title}>My Attendance</h1>
                <p className={s.subtitle}>Track your attendance and absences</p>
            </div>

            {/* â”€â”€ Summary cards â”€â”€ */}
            <div className={s.summaryGrid}>
                <div className={s.summaryCard}>
                    <p className={s.summaryLabel}>Overall Attendance</p>
                    <h2 className={s.summaryValue}>{overallPct}%</h2>
                    <p className={s.summaryDesc}>Across all subjects</p>
                </div>
                <div className={s.summaryCard}>
                    <p className={s.summaryLabel}>Total Classes</p>
                    <h2 className={s.summaryValue}>{total}</h2>
                    <p className={s.summaryDesc}>This academic year</p>
                </div>
                <div className={s.summaryCard}>
                    <p className={s.summaryLabel}>Classes Present</p>
                    <h2 className={`${s.summaryValue} ${s.green}`}>{presentCount}</h2>
                    <p className={s.summaryDesc}>{overallPct}% average</p>
                </div>
                <div className={s.summaryCard}>
                    <p className={s.summaryLabel}>Absences</p>
                    <h2 className={`${s.summaryValue} ${s.red}`}>{absentCount}</h2>
                    <p className={s.summaryDesc}>Total this year</p>
                </div>
            </div>

            {/* â”€â”€ Attendance by Class/Subject table â”€â”€ */}
            <div className={s.tableCard}>
                <h2 className={s.cardTitle}>Attendance by Subject</h2>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Late</th>
                            <th>Total</th>
                            <th>Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classRows.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={s.empty}>No attendance records found</td>
                            </tr>
                        ) : classRows.map((row, i) => {
                            const pct   = row.total > 0 ? Math.round((row.present / row.total) * 100) : 0
                            const color = barColor(pct)
                            return (
                                <tr key={i}>
                                    <td className={s.subjectName}>{row.name}</td>
                                    <td className={s.present}>{row.present}</td>
                                    <td className={s.absent}>{row.absent}</td>
                                    <td className={s.late}>0</td>
                                    <td>{row.total}</td>
                                    <td>
                                        <div className={s.pctCell}>
                                            <span style={{ color }}>{pct}%</span>
                                            <div className={s.pctBarWrap}>
                                                <div
                                                    className={s.pctBar}
                                                    style={{ width: `${pct}%`, background: color }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* â”€â”€ Monthly attendance â”€â”€ */}
            <div className={s.tableCard}>
                <div className={s.monthHeader}>
                    <h2 className={s.cardTitle}>Monthly Attendance</h2>
                    <select
                        className={s.monthSelect}
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                    >
                        <option value="all">All Months</option>
                        {availableMonths.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className={s.monthList}>
                    {filteredMonths.length === 0 ? (
                        <p className={s.empty}>No records for selected month</p>
                    ) : filteredMonths.map((m, i) => {
                        const pct = m.total > 0 ? Math.round((m.present / m.total) * 100) : 0
                        return (
                            <div key={i} className={s.monthRow}>
                                <div className={s.monthMeta}>
                                    <span className={s.monthName}>{m.monthName}</span>
                                    <span className={s.monthSub}>{m.present}/{m.total} days present</span>
                                </div>
                                <div className={s.monthBarWrap}>
                                    <div className={s.monthBar} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={s.monthPct}>{pct}%</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default StudentAttendance
