import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function RegisterForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const { register } = useAuth()
    const navigate = useNavigate()

    const registerSubmit = async (event) => {
        event.preventDefault();

        const result = await register(username, password)
        if (result.success) {
            navigate('/')
        } else {
            alert(result.error)
        }
    }

    return (
        <div className="register-form-container">
            <form autoComplete="off" onSubmit={registerSubmit}>
                <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterForm;