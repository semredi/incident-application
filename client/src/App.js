import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CreateIncident from './components/CreateIncident';
import ListIncidents from './components/ListIncidents';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <div className="container">
        <h1>Fire Incident Mini-Portal</h1>
        <div className="nav-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Create Incident
          </Link>
          <Link 
            to="/incidents" 
            className={location.pathname === '/incidents' ? 'active' : ''}
          >
            View Incidents
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<CreateIncident />} />
            <Route path="/incidents" element={<ListIncidents />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
