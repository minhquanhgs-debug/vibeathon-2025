import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaMapMarkerAlt, FaDollarSign, FaUser, FaRoute, FaArrowLeft, FaSearch, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [routeIdInput, setRouteIdInput] = useState('');
  const [fetchingRoute, setFetchingRoute] = useState(false);

  // Mock function to fetch routes - in production, this would filter by provider
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have an endpoint like /api/routes?provider_id=X
      // For now, we'll use a mock or fetch all routes
      // This is a placeholder - you'd implement proper filtering
      toast.info('Fetching patient routes...');
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteDetails = async (routeId) => {
    if (!routeId) {
      toast.error('Please enter a Route ID');
      return;
    }

    setFetchingRoute(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/routes/${routeId}`);
      setSelectedRoute(response.data);
      toast.success(`Route #${routeId} loaded successfully`);
    } catch (error) {
      console.error('Error fetching route details:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to fetch route details';
      toast.error(errorMessage);
      setSelectedRoute(null);
    } finally {
      setFetchingRoute(false);
    }
  };

  const handleRouteIdSubmit = (e) => {
    e.preventDefault();
    const routeId = parseInt(routeIdInput);
    if (routeId) {
      fetchRouteDetails(routeId);
    } else {
      toast.error('Please enter a valid Route ID');
    }
  };

  const updateNodeStatus = async (routeId, nodeId, status, notes = '') => {
    setUpdating(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/routes/${routeId}/update_node_status?node_id=${nodeId}`,
        {
          status,
          notes
        }
      );
      toast.success('Status updated successfully');
      // Refresh route details
      if (selectedRoute) {
        await fetchRouteDetails(routeId);
      }
    } catch (error) {
      console.error('Error updating node status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calculateProgress = (route) => {
    if (!route || !route.route || route.route.length === 0) return 0;
    const completed = route.route.filter(node => node.status === 'Completed').length;
    return Math.round((completed / route.route.length) * 100);
  };

  useEffect(() => {
    // Fetch routes on component mount
    // In production, implement proper route fetching with provider filtering
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors"
            >
              <FaArrowLeft /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-primary-500">Provider Dashboard</h1>
          <p className="text-sm text-gray-600">Track and manage patient care routes</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Route Selection */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaIdCard className="text-2xl text-primary-500" />
            <h2 className="text-xl font-bold text-gray-900">Import Patient Route</h2>
          </div>
          <form onSubmit={handleRouteIdSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route ID
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Enter Route ID (e.g., 1, 2, 3...)"
                  value={routeIdInput}
                  onChange={(e) => setRouteIdInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  min="1"
                />
                <button
                  type="submit"
                  disabled={fetchingRoute || !routeIdInput}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaSearch /> {fetchingRoute ? 'Loading...' : 'Load Route'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter the Route ID provided by the patient to view and manage their care route
              </p>
            </div>
          </form>
          
          {selectedRoute && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <FaCheckCircle />
                <span className="font-semibold">Route #{selectedRoute.route_id} loaded successfully</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Patient: {selectedRoute.patient_id} | Insurance: {selectedRoute.insurance_code}
              </p>
            </div>
          )}
        </div>

        {/* Route Details */}
        {selectedRoute && (
          <div className="space-y-6">
            {/* Route Summary */}
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Route #{selectedRoute.route_id}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaUser />
                      <span>{selectedRoute.patient_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRoute />
                      <span>{selectedRoute.insurance_code}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-primary-500">
                    {calculateProgress(selectedRoute)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(selectedRoute)}%` }}
                  />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDollarSign className="text-blue-500" />
                    <span className="font-semibold text-gray-700">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${selectedRoute.total_estimated_cost.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-green-500" />
                    <span className="font-semibold text-gray-700">Total Time</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedRoute.total_estimated_time}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRoute className="text-purple-500" />
                    <span className="font-semibold text-gray-700">Distance</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedRoute.total_distance_miles?.toFixed(2) || 'N/A'} mi
                  </p>
                </div>
              </div>
            </div>

            {/* Service Checklist */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Service Checklist</h3>
              <div className="space-y-4">
                {selectedRoute.route.map((node, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${
                      node.status === 'Completed'
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            node.status === 'Completed'
                              ? 'bg-green-500 text-white'
                              : 'bg-primary-500 text-white'
                          }`}>
                            {node.status === 'Completed' ? (
                              <FaCheckCircle />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{node.service_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <FaMapMarkerAlt className="text-primary-500" />
                              <span>{node.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-green-500" />
                            <span className="text-sm font-semibold">${node.price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-blue-500" />
                            <span className="text-sm font-semibold">{node.duration}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(node.status)}`}>
                              {node.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col gap-2">
                        {node.status !== 'Completed' && (
                          <>
                            <button
                              onClick={() => updateNodeStatus(
                                selectedRoute.route_id,
                                node.service_id,
                                'In Progress'
                              )}
                              disabled={updating}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => updateNodeStatus(
                                selectedRoute.route_id,
                                node.service_id,
                                'Completed'
                              )}
                              disabled={updating}
                              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        {node.status === 'Completed' && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <FaCheckCircle />
                            <span>Done</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedRoute && !loading && (
          <div className="card text-center py-12">
            <FaRoute className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Enter a Route ID to view patient care route</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProviderDashboard;


