import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const MainLayout = ({ children }) => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container container">
          <Link to="/" className="navbar-brand">Healthcare & Insurance</Link>
          <div className="navbar-links">
            <Link to="/" className="navbar-link">Dashboard</Link>
            
            {userRole === 'hospital' && (
              <Link to="/patients" className="navbar-link">Hospital</Link>
            )}
            
            {userRole === 'insurance' && (
              <Link to="/policies" className="navbar-link">Insurance</Link>
            )}
            
            <button
              onClick={handleLogout}
              className="navbar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-title">
            {userRole === 'hospital' ? 'Hospital Portal' : 'Insurance Portal'}
          </div>
          
          <div className="sidebar-links">
            <NavLink
              to="/"
              className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
            >
              Dashboard
            </NavLink>
            
            {userRole === 'hospital' && (
              <>
                <div className="sidebar-title">Patient Management</div>
                <NavLink
                  to="/patients"
                  className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                  Patients
                </NavLink>
              </>
            )}
            
            {userRole === 'insurance' && (
              <>
                <div className="sidebar-title">Insurance Management</div>
                <NavLink
                  to="/policies"
                  className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                  Policies
                </NavLink>
                <NavLink
                  to="/claims"
                  className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                  Claims
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="container">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;