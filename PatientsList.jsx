import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientsApi } from '../services/api';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientsApi.getAll();
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setLoading(false);
    }
  };

  // Fixed delete function
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        // Set loading to true during deletion
        setLoading(true);
        
        // Call the delete API
        await patientsApi.delete(id);
        
        // If no error was thrown, deletion was successful
        // Update the local state to remove the deleted patient
        setPatients(patients.filter(patient => patient.patient_id !== id));
        toast.success('Patient deleted successfully');
      } catch (error) {
        console.error('Error deleting patient:', error);
        // Show a more specific error message
        toast.error('Failed to delete patient. The patient may have associated records.');
      } finally {
        // Always set loading back to false when done
        setLoading(false);
      }
    }
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="card-title">Patients</h1>
        <Link to="/patients/new" className="button button-primary">Add Patient</Link>
      </div>
      
      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="Search patients..."
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="card-body">
          {filteredPatients.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.patient_id}>
                    <td>{patient.first_name} {patient.last_name}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.date_of_birth}</td>
                    <td>{patient.phone}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/patients/${patient.patient_id}`} className="button button-outline">
                          View
                        </Link>
                        <button 
                          onClick={() => handleDelete(patient.patient_id)} 
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
            <p>No patients found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsList;