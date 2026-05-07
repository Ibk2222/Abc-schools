import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Upload } from 'lucide-react'
import style from './StudentSignup.module.css'

const StudentSignup = () => {
    const [form, setForm] = useState({
        firstname: '', lastname: '', email: '', age: '',
        password: '', dob: '', gender: '', address: '',
        parent_phone: '', class_id: '',
    })
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [classes, setClasses] = useState([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const fileRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('https://schoolpj-backend.onrender.com/students/all-students')
            .then(() => {})
            .catch(() => {})
        axios.get('https://schoolpj-backend.onrender.com/admin/all-classes')
            .then((res) => {
                if (res.data.status) setClasses(res.data.classes ?? [])
            })
            .catch(() => {})
    }, [])

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const uploadImage = async () => {
        if (!image) return null
        const data = new FormData()
        data.append('image', image)
        const res = await axios.post('https://schoolpj-backend.onrender.com/students/upload', data)
        if (res.data.status) return res.data.imageUrl
        throw new Error('Image upload failed')
    }

    const pwChecks = {
        length:    form.password.length >= 6,
        uppercase: /[A-Z]/.test(form.password),
        lowercase: /[a-z]/.test(form.password),
        number:    /\d/.test(form.password),
    }
    const pwStrength = Object.values(pwChecks).filter(Boolean).length
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength] ?? ''
    const strengthColor = ['', '#f44336', '#ff9800', '#2196f3', '#4caf50'][pwStrength] ?? ''

    const registerStudent = async () => {
        if (!image) { setError('Please upload a profile photo.'); return }
        if (!Object.values(pwChecks).every(Boolean)) { setError('Password does not meet all requirements.'); return }
        if (form.password !== confirm) { setError('Passwords do not match.'); return }
        setLoading(true)
        setError('')
        try {
            const imageUrl = await uploadImage()
            const res = await axios.post('https://schoolpj-backend.onrender.com/students/registerstudent', {
                ...form, image: imageUrl,
            })
            if (res.data.status === false) {
                setError(res.data.message)
            } else {
                navigate('/student/login')
            }
        } catch {
            setError('Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={style.container}>
            <div className={style.wrapper}>
                <div className={style.header}>
                    <img
                        src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360"
                        alt="Logo"
                        className={style.logo}
                    />
                    <h1>Student Registration</h1>
                    <p>Create your student account</p>
                </div>

                {error && <div className={style.error}>{error}</div>}

                <form onSubmit={(e) => { e.preventDefault(); registerStudent() }}>
                    {/* Profile photo */}
                    <div className={style.photoSection}>
                        <div className={style.photoPreview} onClick={() => fileRef.current.click()}>
                            {imagePreview
                                ? <img src={imagePreview} alt="Preview" className={style.previewImg} />
                                : <><Upload size={24} /><span>Upload Photo</span></>
                            }
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                        <p className={style.photoHint}>Profile photo (required)</p>
                    </div>

                    <div className={style.row}>
                        <div className={style.group}>
                            <label>First Name</label>
                            <input type="text" value={form.firstname} onChange={set('firstname')} placeholder="First name" required />
                        </div>
                        <div className={style.group}>
                            <label>Last Name</label>
                            <input type="text" value={form.lastname} onChange={set('lastname')} placeholder="Last name" required />
                        </div>
                    </div>

                    <div className={style.row}>
                        <div className={style.group}>
                            <label>Age</label>
                            <input type="number" value={form.age} onChange={set('age')} placeholder="Age" min="1" required />
                        </div>
                        <div className={style.group}>
                            <label>Date of Birth</label>
                            <input type="date" value={form.dob} onChange={set('dob')} required />
                        </div>
                    </div>

                    <div className={style.row}>
                        <div className={style.group}>
                            <label>Gender</label>
                            <select value={form.gender} onChange={set('gender')} required>
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className={style.group}>
                            <label>Class</label>
                            <select value={form.class_id} onChange={set('class_id')} required>
                                <option value="">Select class</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={style.group}>
                        <label>Email Address</label>
                        <input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" required />
                    </div>

                    <div className={style.group}>
                        <label>Address</label>
                        <input type="text" value={form.address} onChange={set('address')} placeholder="Home address" required />
                    </div>

                    <div className={style.group}>
                        <label>Parent / Guardian Phone</label>
                        <input type="tel" value={form.parent_phone} onChange={set('parent_phone')} placeholder="+2348000000000" required />
                    </div>

                    <div className={style.group}>
                        <label>Password</label>
                        <div className={style.inputWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={set('password')}
                                placeholder="Create a password"
                                required
                            />
                            <span className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>

                        {form.password && (
                            <div className={style.strengthWrap}>
                                <div className={style.strengthBar}>
                                    {[1,2,3,4].map(n => (
                                        <div
                                            key={n}
                                            className={style.strengthSegment}
                                            style={{ background: pwStrength >= n ? strengthColor : '#2a3550' }}
                                        />
                                    ))}
                                </div>
                                <span className={style.strengthLabel} style={{ color: strengthColor }}>{strengthLabel}</span>
                            </div>
                        )}

                        <ul className={style.pwChecklist}>
                            <li className={pwChecks.length    ? style.checkPass : style.checkFail}>At least 6 characters</li>
                            <li className={pwChecks.uppercase ? style.checkPass : style.checkFail}>One uppercase letter</li>
                            <li className={pwChecks.lowercase ? style.checkPass : style.checkFail}>One lowercase letter</li>
                            <li className={pwChecks.number    ? style.checkPass : style.checkFail}>One number</li>
                        </ul>
                    </div>

                    <div className={style.group}>
                        <label>Confirm Password</label>
                        <div className={style.inputWrapper}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                            />
                            <span className={style.eyeIcon} onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                        {confirm && (
                            <p className={form.password === confirm ? style.matchOk : style.matchFail}>
                                {form.password === confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </p>
                        )}
                    </div>

                    <button type="submit" className={style.submitBtn} disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" /><span>Registering...</span></> : 'Create Student Account'}
                    </button>
                </form>

                <p className={style.loginLink}>
                    Already have an account?{' '}
                    <span onClick={() => navigate('/student/login')}>Sign In</span>
                </p>
            </div>
        </div>
    )
}

export default StudentSignup
