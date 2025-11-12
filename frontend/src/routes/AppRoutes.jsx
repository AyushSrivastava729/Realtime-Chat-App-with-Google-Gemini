import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'// Importing necessary modules from react-router-dom
import Login from '../screens/Login';// Importing the Login component
import Register from '../screens/Register';// Importing the Register component
import Home from '../screens/Home';// Importing the Home component
import Project from '../screens/Project';
import UserAuth from '../auth/UserAuth';


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<UserAuth><Home /></UserAuth>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/project" element={<UserAuth><Project /></UserAuth>} />

      
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes