import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore.js'

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const {login} = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {

    e.preventDefault()

    if (!form.email || !form.password) {
        alert("Fill in all fields")
        return
    }


    setLoading(true)
    try {
        await login(form)
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
                        login to continue
                    </p>
                </div>

                {/* BOX */}
                <div className="border-2 border-black overflow-hidden">

                    {/* TABS */}
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

                    {/* FORM */}
                    <form onSubmit={handleSubmit} >
                        <div className="p-8 flex flex-col gap-6">

                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    email

                                </label>
                                <input
                                    value={form.email}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="you@example.com"
                                    type="email"
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="font-headline text-[10px] font-bold uppercase tracking-wider">
                                    password
                                </label>
                                <input
                                    value={form.password}
                                    className="border-2 border-black w-full p-3 font-body text-sm placeholder:opacity-30 rounded-none outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                />
                            </div>

                            
                                <button 
                                type='submit'
                                disabled={loading}
                                className="w-full border-2 border-black py-4 font-headline font-black tracking-widest uppercase bg-white text-black hover:bg-black hover:text-white">
                                    {loading ? 'Signing in…' : 'Sign in'}
                                </button>
                            

                            <div className="flex justify-between items-center pt-2">
                                <a className="font-headline text-[10px] uppercase underline underline-offset-4 hover:opacity-60">
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