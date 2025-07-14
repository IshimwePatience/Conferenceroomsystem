import React, { useState, useEffect } from 'react';
import api, { getSystemAdminRegistrationEnabled } from '../utils/api';

const SystemAdminRegister = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkRegistrationStatus = async () => {
            try {
                const enabled = await getSystemAdminRegistrationEnabled();
                setIsRegistrationEnabled(enabled);
            } catch (err) {
                console.error('Error checking registration status:', err);
                // If there's an error, we'll assume it's the first system admin (no config exists yet)
                setIsRegistrationEnabled(true);
            } finally {
                setIsLoading(false);
            }
        };
        checkRegistrationStatus();
    }, []);

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
            if (!formData.email) {
                setError('Please enter your email');
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

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isRegistrationEnabled) {
            setError('System admin registration is currently disabled. Please contact an existing system admin.');
            return;
        }

        try {
            const response = await api.post('/user/register-system-admin', formData);
            setSuccess('System admin registered successfully! You can now create organizations.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            setCurrentStep(1);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                />

                <input
                    name="lastName"
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                />
            </div>

            <button
                type="button"
                onClick={handleNext}
                className="w-full mt-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
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
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                >
                    Go back
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
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
                <input
                    name="password"
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <input
                    name="confirmPassword"
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                >
                    Go back
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                    Sign up
                </button>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!isRegistrationEnabled) {
        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-center">
                    System admin registration is currently disabled. Please contact an existing system admin to enable registration.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
        </div>
    );
};

export default SystemAdminRegister;