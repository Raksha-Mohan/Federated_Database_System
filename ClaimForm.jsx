import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { claimsApi, patientsApi, policiesApi } from '../services/api';

const ClaimForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(isEditMode);
  const [patients, setPatients] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromUrl || '');
  
  const [claim, setClaim] = useState({
    claim_id: '',
    policy_id: '',
    record_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    amount: '',
    status: 'Pending',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients
        const patientsRes = await patientsApi.getAll();
        setPatients(patientsRes.data);
        
        if (isEditMode) {
          // Fetch claim details
          const claimRes = await claimsApi.getComplete(id);
          setClaim(claimRes.data.claim_info);
          setSelectedPatientId(claimRes.data.patient_info.patient_id.toString());
          
          // Fetch policies and medical records for the patient
          await fetchPatientRelatedData(claimRes.data.patient_info.patient_id);
        } else if (selectedPatientId) {
          // If not editing but have a patient ID (from URL), fetch their data
          await fetchPatientRelatedData(selectedPatientId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode, selectedPatientId]);

  const fetchPatientRelatedData = async (patientId) => {
    try {
      // Fetch policies
      const policiesRes = await policiesApi.getForPatient(patientId);
      setPolicies(policiesRes.data);
      
      // Fetch medical records
      const recordsRes = await patientsApi.getMedicalRecords(patientId);
      setMedicalRecords(recordsRes.data);
      
      // Auto-select first policy if creating a new claim
      if (!isEditMode && policiesRes.data.length > 0 && !claim.policy_id) {
        setClaim(prev => ({
          ...prev,
          policy_id: policiesRes.data[0].policy_id
        }));
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    }
  };

  const handlePatientChange = async (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    
    // Reset policy and medical record selections
    setClaim(prev => ({
      ...prev,
      policy_id: '',
      record_id: ''
    }));
    
    if (patientId) {
      await fetchPatientRelatedData(patientId);
    } else {
      setPolicies([]);
      setMedicalRecords([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClaim({
      ...claim,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submissionData = {
        ...claim,
        amount: parseFloat(claim.amount),
        record_id: parseInt(claim.record_id)
      };
      
      if (isEditMode) {
        await claimsApi.update(id, submissionData);
        toast.success('Claim updated successfully');
      } else {
        await claimsApi.create(submissionData);
        toast.success('Claim submitted successfully');
        navigate('/claims');
      }
    } catch (error) {
      console.error('Error saving claim:', error);
      toast.error('Failed to save claim');
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <h1 className="card-title mb-4">{isEditMode ? 'Edit Claim' : 'Submit New Claim'}</h1>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Claim Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {!isEditMode && (
              <div className="form-group">
                <label className="form-label">Patient</label>
                <select
                  name="patient_id"
                  className="form-select"
                  value={selectedPatientId}
                  onChange={handlePatientChange}
                  required
                  disabled={!!patientIdFromUrl}
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Insurance Policy</label>
                <select
                  name="policy_id"
                  className="form-select"
                  value={claim.policy_id}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                >
                  <option value="">Select Policy</option>
                  {policies.map(policy => (
                    <option key={policy.policy_id} value={policy.policy_id}>
                      {policy.provider} - {policy.policy_number}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Medical Record</label>
                <select
                  name="record_id"
                  className="form-select"
                  value={claim.record_id}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                >
                  <option value="">Select Medical Record</option>
                  {medicalRecords.map(record => (
                    <option key={record.record_id} value={record.record_id}>
                      {record.diagnosis} ({record.record_date})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Claim Date</label>
                <input
                  type="date"
                  name="claim_date"
                  className="form-input"
                  value={claim.claim_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  value={claim.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={claim.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Denied">Denied</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-textarea"
                value={claim.description}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => navigate('/claims')}
                className="button button-outline"
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {isEditMode ? 'Update Claim' : 'Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;