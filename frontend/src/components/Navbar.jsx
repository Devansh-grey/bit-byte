import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/AuthStore.js';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const Navbar = () => {

  const navigate = useNavigate()
  const { authUser, logout } = useAuthStore()

  return (
    <div className="flex justify-between items-center border-b-2 border-black px-6 py-4">

      {/* LEFT */}
      <div
        onClick={() => navigate('/')}
        className="text-2xl font-black italic font-headline hover:cursor-pointer uppercase tracking-tighter">
        BITCHAT
      </div>

      {/* CENTER */}
      <nav className="hidden md:flex gap-8 items-center">
        <a className="font-headline uppercase tracking-tighter hover:bg-black hover:text-white hover:cursor-pointer px-2 py-1">
          FEATURES
        </a>
        <a className="font-headline uppercase tracking-tighter hover:bg-black hover:text-white hover:cursor-pointer  px-2 py-1">
          LOG PROTOCOL
        </a>
        <a className="font-headline uppercase tracking-tighter hover:bg-black hover:text-white hover:cursor-pointer  px-2 py-1">
          MANUAL
        </a>
      </nav>

      {/* RIGHT */}
      <div className="border-l-2 border-black pl-6">
        {authUser ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="font-body uppercase tracking-tighter font-bold hover:bg-black hover:text-white px-4 py-2">
                {authUser.fullName}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              // sideOffset={15}
              className="bg-white border border-black shadow-md"
            >
              <DropdownMenu.Item
                onClick={logout}
                className="px-4 py-2 text-sm hover:bg-black hover:text-white cursor-pointer"
              >
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="font-headline uppercase tracking-tighter font-bold hover:bg-black hover:text-white px-4 py-2"
          >
            Login
          </button>
        )}
      </div>

    </div>
  );
};


export default Navbar
