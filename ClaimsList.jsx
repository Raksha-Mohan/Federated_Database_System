import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { claimsApi, patientsApi } from '../services/api';

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all patients
      const patientsRes = await patientsApi.getAll();
      setPatients(patientsRes.data);
      
      // Get claims for each patient
      const allClaims = [];
      for (const patient of patientsRes.data) {
        const claimsRes = await claimsApi.getForPatient(patient.patient_id);
        // Add patient name to each claim for display
        const claimsWithPatient = claimsRes.data.map(claim => ({
          ...claim,
          patientName: `${patient.first_name} ${patient.last_name}`
        }));
        allClaims.push(...claimsWithPatient);
      }
      
      setClaims(allClaims);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      try {
        await claimsApi.delete(id);
        setClaims(claims.filter(claim => claim.claim_id !== id));
        toast.success('Claim deleted successfully');
      } catch (error) {
        console.error('Error deleting claim:', error);
        toast.error('Failed to delete claim');
      }
    }
  };

  const filteredClaims = claims.filter(claim => {
    const claimText = `${claim.claim_id} ${claim.patientName} ${claim.description}`.toLowerCase();
    const matchesSearch = claimText.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'Processing': return 'badge badge-info';
      default: return 'badge badge-danger';
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="card-title">Insurance Claims</h1>
        <Link to="/claims/new" className="button button-primary">Add Claim</Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search claims..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Approved">Approved</option>
              <option value="Denied">Denied</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {filteredClaims.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map(claim => (
                  <tr key={claim.claim_id}>
                    <td>{claim.claim_id}</td>
                    <td>{claim.patientName}</td>
                    <td>{claim.claim_date}</td>
                    <td>${claim.amount.toFixed(2)}</td>
                    <td><span className={getStatusBadgeClass(claim.status)}>{claim.status}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/claims/${claim.claim_id}`} className="button button-outline">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(claim.claim_id)}
                          className="button button-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No claims found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsList;