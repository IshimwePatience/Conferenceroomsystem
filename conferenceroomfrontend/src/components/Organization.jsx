import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const PAGE_SIZE = 9;

const Organization = () => {
    const [organizations, setOrganizations] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        organizationCode: '',
        description: '',
        address: '',
        phone: '',
        email: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingOrgId, setEditingOrgId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/organization');
            setOrganizations(response.data);
        } catch (err) {
            setError('Failed to fetch organizations.');
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    // Filter and paginate organizations
    const filteredOrganizations = debouncedSearchTerm
        ? organizations.filter(org =>
            org.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            org.organizationCode?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
        : organizations;
    
    useEffect(() => {
        setTotalPages(Math.ceil(filteredOrganizations.length / PAGE_SIZE) || 1);
    }, [filteredOrganizations]);

    const paginatedOrganizations = filteredOrganizations.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const getImageUrl = (imagePath) => {
        if (imagePath && typeof imagePath === 'string') {
            return `${import.meta.env.VITE_API_URL}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
        }
        return 'https://via.placeholder.com/100x100/cccccc/ffffff?text=No+Logo';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', organizationCode: '', description: '', address: '', phone: '', email: '' });
        setLogoFile(null);
        setLogoPreview('');
        setEditingOrgId(null);
        setIsModalOpen(false);
        setError('');
        setSuccess('');
    };

    const handleAddNewClick = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (org) => {
        setEditingOrgId(org.id);
        setFormData({
            name: org.name || '',
            organizationCode: org.organizationCode || '',
            description: org.description || '',
            address: org.address || '',
            phone: org.phone || '',
            email: org.email || '',
        });
        setLogoFile(null);
        setLogoPreview(getImageUrl(org.logoUrl));
        setIsModalOpen(true);
    };

    const handleDelete = async (orgId) => {
        if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        try {
            await api.delete(`/organization/${orgId}`);
            setSuccess('Organization deleted successfully!');
            fetchOrganizations(); // Refetch organizations after delete
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete organization.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        
        // Append all form data
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });
        
        // Append logo file if it exists
        if (logoFile) {
            formDataToSend.append('logo', logoFile);
        }

        try {
            if (editingOrgId) {
                await api.put(`/organization/${editingOrgId}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Organization updated successfully!');
            } else {
                await api.post('/organization/create', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setSuccess('Organization created successfully!');
            }
            fetchOrganizations();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save organization.');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Organizations</h1>
                        <p className="text-gray-400">Manage all organizations in the system.</p>
                    </div>
                    <button
                        onClick={handleAddNewClick}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FaPlus />
                        <span>Add New</span>
                    </button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg">{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedOrganizations.map(org => (
                        <div key={org.id} className="bg-gray-800 rounded-lg p-5 flex flex-col justify-between border border-gray-700 hover:border-blue-500/50 transition-colors">
                            <div>
                                <div className="flex items-center mb-4">
                                    <img 
                                        src={getImageUrl(org.logoUrl)} 
                                        alt={`${org.name} logo`}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-600 mr-4"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{org.name}</h3>
                                        <p className="text-sm text-gray-400">{org.organizationCode}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-sm mb-1"><span className="font-semibold">Email:</span> {org.email}</p>
                                <p className="text-gray-300 text-sm"><span className="font-semibold">Users:</span> {org.totalUsers}</p>
                            </div>
                            <div className="flex justify-end space-x-3 mt-4">
                                <button onClick={() => handleEdit(org)} className="p-2 text-gray-400 hover:text-white transition-colors"><FaEdit /></button>
                                <button onClick={() => handleDelete(org.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>

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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">{editingOrgId ? 'Edit Organization' : 'Add New Organization'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <img src={logoPreview || 'https://via.placeholder.com/100x100/cccccc/ffffff?text=Logo'} alt="Logo Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"/>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Organization Code</label>
                                    <input type="text" name="organizationCode" value={formData.organizationCode} onChange={e => setFormData({...formData, organizationCode: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" rows="3"/>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"/>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"/>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"/>
                                </div>
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingOrgId ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Organization;