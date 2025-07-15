import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getOrganizationRooms, deleteRoom, createRoom, updateRoom, getAllRooms } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const Room = ({ userRole }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8; // 4 columns x 2 rows
  const [newRoom, setNewRoom] = useState({
    name: '',
    capacity: '',
    location: '',
    floor: '',
    description: '',
    amenities: '',
    equipment: '',
    imageFiles: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Debounce search term (900ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 900);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to first page when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { data: roomsData, isLoading, error: fetchError } = useQuery({
    queryKey: ['rooms', userRole, debouncedSearchTerm, currentPage],
    queryFn: async () => {
      if (userRole === 'ADMIN') {
        // Fetch all organization rooms (not paginated)
        const res = await getOrganizationRooms({});
        const allRooms = res.data.content || [];
        const filtered = debouncedSearchTerm
          ? allRooms.filter(room =>
              room.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
          : allRooms;
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
        const start = (currentPage - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        return paginated;
      } else if (userRole === 'SYSTEM_ADMIN') {
        const res = await api.get('/room/all');
        const allRooms = res.data;
        const filtered = debouncedSearchTerm
          ? allRooms.filter(room =>
              room.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
          : allRooms;
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
        const start = (currentPage - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        return paginated;
      } else if (userRole === 'USER') {
        // Fetch all rooms for users, filter and paginate on frontend
        const res = await getAllRooms({});
        const allRooms = res.data || [];
        const filtered = debouncedSearchTerm
          ? allRooms.filter(room =>
              room.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              room.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            )
          : allRooms;
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
        const start = (currentPage - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        return paginated;
      }
      return [];
    },
    enabled: !!userRole,
    refetchOnWindowFocus: true,
  });

  const rooms = roomsData;

  const handleBookRoom = (roomId) => {
    navigate(`/booking/${roomId}`);
  };

  const handleAddRoomClick = () => {
    setEditingRoom(null);
    setNewRoom({
      name: '',
      capacity: '',
      location: '',
      floor: '',
      description: '',
      amenities: '',
      equipment: '',
      imageFiles: [],
    });
    setIsModalOpen(true);
  };

  const handleEditRoomClick = (room) => {
    setEditingRoom(room);
    setNewRoom({
      id: room.id || '',
      name: room.name || '',
      capacity: room.capacity || '',
      location: room.location || '',
      floor: room.floor || '',
      description: room.description || '',
      amenities: room.amenities || '',
      equipment: room.equipment || '',
      imageFiles: [], // Clear any previously selected new files
      // existingImages: room.images ? JSON.parse(room.images) : [], // Keep track of existing images if needed for display
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await deleteRoom(roomId);
        setSuccess('Room deleted successfully!');
        queryClient.invalidateQueries(['rooms']);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete room.');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setNewRoom({
      name: '',
      capacity: '',
      location: '',
      floor: '',
      description: '',
      amenities: '',
      equipment: '',
      imageFiles: [],
    });
    setError('');
    setSuccess('');
  };

  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFileChange = (e) => {
    setNewRoom(prev => ({
      ...prev,
      imageFiles: Array.from(e.target.files)
    }));
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();

    // Always append required fields, even if their value is empty
    formData.append('name', newRoom.name || '');
    formData.append('location', newRoom.location || '');
    formData.append('capacity', newRoom.capacity ? Number(newRoom.capacity) : 0); // Ensure capacity is a number

    // Append optional fields only if they have a value
    if (newRoom.description) formData.append('description', newRoom.description);
    if (newRoom.floor) formData.append('floor', newRoom.floor);
    if (newRoom.amenities) formData.append('amenities', newRoom.amenities);
    if (newRoom.equipment) formData.append('equipment', newRoom.equipment);

    // Handle image files
    if (newRoom.imageFiles && newRoom.imageFiles.length > 0) {
      newRoom.imageFiles.forEach(file => formData.append('images', file));
    }

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
        setSuccess('Room updated successfully!');
      } else {
        await createRoom(formData);
        setSuccess('Room created successfully!');
      }
      queryClient.invalidateQueries(['rooms']);
      handleModalClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save room.');
    }
  };

  const getImageUrl = (imagePath) => {
    if (imagePath && typeof imagePath === 'string') {
        return `${import.meta.env.VITE_API_URL}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
    }
    // Return a data URL for placeholder if no valid path is provided
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjM2I0MjU5Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
};

  const handleImageError = (e) => {
    // Use a data URL for the fallback image to avoid infinite loops
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMTBiOTgxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Um9vbTwvdGV4dD4KPC9zdmc+Cg==';
  };

  const getRoomImage = (room) => {
    try {
      if (room.images) {
        const parsedImages = JSON.parse(room.images);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          return parsedImages[0];
        }
      }
    } catch (error) {
      console.warn('Failed to parse room images:', error);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <div className="text-green-200 text-xl">Loading rooms...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className=" border-gray-200 min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-6 text-red-200 backdrop-blur-sm max-w-md">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span className="text-lg font-medium">Error: {fetchError.message || "Failed to load rooms."}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gray-500 bg-clip-text text-transparent mb-2">
            {userRole === 'ADMIN' ? 'Organization Rooms' : userRole === 'SYSTEM_ADMIN' ? 'All Rooms' : 'All Rooms'}
          </h1>
          <p className="text-gray-500">
            {userRole === 'ADMIN' 
              ? 'Manage and control your organization\'s conference rooms' 
              : userRole === 'SYSTEM_ADMIN' 
                ? 'Browse and manage all conference rooms across all organizations'
                : 'Browse and book available conference rooms'
            }
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
            {success}
          </div>
        )}

        {/* Search and Add Room */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          {(userRole === 'ADMIN' || userRole === 'SYSTEM_ADMIN') && (
            <button
              onClick={handleAddRoomClick}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
            >
              <FaPlus />
              <span>Add Room</span>
            </button>
          )}
        </div>

        {/* Masonry Grid for Rooms */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-8'>
          {rooms?.map(room => (
            <div key={room.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-green-500/50 transition-all duration-200 break-inside-avoid">
              <div className="relative h-48">
                <img
                  src={getImageUrl(getRoomImage(room))}
                  alt={room.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                {(userRole === 'ADMIN' || userRole === 'SYSTEM_ADMIN') && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleEditRoomClick(room)}
                      className="p-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/80 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{room.name}</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  {userRole === 'SYSTEM_ADMIN' && room.organizationName && (
                    <p><span className="text-blue-400 text-sm">Organization:</span> {room.organizationName}</p>
                  )}
                  <p><span className="text-green-400 text-sm">Capacity:</span> {room.capacity} people</p>
                  <p><span className="text-green-400 text-sm">Location:</span> {room.location}</p>
                  <p><span className="text-green-400 text-sm">Floor:</span> {room.floor}</p>
                  {room.amenities && (
                    <p><span className="text-green-400 text-sm">Amenities:</span> {room.amenities}</p>
                  )}
                  {room.equipment && (
                    <p><span className="text-green-400 text-sm">Equipment:</span> {room.equipment}</p>
                  )}
                </div>
                {userRole === 'USER' && (
                  <button
                    onClick={() => handleBookRoom(room.id)}
                    className="mt-4 w-full px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg text-sm hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                  >
                    Book Room
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold ${currentPage === 1 ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'}`}
          >
            Previous
          </button>
          <span className="text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold ${currentPage === totalPages ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'}`}
          >
            Next
          </button>
        </div>

        {/* Add/Edit Room Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <form onSubmit={handleRoomSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Room Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newRoom.name}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={newRoom.capacity}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={newRoom.location}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Floor</label>
                    <input
                      type="text"
                      name="floor"
                      value={newRoom.floor}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={newRoom.description}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Amenities</label>
                    <input
                      type="text"
                      name="amenities"
                      value={newRoom.amenities}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Equipment</label>
                    <input
                      type="text"
                      name="equipment"
                      value={newRoom.equipment}
                      onChange={handleRoomInputChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Room Images</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                    >
                      {editingRoom ? 'Update Room' : 'Create Room'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;