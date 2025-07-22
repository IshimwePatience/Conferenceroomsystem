import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import Meeting from  '../assets/images/meetingj.jpg'
import { DateTime } from 'luxon'; // If not installed, run: npm install luxon

const UserDashboard = ({ setIsLoggedIn }) => {
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
                setUserEmail(decodedToken.sub); // 'sub' is the standard JWT claim for subject (email in this case)
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        navigate('/login');
        setIsDropdownOpen(false);
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

    // Helper function to get an image URL from a room object
    const getRoomImageUrl = (room) => {
        if (room && room.images) {
            try {
                const imageArray = JSON.parse(room.images);
                if (Array.isArray(imageArray) && imageArray.length > 0) {
                    return getImageUrl(imageArray[0]);
                }
            } catch (e) {
                console.error('Failed to parse room images', e);
            }
        }
        return getImageUrl(null); // Return placeholder
    };

    // Helper function to get a room's image URL from a booking
    const getBookingImageUrl = (booking) => {
        if (!rooms || !booking) return getImageUrl(null);
        const room = rooms.find(r => r.id === booking.roomId);
        return getRoomImageUrl(room);
    };

    // Fetch dashboard data
    const { data: dashboardData, error: dashboardError } = useQuery({
        queryKey: ['dashboardData'],
        queryFn: () => api.get('/dashboard').then(res => res.data),
        refetchInterval: 10000 // Refetch every 10 seconds
    });

    // Fetch rooms
    const { data: rooms, error: roomsError } = useQuery({
        queryKey: ['rooms'],
        queryFn: () => api.get('/room/all').then(res => res.data),
        refetchInterval: 10000
    });

    // Fetch user's upcoming bookings
    const { data: myUpcomingBookings, error: myBookingsError } = useQuery({
        queryKey: ['myUpcomingBookings'],
        queryFn: () => api.get('/booking/upcoming').then(res => res.data.filter(booking => booking.isActive)),
        refetchInterval: 10000
    });

    // Fetch global upcoming bookings
    const { data: globalUpcomingBookings, error: globalBookingsError } = useQuery({
        queryKey: ['globalUpcomingBookings'],
        queryFn: () => api.get('/booking/all/upcoming').then(res => res.data.filter(booking => booking.isActive)),
        refetchInterval: 10000
    });

    // Fetch booking history
    const { data: myBookingHistory, error: historyError } = useQuery({
        queryKey: ['myBookingHistory'],
        queryFn: () => api.get('/booking').then(res => res.data.filter(booking => !booking.isActive || booking.status === 'COMPLETED')),
        refetchInterval: 10000
    });

    // Fetch ongoing meetings (global)
    const { data: ongoingMeetings, error: ongoingMeetingsError } = useQuery({
        queryKey: ['ongoingMeetings'],
        queryFn: () => api.get('/booking/ongoing').then(res => res.data),
        refetchInterval: 10000 // Refetch every 10 seconds
    });

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await api.post(`/booking/${bookingId}/cancel`);
                // The query will automatically refetch due to the refetchInterval
                alert("Booking cancelled successfully!");
            } catch (err) {
                alert('Failed to cancel booking: ' + (err.response?.data || err.message));
            }
        }
    };

    const getImageUrl = (url) => {
        if (!url) {
            // Return a generic placeholder for any invalid URL
            return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"%3E%3Crect width="100%25" height="100%25" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3ERoom%3C/text%3E%3C/svg%3E';
        }
        // If it's already a full URL, return it as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // Otherwise, assume it's a relative path and construct the full URL
        const path = url.startsWith('/') ? url.substring(1) : url;
        return `${import.meta.env.VITE_API_URL}/${path}`;
    };

    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150"%3E%3Crect width="100%25" height="100%25" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="20" fill="%236b7280" text-anchor="middle" dominant-baseline="middle"%3ERoom%3C/text%3E%3C/svg%3E';
    };

    // Helper to parse Kigali date with or without seconds
    function parseKigaliDate(str) {
        let dt = DateTime.fromFormat(str, "yyyy-MM-dd'T'HH:mm:ss", { zone: 'Africa/Kigali' });
        if (!dt.isValid) {
            dt = DateTime.fromFormat(str, "yyyy-MM-dd'T'HH:mm", { zone: 'Africa/Kigali' });
        }
        return dt;
    }

    // Combine all errors
    const error = dashboardError || roomsError || myBookingsError || globalBookingsError || historyError || ongoingMeetingsError;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
                <div className="bg-white border border-red-200 rounded-lg p-6 text-red-800 max-w-md text-center shadow-sm">
                    <svg className="w-8 h-8 text-red-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <p className="font-medium">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!dashboardData || !rooms || !myUpcomingBookings || !globalUpcomingBookings || !myBookingHistory || !ongoingMeetings) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-white text-lg">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
            <div className="container">
                {/* Top Navigation */}
                <header className="fixed top-0 left-0 right-0 bg-black/80 border-b border-blue-900 px-4 sm:px-6 py-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl sm:text-2xl font-bold text-white">ConferenceRoom</h1>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-4 sm:space-x-8">
                            <Link to="/dashboard" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors text-sm sm:text-base">
                                Dashboard
                            </Link>
                            <Link to="/bookings" className="text-white/70 font-medium hover:text-white transition-colors text-sm sm:text-base">
                                My Bookings
                            </Link>
                            <Link to="/rooms" className="text-white/70 font-medium hover:text-white transition-colors text-sm sm:text-base">
                                Meeting Rooms
                            </Link>
                            <Link to="/rooms" className="px-3 py-1 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-medium rounded-lg border border-cyan-400 hover:opacity-90 transition-colors text-sm sm:text-base shadow-md">
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
                                >
                                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">U</span>
                                    </div>
                                </button>
                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                                        <div className="px-4 py-2 text-sm text-blue-200 border-b border-gray-700">
                                            <p className="font-medium">User Account</p>
                                            <p className="text-gray-400">{userEmail}</p>
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
                                    <Link to="/dashboard" className="text-blue-200 font-medium hover:text-blue-400 transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link to="/bookings" className="text-gray-300 font-medium hover:text-white transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                        My Bookings
                                    </Link>
                                    <Link to="/rooms" className="text-gray-300 font-medium hover:text-white transition-colors text-base" onClick={() => setMobileMenuOpen(false)}>
                                        Meeting Rooms
                                    </Link>
                                    <Link to="/rooms" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg border border-blue-400 hover:opacity-90 transition-colors text-base shadow-md" onClick={() => setMobileMenuOpen(false)}>
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

                <main className="max-w-6xl mx-auto px-2 sm:px-4 py-2 pt-0">
                    {/* Hero Section */}
                    <section className="mb-12 relative min-h-[420px]">
                        {/* Background image and overlay */}
                        <div
                            className="absolute inset-0  z-0 min-h-[420px] bg-fixed bg-cover"
                            style={{ backgroundImage: `url(${Meeting})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-blue-900/80 min-h-[420px]"></div>
                        </div>
                        {/* Content above background */}
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center min-h-[420px]">
                            <div>
                                <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                                    Make your space work for your team
                                </h2>
                                <p className="text-base sm:text-xl text-white/80 mb-6">
                                    {dashboardData.message || 'Welcome to your dashboard'}
                                </p>
                                <Link 
                                    to="/rooms" 
                                    className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:opacity-90 transition-colors text-sm sm:text-base shadow-md"
                                >
                                    Book Now
                                </Link>
                            </div>
                            {/* Remove the separate image column */}
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 rounded-lg p-6 shadow-sm border border-blue-900">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-900/60 rounded-lg flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white/70">My Total Bookings</h3>
                                        <p className="text-2xl font-bold text-white">{dashboardData.myBookings}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-6 shadow-sm border border-blue-900">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-900/60 rounded-lg flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white/70">Upcoming Meetings</h3>
                                        <p className="text-2xl font-bold text-white">{dashboardData.upcomingMeetings}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-6 shadow-sm border border-blue-900">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-900/60 rounded-lg flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-white/70">Pending Bookings</h3>
                                        <p className="text-2xl font-bold text-white">{dashboardData.pendingBookings}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Upcoming Meetings */}
                    <section className="mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Upcoming Meetings</h2>
                        {!myUpcomingBookings || myUpcomingBookings.length === 0 ? (
                            <div className="bg-white/10 rounded-lg p-8 text-center border border-blue-900">
                                <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8h.01M3 7h18a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"></path>
                                </svg>
                                <p className="text-white text-lg">No upcoming meetings found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {myUpcomingBookings.map(booking => (
                                    <div key={booking.id} className="bg-white/10 rounded-lg shadow-sm border border-blue-900 overflow-hidden hover:shadow-md transition-shadow">
                                        <img
                                            className="w-full h-32 object-cover"
                                            src={getBookingImageUrl(booking)}
                                            alt={booking.roomName}
                                            onError={handleImageError}
                                        />
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-white truncate" title={booking.roomName}>{booking.roomName || 'React Review'}</h3>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012-2h4a1 1 0 110 2v6a1 1 0 11-2 0V9a1 1 0 10-2 0v4a1 1 0 11-2 0V7z" clipRule="evenodd"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm text-white/70">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>Location</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <div className="flex items-center mt-3">
                                                    <span className="text-xs text-white/50 mr-2">Organizer:</span>
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                                        <div className="w-6 h-6 bg-red-400 rounded-full -ml-1"></div>
                                                        <div className="w-6 h-6 bg-blue-400 rounded-full -ml-1"></div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full items-center ${
                                                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {booking.status}
                                                        {booking.status === 'PENDING' && (
                                                            <span className="ml-1 group relative cursor-pointer">
                                                                <svg className="w-3 h-3 text-yellow-800 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10A8 8 0 1..."/></svg>
                                                                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-black text-xs text-yellow-200 rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                                    Pending bookings require admin approval. You will be notified when approved or rejected.
                                                                </span>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Ongoing Meetings (Global) */}
                    <section className="mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Ongoing Meetings (Global)</h2>
                        {ongoingMeetingsError ? (
                            <div className="bg-white/10 rounded-lg p-8 text-center border border-blue-900">
                                <p className="text-white text-lg">Failed to load ongoing meetings.</p>
                            </div>
                        ) : !ongoingMeetings || ongoingMeetings.length === 0 ? (
                            <div className="bg-white/10 rounded-lg p-8 text-center border border-blue-900">
                                <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                <p className="text-white text-lg">No ongoing meetings found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {ongoingMeetings.map(booking => (
                                    <div key={booking.id} className="bg-white/10 rounded-lg shadow-sm border border-blue-900 overflow-hidden hover:shadow-md transition-shadow">
                                        <img
                                            className="w-full h-32 object-cover"
                                            src={getBookingImageUrl(booking)}
                                            alt={booking.roomName}
                                            onError={handleImageError}
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white mb-2 truncate" title={booking.roomName}>{booking.roomName}</h3>
                                            <div className="space-y-1 text-sm text-white/70">
                                                <p>Organization: {booking.organizationName}</p>
                                                <p>Booked by: {booking.userName}</p>
                                                <p>Purpose: {booking.purpose}</p>
                                                <p>Time: {parseKigaliDate(booking.startTime).toLocaleString(DateTime.DATETIME_MED)} - {parseKigaliDate(booking.endTime).toLocaleString(DateTime.DATETIME_MED)}</p>
                                                <div className="mt-2">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full items-center ${
                                                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* All Global Meetings */}
                    <section className="mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">All Upcoming Meetings (Global)</h2>
                        {!globalUpcomingBookings || globalUpcomingBookings.length === 0 ? (
                            <div className="bg-white/10 rounded-lg p-8 text-center border border-blue-900">
                                <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <p className="text-white text-lg">No global upcoming meetings found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {globalUpcomingBookings.slice(0, 6).map(booking => (
                                    <div key={booking.id} className="bg-white/10 rounded-lg shadow-sm border border-blue-900 overflow-hidden hover:shadow-md transition-shadow">
                                        <img
                                            className="w-full h-32 object-cover"
                                            src={getBookingImageUrl(booking)}
                                            alt={booking.roomName}
                                            onError={handleImageError}
                                        />
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white mb-2 truncate" title={booking.roomName}>{booking.roomName}</h3>
                                            <div className="space-y-1 text-sm text-white/70">
                                                <p>Organization: {booking.organizationName}</p>
                                                <p>Booked by: {booking.userName}</p>
                                                <p>Purpose: {booking.purpose}</p>
                                                <p>Time: {parseKigaliDate(booking.startTime).toLocaleString(DateTime.DATETIME_MED)} - {parseKigaliDate(booking.endTime).toLocaleString(DateTime.DATETIME_MED)}</p>
                                                <div className="mt-2">
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full items-center ${
                                                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {booking.status}
                                                        {booking.status === 'PENDING' && (
                                                            <span className="ml-1 group relative cursor-pointer">
                                                                <svg className="w-3 h-3 text-yellow-800 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10A8 8 0 11..."/></svg>
                                                                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-black text-xs text-yellow-200 rounded p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                                    Pending bookings require admin approval. You will be notified when approved or rejected.
                                                                </span>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Available Rooms */}
                    <section>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2 sm:gap-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Available Rooms</h2>
                            <span className="text-xs sm:text-sm text-white/60">{rooms?.length || 0} Rooms Found</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {rooms?.slice(0, 6).map((room) => {
                                return (
                                    <div key={room.id} className="bg-white/10 rounded-lg shadow-sm border border-blue-900 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="h-48 bg-gray-900/60">
                                            <img 
                                                src={getRoomImageUrl(room)} 
                                                alt={room.name} 
                                                className="w-full h-full object-cover"
                                                onError={handleImageError}
                                            />
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
                                            <div className="space-y-1 text-sm text-white/70 mb-4">
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>{room.location}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-xs text-white/50">Max Limit: {room.capacity}</span>
                                                </div>
                                            </div>
                                            <Link 
                                                to={`/booking/${room.id}`} 
                                                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-medium rounded-lg hover:opacity-90 transition-colors shadow-md"
                                            >
                                                Book Room
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {rooms && rooms.length > 6 && (
                            <div className="text-center mt-8">
                                <Link 
                                    to="/rooms" 
                                    className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-white/10 text-cyan-400 font-medium rounded-lg border border-cyan-400 hover:bg-white/20 transition-colors text-sm sm:text-base"
                                >
                                    View All Rooms
                                </Link>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;