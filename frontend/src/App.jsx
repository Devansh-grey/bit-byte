import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import { Route,Routes } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import Signup from './pages/Signup'

const App = () => {
  const [token,setToken] = useState()

  return (
    <div className="min-h-screen flex flex-col bg-white text-black [font-family:var(--font-body)]">

      <Navbar />

      <main className="grow">
        <Routes>
          <Route path='/' element={token?<ChatPage/>:<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
        </Routes>
      </main>

      <Footer />

    </div>
  )
}

export default App