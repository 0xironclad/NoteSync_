import "./Landing.css"
import MainNavbar from "./MainNavbar"
import { Link } from "react-router-dom"
function Landing() {
    const btnStyle = {
        backgroundColor: "rgb(0, 209, 205)",
        borderRadius: "5px",
        padding: "10px 20px",
        color: "white",
        fontSize: "1.2em",
        width: "fit-content",
        margin: "0 10%",
    }
    return (
        <div className="landing">
            <div className="content">
                <MainNavbar />
                <div className="container">
                    <p className="catchphrase">
                        Capture Your Thoughts, Anywhere
                    </p>
                    <br />
                    <p style={{ fontSize: "1.2em", color: "white" }}>
                        Capture, Edit, and Organize Your Ideas Effortlessly! With our intuitive note-taking app, you can jot down thoughts, refine them, and delete clutter—all in one place. Your creativity, simplified.
                    </p>
                    <br />
                    {/* get started button */}
                    <br />
                    <div className="start d-flex justify-content-center align-items-center">
                        <button style={btnStyle}>
                            <Link to="/register">Get Started</Link>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Landing