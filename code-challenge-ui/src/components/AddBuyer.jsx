import React, { useState } from 'react';
import './AddBuyer.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

const AddBuyer = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    state: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateField = (name, value) => {
    let error = '';

    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
      } else if (value.length > 30) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name must not exceed 30 characters`;
      } else if (!/^[a-zA-Z ]+$/.test(value)) {
        error = `${name === 'firstName' ? 'First' : 'Last'} name must contain only letters and spaces`;
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Email must be valid';
      }
    }

    if (name === 'city') {
      if (!value.trim()) {
        error = 'City is required';
      } else if (value.length > 50) {
        error = 'City must not exceed 50 characters';
      }
    }

    if (name === 'state') {
      if (!value.trim()) {
        error = 'State is required';
      } else if (value.length > 50) {
        error = 'State must not exceed 50 characters';
      }
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error
    });

    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/buyers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`Buyer created successfully with ID: ${data.id}`);
        setFormData({ firstName: '', lastName: '', email: '', city: '', state: '' });
        setErrors({});
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrorMessage(errorData.message || 'Failed to create buyer');
        }
      }
    } catch (err) {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-buyer-container">
      <div className="add-buyer-card">
        <h1>Add New Buyer</h1>
        
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name <span className="required">*</span></label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              maxLength={30}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && (
              <span className="error-text">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name <span className="required">*</span></label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              maxLength={30}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && (
              <span className="error-text">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="city">City <span className="required">*</span></label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              maxLength={50}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && (
              <span className="error-text">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="state">State <span className="required">*</span></label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              maxLength={50}
              className={errors.state ? 'error' : ''}
            />
            {errors.state && (
              <span className="error-text">{errors.state}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBuyer;
