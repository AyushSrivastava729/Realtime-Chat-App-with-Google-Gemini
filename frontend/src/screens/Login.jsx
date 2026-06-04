import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function submitHandler(e) {
        e.preventDefault();
        axios.post('/users/login', { email, password })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                navigate('/');
            })
            .catch((err) => {
                console.error(err.response?.data || "Login failed");
            });
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden px-4">
            {/* Animated Background Orbs for 2026 Aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10">
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mb-4 shadow-lg shadow-blue-500/20">
                            <span className="text-white text-2xl font-bold">AI</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-gray-400 mt-2 text-sm">Enter your credentials to access the neural network</p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-5">
                        <div className="group">
                            <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="group">
                            <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-purple-400 transition-colors">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transform active:scale-[0.98] transition-all duration-200 mt-4"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            New to the interface? 
                            <Link
                                to="/register"
                                className="text-blue-400 hover:text-blue-300 font-semibold ml-2 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer Link for Mobile UX */}
                <p className="text-center text-gray-600 text-xs mt-8 tracking-widest uppercase">
                    &copy; 2026 AI Chat Protocol
                </p>
            </div>
        </div>
    );
};

export default Login;
