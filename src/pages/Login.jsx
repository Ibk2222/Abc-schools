import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from "lucide-react";
import style from './Login.module.css';

const Login = () => {
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    let navigate = useNavigate()

    const loginUser = () => {
        setLoading(true)
        const url = "https://schoolpj-backend.onrender.com/teacher/logins"
        const loginObject = { email, password }

        axios.post(url, loginObject)
        .then((res) => {
            setLoading(false)
            console.log(res)
            if (res.data.status) {
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('role', 'teacher')
                navigate("/dashboard")
            } else {
                setError(res.data.message)
            }
        })
        .catch((error) => {
            setLoading(false)
            console.log(error)
        })
    }

    return (
        <div className={style['login-container']}>
            <div className={style['login-wrapper']}>
                <div className={style['login-header']}>
                    <img src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360" alt="Hero Image" className={style['hero-image']} />
                    <h1>Welcome to ABC Nursery and Primary School</h1>
                    <p>Sign in to your account</p>
                </div>

                {error && <div className={style['error-message']}>{error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); loginUser(); }}>
                    <div className={style['form-group']}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className={style['form-group']}>
                        <label htmlFor="password">Password</label>
                        <div className={style['input-wrapper']}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                            <span className={style['eye-icon']} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className={style['login-button']} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className={style['signup-link']} style={{ marginTop: 16 }}>
                    <span onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
                </p>
                <p className={style['signup-link']}>
                    Don't have an account? <span onClick={() => navigate("/signup")}>Sign Up</span>
                </p>
            </div>
        </div>
    )
}

export default Login
