import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaStethoscope, FaBuilding, FaMapMarkerAlt, FaBell, FaSave, FaTimes } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    npiNumber: '',
    organization: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    dateOfBirth: '',
    insuranceProvider: '',
    insuranceId: '',
    notifications: {
      email: true,
      sms: true
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        specialty: user.specialty || '',
        npiNumber: user.npiNumber || '',
        organization: user.organization || '',
        location: {
          address: user.location?.address || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          zipCode: user.location?.zipCode || ''
        },
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        insuranceProvider: user.insuranceProvider || '',
        insuranceId: user.insuranceId || '',
        notifications: {
          email: user.notifications?.email !== false,
          sms: user.notifications?.sms !== false
        }
      });
    }
  }, [user]);

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    if (phone.includes('@')) {
      return 'Phone number cannot be an email address';
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return 'Please enter a valid phone number (at least 10 digits)';
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [field]: value
        }
      });
    } else if (name.startsWith('notifications.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        notifications: {
          ...formData.notifications,
          [field]: checked
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Real-time phone validation
      if (name === 'phone') {
        const phoneError = validatePhone(value);
        if (phoneError !== true) {
          setErrors({ ...errors, phone: phoneError });
        } else {
          const newErrors = { ...errors };
          delete newErrors.phone;
          setErrors(newErrors);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneError = validatePhone(formData.phone);
    if (phoneError !== true) {
      setErrors({ phone: phoneError });
      toast.error(phoneError);
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        notifications: formData.notifications
      };

      // Add role-specific fields
      if (user?.role === 'provider') {
        updateData.specialty = formData.specialty || undefined;
        updateData.npiNumber = formData.npiNumber || undefined;
        updateData.organization = formData.organization || undefined;
        updateData.location = formData.location.address || formData.location.city 
          ? formData.location 
          : undefined;
      }

      if (user?.role === 'patient') {
        updateData.dateOfBirth = formData.dateOfBirth || undefined;
        updateData.insuranceProvider = formData.insuranceProvider || undefined;
        updateData.insuranceId = formData.insuranceId || undefined;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-primary-500 hover:text-primary-600 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">Update your personal information and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="input-field"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="input-field"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label flex items-center gap-2">
                  <FaEnvelope /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="input-field bg-gray-100"
                  value={formData.email}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div className="md:col-span-2">
                <label className="label flex items-center gap-2">
                  <FaPhone /> Phone <span className="text-gray-400 text-sm">(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Enter phone number, not email address</p>
              </div>
            </div>
          </div>

          {/* Provider-Specific Fields */}
          {user.role === 'provider' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaStethoscope /> Provider Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    className="input-field"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="e.g., Cardiology, Orthopedics"
                  />
                </div>
                <div>
                  <label className="label">NPI Number</label>
                  <input
                    type="text"
                    name="npiNumber"
                    className="input-field"
                    value={formData.npiNumber}
                    onChange={handleChange}
                    placeholder="National Provider Identifier"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label flex items-center gap-2">
                    <FaBuilding /> Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    className="input-field"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Hospital or clinic name"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mt-4">
                <label className="label flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt /> Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="location.address"
                      className="input-field"
                      value={formData.location.address}
                      onChange={handleChange}
                      placeholder="Street Address"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="location.city"
                      className="input-field"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="location.state"
                      className="input-field"
                      value={formData.location.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="location.zipCode"
                      className="input-field"
                      value={formData.location.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Patient-Specific Fields */}
          {user.role === 'patient' && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Patient Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="input-field"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    className="input-field"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    placeholder="e.g., Blue Cross, Aetna"
                  />
                </div>
                <div>
                  <label className="label">Insurance Member ID</label>
                  <input
                    type="text"
                    name="insuranceId"
                    className="input-field"
                    value={formData.insuranceId}
                    onChange={handleChange}
                    placeholder="Insurance member ID"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Preferences */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaBell /> Notification Preferences
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications.email"
                  checked={formData.notifications.email}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifications.sms"
                  checked={formData.notifications.sms}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2 flex-1"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
              <FaTimes /> Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;





