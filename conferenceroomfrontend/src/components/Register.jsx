import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import SystemAdminRegister from './SystemAdminRegister';
import meetingImg from '../assets/images/meeting.jpg'
const Register = () => {
    const [registrationType, setRegistrationType] = useState('user');
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: ''
    });
    const [organizations, setOrganizations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (registrationType === 'user') {
            const fetchOrganizations = async () => {
                try {
                    setIsLoading(true);
                    const response = await api.get('/organization');
                    if (Array.isArray(response.data)) {
                        setOrganizations(response.data);
                    } else {
                        setError('Invalid organization data received');
                        setOrganizations([]);
                    }
                } catch (err) {
                    console.error('Error fetching organizations:', err);
                    setError('Failed to fetch organizations. Please try again later.');
                    setOrganizations([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchOrganizations();
        } else {
            setIsLoading(false);
            setOrganizations([]);
        }
    }, [registrationType]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName) {
                setError('Please fill in all fields');
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.email || !formData.password || !formData.confirmPassword) {
                setError('Please fill in all fields');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
        }
        setError('');
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
        setError('');
    };

    const handleFinalSubmit = async () => {
        setError('');
        setSuccess('');

        if (registrationType === 'user' && !formData.organizationName) {
            setError('Please select an organization');
            return;
        }

        try {
            const response = await api.post('/user/register', formData);
            
            if (response.data.success) {
                setSuccess(response.data.message + '. ' + response.data.nextStep);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    organizationName: ''
                });
                setCurrentStep(1);
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const renderStep1 = () => (
        <div className="w-full max-w-sm mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
                    {error}
                </div>
            )}
            <div className="space-y-4">
                <input
                    name="firstName"
                    type="text"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                />

                <input
                    name="lastName"
                    type="text"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                />
            </div>

            <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Next
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="w-full max-w-sm mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
                    {error}
                </div>
            )}
            <div className="space-y-4">
                <input
                    name="email"
                    type="email"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    name="password"
                    type="password"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input
                    name="confirmPassword"
                    type="password"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2 rounded-lg font-medium text-sm hover:bg-white/20 transition-all duration-300"
                >
                    Go back
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                    Next
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="w-full max-w-sm mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center">
                    {success}
                </div>
            )}

            <div className="space-y-4">
                <select
                    name="organizationName"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all"
                    value={formData.organizationName}
                    onChange={handleChange}
                    disabled={isLoading}
                >
                    <option value="" className="bg-gray-800">Select an organization</option>
                    {organizations.map((org) => (
                        <option key={org.id} value={org.name} className="bg-gray-800">
                            {org.name}
                        </option>
                    ))}
                </select>
                {isLoading && (
                    <p className="text-sm text-white/60 text-center">Loading organizations...</p>
                )}
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2 rounded-lg font-medium text-sm hover:bg-white/20 transition-all duration-300"
                >
                    Go back
                </button>
                <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-2 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    disabled={isLoading}
                >
                    Sign up
                </button>
            </div>
        </div>
    );

    return (
        <div className="container">
            <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-black">
                {/* Background Space Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/3 -right-16 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-400/40 to-red-500/40 rounded-full blur-xl"></div>
                    <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-1/6 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/3 left-1/6 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                    <div className="absolute top-20 right-20 w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse"></div>
                    <div className="absolute bottom-40 left-40 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent transform -rotate-12 animate-pulse"></div>
                </div>

                {/* Left Side Content */}
                <div className="flex-1 flex flex-col justify-center items-start px-3 py-8 sm:px-8 md:px-12 lg:p-16 relative bg-cover bg-center  lg:rounded-b-none " style={{ backgroundImage: `url(${meetingImg})` }}>
                    <div className="absolute inset-0 bg-black/50 z-0"></div>
                    <div className="relative z-10 w-full flex flex-col">
                        {/* Logo - responsive position */}
                        <div className="flex items-center space-x-3 mb-8 sm:mb-16 mt-2 sm:mt-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-white text-xl font-semibold">ConferenceRoomBooking</span>
                        </div>
                        {/* Heading */}
                        <div className="max-w-lg">
                            <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                                Join your
                                <br />
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                    Booking Patner!
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">REGISTER</h2>
                            <p className="text-white/70">
                                {registrationType === 'user' ? 'User Registration' : 'System Admin Registration'}
                            </p>
                        </div>

                        {/* Registration Type Selection */}
                        <div className="flex justify-center mb-6  backdrop-blur-sm rounded-lg p-1">
                            <label className="flex items-center flex-1 justify-center p-3 cursor-pointer">
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="registrationType"
                                    value="user"
                                    checked={registrationType === 'user'}
                                    onChange={() => {
                                        setRegistrationType('user');
                                        setCurrentStep(1);
                                        setError('');
                                    }}
                                />
                                <div className={`w-full text-center py-2 px-4 rounded-md transition-all ${
                                    registrationType === 'user' 
                                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' 
                                        : 'text-white/70 hover:text-white'
                                }`}>
                                    User
                                </div>
                            </label>
                            <label className="flex items-center flex-1 justify-center p-3 cursor-pointer">
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="registrationType"
                                    value="system_admin"
                                    checked={registrationType === 'system_admin'}
                                    onChange={() => {
                                        setRegistrationType('system_admin');
                                        setCurrentStep(1);
                                        setError('');
                                    }}
                                />
                                <div className={`w-full text-center py-2 px-4 rounded-md transition-all ${
                                    registrationType === 'system_admin' 
                                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' 
                                        : 'text-white/70 hover:text-white'
                                }`}>
                                    System Admin
                                </div>
                            </label>
                        </div>

                        {registrationType === 'user' && (
                            <form onSubmit={handleFinalSubmit} className="w-full max-w-sm mx-auto">
                                {/* Error and Success Messages */}
                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center">
                                        {success}
                                    </div>
                                )}

                                {currentStep === 1 && renderStep1()}
                                {currentStep === 2 && renderStep2()}
                                {currentStep === 3 && renderStep3()}
                            </form>
                        )}

                        {registrationType === 'system_admin' && (
                            <div className="w-full max-w-sm mx-auto">
                                <SystemAdminRegister />
                            </div>
                        )}

                        <p className="text-center text-sm text-white/60 mt-6">
                            Already have an account? <a href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">Login</a>
                        </p>

                        {/* Terms and Conditions */}
                        <div className="text-center mt-8">
                            <p className="text-xs text-white/50">
                                By signing up with our <span className="text-cyan-400">Terms and Conditions</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;