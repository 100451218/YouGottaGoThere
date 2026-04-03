import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in on app start
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:8800/users/check', {
                    method: 'GET',
                    credentials: 'include'
                })
                if (response.ok) {
                    const user = await response.json()
                    setCurrentUser(user)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (username, password) => {
        //Given username and password, call backend login
        const response = await fetch('http://localhost:8800/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        })
        if (response.ok) {
            const user = await response.json()
            setCurrentUser(user)
            return { success: true, user }
        } else {
            const error = await response.json()
            return { success: false, error }
        }
    }

    const register = async (username, password) => {
        // Given username and passord, call for backend register
        console.log("register", username, password)
        const response = await fetch('http://localhost:8800/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        if (response.ok) {
            // After register, auto login
            return await login(username, password)
        } else {
            console.log("Error en register")
            const error = await response.json()
            console.log(error)
            return { success: false, error }
        }
    }

    const logout = async () => {
        await fetch('http://localhost:8800/users/logout', {
            method: 'POST',
            credentials: 'include'
        })
        setCurrentUser(null)
    }

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}