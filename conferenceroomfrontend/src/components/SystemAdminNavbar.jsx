import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

const SystemAdminNavbar = ({ setIsLoggedIn, activePath }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserEmail(decodedToken.sub);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        navigate('/login');
        setIsDropdownOpen(false);
    };

    const getLinkClass = (path) => {
        return `flex items-center px-6 py-3 mt-2 rounded-lg transition-all duration-200 ${
            activePath === path 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
        }`;
    };

    return (
        <>
            {/* Sidebar for desktop/tablet */}
            <div className="hidden md:flex flex-col w-64 h-full bg-black border-gray-700 flex-shrink-0">
                {/* Header */}
                <div className="px-6 py-8">
                    <div className="flex items-center space-x-3">
                        {/* <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">C</span>
                        </div> */}
                        <div>
                            <h2 className="text-xl font-bold text-white">ConferenceRoom</h2>
                            <p className="text-sm text-blue-200">System Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col flex-1 px-4 overflow-y-auto scrollbar-none">
                    <nav className="space-y-1">
                        <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                            </svg>
                            Dashboard
                        </Link>
                        <Link to="/organizations" className={getLinkClass('/organizations')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                            </svg>
                            Manage Organizations
                        </Link>
                        <Link to="/manage-users" className={getLinkClass('/manage-users')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            Manage All Users
                        </Link>
                        <Link to="/approval" className={getLinkClass('/approval')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            Approve Users
                        </Link>
                        <Link to="/bookings" className={getLinkClass('/bookings')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                            </svg>
                            All Bookings
                        </Link>
                        <Link to="/rooms" className={getLinkClass('/rooms')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                            </svg>
                            All Rooms
                        </Link>
                        <Link to="/reports" className={getLinkClass('/reports')}>
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Reports
                        </Link>
                    </nav>

                    {/* User Profile & Dropdown */}
                    <div className="mt-auto pb-8">
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-10 h-10 bg-transparent rounded-full flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full overflow-hidden flex-none flex items-center justify-center aspect-square">
                                    <span className="text-white font-medium text-sm">S</span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">System Admin</p>
                                            <p className="text-gray-400 text-xs truncate">{userEmail}</p>
                                        </div>
                                        <svg className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 001-1h10.586l-2.293-2.293a1 1 0 010-1.414A1 1 0 0114.707 1L18 4.293a1 1 0 010 1.414L14.707 9a1 1 0 01-1.414-1.414L15.586 5H4a3 3 0 00-3 3v9a3 3 0 003 3h12a3 3 0 003-3V4a1 1 0 00-1-1H3z" clipRule="evenodd"/>
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hamburger for mobile */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen(true)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex">
                    <div className="w-64 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 h-full flex flex-col p-6 animate-slide-in-left relative">
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 text-gray-300 hover:text-white"
                            aria-label="Close menu"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-8 mt-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">C</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">ConferenceRoom</h2>
                                <p className="text-sm text-blue-200">System Admin</p>
                            </div>
                        </div>
                        {/* Navigation */}
                        <nav className="flex flex-col space-y-1">
                            <Link to="/dashboard" className={getLinkClass('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <Link to="/organizations" className={getLinkClass('/organizations')} onClick={() => setMobileMenuOpen(false)}>
                                Manage Organizations
                            </Link>
                            <Link to="/manage-users" className={getLinkClass('/manage-users')} onClick={() => setMobileMenuOpen(false)}>
                                Manage All Users
                            </Link>
                            <Link to="/approval" className={getLinkClass('/approval')} onClick={() => setMobileMenuOpen(false)}>
                                Approve Users
                            </Link>
                            <Link to="/bookings" className={getLinkClass('/bookings')} onClick={() => setMobileMenuOpen(false)}>
                                All Bookings
                            </Link>
                            <Link to="/rooms" className={getLinkClass('/rooms')} onClick={() => setMobileMenuOpen(false)}>
                                All Rooms
                            </Link>
                            <Link to="/reports" className={getLinkClass('/reports')} onClick={() => setMobileMenuOpen(false)}>
                                Reports
                            </Link>
                        </nav>
                        {/* Logout Button */}
                        <div className="mt-auto pb-8">
                            <button 
                                onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                                className="flex items-center w-full px-6 py-3 mt-4 text-gray-300 rounded-lg hover:text-white transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 001-1h10.586l-2.293-2.293a1 1 0 010-1.414A1 1 0 0114.707 1L18 4.293a1 1 0 010 1.414L14.707 9a1 1 0 01-1.414-1.414L15.586 5H4a3 3 0 00-3 3v9a3 3 0 003 3h12a3 3 0 003-3V4a1 1 0 00-1-1H3z" clipRule="evenodd"/>
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                    {/* Click outside to close */}
                    <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
                </div>
            )}
        </>
    );
};

export default SystemAdminNavbar;