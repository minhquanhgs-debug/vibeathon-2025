import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaClipboardList, FaChartBar, FaPlusCircle, FaSignOutAlt, FaRoute } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-500">ReferHarmony</h1>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-700 hover:text-primary-500">
              Welcome, {user?.firstName}!
            </Link>
            <Link to="/profile" className="btn-secondary text-sm">
              Profile
            </Link>
            <button onClick={logout} className="btn-secondary flex items-center gap-2">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage your referrals and track patient care coordination</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/referrals" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-primary-500 text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Referrals</h3>
                <p className="text-sm text-gray-600">See all your referrals</p>
              </div>
            </div>
          </Link>

          {user?.role === 'provider' && (
            <Link to="/create-referral" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <FaPlusCircle className="text-success-500 text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Referral</h3>
                  <p className="text-sm text-gray-600">Create a new referral</p>
                </div>
              </div>
            </Link>
          )}

          <Link to="/analytics" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartBar className="text-purple-500 text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">View insights & reports</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Route Optimization Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/route-planner" className="card hover:shadow-lg transition-shadow border-2 border-primary-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                <FaRoute className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Route Planner</h3>
                <p className="text-sm text-gray-600">Optimize your care route with AI</p>
              </div>
            </div>
          </Link>

          {user?.role === 'provider' && (
            <Link to="/provider-dashboard" className="card hover:shadow-lg transition-shadow border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <FaClipboardList className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Provider Dashboard</h3>
                  <p className="text-sm text-gray-600">Track patient route progress</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* User Info Card */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Your Profile</h3>
            <Link to="/profile" className="btn-secondary text-sm">
              Edit Profile
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">
                {user?.phone ? (
                  user.phone.includes('@') ? (
                    <span className="text-red-500">Invalid phone number. Please update your profile.</span>
                  ) : (
                    user.phone
                  )
                ) : (
                  'Not provided'
                )}
              </p>
            </div>
            {user?.role === 'provider' && user?.specialty && (
              <div>
                <p className="text-sm text-gray-600">Specialty</p>
                <p className="font-medium">{user.specialty}</p>
              </div>
            )}
            {user?.role === 'provider' && user?.organization && (
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium">{user.organization}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
