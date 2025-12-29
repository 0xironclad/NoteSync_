import { Navigate } from "react-router-dom"


function PrivateRoute({children} : {children: JSX.Element}) {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? children : <Navigate to="/login" />
}

export default PrivateRoute