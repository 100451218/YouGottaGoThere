import { useEffect } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import Home from './components/Home'
import Profile from './components/Profile'
import LoginPage from './pages/LoginPage'

import "./css/App.css"

function App() {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Si el usuario está autenticado y está en /login, redirigir al home
    if (!loading && currentUser && window.location.pathname === '/login') {
      navigate('/')
    }
  }, [currentUser, loading, navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div>
        <NavBar />
        <main className='main-content'>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path='/' element={<Home />} />
            <Route path='/favorites' element={<Profile />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App
