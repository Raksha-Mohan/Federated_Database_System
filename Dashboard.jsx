import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientsApi, claimsApi } from '../services/api';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const { userRole } = useAuth();
  const [stats, setStats] = useState({
    patientCount: 0,
    policyCount: 0,
    claimCount: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For both hospital and insurance users, we need to count patients
        const patientsRes = await patientsApi.getAll();
        setRecentPatients(patientsRes.data.slice(0, 5));
        
        // If we're insurance user, also fetch claims
        if (userRole === 'insurance') {
          // Just fetch claims for the first patient as a demonstration
          if (patientsRes.data.length > 0) {
            const claimsRes = await claimsApi.getForPatient(patientsRes.data[0].patient_id);
            setRecentClaims(claimsRes.data);
            
            setStats({
              patientCount: patientsRes.data.length,
              policyCount: patientsRes.data.length, // Simplified: assume 1 policy per patient
              claimCount: claimsRes.data.length
            });
          }
        } else {
          // For hospital users, just show patient stats
          setStats({
            patientCount: patientsRes.data.length,
            policyCount: 0,
            claimCount: 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userRole]);

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <h1 className="card-title mb-4">
        {userRole === 'hospital' ? 'Hospital Dashboard' : 'Insurance Dashboard'}
      </h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3">
        <div className="card">
          <div className="card-body">
            <h3 className="card-title">Patients</h3>
            <p className="mt-2" style={{ fontSize: '2rem' }}>{stats.patientCount}</p>
            {userRole === 'hospital' && (
              <Link to="/patients" className="button button-primary mt-2">View Patients</Link>
            )}
          </div>
        </div>
        
        {userRole === 'insurance' && (
          <>
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Policies</h3>
                <p className="mt-2" style={{ fontSize: '2rem' }}>{stats.policyCount}</p>
                <Link to="/policies" className="button button-primary mt-2">View Policies</Link>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Claims</h3>
                <p className="mt-2" style={{ fontSize: '2rem' }}>{stats.claimCount}</p>
                <Link to="/claims" className="button button-primary mt-2">View Claims</Link>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Recent Activity Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">
            {userRole === 'hospital' ? 'Recent Patients' : 'Recent Activity'}
          </h2>
        </div>
        <div className="card-body">
          {userRole === 'hospital' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map(patient => (
                  <tr key={patient.patient_id}>
                    <td>{patient.first_name} {patient.last_name}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.phone}</td>
                    <td>
                      <Link to={`/patients/${patient.patient_id}`} className="button button-outline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map(claim => (
                  <tr key={claim.claim_id}>
                    <td>{claim.claim_id}</td>
                    <td>{claim.claim_date}</td>
                    <td>${parseFloat(claim.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        claim.status === 'Approved' ? 'badge-success' : 
                        claim.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/claims/${claim.claim_id}`} className="button button-outline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;