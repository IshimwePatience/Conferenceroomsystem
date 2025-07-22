import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

const UserLayoutWrapper = ({ children, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userEmail, setUserEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserEmail(decodedToken.sub);
                // Extract username from email (part before @)
                const extractedUsername = decodedToken.sub.split('@')[0];
                // Extract first name (part before first dot, or whole username if no dot)
                const extractedFirstName = extractedUsername.split('.')[0];
                setFirstName(extractedFirstName);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    // Function to get first two letters of first name
    const getFirstTwoLetters = (name) => {
        if (!name) return 'US';
        return name.substring(0, 2).toUpperCase();
    };

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
        const isActive = location.pathname === path || (path === '/rooms' && location.pathname.startsWith('/booking'));
        return isActive 
            ? "text-teal-600 font-medium hover:text-teal-700 transition-colors"
            : "text-gray-600 font-medium hover:text-gray-900 transition-colors";
    };

    const userInitials = getFirstTwoLetters(firstName);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
            {/* Fixed Top Navigation */}
            <header className="fixed top-0 left-0 right-0 bg-black/80 border-b border-blue-900 px-4 sm:px-6 py-4 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <h1 className="text-2xl font-bold text-white">ConferenceRoom</h1>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'text-cyan-400 font-medium transition-colors' : 'text-white/70 font-medium hover:text-white transition-colors'}>
                            Dashboard
                        </Link>
                        <Link to="/bookings" className={location.pathname === '/bookings' ? 'text-cyan-400 font-medium transition-colors' : 'text-white/70 font-medium hover:text-white transition-colors'}>
                            My Bookings
                        </Link>
                        <Link to="/rooms" className={location.pathname === '/rooms' ? 'text-cyan-400 font-medium transition-colors' : 'text-white/70 font-medium hover:text-white transition-colors'}>
                            Meeting Rooms
                        </Link>
                        <Link to="/rooms" className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-medium rounded-lg border border-cyan-400 hover:opacity-90 transition-colors">
                            Book Now
                        </Link>
                    </nav>

                    {/* Hamburger for mobile */}
                    <button
                        className="md:hidden p-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Open menu"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* User Profile & Dropdown (desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden hover:ring-2 hover:ring-teal-500 transition-all"
                                aria-label="Open user menu"
                            >
                                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">{userInitials}</span>
                                </div>
                            </button>
                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                                    <div className="px-4 py-2 text-sm text-blue-200 border-b border-gray-700">
                                        <p className="font-medium">User Account</p>
                                        <p className="text-gray-400 truncate">{userEmail}</p>
                                        <p className="text-xs text-blue-200 mt-1">Name: {firstName}</p>
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

                {/* Mobile menu overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex md:hidden">
                        <div className="w-64 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 h-full flex flex-col p-6 animate-slide-in-left relative text-white">
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
                            {/* Navigation */}
                            <nav className="flex flex-col space-y-4 mt-8">
                                <Link to="/dashboard" className="text-cyan-400 font-medium hover:text-white transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link to="/bookings" className="text-white/70 font-medium hover:text-white transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                    My Bookings
                                </Link>
                                <Link to="/rooms" className="text-white/70 font-medium hover:text-white transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                    Meeting Rooms
                                </Link>
                                <Link to="/rooms" className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-medium rounded-lg border border-cyan-400 hover:opacity-90 transition-colors text-base shadow-md" onClick={() => setMobileMenuOpen(false)}>
                                    Book Now
                                </Link>
                                <button 
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center mt-4 border-t border-gray-700 pt-4"
                                >
                                    <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 001-1h10.586l-2.293-2.293a1 1 0 010-1.414A1 1 0 0114.707 1L18 4.293a1 1 0 010 1.414L14.707 9a1 1 0 01-1.414-1.414L15.586 5H4a3 3 0 00-3 3v9a3 3 0 003 3h12a3 3 0 003-3V4a1 1 0 00-1-1H3z" clipRule="evenodd"/>
                                    </svg>
                                    Logout
                                </button>
                            </nav>
                        </div>
                        {/* Click outside to close */}
                        <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
                    </div>
                )}
            </header>

            {/* Main Content with Top Padding */}
            <main className="max-w-7xl mx-auto px-6 py-8 pt-24">
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default UserLayoutWrapper;