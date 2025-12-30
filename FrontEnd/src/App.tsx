import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./Pages/LogIn/Login"
import Register from "./Pages/SignUp/Register"
import DashboardContainer from "./components/DashboardContainer"
import PrivateRoute from "./components/PrivateRoute"
import Profile from "./components/Profile/Profile"
import Landing from "./Pages/Landing/Landing"
import { Toaster } from "./components/ui/sonner"

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
  return (
    <Router>
      <div className="w-screen min-h-screen">
        {routes}
      </div>
      <Toaster position="bottom-right" richColors />
    </Router>
  )
}

export default App
