import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const AdminDashboard = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch dashboard data with better error handling and loading state
    const { 
        data: dashboardData, 
        isLoading: isDashboardLoading,
        error: dashboardError 
    } = useQuery({
        queryKey: ['adminDashboardData'],
        queryFn: () => api.get('/dashboard').then(res => res.data),
        refetchInterval: 30000, // Reduced from 10000 to 30000 (30 seconds)
        retry: 3,
        staleTime: 10000
    });

    // Fetch pending bookings with better error handling and loading state
    const { 
        data: pendingBookings, 
        isLoading: isBookingsLoading,
        error: bookingsError 
    } = useQuery({
        queryKey: ['pendingBookings'],
        queryFn: () => api.get('/booking/organization/pending').then(res => res.data),
        refetchInterval: 30000,
        retry: 3,
        staleTime: 10000
    });

    // Fetch pending users with better error handling and loading state
    const { 
        data: pendingUsers, 
        isLoading: isUsersLoading,
        error: usersError 
    } = useQuery({
        queryKey: ['pendingUsers'],
        queryFn: () => api.get('/user/pending-users').then(res => res.data),
        refetchInterval: 30000,
        retry: 3,
        staleTime: 10000
    });

    const handleApprove = async (bookingId) => {
        try {
            await api.post(`/booking/${bookingId}/approve`);
            setSuccess('Booking approved successfully!');
            // The query will automatically refetch due to the refetchInterval
        } catch (err) {
            setError('Failed to approve booking.');
            console.error(err);
        }
    };

    const handleReject = async (bookingId) => {
        try {
            await api.post(`/booking/${bookingId}/reject`);
            setSuccess('Booking rejected successfully!');
            // The query will automatically refetch due to the refetchInterval
        } catch (err) {
            setError('Failed to reject booking.');
            console.error(err);
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await api.put('/user/approve', { userId, approve: true, role: 'USER' });
            setSuccess('User approved successfully!');
            // The query will automatically refetch due to the refetchInterval
        } catch (err) {
            setError('Failed to approve user.');
            console.error(err);
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await api.put('/user/approve', { userId, approve: false, role: 'USER' });
            setSuccess('User rejected successfully!');
            // The query will automatically refetch due to the refetchInterval
        } catch (err) {
            setError('Failed to reject user.');
            console.error(err);
        }
    };

    // Show loading state for the entire dashboard
    if (isDashboardLoading || isBookingsLoading || isUsersLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-3 text-blue-200 text-sm">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    // Show error state if any of the queries failed
    if (dashboardError || bookingsError || usersError) {
        const errorMessage = dashboardError?.message || bookingsError?.message || usersError?.message || 'An error occurred while loading the dashboard';
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-3">
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 text-red-200 backdrop-blur-sm max-w-md text-center">
                    <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-sm font-medium mb-2">{errorMessage}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm"
                    >
                        Refresh Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
                <div className="text-blue-200 text-sm">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-2 sm:p-3 rounded-lg">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent mb-1">
                        Admin Dashboard
                    </h1>
                    <h2 className="text-xs sm:text-sm text-blue-200 mb-2">Organization: {dashboardData.organization}</h2>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                </div>

                {/* Alert Messages */}
                {error && (
                    <div className="mb-3 p-2 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                            <button onClick={() => setError('')} className="text-red-300 hover:text-red-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mb-3 p-2 bg-emerald-500/20 border border-emerald-400/50 rounded-lg text-emerald-200 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-sm">{success}</span>
                            </div>
                            <button onClick={() => setSuccess('')} className="text-emerald-300 hover:text-emerald-100">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-blue-300">Total Rooms</h3>
                                <p className="text-lg font-bold text-white">{dashboardData.totalRooms}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg p-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-blue-300">Active Bookings</h3>
                                <p className="text-lg font-bold text-white">{dashboardData.activeBookings}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-indigo-800/30 backdrop-blur-sm border border-indigo-600/30 rounded-lg p-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-blue-300">Pending Bookings</h3>
                                <p className="text-lg font-bold text-white">{dashboardData.pendingBookings}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-lg p-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-blue-300">Users in Organization</h3>
                                <p className="text-lg font-bold text-white">{dashboardData.totalUsersInOrg}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending User Approvals Table */}
                <div className="bg-indigo-800/20 backdrop-blur-sm border border-indigo-600/30 rounded-lg p-2 sm:p-4 shadow-2xl mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2 sm:gap-0">
                        <h2 className="text-xs sm:text-sm font-bold text-white">Pending User Approvals</h2>
                        {pendingUsers && pendingUsers.length > 0 && (
                            <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded">
                                <span className="text-purple-300 font-medium text-xs">{pendingUsers.length} pending</span>
                            </div>
                        )}
                    </div>
                    {!pendingUsers || pendingUsers.length === 0 ? (
                        <div className="text-center py-6">
                            <svg className="w-10 h-10 text-indigo-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-indigo-300 text-xs sm:text-sm">No pending user approvals</p>
                        </div>
                    ) : (
                        <div className="rounded border border-indigo-600/30 overflow-x-auto">
                            <table className="w-full min-w-[500px] table-fixed text-xs sm:text-sm">
                                <thead className="bg-gradient-to-r from-indigo-700/50 to-purple-700/50">
                                    <tr>
                                        <th className="py-1 px-2 text-left font-medium text-blue-200 uppercase tracking-wider border-b border-indigo-600/30 w-1/3">Name</th>
                                        <th className="py-1 px-2 text-left font-medium text-blue-200 uppercase tracking-wider border-b border-indigo-600/30 w-1/3">Email</th>
                                        <th className="py-1 px-2 text-center font-medium text-blue-200 uppercase tracking-wider border-b border-indigo-600/30 w-1/3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-indigo-600/30">
                                    {pendingUsers.map((user, index) => (
                                        <tr key={user.id} className={`hover:bg-indigo-700/30 transition-colors ${index % 2 === 0 ? 'bg-indigo-800/20' : 'bg-transparent'}`}>
                                            <td className="px-2 py-1 text-white font-medium truncate">{user.firstName} {user.lastName}</td>
                                            <td className="px-2 py-1 text-blue-200 truncate">{user.email}</td>
                                            <td className="px-2 py-1 text-center">
                                                <div className="flex justify-center space-x-1">
                                                    <button 
                                                        onClick={() => handleApproveUser(user.id)} 
                                                        className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded text-xs hover:from-emerald-600 hover:to-green-600 transition-all duration-200 shadow-lg"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectUser(user.id)} 
                                                        className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded text-xs hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;