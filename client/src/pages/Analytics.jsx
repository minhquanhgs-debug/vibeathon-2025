import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { FaChartBar, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Analytics = () => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await axios.get(`/api/referrals/analytics/overview?${params.toString()}`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const statusData = analytics?.statusBreakdown?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const urgencyData = analytics?.urgencyBreakdown?.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  const avgTimes = analytics?.averageTimes || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-500">ReferHarmony</Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Analytics & Reports</h2>
          
          {/* Date Range Filter */}
          <div className="card mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaChartBar className="text-blue-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Referrals</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics?.totalReferrals || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="text-green-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.statusBreakdown?.find(s => s._id === 'completed')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-orange-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg. Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {avgTimes.avgTimeToAcknowledge
                        ? `${Math.round(avgTimes.avgTimeToAcknowledge)}h`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaExclamationTriangle className="text-purple-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.statusBreakdown?.find(s => s._id === 'pending')?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Status Breakdown</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No data available</p>
                )}
              </div>

              {/* Urgency Breakdown */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Urgency Distribution</h3>
                {urgencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={urgencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No data available</p>
                )}
              </div>
            </div>

            {/* Response Times */}
            {(avgTimes.avgTimeToAcknowledge || avgTimes.avgTimeToSchedule || avgTimes.avgTimeToComplete) && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Average Response Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Time to Acknowledge</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {avgTimes.avgTimeToAcknowledge
                        ? `${Math.round(avgTimes.avgTimeToAcknowledge)}h`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Time to Schedule</p>
                    <p className="text-3xl font-bold text-green-600">
                      {avgTimes.avgTimeToSchedule
                        ? `${Math.round(avgTimes.avgTimeToSchedule)}h`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Time to Complete</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {avgTimes.avgTimeToComplete
                        ? `${Math.round(avgTimes.avgTimeToComplete)}h`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Breakdown Table */}
            {statusData.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Status Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statusData.map((item, index) => {
                        const total = statusData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                              {item.value}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="h-2 rounded-full"
                                    style={{
                                      width: `${percentage}%`,
                                      backgroundColor: COLORS[index % COLORS.length]
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
