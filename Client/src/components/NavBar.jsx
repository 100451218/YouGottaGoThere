import { Link } from "react-router-dom"
import { useAuth } from '../context/AuthContext'
import "../css/navbar.css"

function NavBar()
{
    const { currentUser, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
    }

    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">You have to go there</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/favorites" className="nav-link">Profile</Link>
            {currentUser && <button onClick={handleLogout}>Logout</button>}
        </div>
        </nav>
}

export default NavBar