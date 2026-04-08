import React from 'react'

const Footer = () => {
    return (
        <footer className="w-full border-t-2 border-black bg-white">
            <div className="flex justify-between items-center px-6 py-6 w-full flex-wrap gap-4">

                {/* LEFT */}
                <div className="font-headline text-[10px] uppercase tracking-widest">
                    ©2026 bitchat 
                </div>

                {/* CENTER */}
                <div className="flex gap-8">
                    <a className="font-headline text-[10px] uppercase tracking-widest px-2 py-1 hover:bg-black hover:text-white">
                        privacy.txt
                    </a>
                    <a className="font-headline text-[10px] uppercase tracking-widest px-2 py-1 hover:bg-black hover:text-white">
                        terms.md
                    </a>
                    <a
                        href="https://github.com/Devansh-grey/Bitchat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-headline text-[10px] uppercase tracking-widest px-2 py-1 hover:bg-black hover:text-white">
                        source_code
                    </a>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black animate-pulse"></div>
                    <span className="font-headline text-[10px] uppercase tracking-widest">
                        network_secure
                    </span>
                </div>

            </div>
        </footer>
    )
}

export default Footer