import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import PrivateRoute from './PrivateRoute'
import Register from './Register'
import { UserContextProvider } from './UserContext.js'

const URLS = () => {
    return (
        <BrowserRouter>
            <UserContextProvider>
                <Routes>
                    <Route path='/register' element={<Register />} />
                    <Route path='/home' element={<Home />} />
                </Routes>
            </UserContextProvider>
        </BrowserRouter>
    )
}

export default URLS;