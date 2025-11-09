import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { FaSearch, FaFilter, FaEye, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const ReferralList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    specialty: ''
  });

  useEffect(() => {
    fetchReferrals();
  }, [filters]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.urgency) params.append('urgency', filters.urgency);
      if (filters.specialty) params.append('specialty', filters.specialty);

      const response = await axios.get(`/api/referrals?${params.toString()}`);
      setReferrals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
      scheduled: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'emergency') return <FaExclamationTriangle className="text-red-500" />;
    if (urgency === 'urgent') return <FaClock className="text-orange-500" />;
    return <FaCheckCircle className="text-green-500" />;
  };

  const filteredReferrals = referrals.filter(referral => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      referral.referralNumber?.toLowerCase().includes(search) ||
      referral.patient?.firstName?.toLowerCase().includes(search) ||
      referral.patient?.lastName?.toLowerCase().includes(search) ||
      referral.specialty?.toLowerCase().includes(search) ||
      referral.reasonForReferral?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-500">ReferHarmony</Link>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-gray-700 hover:text-primary-500">
              Welcome, {user?.firstName}!
            </Link>
            <Link to="/profile" className="btn-secondary text-sm">Profile</Link>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Referrals</h2>
          {user?.role === 'provider' && (
            <Link to="/create-referral" className="btn-primary">
              Create New Referral
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search referrals..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select
                className="input-field"
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
              >
                <option value="">All Urgency Levels</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Loading referrals...</p>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No referrals found.</p>
            {user?.role === 'provider' && (
              <Link to="/create-referral" className="btn-primary mt-4 inline-block">
                Create Your First Referral
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReferrals.map((referral) => (
              <div key={referral._id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/referrals/${referral._id}`)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {referral.referralNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        {getUrgencyIcon(referral.urgency)}
                        <span className="capitalize">{referral.urgency}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Patient:</span>{' '}
                        {referral.patient?.firstName} {referral.patient?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Specialty:</span> {referral.specialty}
                      </div>
                      <div>
                        <span className="font-medium">Referring:</span>{' '}
                        {referral.referringProvider?.firstName} {referral.referringProvider?.lastName}
                      </div>
                      <div>
                        <span className="font-medium">Receiving:</span>{' '}
                        {referral.receivingProvider?.firstName} {referral.receivingProvider?.lastName}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                      {referral.reasonForReferral}
                    </p>
                  </div>
                  <div className="ml-4 text-right text-sm text-gray-500">
                    <div>{format(new Date(referral.createdAt), 'MMM dd, yyyy')}</div>
                    <div>{format(new Date(referral.createdAt), 'h:mm a')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReferralList;
