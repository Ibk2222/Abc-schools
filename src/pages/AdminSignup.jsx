import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import style from './Signup.module.css'

const AdminSignup = () => {
    const [form, setForm] = useState({
        firstname: '', lastname: '', email: '',
        age: '', phone: '', password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

    const registerAdmin = () => {
        setLoading(true)
        setError('')
        axios.post('https://schoolproject-backend-ruiy.onrender.com/admin/registersadmin', form)
            .then((res) => {
                if (res.data.status === false) {
                    setError(res.data.message)
                } else {
                    navigate('/admin/login')
                }
            })
            .catch(() => setError('Something went wrong. Please try again.'))
            .finally(() => setLoading(false))
    }

    return (
        <div className={style['signup-container']}>
            <div className={style['signup-wrapper']}>
                <div className={style['signup-header']}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="Logo"
                        className={style['hero-image']}
                    />
                    <h1>Admin Registration</h1>
                    <p>Create your admin account</p>
                </div>

                {error && <div className={style['error-message']}>{error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); registerAdmin() }}>
                    <div className={style['form-row']}>
                        <div className={style['form-group']}>
                            <label>First Name</label>
                            <input type="text" value={form.firstname} onChange={set('firstname')} placeholder="First name" required />
                        </div>
                        <div className={style['form-group']}>
                            <label>Last Name</label>
                            <input type="text" value={form.lastname} onChange={set('lastname')} placeholder="Last name" required />
                        </div>
                    </div>

                    <div className={style['form-row']}>
                        <div className={style['form-group']}>
                            <label>Age</label>
                            <input type="number" value={form.age} onChange={set('age')} placeholder="Age" min="18" required />
                        </div>
                        <div className={style['form-group']}>
                            <label>Phone</label>
                            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+2348000000000" required />
                        </div>
                    </div>

                    <div className={style['form-group']}>
                        <label>Email Address</label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" required />
                    </div>

                    <div className={style['form-group']}>
                        <label>Password</label>
                        <div className={style['input-wrapper']}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={set('password')}
                                placeholder="Min 6 chars, include letter and number"
                                required
                            />
                            <span className={style['eye-icon']} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className={style['signup-button']} disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" /><span>Registering...</span></> : 'Create Admin Account'}
                    </button>
                </form>

                <p className={style['login-link']}>
                    Already have an account?{' '}
                    <span onClick={() => navigate('/admin/login')}>Sign In</span>
                </p>
            </div>
        </div>
    )
}

export default AdminSignup
