import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';
import { FaSearch } from 'react-icons/fa';
import { Listbox } from '@headlessui/react';
import { Fragment } from 'react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [userRole, setUserRole] = useState(null);
    const [organizationFilter, setOrganizationFilter] = useState('');
    const [organizations, setOrganizations] = useState([]);

    const organizationOptions = [{ id: '', name: 'All Organizations' }, ...organizations];

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 900);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearchTerm]);

    const decodeTokenAndGetRole = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                return decoded.role;
            } catch (e) {
                console.error("Failed to decode token", e);
                return null;
            }
        }
        return null;
    };

    const fetchUsers = async (role) => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: 10,
                search: debouncedSearchTerm
            };

            if (role === 'SYSTEM_ADMIN' && organizationFilter) {
                params.organizationId = organizationFilter;
            }

            const response = await api.get('/user/all', { params });

            if (response.data && response.data.content) {
                setUsers(response.data.content);
                setTotalPages(response.data.totalPages);
            } else {
                setUsers([]);
                setError('Invalid response format from server');
            }
        } catch (err) {
            setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const role = decodeTokenAndGetRole();
        setUserRole(role);

        const fetchOrganizations = async () => {
            if (role === 'SYSTEM_ADMIN') {
                try {
                    const response = await api.get('/organization');
                    setOrganizations(response.data);
                } catch (err) {
                    console.error("Failed to fetch organizations:", err);
                    setError("Failed to load organizations for filtering.");
                }
            }
        };
        
        if(role) {
            fetchOrganizations();
            fetchUsers(role);
        }

    }, [currentPage, debouncedSearchTerm, organizationFilter]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userToUpdate = users.find(user => user.id === userId);
            if (!userToUpdate) {
                setError('User not found in local state.');
                return;
            }

            const updatedUserPayload = { ...userToUpdate, role: newRole };
            await api.put(`/user/${userId}`, updatedUserPayload);
            setSuccess(`User role updated successfully.`);
            fetchUsers(userRole); 
        } catch (err) {
            setError('Failed to update user role: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUserStatusChange = async (userId, isActive) => {
        try {
            await api.put(`/user/${userId}/status`, { isActive });
            setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully.`);
            fetchUsers(userRole);
        } catch (err) {
            setError(`Failed to ${isActive ? 'activate' : 'deactivate'} user: ` + (err.response?.data?.message || err.message));
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-400">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  text-gray-200 p-6">
            <div className="container">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                    <p className="text-gray-400">Control user roles, permissions, and account status.</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg">{success}</div>}

                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-grow md:flex-grow-0">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    {userRole === 'SYSTEM_ADMIN' && (
                        <Listbox value={organizationFilter} onChange={setOrganizationFilter} as={Fragment}>
                            <div className="relative w-full sm:w-auto">
                                <Listbox.Button className="w-full sm:w-auto text-sm py-1 px-2 bg-gray-800 border border-gray-700 rounded-lg text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {organizationOptions.find(o => o.id === organizationFilter)?.name}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 w-full sm:w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {organizationOptions.map(option => (
                                        <Listbox.Option key={option.id} value={option.id} as={Fragment}>
                                            {({ active, selected }) => (
                                                <li className={`cursor-pointer select-none relative py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-200'} ${selected ? 'font-semibold' : ''}`}>{option.name}</li>
                                            )}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    )}
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Organization</th>
                                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                {userRole === 'SYSTEM_ADMIN' &&
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                }
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{user.firstName} {user.lastName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'SYSTEM_ADMIN' ? 'bg-red-500/20 text-red-300' :
                                            user.role === 'ADMIN' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-blue-500/20 text-blue-300'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{user.organizationName || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                         <button
                                            onClick={() => handleUserStatusChange(user.id, !user.isActive)}
                                            disabled={user.role === 'SYSTEM_ADMIN'}
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${user.isActive 
                                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                                                : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600/70'}`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    {userRole === 'SYSTEM_ADMIN' &&
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                disabled={user.role === 'SYSTEM_ADMIN'}
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                                {userRole === 'SYSTEM_ADMIN' && <option value="SYSTEM_ADMIN">System Admin</option>}
                                            </select>
                                        </td>
                                    }
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center items-center mt-8 space-x-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-white font-medium">Page {currentPage + 1} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="px-4 py-2 rounded-lg font-semibold bg-gray-700 text-white disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;