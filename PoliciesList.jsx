import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { policiesApi, patientsApi } from '../services/api';

const PoliciesList = () => {
  const [policies, setPolicies] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all patients
      const patientsRes = await patientsApi.getAll();
      setPatients(patientsRes.data);
      
      // Get policies for each patient
      const allPolicies = [];
      for (const patient of patientsRes.data) {
        const policiesRes = await policiesApi.getForPatient(patient.patient_id);
        // Add patient name to each policy for display
        const policiesWithPatient = policiesRes.data.map(policy => ({
          ...policy,
          patientName: `${patient.first_name} ${patient.last_name}`
        }));
        allPolicies.push(...policiesWithPatient);
      }
      
      setPolicies(allPolicies);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast.error('Failed to load policies');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await policiesApi.delete(id);
        setPolicies(policies.filter(policy => policy.policy_id !== id));
        toast.success('Policy deleted successfully');
      } catch (error) {
        console.error('Error deleting policy:', error);
        toast.error('Failed to delete policy');
      }
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const policyText = `${policy.provider} ${policy.policy_number} ${policy.patientName}`.toLowerCase();
    return policyText.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="card-title">Insurance Policies</h1>
        <Link to="/policies/new" className="button button-primary">Add Policy</Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Search policies..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="card-body">
          {filteredPolicies.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Policy ID</th>
                  <th>Provider</th>
                  <th>Patient</th>
                  <th>Coverage Type</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPolicies.map(policy => (
                  <tr key={policy.policy_id}>
                    <td>{policy.policy_id}</td>
                    <td>{policy.provider} - {policy.policy_number}</td>
                    <td>{policy.patientName}</td>
                    <td><span className="badge badge-info">{policy.coverage_type}</span></td>
                    <td>{policy.end_date}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/policies/${policy.policy_id}`} className="button button-outline">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(policy.policy_id)}
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
            <p>No policies found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoliciesList;