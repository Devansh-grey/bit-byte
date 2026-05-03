import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore.js'
import { useToast } from "../components/ToastProvider"

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const [unverifiedEmail, setUnverifiedEmail] = useState(null)
    const [isResending, setIsResending] = useState(false)

    const { login, resendVerification } = useAuthStore()
    const navigate = useNavigate()
    const toast = useToast()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const verified = searchParams.get("verified")
        if (verified === "true") {
            toast.success("Email verified! You're now logged in.")
            navigate("/", { replace: true })
        } else if (verified === "invalid") {
            toast.error("Verification link is invalid or has expired. Request a new one.")
        } else if (verified === "error") {
            toast.error("Something went wrong during verification. Please try again.")
        }
    }, [])

    const validateField = (name, value) => {
        switch (name) {
            case "email":
                if (!value) return "Email is required"
                if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format"
                return ""
            case "password":
                if (!value) return "Password is required"
                if (value.length < 6) return "Password must be at least 6 characters"
                if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
                    return "Password must contain a letter and a number"
                return ""
            default:
                return ""
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
        if (name === "email") setUnverifiedEmail(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newErrors = {
            email: validateField("email", form.email),
            password: validateField("password", form.password)
        }
        setErrors(newErrors)
        if (Object.values(newErrors).some(err => err !== "")) return

        setLoading(true)
        try {
            const res = await login(form)
            toast.success(`Welcome back, ${res.fullName}!`)
            navigate('/')
        } catch (error) {
            const data = error.response?.data
            if (data?.unverified) {
                setUnverifiedEmail(form.email)
                return
            }
            toast.error(data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!unverifiedEmail || isResending) return
        setIsResending(true)
        try {
            await resendVerification(unverifiedEmail)
            toast.success("Verification email sent! Check your inbox.")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend. Try again.")
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white text-black">
            <div className="w-full max-w-md flex flex-col gap-6">

                <div className="text-center">
                    <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mb-2">
                        bitchat
                    </h1>
                    <p className="font-headline text-xs tracking-[0.2em] uppercase opacity-60">
                        login to continue
                    </p>
                </div>

                <div className="border-2 border-black overflow-hidden">
                    <div className="flex border-b-2 border-black">
                        <button
                            type='button'
                            className="flex-1 py-4 font-headline font-bold text-sm tracking-widest bg-black text-white uppercase">
                            login
                        </button>
                        <button
                            type='button'
                            onClick={() => navigate('/signup')}
                            className="flex-1 py-4 font-headline font-bold text-sm tracking-widest uppercase hover:bg-black hover:text-white">
                            signup
                        </button>
                    </div>

                    
                    {unverifiedEmail && (
                        <div className="border-b-2 border-black bg-gray-50 px-6 py-4 flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                                    mail_lock
                                </span>
                                <p className="font-mono text-xs leading-relaxed">
                                    <span className="font-black uppercase">Email not verified.</span>{" "}
                                    Check your inbox for the verification link, or request a new one below.
                                </p>
                            </div>
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="w-full border-2 border-black py-2 font-headline font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isResending ? "Sending…" : "Resend verification email"}
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="p-8 flex flex-col gap-6">

                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    email
                                </label>
                                <input
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="you@example.com"
                                    type="email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs">{errors.email}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    password
                                </label>
                                <input
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs">{errors.password}</p>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className="w-full border-2 border-black py-4 font-headline font-black tracking-widest uppercase bg-white text-black hover:bg-black hover:text-white">
                                {loading ? 'Signing in…' : 'Sign in'}
                            </button>

                            <div className="flex justify-between items-center pt-2">
                                <a className="font-headline text-[10px] uppercase underline underline-offset-4 hover:opacity-60 cursor-pointer">
                                    forgot password
                                </a>
                            </div>

                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Login