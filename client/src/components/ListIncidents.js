import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/incidents');
      setIncidents(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incidents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getIncidentTypeClass = (type) => {
    return type.toLowerCase();
  };

  if (loading) {
    return (
      <div>
        <h2>Incidents</h2>
        <div className="loading">Loading incidents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Incidents</h2>
        <div className="error">{error}</div>
        <button onClick={fetchIncidents} className="btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Incidents</h2>
      
      {incidents.length === 0 ? (
        <div className="no-incidents">
          <p>No incidents found.</p>
          <p>Create your first incident to get started.</p>
        </div>
      ) : (
        <div className="incidents-grid">
          {incidents.map((incident) => (
            <div key={incident.id} className="incident-card">
              <div className="incident-title">{incident.title}</div>
              
              <div className={`incident-type ${getIncidentTypeClass(incident.incident_type)}`}>
                {incident.incident_type}
              </div>
              
              {incident.description && (
                <div className="incident-description">
                  {incident.description}
                </div>
              )}
              
              {incident.location && (
                <div className="incident-location">
                  📍 {incident.location}
                </div>
              )}
              
              <div className="incident-time">
                Created: {formatDate(incident.created_at)}
              </div>
              
              {incident.image && (
                <div className="incident-image">
                  <img 
                    src={`/uploads/${incident.image}`} 
                    alt="Incident"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="filename" style={{ display: 'none' }}>
                    📷 {incident.image}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListIncidents;
