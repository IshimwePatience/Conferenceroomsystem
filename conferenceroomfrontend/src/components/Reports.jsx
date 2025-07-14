import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { FaChartBar, FaUsers, FaCalendarAlt, FaBuilding, FaFilePdf, FaSpinner } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
    <div className="p-4 rounded-lg text-center bg-gray-800 border border-gray-700">
        <div className={`text-3xl ${color} mx-auto mb-2`}>{icon}</div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const UserReport = ({ data }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={data.totalUsers} icon={<FaUsers />} color="text-blue-400" />
            <StatCard title="Active Users" value={data.activeUsers} icon={<FaUsers />} color="text-green-400" />
            <StatCard title="Inactive Users" value={data.inactiveUsers} icon={<FaUsers />} color="text-red-400" />
            <StatCard title="Pending Approval" value={data.pendingApprovalUsers} icon={<FaUsers />} color="text-yellow-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.usersByOrganization && Object.keys(data.usersByOrganization).length > 0 && (
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-white"><FaBuilding className="mr-2" />Users by Organization</h3>
                    <ul>
                        {Object.entries(data.usersByOrganization).map(([org, count]) => (
                            <li key={org} className="flex justify-between items-center py-1 border-b border-gray-700">
                                <span className="text-gray-300">{org}</span>
                                <span className="font-semibold text-white">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data.usersByRole && Object.keys(data.usersByRole).length > 0 && (
                <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-white">Users by Role</h3>
                    <ul>
                        {Object.entries(data.usersByRole).map(([role, count]) => (
                            <li key={role} className="flex justify-between items-center py-1 border-b border-gray-700">
                                <span className="text-gray-300">{role}</span>
                                <span className="font-semibold text-white">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

const BookingReport = ({ data }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Total Bookings" value={data.totalBookings} icon={<FaCalendarAlt />} color="text-blue-400" />
            <StatCard title="Completed" value={data.completedBookings} icon={<FaCalendarAlt />} color="text-green-400" />
            <StatCard title="Cancelled" value={data.cancelledBookings} icon={<FaCalendarAlt />} color="text-red-400" />
        </div>
        {data.organizationBookings && data.organizationBookings.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-white">Bookings by Organization</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="py-2 text-gray-400">Organization</th>
                            <th className="text-gray-400">Total Bookings</th>
                            <th className="text-gray-400">Cancelled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.organizationBookings.map((org) => (
                            <tr key={org.organizationName} className="border-b border-gray-700">
                                <td className="py-2 text-gray-300">{org.organizationName}</td>
                                <td className="text-white">{org.totalBookings}</td>
                                <td className="text-white">{org.cancelledBookings}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        {data.mostUsedRooms && data.mostUsedRooms.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-white">Most Used Rooms</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="py-2 text-gray-400">Room</th>
                            <th className="text-gray-400">Organization</th>
                            <th className="text-gray-400">Bookings</th>
                            <th className="text-gray-400">Hours Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.mostUsedRooms.map((room) => (
                            <tr key={room.roomName} className="border-b border-gray-700">
                                <td className="py-2 text-gray-300">{room.roomName}</td>
                                <td className="text-gray-300">{room.organizationName}</td>
                                <td className="text-white">{room.totalBookings}</td>
                                <td className="text-white">{room.totalHoursUsed.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const RoomUsageReport = ({ data }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard title="Total Rooms" value={data.totalRooms} icon={<FaBuilding />} color="text-blue-400" />
            <StatCard title="Active Rooms" value={data.activeRooms} icon={<FaBuilding />} color="text-green-400" />
            <StatCard title="Inactive Rooms" value={data.inactiveRooms} icon={<FaBuilding />} color="text-red-400" />
        </div>
        {data.mostUsedRooms && data.mostUsedRooms.length > 0 && (
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-white">Room Usage Details</h3>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="py-2 text-gray-400">Room</th>
                            <th className="text-gray-400">Organization</th>
                            <th className="text-gray-400">Bookings</th>
                            <th className="text-gray-400">Hours Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.mostUsedRooms.map((room) => (
                            <tr key={room.roomName} className="border-b border-gray-700">
                                <td className="py-2 text-gray-300">{room.roomName}</td>
                                <td className="text-gray-300">{room.organizationName}</td>
                                <td className="text-white">{room.totalBookings}</td>
                                <td className="text-white">{room.totalHoursUsed.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const renderReport = (type, data) => {
    switch(type) {
        case 'user':
            return <UserReport data={data} />;
        case 'booking':
            return <BookingReport data={data} />;
        case 'room':
            return <RoomUsageReport data={data} />;
        default:
            return <p className="text-gray-400">Select a report type.</p>;
    }
};

const Reports = () => {
    const [selectedReportType, setSelectedReportType] = useState('booking');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState('MONTHLY');
    const [reportData, setReportData] = useState(null);

    const generateReportMutation = useMutation({
        mutationFn: (requestData) => {
            return api.post(`/reports/generate`, requestData).then(res => res.data);
        },
        onSuccess: (data) => {
            setReportData(data);
        },
        onError: (error) => {
            console.error('Error generating report:', error);
        }
    });

    const downloadPdfMutation = useMutation({
        mutationFn: (requestData) => {
            return api.post('/reports/pdf', requestData, { responseType: 'blob' }).then(res => res.data);
        },
        onSuccess: (data) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            let reportName = selectedReportType;
            if (reportName === 'room') {
                reportName = 'room_usage';
            }
            link.setAttribute('download', `${reportName}_report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        },
        onError: (error) => {
            console.error('Error downloading PDF:', error);
        }
    });

    const handleGenerateReport = () => {
        let reportTypeForApi = selectedReportType.toUpperCase();
        if (reportTypeForApi === 'ROOM') {
            reportTypeForApi = 'ROOM_USAGE';
        }

        const requestData = {
            timePeriod: selectedTimePeriod,
            reportType: `${reportTypeForApi}_REPORT`
        };
        
        generateReportMutation.mutate(requestData);
    };

    const handleDownloadPdf = () => {
        let reportTypeForApi = selectedReportType.toUpperCase();
        if (reportTypeForApi === 'ROOM') {
            reportTypeForApi = 'ROOM_USAGE';
        }
        const requestData = {
            timePeriod: selectedTimePeriod,
            reportType: `${reportTypeForApi}_REPORT`
        };

        downloadPdfMutation.mutate(requestData);
    };

    const isLoading = generateReportMutation.isLoading;

    return (
        <div className="min-h-screen  text-gray-200 p-6">
            <div className="max-w-7xl mx-auto w-full">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-white">Reports</h1>
                    <p className="text-gray-400 mt-2">Generate comprehensive reports for your organization</p>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                            <select
                                value={selectedReportType}
                                onChange={(e) => {
                                    setSelectedReportType(e.target.value);
                                    setReportData(null);
                                }}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="booking">Booking Report</option>
                                <option value="user">User Report</option>
                                <option value="room">Room Usage Report</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Time Period</label>
                            <select
                                value={selectedTimePeriod}
                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <FaSpinner className="animate-spin" /> : <FaChartBar className="mr-2" />}
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                        <FaSpinner className="text-6xl text-blue-400 mx-auto animate-spin" />
                        <p className="mt-4 text-gray-400">Generating report...</p>
                    </div>
                )}

                {reportData && !isLoading && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 sm:p-6 overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">
                                {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1).replace(/_/g, ' ')} Report
                            </h2>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={downloadPdfMutation.isLoading}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {downloadPdfMutation.isLoading ? <FaSpinner className="animate-spin" /> : <FaFilePdf className="mr-2" />}
                                Export to PDF
                            </button>
                        </div>
                        {renderReport(selectedReportType, reportData)}
                    </div>
                )}

                {!reportData && !isLoading && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-12 text-center">
                        <FaChartBar className="text-6xl text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Report Generated</h3>
                        <p className="text-gray-400">Select your report options and click "Generate Report" to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports; 