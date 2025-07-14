import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Navbar = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <div className="flex flex-col w-64 h-full px-4 py-8 bg-white border-r">
            <h2 className="text-3xl font-semibold text-gray-800">ConferenceRoom</h2>
            <div className="flex flex-col justify-between flex-1 mt-6">
                <nav>
                    {token ? (
                        <>
                            <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md">Dashboard</Link>
                            <Link to="/bookings" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Bookings</Link>
                            <Link to="/organizations" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Organizations</Link>
                            <Link to="/approval" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Approve Users</Link>
                            <button onClick={handleLogout} className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Logout</button>
                        </>
                    ) : (
                        <>
                            {/* These links are now redundant as App.jsx handles redirection to login for unauthenticated users */}
                            {/* <Link to="/login" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md">Login</Link> */}
                            {/* <Link to="/register" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Register</Link> */}
                            {/* <Link to="/register-system-admin" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">Register System Admin</Link> */}
                        </>
                    )}
                </nav>
            </div>
        </div>
    );
};

export default Navbar;