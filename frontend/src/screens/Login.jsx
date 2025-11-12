import React, { useState,useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios'; // Importing the configured axios instance
import { UserContext } from '../context/user.context.jsx'; // Importing the useUser hook



const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setUser } = useContext(UserContext); // Accessing setUser from UserContext

    const navigate = useNavigate();

    function submitHandler(e) {
        e.preventDefault();// Prevent the default form submission behavior


        axios.post('/users/login', { email, password })
            .then((res) => {
                console.log(res.data); // Handle successful login, e.g., store token, redirect, etc.

                localStorage.setItem('token', res.data.token); // Store the token in localStorage

                setUser(res.data.user); // Update the user state in context

                navigate('/'); // Redirect to home page after successful login
            })
            .catch((err) => {
                console.error(err.response.data); // Handle error appropriately
            });
        // Handle successful login, e.g., store token, redirect, etc.       
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="bg-gray-900 shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-800">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign in to your account</h2>
                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none rounded w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <span className="text-gray-400">Don't have an account?</span>
                    <Link
                        to="/register"
                        className="text-blue-400 hover:underline font-medium ml-1"
                    >
                        Create one
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
