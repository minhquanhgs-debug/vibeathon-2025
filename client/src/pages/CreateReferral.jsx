import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaStethoscope, FaInfoCircle } from 'react-icons/fa';

const CreateReferral = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [formData, setFormData] = useState({
    patientId: '',
    receivingProviderId: '',
    specialty: '',
    reasonForReferral: '',
    clinicalNotes: '',
    urgency: 'routine',
    patientInsurance: {
      provider: '',
      memberId: ''
    }
  });
  const [matchScore, setMatchScore] = useState(null);

  useEffect(() => {
    fetchPatients();
    fetchProviders();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingUsers(true);
      setUserError('');
      const response = await axios.get('/api/auth/users?role=patient');
      const patientList = response.data.data || [];
      setPatients(patientList);
      
      if (patientList.length === 0) {
        setUserError('No patients found. Please register at least one patient account first.');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      const errorMsg = error.response?.data?.message || 'Error loading patients';
      setUserError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/auth/users?role=provider');
      const providerList = response.data.data || [];
      setProviders(providerList);
      
      if (providerList.length === 0) {
        setUserError(prev => prev ? prev + ' Also, no providers found.' : 'No providers found. Please register at least one provider account first.');
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      const errorMsg = error.response?.data?.message || 'Error loading providers';
      setUserError(prev => prev ? prev + ' ' + errorMsg : errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('insurance.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        patientInsurance: {
          ...formData.patientInsurance,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateMatchScore = () => {
    if (!formData.patientId || !formData.receivingProviderId) return;
    
    const patient = patients.find(p => p._id === formData.patientId);
    const provider = providers.find(p => p._id === formData.receivingProviderId);
    
    if (!patient || !provider) return;

    let score = 0;
    const criteria = {
      insuranceMatch: false,
      locationMatch: false,
      specialtyMatch: formData.specialty === provider.specialty
    };

    // Insurance match
    if (formData.patientInsurance.provider) {
      criteria.insuranceMatch = true;
      score += 30;
    }

    // Location match
    if (patient.location?.city === provider.location?.city) {
      criteria.locationMatch = true;
      score += 30;
    } else if (patient.location?.state === provider.location?.state) {
      score += 15;
    }

    // Specialty match
    if (criteria.specialtyMatch) {
      score += 20;
    }

    // Availability (assumed)
    score += 20;

    setMatchScore({ score, criteria });
  };

  useEffect(() => {
    calculateMatchScore();
  }, [formData.patientId, formData.receivingProviderId, formData.specialty, formData.patientInsurance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patientId) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.receivingProviderId) {
      toast.error('Please select a receiving provider');
      return;
    }
    if (!formData.specialty) {
      toast.error('Please enter a specialty');
      return;
    }
    if (!formData.reasonForReferral) {
      toast.error('Please enter a reason for referral');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/referrals', formData);
      toast.success('Referral created successfully!');
      navigate(`/referrals/${response.data.data._id}`);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error creating referral';
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.error || errorMessage;
        // Log full error details for debugging
        console.error('Error details:', {
          message: error.response.data.message,
          error: error.response.data.error,
          details: error.response.data.details
        });
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      console.error('Referral creation error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-500">ReferHarmony</Link>
          <button onClick={logout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Create New Referral</h2>

        {userError && (
          <div className="card bg-yellow-50 border-yellow-200 mb-6">
            <p className="text-yellow-800">
              <strong>⚠️ Notice:</strong> {userError}
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              You need at least one patient and one provider (other than yourself) to create a referral.
              {user?.role === 'provider' && ' Make sure you have registered patient accounts, or ask an admin to create them.'}
            </p>
          </div>
        )}

        {loadingUsers ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">Loading patients and providers...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="card">
            <label className="label flex items-center gap-2">
              <FaUser /> Patient
            </label>
            <select
              name="patientId"
              className="input-field"
              value={formData.patientId}
              onChange={handleChange}
              required
              disabled={patients.length === 0}
            >
              <option value="">
                {patients.length === 0 ? 'No patients available' : 'Select a patient'}
              </option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName} ({patient.email})
                </option>
              ))}
            </select>
            {patients.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please register at least one patient account first.</p>
            )}
          </div>

          {/* Receiving Provider */}
          <div className="card">
            <label className="label flex items-center gap-2">
              <FaStethoscope /> Receiving Provider
            </label>
            <select
              name="receivingProviderId"
              className="input-field"
              value={formData.receivingProviderId}
              onChange={handleChange}
              required
              disabled={providers.length === 0}
            >
              <option value="">
                {providers.length === 0 ? 'No providers available' : 'Select a provider'}
              </option>
              {providers.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  Dr. {provider.firstName} {provider.lastName} - {provider.specialty || 'General'}
                  {provider.organization && ` (${provider.organization})`}
                </option>
              ))}
            </select>
            {providers.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please register at least one provider account first.</p>
            )}
          </div>

          {/* Match Score Display */}
          {matchScore && formData.patientId && formData.receivingProviderId && (
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FaInfoCircle className="text-blue-500" />
                <span className="font-semibold text-blue-900">Match Score: {matchScore.score}/100</span>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Insurance Match: {matchScore.criteria.insuranceMatch ? '✓' : '✗'}</div>
                <div>Location Match: {matchScore.criteria.locationMatch ? '✓' : '✗'}</div>
                <div>Specialty Match: {matchScore.criteria.specialtyMatch ? '✓' : '✗'}</div>
              </div>
            </div>
          )}

          {/* Specialty */}
          <div className="card">
            <label className="label">Specialty</label>
            <input
              type="text"
              name="specialty"
              className="input-field"
              value={formData.specialty}
              onChange={handleChange}
              placeholder="e.g., Cardiology, Orthopedics, Neurology"
              required
            />
          </div>

          {/* Reason for Referral */}
          <div className="card">
            <label className="label">Reason for Referral</label>
            <textarea
              name="reasonForReferral"
              className="input-field"
              rows="3"
              value={formData.reasonForReferral}
              onChange={handleChange}
              placeholder="Brief description of why this referral is needed"
              required
            />
          </div>

          {/* Clinical Notes */}
          <div className="card">
            <label className="label">Clinical Notes</label>
            <textarea
              name="clinicalNotes"
              className="input-field"
              rows="5"
              value={formData.clinicalNotes}
              onChange={handleChange}
              placeholder="Additional clinical information, test results, relevant history..."
            />
          </div>

          {/* Urgency */}
          <div className="card">
            <label className="label">Urgency Level</label>
            <select
              name="urgency"
              className="input-field"
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Insurance Information */}
          <div className="card">
            <label className="label mb-4">Patient Insurance Information</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Insurance Provider</label>
                <input
                  type="text"
                  name="insurance.provider"
                  className="input-field"
                  value={formData.patientInsurance.provider}
                  onChange={handleChange}
                  placeholder="e.g., Blue Cross, Aetna"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Member ID</label>
                <input
                  type="text"
                  name="insurance.memberId"
                  className="input-field"
                  value={formData.patientInsurance.memberId}
                  onChange={handleChange}
                  placeholder="Insurance member ID"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || patients.length === 0 || providers.length === 0}
            >
              {loading ? 'Creating...' : 'Create Referral'}
            </button>
            <Link to="/referrals" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
        )}
      </main>
    </div>
  );
};

export default CreateReferral;
