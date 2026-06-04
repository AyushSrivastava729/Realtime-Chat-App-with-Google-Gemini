import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context.jsx';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    function submitHandler(e) {
        e.preventDefault();
        axios.post('/users/register', { email, password })
            .then((res) => {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                navigate('/');
            })
            .catch((err) => {
                console.error(err.response?.data || "Registration failed");
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden px-4">
            {/* Animated Background Orbs for 2026 Aesthetic */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>

            <div className="z-10 w-full max-w-md">
                {/* Glassmorphism Card */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl rounded-3xl p-8 md:p-10">
                    
                    <header className="mb-10 text-center">
                        <div className="inline-block p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Join the Future</h2>
                        <p className="text-gray-400 mt-2 text-sm">Experience next-gen AI conversation</p>
                    </header>

                    <form onSubmit={submitHandler} className="space-y-5">
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:border-white/[0.2]"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:border-white/[0.2]"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transform transition-all active:scale-[0.98] focus:ring-4 focus:ring-blue-600/30"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
                        <p className="text-gray-400 text-sm">
                            Already a member? 
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold ml-2 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
                
                {/* Footer simple link */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; 2026 RealTime AI Chat. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Register;
