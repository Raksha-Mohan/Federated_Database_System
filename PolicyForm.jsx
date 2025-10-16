import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { policiesApi, patientsApi } from '../services/api';

const PolicyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [patients, setPatients] = useState([]);
  
  const [policy, setPolicy] = useState({
    policy_id: '',
    patient_id: patientIdFromUrl || '',
    provider: '',
    policy_number: '',
    coverage_type: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    coverage_details: {
      deductible: 0,
      copay: 0,
      max_out_of_pocket: 0,
      coverage_percentage: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients
        const patientsRes = await patientsApi.getAll();
        setPatients(patientsRes.data);
        
        if (isEditMode) {
          // Fetch policy details
          const policyRes = await policiesApi.getById(id);
          setPolicy(policyRes.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('coverage_details.')) {
      const field = name.split('.')[1];
      setPolicy({
        ...policy,
        coverage_details: {
          ...policy.coverage_details,
          [field]: parseFloat(value)
        }
      });
    } else {
      setPolicy({
        ...policy,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submissionData = {
        ...policy,
        patient_id: parseInt(policy.patient_id)
      };
      
      if (isEditMode) {
        await policiesApi.update(id, submissionData);
        toast.success('Policy updated successfully');
      } else {
        await policiesApi.create(submissionData);
        toast.success('Policy created successfully');
        navigate('/policies');
      }
    } catch (error) {
      console.error('Error saving policy:', error);
      toast.error('Failed to save policy');
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <h1 className="card-title mb-4">{isEditMode ? 'Edit Policy' : 'Add New Policy'}</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Policy Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2">
              {!isEditMode && (
                <div className="form-group">
                  <label className="form-label">Policy ID</label>
                  <input
                    type="text"
                    name="policy_id"
                    className="form-input"
                    value={policy.policy_id}
                    onChange={handleChange}
                    required
                    placeholder="e.g., POL001"
                  />
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  name="patient_id"
                  className="form-select"
                  value={policy.patient_id}
                  onChange={handleChange}
                  required
                  disabled={!!patientIdFromUrl || isEditMode}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Provider</label>
                <input
                  type="text"
                  name="provider"
                  className="form-input"
                  value={policy.provider}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Policy Number</label>
                <input
                  type="text"
                  name="policy_number"
                  className="form-input"
                  value={policy.policy_number}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Coverage Type</label>
                <select
                  name="coverage_type"
                  className="form-select"
                  value={policy.coverage_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                  <option value="Group">Group</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  className="form-input"
                  value={policy.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  className="form-input"
                  value={policy.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <h3 className="card-title mt-4 mb-2">Coverage Details</h3>
            
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Deductible ($)</label>
                <input
                  type="number"
                  name="coverage_details.deductible"
                  className="form-input"
                  value={policy.coverage_details.deductible}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Copay ($)</label>
                <input
                  type="number"
                  name="coverage_details.copay"
                  className="form-input"
                  value={policy.coverage_details.copay}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Out-of-Pocket ($)</label>
                <input
                  type="number"
                  name="coverage_details.max_out_of_pocket"
                  className="form-input"
                  value={policy.coverage_details.max_out_of_pocket}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Coverage Percentage (%)</label>
                <input
                  type="number"
                  name="coverage_details.coverage_percentage"
                  className="form-input"
                  value={policy.coverage_details.coverage_percentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => navigate('/policies')}
                className="button button-outline"
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {isEditMode ? 'Update Policy' : 'Save Policy'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PolicyForm;