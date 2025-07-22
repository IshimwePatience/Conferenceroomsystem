import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaSearch } from 'react-icons/fa';
import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';

const PAGE_SIZE = 8;

const roleOptions = [
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
];

const Approval = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const response = await api.get('/user/pending-users');
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch pending users.');
            }
        };
        fetchPendingUsers();
    }, []);

    // Filter and paginate users
    const filteredUsers = debouncedSearchTerm
        ? users.filter(user =>
            (user.firstName + ' ' + user.lastName).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.organizationName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        : users;
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const paginatedUsers = filteredUsers.slice(startIdx, startIdx + PAGE_SIZE);
    useEffect(() => {
        setTotalPages(Math.ceil(filteredUsers.length / PAGE_SIZE) || 1);
    }, [filteredUsers]);

    const handleApprove = async (userId, role) => {
        try {
            await api.put(`/user/approve`, { userId, approve: true, role });
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError('Failed to approve user.');
        }
    };

    const handleReject = async (userId) => {
        try {
            await api.put(`/user/approve`, { userId, approve: false });
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            setError('Failed to reject user.');
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-3">
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 max-w-md">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  text-gray-200 p-6">
            <div className="container">
                {/* Header Section */}
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        User Approvals
                    </h2>
                    <p className="text-gray-400">Review and approve pending user registrations</p>
                </div>

                {/* Search Input */}
                <div className="mb-6 flex justify-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search by name, email, or organization..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    {paginatedUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="mb-3">
                                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">All Caught Up!</h3>
                            <p className="text-gray-400 text-sm">No pending approvals at the moment.</p>
                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded">
                                <svg className="w-4 h-4 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-blue-300 font-medium text-xs">System is up to date</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Pending Registrations</h3>
                                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded">
                                    <span className="text-blue-300 font-medium text-sm">{filteredUsers.length} pending</span>
                                </div>
                            </div>
                            {paginatedUsers.map((user, index) => (
                                <div 
                                    key={user.id} 
                                    className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">
                                                    {user.firstName} {user.lastName}
                                                </h4>
                                                <p className="text-gray-300 flex items-center text-xs">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                                    </svg>
                                                    {user.email}
                                                </p>
                                                {user.organizationName && (
                                                    <p className="text-gray-400 text-xs flex items-center mt-1">
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4z" clipRule="evenodd"/>
                                                        </svg>
                                                        {user.organizationName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role Selector and Action Buttons */}
                                        <div className="flex items-center space-x-2">
                                            <Listbox value={user.role || 'USER'} onChange={role => {
                                                setUsers(prevUsers =>
                                                    prevUsers.map(u =>
                                                        u.id === user.id ? { ...u, role } : u
                                                    )
                                                );
                                            }} as={Fragment}>
                                                <div className="relative w-28">
                                                    <Listbox.Button className="w-full text-xs sm:text-sm py-1 px-2 bg-gray-600 border border-gray-500 rounded-md text-white flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-blue-500">
                                                        {roleOptions.find(o => o.value === (user.role || 'USER'))?.label}
                                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                    </Listbox.Button>
                                                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        {roleOptions.map(option => (
                                                            <Listbox.Option key={option.value} value={option.value} as={Fragment}>
                                                                {({ active, selected }) => (
                                                                    <li className={`cursor-pointer select-none relative py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-200'} ${selected ? 'font-semibold' : ''}`}>{option.label}</li>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </div>
                                            </Listbox>
                                            <button 
                                                onClick={() => handleApprove(user.id, user.role || 'USER')}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 transition-colors text-sm"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>Approve</span>
                                                </div>
                                            </button>
                                            <button 
                                                onClick={() => handleReject(user.id)} 
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-red-400 transition-colors text-sm"
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                                    </svg>
                                                    <span>Reject</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center mt-8 space-x-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-white font-medium">Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Approval;