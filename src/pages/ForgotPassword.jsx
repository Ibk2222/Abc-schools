import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import style from './Login.module.css'
import fpStyle from './ForgotPassword.module.css'

const BASE = 'https://schoolpj-backend.onrender.com'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    // Determine role from URL path
    const role = pathname.startsWith('/admin') ? 'admin'
               : pathname.startsWith('/student') ? 'student'
               : 'teacher'

    const apiBase = role === 'admin'   ? `${BASE}/admin`
                  : role === 'student' ? `${BASE}/students`
                  : `${BASE}/teacher`

    const loginPath = role === 'admin'   ? '/admin/login'
                    : role === 'student' ? '/student/login'
                    : '/login'

    const roleLabel = role === 'admin' ? 'Admin' : role === 'student' ? 'Student' : 'Teacher'

    // Step 1: request code
    const [email, setEmail]     = useState('')
    const [step1Loading, setStep1Loading] = useState(false)
    const [step1Error, setStep1Error]     = useState('')
    const [resetCode, setResetCode]       = useState('') // shown on screen (dev mode)

    // Step 2: reset password
    const [step, setStep]           = useState(1)
    const [code, setCode]           = useState('')
    const [newPassword, setNewPassword]     = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [step2Loading, setStep2Loading]   = useState(false)
    const [step2Error, setStep2Error]       = useState('')
    const [success, setSuccess]             = useState(false)

    const handleRequestCode = (e) => {
        e.preventDefault()
        setStep1Loading(true)
        setStep1Error('')
        axios.post(`${apiBase}/forgot-password`, { email })
            .then((res) => {
                if (res.data.status) {
                    setResetCode(res.data.resetCode)
                    setStep(2)
                } else {
                    setStep1Error(res.data.message ?? 'Something went wrong.')
                }
            })
            .catch(() => setStep1Error('Server error. Please try again.'))
            .finally(() => setStep1Loading(false))
    }

    const handleResetPassword = (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setStep2Error('Passwords do not match.')
            return
        }
        setStep2Loading(true)
        setStep2Error('')
        axios.post(`${apiBase}/reset-password`, { email, code, newPassword })
            .then((res) => {
                if (res.data.status) {
                    setSuccess(true)
                } else {
                    setStep2Error(res.data.message ?? 'Something went wrong.')
                }
            })
            .catch(() => setStep2Error('Server error. Please try again.'))
            .finally(() => setStep2Loading(false))
    }

    return (
        <div className={style['login-container']}>
            <div className={style['login-wrapper']}>
                <div className={style['login-header']}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="Logo"
                        className={style['hero-image']}
                    />
                    <h1>{roleLabel} — Reset Password</h1>
                    <p>{step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}</p>
                </div>

                {success ? (
                    <div className={fpStyle.successBox}>
                        <p className={fpStyle.successTitle}>Password reset successfully!</p>
                        <p className={fpStyle.successSub}>You can now sign in with your new password.</p>
                        <button className={style['login-button']} onClick={() => navigate(loginPath)}>
                            Back to Login
                        </button>
                    </div>
                ) : step === 1 ? (
                    <form onSubmit={handleRequestCode}>
                        {step1Error && <div className={style['error-message']}>{step1Error}</div>}

                        <div className={style['form-group']}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your registered email"
                                required
                            />
                        </div>

                        <button type="submit" className={style['login-button']} disabled={step1Loading}>
                            {step1Loading
                                ? <><Loader2 className="animate-spin" /><span>Sending...</span></>
                                : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        {step2Error && <div className={style['error-message']}>{step2Error}</div>}

                        {/* Dev-mode code display */}
                        <div className={fpStyle.codeBox}>
                            <p className={fpStyle.codeLabel}>Your reset code</p>
                            <p className={fpStyle.codeValue}>{resetCode}</p>
                            <p className={fpStyle.codeNote}>In production this would be sent to your email. Code expires in 15 minutes.</p>
                        </div>

                        <div className={style['form-group']}>
                            <label htmlFor="code">Reset Code</label>
                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className={style['form-group']}>
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div className={style['form-group']}>
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        <button type="submit" className={style['login-button']} disabled={step2Loading}>
                            {step2Loading
                                ? <><Loader2 className="animate-spin" /><span>Resetting...</span></>
                                : 'Reset Password'}
                        </button>
                    </form>
                )}

                {!success && (
                    <p className={style['signup-link']} style={{ marginTop: 20 }}>
                        Remember your password?{' '}
                        <span onClick={() => navigate(loginPath)}>Back to Login</span>
                    </p>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword
