import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaRoute, FaCheckCircle, FaTimesCircle, FaRedo, FaArrowLeft, FaCopy, FaIdCard } from 'react-icons/fa';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000';

const RoutePlanner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [patientInput, setPatientInput] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    insurance_code: 'AET-GOLD',
    location_latitude: 37.0842, // Joplin, MO default
    location_longitude: -94.5133,
    address: '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [excludedServices, setExcludedServices] = useState(new Set());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientInput(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const optimizeRoute = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/route_optimizer`,
        patientInput
      );
      setRouteData(response.data);
      toast.success('Route optimized successfully!');
    } catch (error) {
      console.error('Route optimization error:', error);
      toast.error(error.response?.data?.detail || 'Failed to optimize route');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId) => {
    const newExcluded = new Set(excludedServices);
    if (newExcluded.has(serviceId)) {
      newExcluded.delete(serviceId);
    } else {
      newExcluded.add(serviceId);
    }
    setExcludedServices(newExcluded);
  };

  const reoptimizeRoute = async () => {
    if (!routeData?.route_id) {
      toast.error('No route to reoptimize');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reoptimize_route`,
        {
          route_id: routeData.route_id,
          excluded_service_ids: Array.from(excludedServices)
        }
      );
      setRouteData(response.data);
      setExcludedServices(new Set());
      toast.success('Route reoptimized successfully!');
    } catch (error) {
      console.error('Reoptimization error:', error);
      toast.error(error.response?.data?.detail || 'Failed to reoptimize route');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    return timeStr || '0 mins';
  };

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
          <h1 className="text-2xl font-bold text-primary-500">Route Planner</h1>
          <p className="text-sm text-gray-600">AI-Powered Care Route Optimization</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Input Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={patientInput.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Patient Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Code
              </label>
              <select
                name="insurance_code"
                value={patientInput.insurance_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="AET-GOLD">Aetna Gold</option>
                <option value="BCBS-SILVER">Blue Cross Blue Shield Silver</option>
                <option value="UHC-PLATINUM">UnitedHealthcare Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                name="location_latitude"
                value={patientInput.location_latitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                name="location_longitude"
                value={patientInput.location_longitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                name="address"
                value={patientInput.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Street Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="text"
                name="phone"
                value={patientInput.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Phone Number"
              />
            </div>
          </div>
          <button
            onClick={optimizeRoute}
            disabled={loading}
            className="mt-4 btn-primary flex items-center gap-2"
          >
            <FaRoute /> {loading ? 'Optimizing...' : 'Optimize Route'}
          </button>
        </div>

        {/* Route Visualization */}
        {routeData && (
          <div className="space-y-6">
            {/* Route ID Display */}
            {routeData.route_id && (
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaIdCard className="text-2xl text-primary-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Your Route ID</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Share this ID with your healthcare provider to track your care route
                      </p>
                      <div className="flex items-center gap-3">
                        <code className="text-2xl font-bold text-primary-600 bg-white px-4 py-2 rounded border-2 border-primary-300">
                          {routeData.route_id}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(routeData.route_id.toString());
                            toast.success('Route ID copied to clipboard!');
                          }}
                          className="btn-secondary flex items-center gap-2 text-sm"
                          title="Copy Route ID"
                        >
                          <FaCopy /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Route Summary */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Optimized Route</h2>
                <button
                  onClick={reoptimizeRoute}
                  disabled={loading || excludedServices.size === 0}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <FaRedo /> Reoptimize
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDollarSign className="text-blue-500" />
                    <span className="font-semibold text-gray-700">Total Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${routeData.total_estimated_cost?.toFixed(2) || '0.00'}
                  </p>
                  {routeData.total_service_cost && routeData.total_travel_cost && (
                    <p className="text-xs text-gray-600 mt-1">
                      Services: ${routeData.total_service_cost.toFixed(2)} + Travel: ${routeData.total_travel_cost.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaDollarSign className="text-green-500" />
                    <span className="font-semibold text-gray-700">Service Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${routeData.total_service_cost?.toFixed(2) || routeData.total_estimated_cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaRoute className="text-orange-500" />
                    <span className="font-semibold text-gray-700">Travel Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    ${routeData.total_travel_cost?.toFixed(2) || '0.00'}
                  </p>
                  {routeData.total_distance_miles && (
                    <p className="text-xs text-gray-600 mt-1">
                      {routeData.total_distance_miles.toFixed(2)} miles
                    </p>
                  )}
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-purple-500" />
                    <span className="font-semibold text-gray-700">Total Time</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatTime(routeData.total_estimated_time)}
                  </p>
                </div>
              </div>

              {/* Route Nodes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Service Route</h3>
                {routeData.route.map((node, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      excludedServices.has(node.service_id)
                        ? 'border-red-300 bg-red-50 opacity-60'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{node.service_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <FaMapMarkerAlt className="text-primary-500" />
                              <span>{node.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="text-green-500" />
                            <span className="text-sm">
                              <span className="font-semibold">${node.price.toFixed(2)}</span>
                              {node.covered && (
                                <span className="text-green-600 ml-1">(Covered)</span>
                              )}
                            </span>
                          </div>
                          {node.travel_cost && (
                            <div className="flex items-center gap-2">
                              <FaRoute className="text-orange-500" />
                              <span className="text-sm">
                                <span className="font-semibold">${node.travel_cost.toFixed(2)}</span>
                                {node.travel_distance_miles && (
                                  <span className="text-gray-600 ml-1">({node.travel_distance_miles.toFixed(1)} mi)</span>
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FaClock className="text-blue-500" />
                            <span className="text-sm font-semibold">{node.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {node.covered ? (
                              <FaCheckCircle className="text-green-500" />
                            ) : (
                              <FaTimesCircle className="text-red-500" />
                            )}
                            <span className="text-sm">{node.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleService(node.service_id)}
                        className={`ml-4 px-3 py-1 rounded text-sm ${
                          excludedServices.has(node.service_id)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {excludedServices.has(node.service_id) ? 'Include' : 'Exclude'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {routeData.ai_recommendations && (
              <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI Recommendations
                </h3>
                
                {routeData.ai_recommendations.explanation && (
                  <div className="mb-4 p-4 bg-white rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Route Explanation</h4>
                    <p className="text-gray-700">{routeData.ai_recommendations.explanation}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routeData.ai_recommendations.cost_tips && routeData.ai_recommendations.cost_tips.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">💰 Cost-Saving Tips</h4>
                      <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                        {routeData.ai_recommendations.cost_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {routeData.ai_recommendations.time_tips && routeData.ai_recommendations.time_tips.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">⏱️ Time-Saving Tips</h4>
                      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        {routeData.ai_recommendations.time_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {routeData.ai_recommendations.health_considerations && routeData.ai_recommendations.health_considerations.length > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🏥 Health Considerations</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {routeData.ai_recommendations.health_considerations.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {!routeData && !loading && (
          <div className="card text-center py-12">
            <FaRoute className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Enter patient information and click "Optimize Route" to begin</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoutePlanner;

