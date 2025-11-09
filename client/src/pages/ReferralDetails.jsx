import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaClock, FaMapMarkerAlt, FaUser, FaStethoscope, FaCalendar, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const ReferralDetails = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    note: '',
    appointmentDate: '',
    appointmentLocation: ''
  });

  useEffect(() => {
    fetchReferral();
  }, [id]);


  const fetchReferral = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/referrals/${id}`);
      setReferral(response.data.data);
      
      // Set default status for update form
      setStatusUpdate({
        status: response.data.data.status,
        note: '',
        appointmentDate: response.data.data.appointmentDate ? format(new Date(response.data.data.appointmentDate), "yyyy-MM-dd'T'HH:mm") : '',
        appointmentLocation: response.data.data.appointmentLocation || ''
      });
    } catch (error) {
      console.error('Error loading referral:', error);
      const errorMessage = error.response?.data?.message || 'Error loading referral';
      toast.error(errorMessage);
      
      // Only navigate away if it's a 403 (unauthorized) or 404 (not found)
      if (error.response?.status === 403 || error.response?.status === 404) {
        setTimeout(() => navigate('/referrals'), 2000);
      }
    } finally {
      // Always set loading to false, regardless of success or error
      setLoading(false);
    }
  };


  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/referrals/${id}/status`, statusUpdate);
      toast.success('Status updated successfully');
      fetchReferral();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading referral details...</p>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Referral not found</p>
          <Link to="/referrals" className="btn-primary">Back to Referrals</Link>
        </div>
      </div>
    );
  }

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
          <Link to="/referrals" className="text-primary-500 hover:text-primary-600 mb-4 inline-block">
            ← Back to Referrals
          </Link>
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{referral.referralNumber}</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(referral.status)}`}>
                {referral.status}
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                {getUrgencyIcon(referral.urgency)}
                <span className="capitalize">{referral.urgency}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Information */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Referral Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Specialty</label>
                    <p className="font-medium">{referral.specialty}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Match Score</label>
                    <p className="font-medium">{referral.matchScore || 'N/A'}/100</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Reason for Referral</label>
                  <p className="font-medium">{referral.reasonForReferral}</p>
                </div>
                {referral.clinicalNotes && (
                  <div>
                    <label className="text-sm text-gray-600">Clinical Notes</label>
                    <p className="font-medium whitespace-pre-wrap">{referral.clinicalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Information */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser /> Patient Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <p className="font-medium">{referral.patient?.firstName} {referral.patient?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{referral.patient?.email}</p>
                </div>
                {referral.patientInsurance?.provider && (
                  <div>
                    <label className="text-sm text-gray-600">Insurance</label>
                    <p className="font-medium">{referral.patientInsurance.provider}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Providers */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaStethoscope /> Providers
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Referring Provider</label>
                  <p className="font-medium">
                    {referral.referringProvider?.firstName} {referral.referringProvider?.lastName}
                  </p>
                  {referral.referringProvider?.organization && (
                    <p className="text-sm text-gray-500">{referral.referringProvider.organization}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600">Receiving Provider</label>
                  <p className="font-medium">
                    {referral.receivingProvider?.firstName} {referral.receivingProvider?.lastName}
                  </p>
                  {referral.receivingProvider?.organization && (
                    <p className="text-sm text-gray-500">{referral.receivingProvider.organization}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {referral.timeline?.map((event, index) => (
                  <div key={index} className="flex gap-4 border-l-2 border-primary-200 pl-4">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-primary-500 rounded-full mt-1"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{event.status}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.timestamp), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                      {event.note && <p className="text-sm text-gray-600 mt-1">{event.note}</p>}
                      {event.updatedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated by: {event.updatedBy?.firstName} {event.updatedBy?.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update (Provider/Admin only) */}
            {(user?.role === 'provider' || user?.role === 'admin') && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status</h2>
                <form onSubmit={handleStatusUpdate} className="space-y-4">
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="input-field"
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Note</label>
                    <textarea
                      className="input-field"
                      rows="3"
                      value={statusUpdate.note}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                      placeholder="Add a note about this status change"
                    />
                  </div>
                  {statusUpdate.status === 'scheduled' && (
                    <>
                      <div>
                        <label className="label flex items-center gap-2">
                          <FaCalendar /> Appointment Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          className="input-field"
                          value={statusUpdate.appointmentDate}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, appointmentDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label flex items-center gap-2">
                          <FaMapMarkerAlt /> Location
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={statusUpdate.appointmentLocation}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, appointmentLocation: e.target.value })}
                          placeholder="Clinic address or room number"
                        />
                      </div>
                    </>
                  )}
                  <button type="submit" className="btn-primary w-full">
                    Update Status
                  </button>
                </form>
              </div>
            )}

            {/* Appointment Info */}
            {referral.appointmentDate && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCalendar /> Appointment
                </h2>
                <div className="space-y-2">
                  <p className="font-medium">
                    {format(new Date(referral.appointmentDate), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    {format(new Date(referral.appointmentDate), 'h:mm a')}
                  </p>
                  {referral.appointmentLocation && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <FaMapMarkerAlt /> {referral.appointmentLocation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>{' '}
                  <span className="font-medium">
                    {format(new Date(referral.createdAt), 'MMM dd, yyyy')}
                  </span>
                </div>
                {referral.timeToAcknowledge && (
                  <div>
                    <span className="text-gray-600">Time to Acknowledge:</span>{' '}
                    <span className="font-medium">{referral.timeToAcknowledge.toFixed(1)} hours</span>
                  </div>
                )}
                {referral.timeToSchedule && (
                  <div>
                    <span className="text-gray-600">Time to Schedule:</span>{' '}
                    <span className="font-medium">{referral.timeToSchedule.toFixed(1)} hours</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReferralDetails;
