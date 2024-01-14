import { useContext } from "react"
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext"

const PrivateRoute = ({ children }) => {
    var { id } = useContext(UserContext);
    console.log("HELLOOOOOOO", id);
    return (
        <>
            {id == null ? <Navigate to='/register' /> : children}

        </>
    )
}

export default PrivateRoute;