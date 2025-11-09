import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHospital } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    // Check if it contains @ (email address)
    if (phone.includes('@')) {
      return 'Phone number cannot be an email address';
    }
    // Check if it has at least 10 digits
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return 'Please enter a valid phone number (at least 10 digits)';
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneError = validatePhone(formData.phone);
    if (phoneError !== true) {
      setErrors({ phone: phoneError });
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-success-50 py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <FaHospital className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ReferHarmony</h1>
          <p className="text-gray-600">Bridging Care with Clarity and Precision</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
            </div>

            <div className="mb-4">
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="mb-4">
              <label className="label">Phone <span className="text-gray-400 text-sm">(Optional)</span></label>
              <input
                type="tel"
                name="phone"
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                pattern="[0-9+\-() ]+"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Enter phone number, not email address</p>
            </div>

            <div className="mb-6">
              <label className="label">I am a...</label>
              <select
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="provider">Healthcare Provider</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
