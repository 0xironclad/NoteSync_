import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Pages/LogIn/Login"
import Register from "./Pages/SignUp/Register"
import DashboardContainer from "./components/DashboardContainer"
import PrivateRoute from "./components/PrivateRoute"
import Profile from "./components/Profile/Profile"
import Landing from "./Pages/Landing/Landing"

const routes = (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={
      <PrivateRoute>
        <DashboardContainer />
      </PrivateRoute>
    } />
    <Route path="/profile" element={<Profile />} />
  </Routes>
)

function App() {
  const style = {
    width: "100vw",
    minHeight: "100vh",
  }
  return (
    <Router>
      <div className="d-flex justify-content-center align-items-center" style={style}>
        {routes}
      </div>
    </Router>
  )
}

export default App
