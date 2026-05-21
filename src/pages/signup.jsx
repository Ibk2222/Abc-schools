import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from "lucide-react";
import style from './Signup.module.css';


const Signup = () => {
    const [title, settitle] = useState("")
    const [firstname, setfirstname] = useState("")
    const [lastname, setlastname] = useState("")
    const [email, setemail] = useState("")
    const [age, setage] = useState("")
    const [phone, setphone] = useState("")
    const [password, setpassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const pwChecks = {
        length:    password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /\d/.test(password),
    }
    const pwStrength = Object.values(pwChecks).filter(Boolean).length
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength] ?? ''
    const strengthColor = ['', '#f44336', '#ff9800', '#2196f3', '#4caf50'][pwStrength] ?? ''

    let navigate = useNavigate()
    const registerUser = () =>{
        setLoading(true)
        const url = "https://schoolpj-backend.onrender.com/teacher/register"
        const teacherObject = {title, firstname, lastname, email, age, phone, password}
        console.log(teacherObject)

        axios.post(url, teacherObject)
        .then((res)=>{
            setLoading(false)
            console.log(res)
            if(res.data.status){
                navigate("/login")
            }else{
                console.log("Wrong Details")
                setError(res.data.message)
            }
        })
        .catch((error)=>{
            setLoading(false)
            console.log(error)
        })
    }
  return (
    <div className={style['signup-container']}>
      <div className={style['signup-wrapper']}>
        <div className={style['signup-header']}>
          <img src="https://img.freepik.com/premium-vector/abc-kindergarten-school-preschool-day-care-logo_513640-3079.jpg?w=360" alt="Hero Image" className={style['hero-image']} />
          <h1>Teacher Registration</h1>
          <p>Create your teacher account</p>
        </div>

        {error && <div className={style['error-message']}>{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); registerUser(); }}>
          <div className={style['form-row']}>
            <div className={style['form-group']}>
              <label htmlFor="title">Title</label>
              <select
                id="title"
                value={title}
                onChange={(e) => settitle(e.target.value)}
                required
              >
                <option value="">Select Title</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
            </div>
            <div className={style['form-group']}>
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setage(e.target.value)}
                placeholder="Enter your age"
                required
              />
            </div>
          </div>

          <div className={style['form-group']}>
            <label htmlFor="phone">Parent's Phone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setphone(e.target.value)}
              placeholder="08000000000" maxLength={11}
              required
            />
          </div>

          <div className={style['form-row']}>
            <div className={style['form-group']}>
              <label htmlFor="firstname">First Name</label>
              <input 
                id="firstname"
                type="text" 
                value={firstname}
                onChange={(e) => setfirstname(e.target.value.replace(/[^A-Za-z '-]/g, ''))}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className={style['form-group']}>
              <label htmlFor="lastname">Last Name</label>
              <input 
                id="lastname"
                type="text" 
                value={lastname}
                onChange={(e) => setlastname(e.target.value.replace(/[^A-Za-z '-]/g, ''))}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

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
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </span>
            </div>
            {password && (
              <div className={style['strength-wrap']}>
                <div className={style['strength-bar']}>
                  {[1,2,3,4].map(n => (
                    <div key={n} className={style['strength-segment']} style={{ background: pwStrength >= n ? strengthColor : '#2a3550' }} />
                  ))}
                </div>
                <span className={style['strength-label']} style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {password && (
              <ul className={style['pw-checklist']}>
                <li className={pwChecks.length    ? style['check-pass'] : style['check-fail']}>At least 6 characters</li>
                <li className={pwChecks.uppercase ? style['check-pass'] : style['check-fail']}>One uppercase letter</li>
                <li className={pwChecks.lowercase ? style['check-pass'] : style['check-fail']}>One lowercase letter</li>
                <li className={pwChecks.number    ? style['check-pass'] : style['check-fail']}>One number</li>
              </ul>
            )}
          </div>

          <button type="submit" className={style['signup-button']} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Signing up...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Signup