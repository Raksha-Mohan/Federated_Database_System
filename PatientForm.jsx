import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientsApi, medicalRecordsApi } from '../services/api';

const PatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [patient, setPatient] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    email: ''
  });
  
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    doctor_id: 1, // Default doctor ID
    diagnosis: '',
    treatment: '',
    notes: '',
    record_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isEditMode) {
      fetchPatientData();
    }
  }, [id, isEditMode]);

  const fetchPatientData = async () => {
    try {
      const response = await patientsApi.getComplete(id);
      setPatient(response.data.patient_info);
      setMedicalRecords(response.data.medical_records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to load patient data');
      setLoading(false);
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPatient = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await patientsApi.update(id, patient);
        toast.success('Patient updated successfully');
      } else {
        const response = await patientsApi.create(patient);
        toast.success('Patient created successfully');
        navigate(`/patients/${response.data.patient_id}`);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient');
    }
  };

  const handleAddMedicalRecord = async (e) => {
    e.preventDefault();
    try {
      const recordData = {
        ...newRecord,
        patient_id: parseInt(id)
      };
      
      await medicalRecordsApi.create(recordData);
      toast.success('Medical record added');
      
      // Reset form and refresh records
      setNewRecord({
        doctor_id: 1,
        diagnosis: '',
        treatment: '',
        notes: '',
        record_date: new Date().toISOString().split('T')[0]
      });
      setShowAddRecord(false);
      fetchPatientData();
    } catch (error) {
      console.error('Error adding medical record:', error);
      toast.error('Failed to add medical record');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordsApi.delete(recordId);
        setMedicalRecords(medicalRecords.filter(record => record.record_id !== recordId));
        toast.success('Medical record deleted');
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error('Failed to delete record');
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <h1 className="card-title mb-4">{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h1>
      
      {/* Patient Form */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Patient Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmitPatient}>
            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={patient.first_name}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={patient.last_name}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-input"
                  value={patient.date_of_birth}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-select"
                  value={patient.gender}
                  onChange={handlePatientChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={patient.phone}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={patient.email || ''}
                  onChange={handlePatientChange}
                />
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={patient.address}
                  onChange={handlePatientChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="button button-outline"
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {isEditMode ? 'Update Patient' : 'Save Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Medical Records Section (only visible in edit mode) */}
      {isEditMode && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">Medical Records</h2>
              <button
                onClick={() => setShowAddRecord(!showAddRecord)}
                className="button button-primary"
              >
                {showAddRecord ? 'Cancel' : 'Add Record'}
              </button>
            </div>
          </div>
          
          {/* Add Record Form */}
          {showAddRecord && (
            <div className="card-body" style={{ borderBottom: '1px solid #e5e5e5' }}>
              <form onSubmit={handleAddMedicalRecord}>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Doctor</label>
                    <select
                      name="doctor_id"
                      className="form-select"
                      value={newRecord.doctor_id}
                      onChange={handleRecordChange}
                      required
                    >
                      <option value="1">Dr. Sarah Williams</option>
                      <option value="2">Dr. Michael Brown</option>
                      <option value="3">Dr. Emily Davis</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="record_date"
                      className="form-input"
                      value={newRecord.record_date}
                      onChange={handleRecordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Diagnosis</label>
                    <input
                      type="text"
                      name="diagnosis"
                      className="form-input"
                      value={newRecord.diagnosis}
                      onChange={handleRecordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Treatment</label>
                    <input
                      type="text"
                      name="treatment"
                      className="form-input"
                      value={newRecord.treatment}
                      onChange={handleRecordChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      className="form-textarea"
                      value={newRecord.notes}
                      onChange={handleRecordChange}
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button type="submit" className="button button-primary">
                    Add Medical Record
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="card-body">
            {medicalRecords.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Treatment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalRecords.map(record => (
                    <tr key={record.record_id}>
                      <td>{record.record_date}</td>
                      <td>{record.diagnosis}</td>
                      <td>{record.treatment}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteRecord(record.record_id)}
                          className="button button-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No medical records found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;