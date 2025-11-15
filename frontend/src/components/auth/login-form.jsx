"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("PATIENT")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Store token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Navigate based on role
      if (data.user.role === "PATIENT") {
        navigate("/patient/dashboard")
      } else if (data.user.role === "DOCTOR") {
        navigate("/doctor/dashboard")
      } else if (data.user.role === "ADMIN") {
        navigate("/admin/dashboard")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">MediHub</h1>
          <p className="text-gray-600">Hospital OPD Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
