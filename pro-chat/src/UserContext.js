import { createContext, useEffect, useState } from "react";
import { User_Profile } from "./utility/Urls";
import { APICall } from "./utility/utils";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [loggedUser, setLoggedUser] = useState(null);
    const [id, setId] = useState(null);
    const navigate = useNavigate();

    const checkProfile = () => APICall({
        url: User_Profile,
        method: 'get',
        successCallBack: (response) => {
            setLoggedUser(response.data.username);
            setId(response.data.userId);
            // navigate('/home');
            console.log("Done");
        },
        errorCallBack: (response) => {
            // navigate('/register');
            console.log("error");
        }

    });
    useEffect(() => {
        checkProfile();

    }, []);
    console.log("user-> COntext==> ", id);
    return (
        <UserContext.Provider value={{ loggedUser, setLoggedUser, id, setId }}>
            {children}
        </UserContext.Provider>
    )
}

