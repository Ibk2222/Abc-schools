import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff, Upload } from 'lucide-react'
import style from './StudentSignup.module.css'

const STEPS = ['Personal Info', 'Contact Details', 'Security']

const StudentSignup = () => {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        firstname: '', lastname: '', email: '',
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
    const setName = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value.replace(/[^A-Za-z '-]/g, '') }))

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

    const validateStep = () => {
        setError('')
        if (step === 1) {
            if (!image) { setError('Please upload a profile photo.'); return false }
            if (!form.firstname.trim()) { setError('First name is required.'); return false }
            if (!form.lastname.trim()) { setError('Last name is required.'); return false }
            if (!form.dob) { setError('Date of birth is required.'); return false }
            const year = new Date(form.dob).getFullYear()
            if (year < 2015 || year > 2022) { setError('Date of birth must be between 2015 and 2022.'); return false }
            if (!form.gender) { setError('Please select a gender.'); return false }
            if (!form.class_id) { setError('Please select a class.'); return false }
        }
        if (step === 2) {
            if (!form.email.trim()) { setError('Email is required.'); return false }
            if (!form.address.trim()) { setError('Address is required.'); return false }
            if (!form.parent_phone || form.parent_phone.length < 11) { setError('Enter a valid 11-digit phone number.'); return false }
        }
        return true
    }

    const nextStep = () => { if (validateStep()) setStep(s => s + 1) }
    const prevStep = () => { setError(''); setStep(s => s - 1) }

    const registerStudent = async (e) => {
        e.preventDefault()
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
        } catch (err) {
            setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
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

                <div className={style.stepBar}>
                    {STEPS.map((label, i) => {
                        const n = i + 1
                        const active = n === step
                        const done = n < step
                        return (
                            <React.Fragment key={n}>
                                <div className={style.stepItem}>
                                    <div className={`${style.stepCircle} ${done ? style.stepDone : active ? style.stepActive : ''}`}>
                                        {done ? '✓' : n}
                                    </div>
                                    <span className={`${style.stepLabel} ${active ? style.stepLabelActive : ''}`}>{label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`${style.stepLine} ${done ? style.stepLineDone : ''}`} />
                                )}
                            </React.Fragment>
                        )
                    })}
                </div>

                {error && <div className={style.error}>{error}</div>}

                <form onSubmit={registerStudent}>
                    {step === 1 && (
                        <>
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
                                    <input type="text" value={form.firstname} onChange={setName('firstname')} placeholder="First name" />
                                </div>
                                <div className={style.group}>
                                    <label>Last Name</label>
                                    <input type="text" value={form.lastname} onChange={setName('lastname')} placeholder="Last name" />
                                </div>
                            </div>

                            <div className={style.group}>
                                <label>Date of Birth</label>
                                <input type="date" value={form.dob} onChange={set('dob')} min="2015-01-01" max="2022-12-31" />
                            </div>

                            <div className={style.row}>
                                <div className={style.group}>
                                    <label>Gender</label>
                                    <select value={form.gender} onChange={set('gender')}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className={style.group}>
                                    <label>Class</label>
                                    <select value={form.class_id} onChange={set('class_id')}>
                                        <option value="">Select class</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className={style.group}>
                                <label>Email Address</label>
                                <input type="email" value={form.email} onChange={set('email')} placeholder="Enter your email" />
                            </div>

                            <div className={style.group}>
                                <label>Address</label>
                                <input type="text" value={form.address} onChange={set('address')} placeholder="Home address" />
                            </div>

                            <div className={style.group}>
                                <label>Parent / Guardian Phone</label>
                                <input
                                    type="tel"
                                    value={form.parent_phone}
                                    onChange={(e) => setForm(prev => ({ ...prev, parent_phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                                    placeholder="07000000000"
                                    maxLength={11}
                                />
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
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
                        </>
                    )}

                    <div className={style.navBtns}>
                        {step > 1 && (
                            <button type="button" className={style.backBtn} onClick={prevStep}>
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button type="button" className={style.submitBtn} onClick={nextStep}>
                                Next
                            </button>
                        ) : (
                            <button type="submit" className={style.submitBtn} disabled={loading}>
                                {loading ? <><Loader2 className="animate-spin" /><span>Registering...</span></> : 'Create Student Account'}
                            </button>
                        )}
                    </div>
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
