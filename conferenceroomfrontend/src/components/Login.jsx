import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import meetingImg from '../assets/images/meeting.jpg';

const Login = ({ setIsLoggedIn, setUserRole }) => {
    const navigate = useNavigate();
    // State to manage which form is visible: 'LOGIN', '2FA', or 'FORGOT_PASSWORD'
    const [currentView, setCurrentView] = useState('LOGIN');

    // State for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for user feedback
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Clear any existing token when the login component mounts
        localStorage.removeItem('token');
        // Also clear any default authorization header from axios
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false); // Ensure App knows we are logged out on login page load
        setUserRole(null); // Clear the user role
    }, [setIsLoggedIn, setUserRole]);

    // Handles successful login by storing the token and redirecting
    const handleSuccessfulLogin = (data, isGoogle = false) => {
        console.log('Login response data:', data); // Debug log
        localStorage.setItem('token', data.accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Decode token to get role
        try {
            const decodedToken = jwtDecode(data.accessToken);
            console.log('Decoded token after login:', decodedToken); // Debug log
            const userRole = decodedToken.role;
            console.log('User role after login:', userRole); // Debug log
            
            // Update parent component state
            setUserRole(userRole);
            setIsLoggedIn(true);
            
            // Always redirect to /dashboard, but force reload for Google login
            if (isGoogle) {
                window.location.href = '/dashboard';
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error decoding token after login:', error);
            if (isGoogle) {
                window.location.href = '/dashboard';
            } else {
                navigate('/dashboard');
            }
        }
    };

    // Submits the initial email/password login form
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
                // The backend now sends specific messages, so we display them directly.
                setError(data.message || 'An unexpected error occurred during login.');
            }
        } catch (err) {
            // Handle specific error messages from the backend
            const errorMessage = err.response?.data?.message;
            if (errorMessage) {
                // Prioritize specific messages for deactivated/locked accounts from backend using strict equality
                if (errorMessage === 'Your account has been deactivated. Please contact your administrator.') {
                    setError('Your account has been deactivated. Please contact your administrator for assistance.');
                } else if (errorMessage === 'Account is temporarily locked. Please try again later.') {
                    setError('Your account is temporarily locked. Please try again later.');
                }
                // Explicitly handle the message observed in the user's screenshot (if it's a backend-sent message)
                else if (errorMessage === 'Your account is pending approval or has been rejected') {
                    setError('Your account is pending approval or has been rejected. This status typically relates to registration requests. Please contact your administrator for clarity.');
                }
                // Handle other specific messages for pending/rejected registration using strict equality
                else if (errorMessage === 'Your account is pending approval. Please wait for admin approval.') {
                    setError('Your account is pending approval. Please wait for administrator approval.');
                } else if (errorMessage === 'Your account registration has been rejected. Please contact your administrator for more information.') {
                    setError('Your account registration has been rejected. Please contact your administrator for more information.');
                }
                // Fallback for general invalid credentials or other unhandled messages
                else if (errorMessage === 'Invalid email or password') {
                    setError('Invalid email or password. Please check your credentials.');
                }
                // Generic fallback for any other unexpected backend message
                else {
                    setError(errorMessage || 'An unexpected error occurred. Please try again.');
                }
            } else {
                setError('Invalid credentials or server error.');
            }
        }
    };

    // Handles resending the 2FA code
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

    // Submits the 2FA verification code
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

    // Submits the forgot password request
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
            setCurrentView('RESET_CODE'); // Switch to reset code input view
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send the password reset code.');
        }
    };

    // Submits the reset code for verification
    const handleResetCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/auth/verify-reset-code', { email, code: resetCode });
            setCurrentView('NEW_PASSWORD'); // Switch to new password view
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired reset code.');
        }
    };

    // Handles resending the reset code
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

    // Submits the new password
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
    
    // This hook initiates the Google Login flow.
    // It's configured for 'auth-code' to match the backend's expectation.
    const handleGoogleLoginClick = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            // This 'code' is the authorization code the backend needs.
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
                // --- TEMPORARY: Log the full error response for debugging --- 
                console.error('Full Google OAuth Error Response:', err.response);
                console.error('Google OAuth Error Message:', err.response?.data?.message);
                // --- END TEMPORARY LOGGING --- 

                // Apply the same specific error message handling as for local login
                const errorMessage = err.response?.data?.message;
                if (errorMessage) {
                    // Prioritize specific messages for deactivated/locked accounts from backend using strict equality
                    if (errorMessage === 'Your account has been deactivated. Please contact your administrator.') {
                        setError('Your account has been deactivated. Please contact your administrator for assistance.');
                    } else if (errorMessage === 'Account is temporarily locked. Please try again later.') {
                        setError('Your account is temporarily locked. Please try again later.');
                    }
                    // Explicitly handle the message observed in the user's screenshot for registration requests
                    else if (errorMessage === 'Your account is pending approval or has been rejected') {
                        setError('Your account is pending approval or has been rejected. This status typically relates to registration requests. Please contact your administrator for clarity.');
                    }
                    // Handle other specific messages for pending/rejected registration using strict equality
                    else if (errorMessage === 'Your account is pending approval. Please wait for admin approval.') {
                        setError('Your account is pending approval. Please wait for administrator approval.');
                    } else if (errorMessage === 'Your account registration has been rejected. Please contact your administrator for more information.') {
                        setError('Your account registration has been rejected. Please contact your administrator for more information.');
                    }
                    // Fallback for general invalid credentials or other unhandled messages
                    else if (errorMessage === 'Invalid email or password') {
                        setError('Invalid email or password. Please check your credentials.');
                    }
                    // Generic fallback for any other unexpected backend message
                    else {
                        setError(errorMessage || 'An unexpected error occurred during Google login. Please try again.');
                    }
                } else {
                    setError('Failed to process Google login: No error message provided.');
                }
            }
        },
        flow: 'auth-code', // This is the crucial change to align with the backend.
        onError: () => {
            setError('Google login failed. Please try again.');
        },
    });

    // Renders the main login form
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="w-full responsive-form">
            <div className="fluid-spacing-medium">
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all" 
                    placeholder="Enter email address"
                    required 
                />
            </div>
            <div className="fluid-spacing-medium">
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all" 
                    placeholder="Password"
                    required 
                />
            </div>
            <div className="fluid-spacing-medium flex items-center justify-between">
                <label className="flex items-center text-white/80 fluid-text-small">
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
                    className="fluid-text-small text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Forgot Password?
                </button>
            </div>
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 fluid-spacing-small"
            >
                Sign in
            </button>
            
            <div className="flex items-center justify-center fluid-spacing-small">
                <div className="border-t border-white/20 flex-grow"></div>
                <span className="px-4 text-white/60 fluid-text-small">Or continue with</span>
                <div className="border-t border-white/20 flex-grow"></div>
            </div>
            
            <button 
                type="button" 
                onClick={() => handleGoogleLoginClick()} 
                className="w-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 fluid-spacing-medium"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Google
            </button>
            
            <p className="text-center fluid-text-small text-white/60">
                Don't have an account? <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">Register here</a>
            </p>
        </form>
    );

    // Renders the 2FA code input form
    const render2FAForm = () => (
        <form onSubmit={handle2FASubmit} className="w-full responsive-form">
            <div className="fluid-spacing-medium">
                <input 
                    type="text" 
                    value={twoFactorCode} 
                    onChange={(e) => setTwoFactorCode(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all" 
                    placeholder="Enter 6-digit verification code"
                    required 
                />
            </div>
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 fluid-spacing-small"
            >
                Verify Code
            </button>
            <div className="flex flex-col space-y-2">
                <button 
                    type="button" 
                    onClick={handleResend2FACode}
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
                >
                    Resend Code
                </button>
                <button 
                    type="button" 
                    onClick={() => setCurrentView('LOGIN')} 
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
                >
                    Back to Login
                </button>
            </div>
        </form>
    );

    // Renders the forgot password form
    const renderForgotPasswordForm = () => (
        <form onSubmit={handleForgotPasswordSubmit} className="w-full responsive-form">
            <div className="fluid-spacing-medium">
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm rounded-lg font-light text-white placeholder-white/70 hover:shadow-2xl focus:outline-none transition-all" 
                    placeholder="Enter your email to get a reset code"
                    required 
                />
            </div>
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 fluid-spacing-small"
            >
                Send Reset Code
            </button>
            <button 
                type="button" 
                onClick={() => setCurrentView('LOGIN')} 
                className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
            >
                Back to Login
            </button>
        </form>
    );

    // Renders the reset code input form
    const renderResetCodeForm = () => (
        <form onSubmit={handleResetCodeSubmit} className="w-full responsive-form">
            <div className="fluid-spacing-medium">
                <input 
                    type="text" 
                    value={resetCode} 
                    onChange={(e) => setResetCode(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" 
                    placeholder="Enter 6-digit reset code"
                    required 
                />
            </div>
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 fluid-spacing-small"
            >
                Verify Code
            </button>
            <div className="flex flex-col space-y-2">
                <button 
                    type="button" 
                    onClick={handleResendCode}
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
                >
                    Resend Code
                </button>
                <button 
                    type="button" 
                    onClick={() => setCurrentView('LOGIN')} 
                    className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
                >
                    Back to Login
                </button>
            </div>
        </form>
    );

    // Renders the new password form
    const renderNewPasswordForm = () => (
        <form onSubmit={handleNewPasswordSubmit} className="w-full responsive-form">
            <div className="fluid-spacing-medium">
                <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" 
                    placeholder="New Password"
                    required 
                />
            </div>
            <div className="fluid-spacing-medium">
                <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" 
                    placeholder="Confirm Password"
                    required 
                />
            </div>
            <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 fluid-spacing-small"
            >
                Reset Password
            </button>
            <button 
                type="button" 
                onClick={() => setCurrentView('FORGOT_PASSWORD')} 
                className="w-full text-cyan-400 hover:text-cyan-300 transition-colors text-center fluid-text-small"
            >
                Back to Forgot Password
            </button>
        </form>
    );

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-black">
            {/* Background Space Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large Planet */}
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"></div>
                
                {/* Medium Planet */}
                <div className="absolute top-1/3 -right-16 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                
                {/* Small Planet */}
                <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-400/40 to-red-500/40 rounded-full blur-xl"></div>
                
                {/* Stars */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></div>
                <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse"></div>
                <div className="absolute top-1/6 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/6 w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                
                {/* Shooting Stars */}
                <div className="absolute top-20 right-20 w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45 animate-pulse"></div>
                <div className="absolute bottom-40 left-40 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent transform -rotate-12 animate-pulse"></div>
            </div>

            {/* Left Side Content */}
            <div className="flex-1 flex flex-col justify-center items-start px-3 py-8 sm:px-8 md:px-12 lg:p-16 relative bg-cover bg-center lg:rounded-b-none" style={{ backgroundImage: `url(${meetingImg})` }}>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/50 z-0"></div>
                <div className="relative z-10 w-full flex flex-col">
                    {/* Logo - fluid sizing */}
                    <div className="flex items-center space-x-3 fluid-spacing-large mt-2 sm:mt-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold fluid-text-small"> C </span>
                        </div>
                        <span className="text-white fluid-text font-semibold">ConferenceRoomBooking</span>
                    </div>
                    {/* Heading - fluid typography */}
                    <div className="max-w-lg">
                        <h1 className="fluid-heading-large font-bold text-white mb-4 leading-tight">
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
            <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="fluid-container">
                    <div className="text-center fluid-spacing-large">
                        <h2 className="fluid-heading-medium font-bold text-white mb-2">
                            {currentView === 'LOGIN' && 'SIGN IN'}
                            {currentView === '2FA' && 'VERIFY CODE'}
                            {currentView === 'FORGOT_PASSWORD' && 'RESET PASSWORD'}
                            {currentView === 'RESET_CODE' && 'ENTER RESET CODE'}
                            {currentView === 'NEW_PASSWORD' && 'SET NEW PASSWORD'}
                        </h2>
                        <p className="text-white/70 fluid-text">
                            {currentView === 'LOGIN' && 'Sign in with email address'}
                            {currentView === '2FA' && 'Enter your verification code'}
                            {currentView === 'FORGOT_PASSWORD' && 'Enter your email for reset link'}
                            {currentView === 'RESET_CODE' && 'Enter the reset code you received'}
                            {currentView === 'NEW_PASSWORD' && 'Enter your new password and confirm it'}
                        </p>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="fluid-spacing-small p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="fluid-spacing-small p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center">
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
                    <div className="text-center fluid-spacing-large">
                        <p className="fluid-text-small text-white/50">
                            By signing up with our <span className="text-cyan-400">Terms and Conditions</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;