import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore.js'

const Signup = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const {signup} = useAuthStore()
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
                
    e.preventDefault()

    if (!form.email || !form.password ||!form.fullName) {
        alert("Fill in all fields")
        return
    }

    setLoading(true)
    try {
        await signup(form)
        navigate('/')
    } catch (error) {
        console.error(error)
    } finally {
        setLoading(false)
    }
}

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white text-black">

            <div className="w-full max-w-md flex flex-col gap-6">

                {/* TITLE */}
                <div className="text-center">
                    <h1 className="font-headline text-5xl font-black italic tracking-tighter uppercase mb-2">
                        bitchat
                    </h1>
                    <p className="font-headline text-xs tracking-[0.2em] uppercase opacity-60">
                        Sign up to continue
                    </p>
                </div>

                {/* BOX */}
                <div className="border-2 border-black overflow-hidden">

                    {/* TABS */}
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



                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    Full Name

                                </label>
                                <input
                                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="John Doe"
                                    type="text"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    email

                                </label>
                                <input
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="you@example.com"
                                    type="email"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    password
                                </label>
                                <input
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                type='submit'
                                disabled = {loading}
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
