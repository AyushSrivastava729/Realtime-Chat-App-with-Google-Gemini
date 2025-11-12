import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'// Importing necessary modules from react-router-dom
import AppRoutes from './routes/AppRoutes.jsx'
import { UserProvider } from './context/user.context.jsx';  // Importing the UserProvider
const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}

export default App
