import React from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {

    const navigate = useNavigate()

    return (

        <section className="grow flex flex-col items-center justify-center text-center px-4 py-24 border-b-2 border-black">
            <h1 className="font-headline font-black text-7xl md:text-9xl tracking-tighter uppercase mb-4 leading-none">
                BITCHAT
            </h1>
            <p className="font-headline text-xl md:text-2xl uppercase tracking-widest mb-12">
                chat. nothing else.
            </p>
            <button 
            onClick={() => navigate('/login')}
            className="instant-invert px-12 py-4 border-2 border-black bg-white text-black font-headline font-bold text-lg uppercase tracking-widest transition-none">
                [ enter ]
            </button>
        </section>

    )
}

export default Hero
