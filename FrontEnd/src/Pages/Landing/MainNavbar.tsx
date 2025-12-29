import NoteSyncLogo from "../../assets/NoteSyncLogo.png"
import { Link } from "react-router-dom"
import "./Landing.css"
function MainNavbar() {
    return (
        <nav className="navbar pt-4 pb-4">
            <div className="container d-flex justify-content-between align-items-center">
                <Link to="/">
                    <img src={NoteSyncLogo} alt="Notesync Logo" className="logo" width={150} />
                </Link>
                <div className="pages d-flex gap-2">
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/features" className="nav-link">Features</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </div>
                <div className="auth d-flex gap-2">
                    <button className="nav-link">
                        <Link to="/login">Login</Link>
                    </button>
                    <button className="nav-link">
                        <Link to="/register">Signup</Link>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default MainNavbar