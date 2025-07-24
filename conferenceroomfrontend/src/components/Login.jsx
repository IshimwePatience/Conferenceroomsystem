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

    // [Previous handler functions remain the same - handleLoginSubmit, handleResend2FACode, etc.]
    // I'll include the key ones for brevity but you should keep all your existing handlers

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
                    setError('Your account is pending approval or has been rejected. This status typically relates to registration requests. Please contact your administrator for clarity.');
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

    // Google Login handler
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
                if (errorMessage) {
                    setError(errorMessage || 'An unexpected error occurred during Google login. Please try again.');
                } else {
                    setError('Failed to process Google login: No error message provided.');
                }
            }
        },
        flow: 'auth-code',
        onError: () => {
            setError('Google login failed. Please try again.');
        },
    });

    // Renders the main login form with improved responsive design
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="form-container space-adaptive-y">
            <div className="space-adaptive-y-sm">
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="input-adaptive" 
                    placeholder="Enter email address"
                    required 
                />
            </div>
            <div className="space-adaptive-y-sm">
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="input-adaptive" 
                    placeholder="Password"
                    required 
                />
            </div>
            <div className="flex items-center justify-between space-adaptive-y-sm">
                <label className="flex items-center text-white/80 text-adaptive-sm">
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
                    className="text-adaptive-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    Forgot Password?
                </button>
            </div>
            <button 
                type="submit" 
                className="button-adaptive"
            >
                Sign in
            </button>
            
            <div className="flex items-center justify-center space-adaptive-y-sm">
                <div className="border-t border-white/20 flex-grow"></div>
                <span className="px-4 text-white/60 text-adaptive-sm">Or continue with</span>
                <div className="border-t border-white/20 flex-grow"></div>
            </div>
            
            <button 
                type="button" 
                onClick={() => handleGoogleLoginClick()} 
                className="w-full flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300 input-adaptive"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                <span className="text-adaptive-base">Google</span>
            </button>
            
            <p className="text-center text-adaptive-sm text-white/60">
                Don't have an account? <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">Register here</a>
            </p>
        </form>
    );

    // You can create similar render functions for other forms (2FA, forgot password, etc.)
    // using the same responsive classes

    return (
        <div className="min-h-screen-safe w-full flex flex-col lg:flex-row relative overflow-hidden bg-black">
            {/* Background Space Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large Planet */}
                <div className="absolute -top-10 -left-10 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-cyan-400/30 to-blue-600/30 rounded-full blur-3xl"></div>
                
                {/* Medium Planet */}
                <div className="absolute top-1/3 -right-16 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                
                {/* Small Planet */}
                <div className="absolute bottom-20 left-1/4 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400/40 to-red-500/40 rounded-full blur-xl"></div>
                
                {/* Responsive Stars */}
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
            <div className="flex-1 flex flex-col justify-center items-start px-adaptive py-adaptive relative bg-cover bg-center lg:rounded-b-none" style={{ backgroundImage: `url(${meetingImg})` }}>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-black/50 z-0"></div>
                <div className="relative z-10 w-full flex flex-col space-adaptive-y">
                    {/* Logo - responsive sizing */}
                    <div className="flex items-center gap-adaptive-sm">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-adaptive-sm md:text-adaptive-base"> C </span>
                        </div>
                        <span className="text-white text-adaptive-lg md:text-adaptive-xl font-semibold">ConferenceRoomBooking</span>
                    </div>
                    {/* Heading - responsive typography */}
                    <div className="max-w-none md:max-w-lg">
                        <h1 className="text-adaptive-2xl md:text-adaptive-3xl font-bold text-white mb-fluid-2 leading-tight">
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
            <div className="flex-1 flex items-center justify-center relative z-10 px-adaptive py-adaptive">
                <div className="w-full max-w-container-md">
                    <div className="text-center space-adaptive-y">
                        <h2 className="text-adaptive-xl md:text-adaptive-2xl font-bold text-white">
                            {currentView === 'LOGIN' && 'SIGN IN'}
                            {currentView === '2FA' && 'VERIFY CODE'}
                            {currentView === 'FORGOT_PASSWORD' && 'RESET PASSWORD'}
                            {currentView === 'RESET_CODE' && 'ENTER RESET CODE'}
                            {currentView === 'NEW_PASSWORD' && 'SET NEW PASSWORD'}
                        </h2>
                        <p className="text-white/70 text-adaptive-base">
                            {currentView === 'LOGIN' && 'Sign in with email address'}
                            {currentView === '2FA' && 'Enter your verification code'}
                            {currentView === 'FORGOT_PASSWORD' && 'Enter your email for reset link'}
                            {currentView === 'RESET_CODE' && 'Enter the reset code you received'}
                            {currentView === 'NEW_PASSWORD' && 'Enter your new password and confirm it'}
                        </p>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="mb-fluid-3 p-fluid-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center text-adaptive-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-fluid-3 p-fluid-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-center text-adaptive-sm">
                            {message}
                        </div>
                    )}

                    <div className="flex justify-center">
                        {currentView === 'LOGIN' && renderLoginForm()}
                        {/* Add other form renders here with similar responsive classes */}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-center mt-fluid-4">
                        <p className="text-adaptive-sm text-white/50">
                            By signing up with our <span className="text-cyan-400">Terms and Conditions</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;