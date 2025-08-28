import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateIncident = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_type: '',
    location: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const incidentTypes = ['Fire', 'Smoke', 'Emergency'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    // Clear error when user selects a file
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.incident_type) {
      newErrors.incident_type = 'Incident type is required';
    }

    if (formData.image && formData.image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('incident_type', formData.incident_type);
      submitData.append('location', formData.location);
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await axios.post('/api/incidents', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage('Incident created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        incident_type: '',
        location: '',
        image: null
      });

      // Clear file input
      const fileInput = document.getElementById('image');
      if (fileInput) {
        fileInput.value = '';
      }

      // Redirect to incidents list after 2 seconds
      setTimeout(() => {
        navigate('/incidents');
      }, 2000);

    } catch (error) {
      console.error('Error creating incident:', error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'Failed to create incident. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Create New Incident</h2>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="error">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter incident title"
          />
          {errors.title && <div className="error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter incident description (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="incident_type">Incident Type *</label>
          <select
            id="incident_type"
            name="incident_type"
            value={formData.incident_type}
            onChange={handleInputChange}
          >
            <option value="">Select incident type</option>
            {incidentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.incident_type && <div className="error">{errors.incident_type}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Enter location (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
          />
          {errors.image && <div className="error">{errors.image}</div>}
        </div>

        <button 
          type="submit" 
          className="btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Incident'}
        </button>
      </form>
    </div>
  );
};

export default CreateIncident;
