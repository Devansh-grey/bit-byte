import React from 'react'

const Action = () => {
    return (
        <section className="py-24 px-6 flex flex-col items-center border-b-2 border-black">
            <div className="max-w-4xl w-full border-2 border-black p-12 flex flex-col md:flex-row items-center gap-12">

                {/* TEXT */}
                <div className="grow">
                    <h2 className="font-headline font-bold text-3xl uppercase mb-4 italic">
                        start chatting
                    </h2>
                    <p className="font-body text-sm uppercase tracking-wider">
                        simple, fast messaging. no setup, no friction.
                    </p>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-4 w-full md:w-auto">

                    <a
                        href="#"
                        className="text-center bg-black text-white px-8 py-3 border-2 border-black font-headline font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-black"
                    >
                        download app
                    </a>

                    <a
                        href="https://github.com/Devansh-grey/Bitchat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center bg-white text-black px-8 py-3 border-2 border-black font-headline font-bold uppercase tracking-widest text-sm hover:bg-black hover:text-white"
                    >
                        source code
                    </a>

                </div>
            </div>
        </section>
    )
}

export default Action