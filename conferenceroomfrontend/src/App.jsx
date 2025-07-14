import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import Room from './components/Room';
import Login from './components/Login';
import Register from './components/Register';
import SystemAdminRegister from './components/SystemAdminRegister';
import Approval from './components/Approval';
import Organization from './components/Organization';
import Booking from './components/Booking';
import ManageUsers from './components/ManageUsers';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserLayoutWrapper from './components/UserLayoutWrapper';
import OrgAdminNavbar from './components/OrgAdminNavbar';
import SystemAdminNavbar from './components/SystemAdminNavbar';
import Reports from './components/Reports';
import api from './utils/api';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: 1, // Only retry failed requests once
      staleTime: 10000, // Consider data stale after 10 seconds
    },
  },
});

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchType, setGlobalSearchType] = useState('all'); // 'all', 'user', 'room', 'booking'
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role); // Assuming 'role' is in the token
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to decode token or set auth header:", error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />; // Redirect to login if not authenticated
    }
    return children;
  };

  const renderNavbar = () => {
    if (!isLoggedIn || userRole === 'USER') return null; // No navbar for users or if not logged in

    switch (userRole) {
      case 'SYSTEM_ADMIN':
        return <SystemAdminNavbar 
          setIsLoggedIn={setIsLoggedIn} 
          activePath={location.pathname} 
          setGlobalSearchTerm={setGlobalSearchTerm}
          setGlobalSearchType={setGlobalSearchType}
        />;
      case 'ADMIN':
        return <OrgAdminNavbar setIsLoggedIn={setIsLoggedIn} activePath={location.pathname} />;
      default:
        return null;
    }
  };

  // Check if user role should use full-width layout (no sidebar)
  const useFullWidthLayout = userRole === 'USER';

  return (
    <> {/* React Fragment to wrap top-level elements */}
      {isLoggedIn ? (
        // Authenticated layout: Conditional sidebar based on user role
        useFullWidthLayout ? (
          // Full-width layout for users (no sidebar)
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Dashboard routes */} 
              <Route path="/dashboard" element={<ProtectedRoute>
                <UserDashboard setIsLoggedIn={setIsLoggedIn} />
              </ProtectedRoute>} />

              {/* User routes */}
              <Route path="/bookings" element={<ProtectedRoute>
                <UserLayoutWrapper setIsLoggedIn={setIsLoggedIn}>
                  <Booking />
                </UserLayoutWrapper>
              </ProtectedRoute>} />
              <Route path="/booking/:roomId" element={<ProtectedRoute>
                <UserLayoutWrapper setIsLoggedIn={setIsLoggedIn}>
                  <Booking />
                </UserLayoutWrapper>
              </ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute>
                <UserLayoutWrapper setIsLoggedIn={setIsLoggedIn}>
                  <Room userRole={userRole} />
                </UserLayoutWrapper>
              </ProtectedRoute>} />

              {/* Fallback for authenticated users if they try to access non-existent protected routes or unauthorized routes */} 
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        ) : (
          // Sidebar layout for admins
          <div className="flex h-screen">
            {renderNavbar()} {/* Render the role-specific Navbar here */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 bg-black">
                <Routes>
                  {/* Dashboard routes */} 
                  <Route path="/dashboard" element={<ProtectedRoute>
                    {userRole === 'SYSTEM_ADMIN' && <SystemAdminDashboard globalSearchTerm={globalSearchTerm} globalSearchType={globalSearchType} />}
                    {userRole === 'ADMIN' && <AdminDashboard />}
                  </ProtectedRoute>} />

                  {/* Other protected routes, accessible based on role */} 
                  {userRole === 'SYSTEM_ADMIN' && (
                    <>
                      <Route path="/organizations" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
                      <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
                      <Route path="/approval" element={<ProtectedRoute><Approval /></ProtectedRoute>} />
                      <Route path="/bookings" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                      <Route path="/booking/:roomId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                      <Route path="/rooms" element={<ProtectedRoute><Room userRole={userRole} /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    </>
                  )}
                  {userRole === 'ADMIN' && (
                    <>
                      <Route path="/manage-users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
                      <Route path="/bookings" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                      <Route path="/booking/:roomId" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
                      <Route path="/rooms" element={<ProtectedRoute><Room userRole={userRole} /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                    </>
                  )}

                  {/* Fallback for authenticated users if they try to access non-existent protected routes or unauthorized routes */} 
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </main>
          </div>
        )
      ) : (
        // Unauthenticated layout: Only public routes, full screen
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-system-admin" element={<SystemAdminRegister />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </> // End React Fragment
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;