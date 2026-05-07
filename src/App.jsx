import React, { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Teacher
import Signup from "./pages/signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Myclasses from "./pages/Myclasses";
import Mystudents from "./pages/Mystudents";
import Mytimetable from "./pages/Mytimetable";
import Results from "./pages/Results";

// Admin
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminTeachers from "./pages/AdminTeachers";
import AdminClasses from "./pages/AdminClasses";
import AdminSubjects from "./pages/AdminSubjects";
import AdminAttendance from "./pages/AdminAttendance";
import AdminTimetables from "./pages/AdminTimetables";
import AdminExams from "./pages/AdminExams";
import AdminTests from "./pages/AdminTests";
import AdminResults from "./pages/AdminResults";

// Student
import StudentLogin from "./pages/StudentLogin";
import StudentSignup from "./pages/StudentSignup";
import StudentDashboard from "./pages/StudentDashboard";
import Studentprofile from "./pages/Studentprofile";
import StudentAttendance from "./pages/StudentAttendance";
import StudentTimetable from "./pages/StudentTimetable";
import StudentResults from "./pages/StudentResults";
import StudentSubjects from "./pages/StudentSubjects";
import StudentExams from "./pages/StudentExams";
import StudentTests from "./pages/StudentTests";
import ForgotPassword from "./pages/ForgotPassword";
import Nopagefound from "./pages/Nopagefound";
import socketClient from "socket.io-client";
function App() {

    let socket = useRef();
  let endpoint = "https://schoolproject-backend-ruiy.onrender.com";
  useEffect(() => {
    socket.current = socketClient(endpoint);
  }, []);
    const token = localStorage.token

    return (
        <Routes>
            {/* Default */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* â”€â”€ Forgot password â”€â”€ */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/student/forgot-password" element={<ForgotPassword />} />

            {/* â”€â”€ Teacher â”€â”€ */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="dashboard"
                element={token ? <Dashboard /> : <Navigate to="/login" />}
            >
                <Route path="myclasses" element={<Myclasses />} />
                <Route path="mystudents" element={<Mystudents />} />
                <Route path="mytimetable" element={<Mytimetable />} />
                <Route path="results" element={<Results />} />
            </Route>

            {/* â”€â”€ Admin â”€â”€ */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route
                path="/admin/dashboard"
                element={token ? <AdminDashboard /> : <Navigate to="/admin/login" />}
            >
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="subjects" element={<AdminSubjects />} />
                <Route path="attendance" element={<AdminAttendance />} />
                <Route path="timetables" element={<AdminTimetables />} />
                <Route path="exams" element={<AdminExams />} />
                <Route path="tests" element={<AdminTests />} />
                <Route path="results" element={<AdminResults />} />
            </Route>

            {/* â”€â”€ Student â”€â”€ */}
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/signup" element={<StudentSignup />} />
            <Route
                path="/student/dashboard"
                element={token ? <StudentDashboard /> : <Navigate to="/student/login" />}
            >
                <Route path="profile" element={<Studentprofile />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="timetable" element={<StudentTimetable />} />
                <Route path="results" element={<StudentResults />} />
                <Route path="subjects" element={<StudentSubjects />} />
                <Route path="exams" element={<StudentExams />} />
                <Route path="tests" element={<StudentTests />} />
            </Route>
            <Route path="*" element={<Nopagefound />} />
        </Routes>
    )
}

export default App
