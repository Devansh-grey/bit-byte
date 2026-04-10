import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import Signup from './pages/Signup'
import { useAuthStore } from './store/AuthStore.js'
import PageLoader from './components/PageLoader.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'

const App = () => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore()
  useEffect(() => { checkAuth() }, [])

  if (isCheckingAuth) {
    return <PageLoader />
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-white text-black [font-family:var(--font-body)]">

        <Navbar />

        <main className="grow">
          <Routes>
            <Route path='/' element={authUser ? <ChatPage /> : <Home />} />
            <Route path='/login' element={!authUser ? <Login /> : <Navigate to={"/"} />} />
            <Route path='/signup' element={!authUser ? <Signup /> : <Navigate to={"/"} />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </ToastProvider>
  )
}

export default App