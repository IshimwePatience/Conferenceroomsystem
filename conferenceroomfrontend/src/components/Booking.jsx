import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import { FaSearch } from 'react-icons/fa';
import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';

const PAGE_SIZE = 8;

const getUserRoleAndOrg = () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            return { role: decoded.role, organizationId: decoded.organizationId };
        } catch (e) {
            return { role: null, organizationId: null };
        }
    }
    return { role: null, organizationId: null };
};

const Booking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');

    // New states for search, filter, sort, pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { role: userRole, organizationId: userOrgId } = getUserRoleAndOrg();

    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 900);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter, sortOrder]);

    // Fetch room details if roomId exists
    const { data: room, error: roomError } = useQuery({
        queryKey: ['room', roomId],
        queryFn: () => api.get(`/room/${roomId}`).then(res => res.data),
        enabled: !!roomId,
        refetchInterval: 10000
    });

    // Fetch all bookings if no roomId
    const { data: bookings, error: bookingsError } = useQuery({
        queryKey: ['bookings'],
        queryFn: () => api.get('/booking').then(res => res.data),
        enabled: !roomId,
        refetchInterval: 10000
    });

    // Combine query errors
    const queryError = roomError || bookingsError;

    // Filtering, sorting, and pagination for all bookings
    let filteredBookings = bookings || [];
    if (debouncedSearchTerm) {
        filteredBookings = filteredBookings.filter(b =>
            (b.purpose && b.purpose.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
            (b.roomName && b.roomName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
            (b.organizationName && b.organizationName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        );
    }
    if (statusFilter !== 'ALL') {
        filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
    }
    filteredBookings = filteredBookings.sort((a, b) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    useEffect(() => {
        setTotalPages(Math.ceil(filteredBookings.length / PAGE_SIZE) || 1);
    }, [filteredBookings]);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const paginatedBookings = filteredBookings.slice(startIdx, startIdx + PAGE_SIZE);

    const handleBooking = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccess('');
        if (!startTime || !endTime || !purpose) {
            setFormError('All fields are required.');
            return;
        }
        // Debug: log a booking object to inspect its structure
        if (bookings && bookings.length > 0) {
            console.log('Sample booking object:', bookings[0]);
        }
        // Prevent double pending booking for the same user and overlapping time
        const token = localStorage.getItem('token');
        let userId = null;
        if (token) {
            try {
                const decoded = jwtDecode(token);
                userId = decoded.id || decoded.userId || decoded.sub; // Try common fields
            } catch (e) {}
        }
        if (userId && bookings && Array.isArray(bookings)) {
            const newStart = new Date(startTime);
            const newEnd = new Date(endTime);
            // Try to match userId to booking object fields
            const userBookings = bookings.filter(b => 
                (b.userId === userId || b.user_id === userId || b.user === userId || b.user === userId?.toString() || b.userEmail === userId)
            );
            const hasPendingOverlap = userBookings.some(b => {
                if (b.status !== 'PENDING') return false;
                const existingStart = new Date(b.startTime);
                const existingEnd = new Date(b.endTime);
                // Overlap if start < existingEnd and end > existingStart
                return newStart < existingEnd && newEnd > existingStart;
            });
            if (hasPendingOverlap) {
                setFormError('You already have a pending booking that overlaps with this time.');
                return;
            }
        }
        try {
            await api.post('/booking/create', {
                roomId,
                startTime,
                endTime,
                purpose,
            });
            setSuccess('Booking created successfully!');
            setTimeout(() => navigate('/bookings'), 2000);
        } catch (err) {
            let errorMessage = 'An unexpected error occurred.';
            if (err.response?.data) {
                if (typeof err.response.data === 'string' && err.response.data.length < 100) {
                    // If the response data is a short string, use it directly.
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    // If it's an object with a message property, use that.
                    errorMessage = err.response.data.message;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            if (errorMessage.includes("You have already booked")) {
                setFormError("You have already booked this room for the selected time.");
            } else if (errorMessage.includes("already booked from")) {
                try {
                    // Try to extract details from the error response if available
                    let bookingDetails = null;
                    // Check for new backend error structure (custom exception fields)
                    if (err.response && err.response.data && typeof err.response.data === 'object') {
                        const d = err.response.data;
                        if (d.startTime && d.endTime && d.userName && d.userEmail && d.organizationName) {
                            const fromTime = new Date(d.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: 'short', day: 'numeric' });
                            const toTime = new Date(d.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: 'short', day: 'numeric' });
                            setFormError(`Sorry, this room is booked from ${fromTime} to ${toTime}.\nBooked by: ${d.userName} (${d.userEmail}) from ${d.organizationName}.`);
                            return;
                        }
                        // Legacy: check for nested conflictingBooking object
                        if (d.conflictingBooking) {
                            bookingDetails = d.conflictingBooking;
                        }
                    }
                    if (bookingDetails) {
                        const fromTime = new Date(bookingDetails.startTime).toLocaleString();
                        const toTime = new Date(bookingDetails.endTime).toLocaleString();
                        setFormError(`Sorry, this room is booked from ${fromTime} to ${toTime}.\nBooked by: ${bookingDetails.userName} (${bookingDetails.userEmail}) from ${bookingDetails.organizationName}.`);
                    } else {
                        // Fallback: try to parse from error message string
                        const parts = errorMessage.split(' from ')[1].split(' to ');
                        const fromTime = new Date(parts[0]).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: 'short', day: 'numeric' });
                        const toTime = new Date(parts[1]).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: true, year: 'numeric', month: 'short', day: 'numeric' });
                        setFormError(`Sorry, this room is booked from ${fromTime} to ${toTime}. Please choose a different time or room.`);
                    }
                } catch (parseError) {
                    setFormError('This room is currently unavailable at the selected time. Please choose a different time or room.');
                }
            } else {
                setFormError(`Failed to create booking: ${errorMessage}`);
            }
            console.error(err);
        }
    };

    // Approve/Reject handlers
    const handleApprove = async (bookingId) => {
        setActionError(''); setActionSuccess('');
        try {
            await api.post(`/booking/${bookingId}/approve`);
            setActionSuccess('Booking approved successfully.');
            setTimeout(() => setActionSuccess(''), 3000);
        } catch (err) {
            setActionError('Failed to approve booking.');
            setTimeout(() => setActionError(''), 3000);
        }
    };
    const handleReject = async (bookingId) => {
        setActionError(''); setActionSuccess('');
        try {
            await api.post(`/booking/${bookingId}/reject`);
            setActionSuccess('Booking rejected successfully.');
            setTimeout(() => setActionSuccess(''), 3000);
        } catch (err) {
            setActionError('Failed to reject booking.');
            setTimeout(() => setActionError(''), 3000);
        }
    };

    // Add options for status and sort order
    const statusOptions = [
        { value: 'ALL', label: 'All Statuses' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
    ];
    const sortOptions = [
        { value: 'desc', label: 'Newest First' },
        { value: 'asc', label: 'Oldest First' },
    ];

    if (queryError) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 max-w-md">
                    <p className="font-medium text-center">{queryError.message}</p>
                </div>
            </div>
        );
    }

    // If no roomId, show all bookings in table format
    if (!roomId) {
        return (
            <div className="min-h-screen  text-gray-500 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-500">My Bookings</h1>
                        <p className="text-gray-400">Track and manage your room reservations.</p>
                    </div>

                    {/* Search, Filter, Sort Controls */}
                    <div className="mb-6 flex flex-wrap gap-4 items-center">
                        <div className="relative flex-grow md:flex-grow-0">
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        {/* Status Dropdown */}
                        <Listbox value={statusFilter} onChange={setStatusFilter} as={Fragment}>
                            <div className="relative w-full sm:w-auto">
                                <Listbox.Button className="w-full sm:w-auto text-sm py-1 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {statusOptions.find(o => o.value === statusFilter)?.label}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 w-full sm:w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {statusOptions.map(option => (
                                        <Listbox.Option key={option.value} value={option.value} as={Fragment}>
                                            {({ active, selected }) => (
                                                <li className={`cursor-pointer select-none relative py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-200'} ${selected ? 'font-semibold' : ''}`}>{option.label}</li>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                        {/* Sort Dropdown */}
                        <Listbox value={sortOrder} onChange={setSortOrder} as={Fragment}>
                            <div className="relative w-full sm:w-auto">
                                <Listbox.Button className="w-full sm:w-auto text-sm py-1 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {sortOptions.find(o => o.value === sortOrder)?.label}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 w-full sm:w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {sortOptions.map(option => (
                                        <Listbox.Option key={option.value} value={option.value} as={Fragment}>
                                            {({ active, selected }) => (
                                                <li className={`cursor-pointer select-none relative py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-200'} ${selected ? 'font-semibold' : ''}`}>{option.label}</li>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>

                    {/* Show action error/success */}
                    {(actionError || actionSuccess) && (
                        <div className={`mb-4 px-4 py-2 rounded-lg font-semibold text-center transition-all duration-300 shadow-lg ${actionSuccess ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                            {actionError || actionSuccess}
                        </div>
                    )}
                    {/* Bookings Table */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                        {!paginatedBookings || paginatedBookings.length === 0 ? (
                            <div className="text-center py-16">
                                <h3 className="text-xl font-bold text-white mb-2">No Bookings Found</h3>
                                <p className="text-gray-400">Your search and filter criteria did not match any bookings.</p>
                                {userRole === 'USER' && (
                                    <button 
                                        onClick={() => navigate('/rooms')}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Browse Rooms to Book
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                <table className="w-full min-w-[600px] divide-y divide-gray-700 text-xs sm:text-sm">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Room</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Organization</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Time</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">End Time</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Purpose</th>
                                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {paginatedBookings.map(booking => {
                                            // Force show for org admins
                                            let canApproveReject = false;
                                            if (userRole === 'SYSTEM_ADMIN') {
                                                canApproveReject = booking.status === 'PENDING';
                                            } else if (userRole === 'ADMIN') {
                                                canApproveReject = booking.status === 'PENDING';
                                            }
                                            return (
                                                <tr key={booking.id} className="hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{booking.roomName}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{booking.organizationName}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(booking.startTime).toLocaleString()}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(booking.endTime).toLocaleString()}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 truncate max-w-xs">{booking.purpose}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${
                                                            booking.status === 'APPROVED' ? 'bg-green-500/20 text-green-300' :
                                                            booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                                                            booking.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-300' :
                                                            'bg-gray-600/50 text-gray-300'
                                                        }`}>
                                                            {booking.status}
                                                            {booking.status === 'PENDING' && (
                                                                <span className="ml-1 group relative cursor-pointer">
                                                                    <svg className="w-3 h-3 text-yellow-300 inline-block" fill="currentColor" viewBox="0 0 20 20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z" /></svg>
                                                                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 max-w-[180px] w-auto bg-black text-xs text-yellow-200 rounded px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-normal break-words text-center pointer-events-none">
                                                                        Pending bookings require admin approval. You will be notified when approved or rejected.
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </span>
                                                        {canApproveReject && (
                                                            <div className="flex space-x-2 mt-2">
                                                                <button onClick={() => handleApprove(booking.id)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Approve</button>
                                                                <button onClick={() => handleReject(booking.id)} className="px-2 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-xs">Reject</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-8 space-x-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If roomId exists, show booking form
    if (!room) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-400">Loading room details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  text-gray-500 p-2 sm:p-6">
            <div className="max-w-lg mx-auto w-full">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-500">Book Room: {room.name}</h1>
                    <p className="text-gray-400">Organization: {room.organizationName}</p>
                </div>

                {/* Alert Messages */}
                {formError && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg">{formError}</div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg">
                        Booking request sent! Your booking is now <b>pending approval</b> by an administrator.
                    </div>
                )}

                {/* Booking Form */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <form onSubmit={handleBooking} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                                <input
                                    type="datetime-local"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="purpose" className="block text-sm font-medium text-gray-300 mb-1">Purpose</label>
                            <textarea
                                id="purpose"
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Describe the purpose of your booking..."
                            ></textarea>
                        </div>
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                Book Now
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Booking;