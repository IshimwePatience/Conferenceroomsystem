import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getSystemAdminRegistrationEnabled, setSystemAdminRegistrationEnabled } from '../utils/api';
import DataTable from './DataTable';
import EditUserModal from './EditUserModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FaEdit, FaTrash } from 'react-icons/fa';

const SystemAdminDashboard = () => {
    const queryClient = useQueryClient();

    const [newOrganization, setNewOrganization] = useState({
        name: '',
        organizationCode: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        logo: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [globalSearchResults, setGlobalSearchResults] = useState([]);
    const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
    const [globalSearchError, setGlobalSearchError] = useState(null);
    const searchTimeout = useRef();

    // State for Edit User Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    // Pagination states for different tables
    const [allUsersCurrentPage, setAllUsersCurrentPage] = useState(1);
    const [allUsersTotalPages, setAllUsersTotalPages] = useState(1);
    const [allUsersSearchTerm, setAllUsersSearchTerm] = useState('');
    const [roomsCurrentPage, setRoomsCurrentPage] = useState(1);
    const [roomsTotalPages, setRoomsTotalPages] = useState(1);
    const [roomsSearchTerm, setRoomsSearchTerm] = useState('');
    const [bookingsCurrentPage, setBookingsCurrentPage] = useState(1);
    const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
    const [bookingsSearchTerm, setBookingsSearchTerm] = useState('');

    // State for Edit Organization Modal
    const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
    const [organizationToEdit, setOrganizationToEdit] = useState(null);

    // New state for registration toggle
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(false);
    const [isToggleLoading, setIsToggleLoading] = useState(false);

    // Fetch initial registration status
    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            try {
                const enabled = await getSystemAdminRegistrationEnabled();
                setIsRegistrationEnabled(enabled);
            } catch (err) {
                console.error('Error fetching registration status:', err);
            }
        };
        fetchRegistrationStatus();
    }, []);

    // Handle toggle of registration status
    const handleRegistrationToggle = async () => {
        setIsToggleLoading(true);
        try {
            await setSystemAdminRegistrationEnabled(!isRegistrationEnabled);
            setIsRegistrationEnabled(!isRegistrationEnabled);
            setSuccess(`System admin registration ${!isRegistrationEnabled ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            setError('Failed to update registration status');
            console.error('Error updating registration status:', err);
        } finally {
            setIsToggleLoading(false);
        }
    };

    // Global Search Results (custom logic for users and organizations only)
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!globalSearchTerm.trim()) {
            setGlobalSearchResults([]);
            setGlobalSearchError(null);
            return;
        }
        searchTimeout.current = setTimeout(() => {
            const fetchGlobalSearch = async () => {
                setGlobalSearchLoading(true);
                setGlobalSearchError(null);
                try {
                    // Fetch users
                    const usersPromise = api.get('/user/all', {
                        params: { search: globalSearchTerm, page: 0, size: 5 },
                    }).then(res => (res.data.content || []).map(u => ({
                        id: u.id,
                        name: `${u.firstName} ${u.lastName}`,
                        email: u.email,
                        type: 'user',
                    })));
                    // Fetch organizations
                    const orgsPromise = api.get('/organization', {
                        params: { search: globalSearchTerm },
                    }).then(res => (res.data || []).map(o => ({
                        id: o.id,
                        name: o.name,
                        email: o.email,
                        type: 'organization',
                    })));
                    const [users, orgs] = await Promise.all([usersPromise, orgsPromise]);
                    setGlobalSearchResults([...users, ...orgs]);
                } catch (err) {
                    setGlobalSearchError('Error searching users/organizations');
                    setGlobalSearchResults([]);
                } finally {
                    setGlobalSearchLoading(false);
                }
            };
            fetchGlobalSearch();
        }, 900);
        return () => clearTimeout(searchTimeout.current);
    }, [globalSearchTerm]);

    // --- Data Fetching using useQuery --- 

    // Dashboard Stats
    const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['systemAdminDashboardStats'],
        queryFn: () => api.get('/dashboard').then(res => res.data),
        refetchInterval: 10000,
    });

    // Pending Users
    const { data: pendingUsers, isLoading: pendingUsersLoading, error: pendingUsersError } = useQuery({
        queryKey: ['pendingUsers'],
        queryFn: () => api.get('/user/pending-users').then(res => res.data),
        refetchInterval: 10000,
    });

    // All Users (with pagination and search)
    const { data: allUsersData, isLoading: allUsersLoading, error: allUsersError } = useQuery({
        queryKey: ['allUsers', allUsersCurrentPage, allUsersSearchTerm],
        queryFn: () => api.get('/user/all', {
            params: {
                page: allUsersCurrentPage - 1,
                size: 10,
                search: allUsersSearchTerm,
            },
        }).then(res => res.data),
        onSuccess: (data) => {
            setAllUsersTotalPages(data.totalPages || 1);
        },
        keepPreviousData: true,
    });
    const allUsers = allUsersData?.content || [];

    // Organizations
    const { data: organizations, isLoading: orgsLoading, error: orgsError } = useQuery({
        queryKey: ['organizations'],
        queryFn: () => api.get('/organization').then(res => res.data),
        refetchInterval: 10000,
    });

    // Rooms (simplified pagination for now, will refactor if backend supports it)
    const { data: rooms, isLoading: roomsLoading, error: roomsErrorQuery } = useQuery({
        queryKey: ['rooms', roomsCurrentPage, roomsSearchTerm],
        queryFn: () => api.get('/room/all').then(res => res.data),
        onSuccess: (data) => {
            setRoomsTotalPages(Math.ceil(data.length / 10) || 1);
        },
        keepPreviousData: true,
        refetchInterval: 10000,
    });
    const paginatedRooms = rooms ? rooms.slice((roomsCurrentPage - 1) * 10, roomsCurrentPage * 10) : [];

    // Bookings (simplified pagination for now, will refactor if backend supports it)
    const { data: bookings, isLoading: bookingsLoading, error: bookingsErrorQuery } = useQuery({
        queryKey: ['bookings', bookingsCurrentPage, bookingsSearchTerm],
        queryFn: () => api.get('/booking').then(res => res.data),
        onSuccess: (data) => {
            setBookingsTotalPages(Math.ceil(data.length / 10) || 1);
        },
        keepPreviousData: true,
        refetchInterval: 10000,
    });
    const paginatedBookings = bookings ? bookings.slice((bookingsCurrentPage - 1) * 10, bookingsCurrentPage * 10) : [];

    // Combine all errors for display
    const combinedError = statsError || pendingUsersError || allUsersError || orgsError || roomsErrorQuery || bookingsErrorQuery || globalSearchError;

    // Define columns for the All Users table
    const allUsersColumns = [
        { key: 'profilePictureUrl', header: 'Profile Picture' },
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'email', header: 'Email' },
        { key: 'organizationName', header: 'Organization' },
        { key: 'role', header: 'Role' },
        { key: 'isActive', header: 'Status' },
        { key: 'lastLoginAt', header: 'Last Login' }
    ];

    // Define columns for the Rooms table
    const roomsColumns = [
        { key: 'images', header: 'Images' },
        { key: 'name', header: 'Room Name' },
        { key: 'capacity', header: 'Capacity' },
        { key: 'location', header: 'Location' },
        { key: 'floor', header: 'Floor' },
        { key: 'amenities', header: 'Amenities' },
        { key: 'equipment', header: 'Equipment' },
        { key: 'isActive', header: 'Status' }
    ];

    // Define columns for the Bookings table
    const bookingsColumns = [
        { key: 'roomName', header: 'Room' },
        { key: 'userName', header: 'Booked By' },
        { key: 'startTime', header: 'Start Time' },
        { key: 'endTime', header: 'End Time' },
        { key: 'purpose', header: 'Purpose' },
        { key: 'attendeeCount', header: 'Attendees' },
        { key: 'status', header: 'Status' }
    ];

    // Add organization columns definition
    const organizationColumns = [
        { key: 'logoUrl', header: 'Logo' },
        { key: 'name', header: 'Name' },
        { key: 'organizationCode', header: 'Code' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'address', header: 'Address' },
        { key: 'totalUsers', header: 'Total Users' },
        { key: 'totalRooms', header: 'Total Rooms' }
    ];

    const handleAllUsersPageChange = (page) => {
        setAllUsersCurrentPage(page);
    };

    const handleRoomsPageChange = (page) => {
        setRoomsCurrentPage(page);
    };

    const handleBookingsPageChange = (page) => {
        setBookingsCurrentPage(page);
    };

    const handleAllUsersSearch = (searchTerm) => {
        setAllUsersSearchTerm(searchTerm);
        setAllUsersCurrentPage(1);
    };

    const handleRoomsSearch = (searchTerm) => {
        setRoomsSearchTerm(searchTerm);
        setRoomsCurrentPage(1);
    };

    const handleBookingsSearch = (searchTerm) => {
        setBookingsSearchTerm(searchTerm);
        setBookingsCurrentPage(1);
    };

    const handleEditUser = (userId) => {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            setUserToEdit(user);
            setIsEditModalOpen(true);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUserSuccess = () => {
        setSuccess('User updated successfully!');
        queryClient.invalidateQueries(['allUsers']);
        queryClient.invalidateQueries(['systemAdminDashboardStats']);
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/user/${userId}`);
                setSuccess('User deleted successfully!');
                queryClient.invalidateQueries(['allUsers']);
                queryClient.invalidateQueries(['systemAdminDashboardStats']);
            } catch (err) {
                setError('Failed to delete user.');
                console.error(err);
            }
        }
    };

    const handleOrganizationChange = (e) => {
        const { name, value } = e.target;
        setNewOrganization(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewOrganization(prev => ({
                ...prev,
                logo: file
            }));
        }
    };

    const handleCreateOrganization = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newOrganization.name || !newOrganization.organizationCode || !newOrganization.email) {
            setError('Organization name, code, and email are required.');
            return;
        }
        try {
            const formData = new FormData();
            Object.keys(newOrganization).forEach(key => {
                if (key === 'logo' && newOrganization[key]) {
                    formData.append(key, newOrganization[key]);
                } else if (key !== 'logo') {
                    formData.append(key, newOrganization[key]);
                }
            });

            await api.post('/organization/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Organization created successfully!');
            setNewOrganization({
                name: '',
                organizationCode: '',
                description: '',
                address: '',
                phone: '',
                email: '',
                logo: null
            });
            queryClient.invalidateQueries(['organizations']);
            queryClient.invalidateQueries(['systemAdminDashboardStats']);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create organization.');
            console.error(err);
        }
    };

    const handleApproval = async (userId, approvalStatus) => {
        try {
            await api.put('/user/approve', { userId, approvalStatus });
            setSuccess(`User ${approvalStatus.toLowerCase()}d successfully.`);
            queryClient.invalidateQueries(['pendingUsers']);
            queryClient.invalidateQueries(['allUsers']);
            queryClient.invalidateQueries(['systemAdminDashboardStats']);
        } catch (err) {
            setError('Failed to update user approval status.');
            console.error(err);
        }
    };

    const handleEditOrganization = (organizationId) => {
        const org = organizations.find(o => o.id === organizationId);
        if (org) {
            setOrganizationToEdit(org);
            setIsEditOrgModalOpen(true);
        }
    };

    const handleCloseEditOrgModal = () => {
        setIsEditOrgModalOpen(false);
        setOrganizationToEdit(null);
    };

    const handleUpdateOrganization = async (updatedOrgData) => {
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            Object.keys(updatedOrgData).forEach(key => {
                if (key === 'logo' && updatedOrgData[key] instanceof File) {
                    formData.append(key, updatedOrgData[key]);
                } else if (key !== 'logo') {
                    formData.append(key, updatedOrgData[key]);
                }
            });

            await api.put(`/organization/${updatedOrgData.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Organization updated successfully!');
            queryClient.invalidateQueries(['organizations']);
            queryClient.invalidateQueries(['systemAdminDashboardStats']);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update organization.');
            console.error(err);
        }
    };

    const handleDeleteOrganization = async (organizationId) => {
        if (window.confirm("Are you sure you want to delete this organization? This will also delete associated rooms and users.")) {
            try {
                await api.delete(`/organization/${organizationId}`);
                setSuccess('Organization deleted successfully!');
                queryClient.invalidateQueries(['organizations']);
                queryClient.invalidateQueries(['systemAdminDashboardStats']);
                queryClient.invalidateQueries(['allUsers']);
                queryClient.invalidateQueries(['rooms']);
                queryClient.invalidateQueries(['bookings']);
            } catch (err) {
                setError('Failed to delete organization.');
                console.error(err);
            }
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            if (url.includes('placeholder') || url.includes('acmecorp.com')) {
                return url;
            }
            return `${import.meta.env.VITE_API_URL}/api/images/proxy?url=${encodeURIComponent(url)}`;
        } else if (url.startsWith('/')) {
            return `${import.meta.env.VITE_API_URL}${url}`;
        }
        return 'https://via.placeholder.com/50';
    };

    const handleImageError = (e) => {
        console.error("Image failed to load:", {
            src: e.target.src,
            organization: e.target.dataset.organizationName,
            originalUrl: e.target.dataset.originalUrl,
            processedUrl: e.target.src
        });
        e.target.src = 'https://via.placeholder.com/50';
    };

    // Loading state handling
    const isLoading = statsLoading || pendingUsersLoading || allUsersLoading || orgsLoading || roomsLoading || bookingsLoading || globalSearchLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading System Admin Dashboard...</div>
            </div>
        );
    }

    if (combinedError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-red-200">
                    Error fetching dashboard data: {combinedError.message}
                </div>
            </div>
        );
    }

    if (!dashboardStats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-xl">No dashboard data available.</div>
            </div>
        );
    }

    // Data for charts
    const mostUsedRoomsData = dashboardStats.mostUsedRooms?.map(room => ({ name: room[0], bookings: room[1] })) || [];
    const usersByOrgData = dashboardStats.totalUsersInOrg?.map(item => ({ name: item.name, value: item.count })) || [];

    // Prepare data for Organizations DataTable
    const organizationsTableData = organizations?.map(org => ({
        id: org.id,
        name: org.name,
        organizationCode: org.organizationCode,
        description: org.description,
        address: org.address,
        phone: org.phone,
        email: org.email,
        logoUrl: getImageUrl(org.logoUrl),
        totalUsers: org.totalUsers,
        totalRooms: org.totalRooms,
        originalLogoUrl: org.logoUrl
    })) || [];

    // Prepare data for All Users DataTable
    const allUsersTableData = allUsers.map(user => ({
        id: user.id,
        profilePictureUrl: user.profilePictureUrl ? getImageUrl(user.profilePictureUrl) : null,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizationName: user.organization?.name || 'N/A',
        role: user.role,
        isActive: user.isActive ? 'Active' : 'Inactive',
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A',
    }));

    // Prepare data for Rooms DataTable
    const roomsTableData = paginatedRooms.map(room => ({
        id: room.id,
        images: room.images ? JSON.parse(room.images) : [],
        name: room.name,
        capacity: room.capacity,
        location: room.location,
        floor: room.floor,
        amenities: room.amenities,
        equipment: room.equipment,
        isActive: room.isActive ? 'Active' : 'Inactive',
    }));

    // Prepare data for Bookings DataTable
    const bookingsTableData = paginatedBookings.map(booking => ({
        id: booking.id,
        roomName: booking.roomName,
        userName: booking.userName,
        startTime: new Date(booking.startTime).toLocaleString(),
        endTime: new Date(booking.endTime).toLocaleString(),
        purpose: booking.purpose,
        attendeeCount: booking.attendeeCount,
        status: booking.status,
    }));

    return (
        <div className="min-h-screen rounded-xl">
            {/* Compact Global Search Bar */}
            <div className="sticky mt-0 backdrop-blur-sm border-b border-gray-700 px-2 sm:px-3 py-1">
                <div className="max-w-7xl mx-auto">
                    <div className="relative max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Quick search....."
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 pl-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Content */}
            <div className="p-2 sm:p-3">
                <div className="max-w-7xl mx-auto">
                    {/* Compact Header */}
                    <div className="mb-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">System Admin Dashboard</h1>
                        <p className="text-blue-200 text-xs sm:text-sm">Welcome back! Here's what's happening with your system today.</p>
                    </div>

                    {/* Compact Alert Messages */}
                    {error && (
                        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            Error: {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                            Success: {success}
                        </div>
                    )}

                    {/* Global Search Results Section */}
                    {(globalSearchTerm || '').trim() !== '' && globalSearchTerm !== null && (
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 sm:p-4 mb-4 border border-gray-700 shadow-lg">
                            <h2 className="text-base sm:text-lg font-bold text-white mb-3">Global Search Results for "{globalSearchTerm}"</h2>
                            {(() => {
                                const filteredResults = Array.isArray(globalSearchResults)
                                    ? globalSearchResults.filter(result => {
                                        const term = globalSearchTerm.trim().toLowerCase();
                                        return (
                                            (result.name && result.name.toLowerCase().includes(term)) ||
                                            (result.email && result.email.toLowerCase().includes(term))
                                        );
                                    })
                                    : [];
                                if (globalSearchLoading) {
                                    return <p className="text-blue-300 text-sm">Searching...</p>;
                                } else if (filteredResults.length > 0) {
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {filteredResults.map((result, index) => (
                                                <div key={index} className="bg-gray-700/50 rounded-lg p-3 flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        {result.type === 'user' && <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
                                                        {result.type === 'organization' && <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/></svg>}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-gray-300 capitalize">{result.type || 'Unknown'}</p>
                                                        <p className="text-sm font-bold text-white">{result.name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400">Email: {result.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                } else {
                                    return <p className="text-gray-400 text-sm">No results found.</p>;
                                }
                            })()}
                        </div>
                    )}

                    {(globalSearchTerm || '').trim() === '' && (
                        <>
                            {/* Compact Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-blue-100 text-xs font-medium">Total Users</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.totalUsers}</p>
                                        </div>
                                        <div className="text-blue-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-orange-100 text-xs font-medium">Pending</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.pendingApprovals}</p>
                                        </div>
                                        <div className="text-orange-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-green-100 text-xs font-medium">Organizations</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.totalOrganizations}</p>
                                        </div>
                                        <div className="text-green-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-purple-100 text-xs font-medium">Rooms</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.totalRooms}</p>
                                        </div>
                                        <div className="text-purple-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-indigo-100 text-xs font-medium">Bookings</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.totalBookings}</p>
                                        </div>
                                        <div className="text-indigo-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 rounded-lg p-3 shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-cyan-100 text-xs font-medium">Active</h3>
                                            <p className="text-xl font-bold text-white">{dashboardStats.activeBookings}</p>
                                        </div>
                                        <div className="text-cyan-200">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compact Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                {/* Compact Most Used Rooms Chart */}
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                                    <h2 className="text-lg font-bold text-white mb-3">Most Used Rooms</h2>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart data={mostUsedRoomsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                                            <YAxis stroke="#9CA3AF" fontSize={10} />
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: '#1F2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#F3F4F6',
                                                    fontSize: '12px'
                                                }} 
                                            />
                                            <Legend />
                                            <Bar dataKey="bookings" fill="url(#colorGradient)" />
                                            <defs>
                                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Compact Users by Organization Chart */}
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                                    <h2 className="text-lg font-bold text-white mb-3">Users by Organization</h2>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={usersByOrgData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={60}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {usersByOrgData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{
                                                    backgroundColor: '#1F2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px',
                                                    color: '#F3F4F6',
                                                    fontSize: '12px'
                                                }} 
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pending User Approvals */}
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-700">
                                <h2 className="text-lg font-bold text-white mb-3">Pending User Approvals</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Organization</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {pendingUsers && pendingUsers.length > 0 ? (
                                                pendingUsers.map(user => (
                                                    <tr key={user.id} className="hover:bg-gray-700/50">
                                                        <td className="px-3 py-2 whitespace-nowrap text-white text-sm">{user.firstName} {user.lastName}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 text-sm">{user.email}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 text-sm">{user.role}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 text-sm">{user.organization?.name || user.organizationName || 'N/A'}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap space-x-1">
                                                            <button 
                                                                onClick={() => handleApproval(user.id, 'APPROVED')} 
                                                                className="px-2 py-1 bg-green-600 text-white font-medium rounded text-xs hover:bg-green-700 transition-colors"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleApproval(user.id, 'REJECTED')} 
                                                                className="px-2 py-1 bg-red-600 text-white font-medium rounded text-xs hover:bg-red-700 transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-3 py-4 text-center text-gray-400 text-sm">No pending user approvals.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                                                   </>
                    )}

                    {/* Edit User Modal */}
                    {isEditModalOpen && userToEdit && organizations && (
                        <EditUserModal
                            user={userToEdit}
                            organizations={organizations}
                            isOpen={isEditModalOpen}
                            onClose={handleCloseEditModal}
                            onSaveSuccess={handleSaveUserSuccess}
                        />
                    )}

                    {/* Add this section at the top of your dashboard */}
                    <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-4 rounded-lg shadow-lg">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white">System Admin Registration</h3>
                                <p className="text-white/70 text-xs sm:text-sm">
                                    {isRegistrationEnabled 
                                        ? "New system admins can currently register" 
                                        : "New system admin registration is disabled"}
                                </p>
                            </div>
                            <button
                                onClick={handleRegistrationToggle}
                                disabled={isToggleLoading}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isRegistrationEnabled
                                        ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                                        : 'bg-green-500/20 text-green-200 hover:bg-green-500/30'
                                } ${isToggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isToggleLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    isRegistrationEnabled ? 'Disable Registration' : 'Enable Registration'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemAdminDashboard;