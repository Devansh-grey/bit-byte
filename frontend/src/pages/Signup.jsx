import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore.js'
import { useToast } from "../components/ToastProvider"


const PendingVerification = ({ email, onResend, isResending }) => (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white text-black">
        <div className="w-full max-w-md flex flex-col gap-6">
            <div className="text-center">
                <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mb-2">
                    bitchat
                </h1>
            </div>

            <div className="border-2 border-black">
                {/* Header stripe */}
                <div className="bg-black text-white px-8 py-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
                    <div>
                        <p className="font-headline font-black text-sm uppercase tracking-widest leading-none">
                            Check your inbox
                        </p>
                        <p className="font-mono text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                            Verification required
                        </p>
                    </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                    <p className="font-mono text-sm leading-relaxed">
                        We sent a verification link to{" "}
                        <span className="font-black">{email}</span>.
                        Click the link in the email to activate your account.
                    </p>

                    <div className="border-2 border-black p-4 bg-gray-50 font-mono text-xs text-gray-600 uppercase tracking-wide leading-relaxed">
                        <p>&#x2022; Check your spam folder if you don't see it.</p>
                        <p className="mt-1">&#x2022; The link expires in 24 hours.</p>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={onResend}
                            disabled={isResending}
                            className="w-full border-2 border-black py-3 font-headline font-bold text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isResending ? "Sending…" : "Resend verification email"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const Signup = () => {

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const [pendingEmail, setPendingEmail] = useState(null)
    const [isResending, setIsResending] = useState(false)

    const { signup,resendVerification } = useAuthStore()
    const navigate = useNavigate()

    const toast = useToast()

    const validateField = (name, value) => {

        switch (name) {

            case "fullName":
                if (!value.trim()) return "Name is required"
                return ""

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

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        const error = validateField(name, value)

        setErrors(prev => ({
            ...prev,
            [name]: error
        }))
    }


    const handleSubmit = async (e) => {

        e.preventDefault()

        const newErrors = {
            fullName: validateField("fullName", form.fullName),
            email: validateField("email", form.email),
            password: validateField("password", form.password)
        }

        setErrors(newErrors)

        if (Object.values(newErrors).some(err => err !== "")) {
            return
        }

        setLoading(true)

        try {
            await signup(form)
            setPendingEmail(form.email)
            toast.success("Account created!")
        } catch (error) {
            const data = error.response?.data
            if (data?.unverified) {
                setPendingEmail(form.email)
                toast.error("Account already exists. Please verify your email.")
                return
            }
            toast.error(data?.message || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if(!pendingEmail || isResending){
            setIsResending(true)
        }
        try{
            await resendVerification(pendingEmail)
            toast.success("Verification email resent! Check your inbox.")
        }catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend. Try again.")
        } finally {
            setIsResending(false)
        }
    }

    if (pendingEmail) {
        return (
            <PendingVerification
                email={pendingEmail}
                onResend={handleResend}
                isResending={isResending}
            />
        )
    }


    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white text-black">

            <div className="w-full max-w-md flex flex-col gap-6">

                <div className="text-center">
                    <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mb-2">
                        bitchat
                    </h1>
                    <p className="font-headline text-xs tracking-[0.2em] uppercase opacity-60">
                        Sign up to continue
                    </p>
                </div>

                <div className="border-2 border-black overflow-hidden">

                    <div className="flex border-b-2 border-black">
                        <button
                            onClick={() => navigate('/login')}
                            className=" flex-1 py-4 font-headline font-bold text-sm tracking-widest uppercase hover:bg-black hover:text-white">
                            login
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="flex-1 py-4 font-headline font-bold text-sm tracking-widest bg-black text-white uppercase">
                            signup
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-8 flex flex-col gap-6">

                            {/* FULL NAME */}
                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    Full Name
                                </label>

                                <input
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="John Doe"
                                    type="text"
                                />

                                {errors.fullName && (
                                    <p className="text-red-500 text-xs">{errors.fullName}</p>
                                )}
                            </div>

                            {/* EMAIL */}
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

                            {/* PASSWORD */}
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

                            <div className="pt-2">
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className="w-full border-2 border-black py-4 font-headline font-black tracking-widest uppercase bg-white text-black hover:bg-black hover:text-white">
                                    {loading ? 'Creating account…' : 'Create account'}
                                </button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
        </div>
    )
}

export default Signup