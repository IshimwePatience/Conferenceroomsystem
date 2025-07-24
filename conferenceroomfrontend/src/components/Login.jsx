import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import meetingImg from '../assets/images/meeting.jpg';

const Login = ({ setIsLoggedIn, setUserRole }) => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('LOGIN');

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI states
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
        setUserRole(null);
    }, [setIsLoggedIn, setUserRole]);

    const handleSuccessfulLogin = (data, isGoogle = false) => {
        localStorage.setItem('token', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        try {
            const decodedToken = jwtDecode(data.accessToken);
            const userRole = decodedToken.role;
            setUserRole(userRole);
            setIsLoggedIn(true);
            
            if (isGoogle) {
                window.location.href = '/dashboard';
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            if (isGoogle) {
                window.location.href = '/dashboard';
            } else {
                navigate('/dashboard');
            }
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const data = response.data;

            if (data.requiresTwoFactor) {
                setCurrentView('2FA');
                setMessage('A verification code has been sent to your email. Please enter it below.');
            } else if (data.accessToken) {
                handleSuccessfulLogin(data);
            } else {
                setError(data.message || 'An unexpected error occurred during login.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message;
            if (errorMessage) {
                if (errorMessage === 'Your account has been deactivated. Please contact your administrator.') {
                    setError('Your account has been deactivated. Please contact your administrator for assistance.');
                } else if (errorMessage === 'Account is temporarily locked. Please try again later.') {
                    setError('Your account is temporarily locked. Please try again later.');
                } else if (errorMessage === 'Your account is pending approval or has been rejected') {
                    setError('Your account is pending approval or has been rejected. Please contact your administrator for clarity.');
                } else if (errorMessage === 'Your account is pending approval. Please wait for admin approval.') {
                    setError('Your account is pending approval. Please wait for administrator approval.');
                } else if (errorMessage === 'Your account registration has been rejected. Please contact your administrator for more information.') {
                    setError('Your account registration has been rejected. Please contact your administrator for more information.');
                } else if (errorMessage === 'Invalid email or password') {
                    setError('Invalid email or password. Please check your credentials.');
                } else {
                    setError(errorMessage || 'An unexpected error occurred. Please try again.');
                }
            } else {
                setError('Invalid credentials or server error.');
            }
        }
    };

    const handleResend2FACode = async () => {
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/login', { email, password, rememberMe });
            const data = response.data;
            
            if (data.requiresTwoFactor) {
                setMessage('A new verification code has been sent to your email.');
            } else {
                setError('Failed to resend verification code. Please try logging in again.');
                setCurrentView('LOGIN');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification code.');
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/verify-2fa', { email, code: twoFactorCode });
            const data = response.data;

            if (data.accessToken) {
                handleSuccessfulLogin(data);
            } else {
                setError(data.message || 'Invalid verification code.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify the 2FA code.');
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!email) {
            setError('Please enter your email address to receive a password reset code.');
            return;
        }
        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('If an account with that email exists, a password reset code has been sent.');
            setCurrentView('RESET_CODE');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send the password reset code.');
        }
    };

    const handleResetCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/auth/verify-reset-code', { email, code: resetCode });
            setCurrentView('NEW_PASSWORD');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired reset code.');
        }
    };

    const handleResendCode = async () => {
        setError('');
        setMessage('');
        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('A new reset code has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send the reset code.');
        }
    };

    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await api.post('/auth/reset-password', {
                email,
                code: resetCode,
                newPassword,
                confirmPassword
            });
            setMessage('Password has been reset successfully. Please login with your new password.');
            setCurrentView('LOGIN');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        }
    };
    
    const handleGoogleLoginClick = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            try {
                const response = await api.post('/auth/oauth/login', {
                    authorizationCode: codeResponse.code,
                    provider: 'GOOGLE'
                });
                
                const data = response.data;
                if (data.success && data.token) {
                    handleSuccessfulLogin({ accessToken: data.token }, true);
                } else {
                    setError(data.message || 'Google login failed on the server.');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message;
                setError(errorMessage || 'An unexpected error occurred during Google login. Please try again.');
            }
        },
        flow: 'auth-code',
        onError: () => {
            setError('Google login failed. Please try again.');
        },
    });

    // SIMPLE LOGIN FORM - Controlled sizing
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="simple-form space-simple-y">
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Enter email address"
                required 
            />
            
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Password"
                required 
            />
            
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-white/80 text-sm">
                    <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        className="mr-2 rounded w-4 h-4" 
                    />
                    Remember Me
                </label>
                <button 
                    type="button" 
                    onClick={() => setCurrentView('FORGOT_PASSWORD')} 
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Forgot Password?
                </button>
            </div>
            
            <button 
                type="submit" 
                className="simple-button bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Sign in
            </button>
            
            <div className="flex items-center justify-center mb-4">
                <div className="border-t border-white/20 flex-grow"></div>
                <span className="px-4 text-white/60 text-sm">Or continue with</span>
                <div className="border-t border-white/20 flex-grow"></div>
            </div>
            
            <button 
                type="button" 
                onClick={() => handleGoogleLoginClick()} 
                className="simple-button flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Google
            </button>
            
            <p className="text-center text-sm text-white/60">
                Don't have an account? <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">Register here</a>
            </p>
        </form>
    );

    // 2FA FORM
    const render2FAForm = () => (
        <form onSubmit={handle2FASubmit} className="simple-form space-simple-y">
            <input 
                type="text" 
                value={twoFactorCode} 
                onChange={(e) => setTwoFactorCode(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Enter 6-digit verification code"
                required 
            />
            <button 
                type="submit" 
                className="simple-button bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Verify Code
            </button>
            <div className="flex flex-col space-y-2">
                <button 
                    type="button" 
                    onClick={handleResend2FACode}
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
                >
                    Resend Code
                </button>
                <button 
                    type="button" 
                    onClick={() => setCurrentView('LOGIN')} 
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
                >
                    Back to Login
                </button>
            </div>
        </form>
    );

    // FORGOT PASSWORD FORM
    const renderForgotPasswordForm = () => (
        <form onSubmit={handleForgotPasswordSubmit} className="simple-form space-simple-y">
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Enter your email to get a reset code"
                required 
            />
            <button 
                type="submit" 
                className="simple-button bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Send Reset Code
            </button>
            <button 
                type="button" 
                onClick={() => setCurrentView('LOGIN')} 
                className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
            >
                Back to Login
            </button>
        </form>
    );

    // RESET CODE FORM
    const renderResetCodeForm = () => (
        <form onSubmit={handleResetCodeSubmit} className="simple-form space-simple-y">
            <input 
                type="text" 
                value={resetCode} 
                onChange={(e) => setResetCode(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Enter 6-digit reset code"
                required 
            />
            <button 
                type="submit" 
                className="simple-button bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Verify Code
            </button>
            <div className="flex flex-col space-y-2">
                <button 
                    type="button" 
                    onClick={handleResendCode}
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
                >
                    Resend Code
                </button>
                <button 
                    type="button" 
                    onClick={() => setCurrentView('LOGIN')} 
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
                >
                    Back to Login
                </button>
            </div>
        </form>
    );

    // NEW PASSWORD FORM
    const renderNewPasswordForm = () => (
        <form onSubmit={handleNewPasswordSubmit} className="simple-form space-simple-y">
            <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="New Password"
                required 
            />
            <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="simple-input w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/70 border border-white/20 hover:shadow-2xl focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all" 
                placeholder="Confirm Password"
                required 
            />
            <button 
                type="submit" 
                className="simple-button bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
                Reset Password
            </button>
            <button 
                type="button" 
                onClick={() => setCurrentView('FORGOT_PASSWORD')} 
                className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center text-sm"
            >
                Back to Forgot Password
            </button>
        </form>
    );

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-black">
            {/* Background Space Elements - Simple responsive sizing */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-16 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400/40 to-red-500/40 rounded-full blur-xl"></div>
                
                {/* Stars */}
                <div className="absolute top-1/4 left-1/3 w-1 h-1 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-0.5 h-0.5 md:w-1 md:h-1 bg-cyan-300 rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 right-1/3 w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
                <div className="absolute top-1/6 right-1/4 w-0.5 h-0.5 md:w-1 md:h-1 bg-pink-300 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/6 w-1 h-1 md:w-2 md:h-2 bg-blue-300 rounded-full animate-pulse"></div>
                
                {/* Shooting Stars */}
                <div className="absolute top-20 right-20 w-16 h-0.5 md:w-20 md:h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse"></div>
                <div className="absolute bottom-40 left-40 w-12 h-0.5 md:w-16 md:h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent transform -rotate-12 animate-pulse"></div>
            </div>

            {/* Left Side Content */}
            <div className="flex-1 flex flex-col justify-center items-start px-6 py-8 sm:px-8 md:px-12 lg:p-16 relative bg-cover bg-center" style={{ backgroundImage: `url(${meetingImg})` }}>
                <div className="absolute inset-0 bg-black/50 z-0"></div>
                <div className="relative z-10 w-full flex flex-col">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 mb-8 sm:mb-16">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm md:text-base">C</span>
                        </div>
                        <span className="text-white text-xl md:text-2xl font-semibold">ConferenceRoomBooking</span>
                    </div>
                    
                    {/* Heading */}
                    <div className="max-w-lg">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                            Sign in to your
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                Booking Partner!
                            </span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Right Side Form */}
            <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {currentView === 'LOGIN' && 'SIGN IN'}
                            {currentView === '2FA' && 'VERIFY CODE'}
                            {currentView === 'FORGOT_PASSWORD' && 'RESET PASSWORD'}
                            {currentView === 'RESET_CODE' && 'ENTER RESET CODE'}
                            {currentView === 'NEW_PASSWORD' && 'SET NEW PASSWORD'}
                        </h2>
                        <p className="text-white/70">
                            {currentView === 'LOGIN' && 'Sign in with email address'}
                            {currentView === '2FA' && 'Enter your verification code'}
                            {currentView === 'FORGOT_PASSWORD' && 'Enter your email for reset link'}
                            {currentView === 'RESET_CODE' && 'Enter the reset code you received'}
                            {currentView === 'NEW_PASSWORD' && 'Enter your new password and confirm it'}
                        </p>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center text-sm">
                            {message}
                        </div>
                    )}

                    <div className="flex justify-center">
                        {currentView === 'LOGIN' && renderLoginForm()}
                        {currentView === '2FA' && render2FAForm()}
                        {currentView === 'FORGOT_PASSWORD' && renderForgotPasswordForm()}
                        {currentView === 'RESET_CODE' && renderResetCodeForm()}
                        {currentView === 'NEW_PASSWORD' && renderNewPasswordForm()}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center mt-8">
                        <p className="text-xs text-white/50">
                            By signing up with our <span className="text-cyan-400">Terms and Conditions</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;