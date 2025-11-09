import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReferralList from './pages/ReferralList';
import ReferralDetails from './pages/ReferralDetails';
import CreateReferral from './pages/CreateReferral';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import RoutePlanner from './pages/RoutePlanner';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/referrals" element={<PrivateRoute><ReferralList /></PrivateRoute>} />
            <Route path="/referrals/:id" element={<PrivateRoute><ReferralDetails /></PrivateRoute>} />
            <Route path="/create-referral" element={<PrivateRoute><CreateReferral /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/route-planner" element={<PrivateRoute><RoutePlanner /></PrivateRoute>} />
            <Route path="/provider-dashboard" element={<PrivateRoute><ProviderDashboard /></PrivateRoute>} />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
