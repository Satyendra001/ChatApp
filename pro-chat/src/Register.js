import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { Login_URL, Register_URL } from "./utility/Urls";
import { APICall } from "./utility/utils";


const Register = () => {

    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [registerOrLogin, setRegisterOrLogin] = useState('register');
    const { setLoggedUser, setId, id } = useContext(UserContext);

    console.log("Inside register ", id);

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Inside submit call")
        var url = registerOrLogin === 'register' ? Register_URL : Login_URL;
        APICall({
            method: 'post',
            url: url,
            data: { username, password },
            successCallBack: (response) => {
                setLoggedUser(response.data.username);
                setId(response.data.id);
                navigate('/home');
            },
            errorCallBack: (response) => {
                console.log(response);
            }
        });
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="mx-auto w-64" onSubmit={handleSubmit}>
                <input type="text" value={username}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="username"
                    className="block w-full p-2 rounded-sm border" />
                <input type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="password"
                    className="block w-full mt-2 p-2 rounded-sm border" />
                <button className="bg-blue-500 w-full p-2 mt-2 text-white block rounded-sm" type="submit">
                    {registerOrLogin === 'register' ? 'Register' : 'Login'}
                </button>
                <div>
                    {registerOrLogin === 'register' && (
                        <div>
                            Already a member?
                            <button className="hover:cursor-pointer" onClick={() => setRegisterOrLogin('login')}>
                                Login Here
                            </button>
                        </div>
                    )}

                    {registerOrLogin === 'login' && (
                        <div>
                            Don't have account?
                            <button className="hover:cursor-pointer" onClick={() => setRegisterOrLogin('register')}>
                                Register Here
                            </button>
                        </div>
                    )}
                </div>
            </form >
        </div >
    )
}

export default Register;