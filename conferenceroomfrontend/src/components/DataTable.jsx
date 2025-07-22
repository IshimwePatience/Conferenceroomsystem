import React from 'react';

const DataTable = ({ 
    title, 
    data, 
    columns, 
    onSearch, 
    onPaginate, 
    currentPage, 
    totalPages,
    onEdit,
    onDelete
}) => {
    const renderCell = (item, column) => {
        if (column.key === 'profilePictureUrl' || column.key === 'logoUrl') {
            return (
                <div className="flex items-center">
                    {item[column.key] ? (
                        <img 
                            src={item[column.key]} 
                            alt={item.name || 'Image'} 
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}
                </div>
            );
        }
        return item[column.key];
    };

    return (
        <div className="container">
            {title && <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>}
            
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/50"
                                >
                                    {column.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-gray-700/50">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-700/50 bg-gray-800/50">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-gray-200">
                                        {renderCell(item, column)}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item.id)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item.id)}
                                                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => onPaginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onPaginate(index + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${
                                    currentPage === index + 1
                                        ? 'text-white bg-blue-600'
                                        : 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPaginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default DataTable; 