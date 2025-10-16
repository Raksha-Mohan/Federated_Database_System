import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Unauthorized = () => {
  const { userRole } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-500 px-6 py-4">
          <h1 className="text-white text-xl font-bold">Access Denied</h1>
        </div>
        <div className="p-6">
          <div className="flex items-center text-red-500 mb-4">
            <svg className="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
            </svg>
            <h2 className="text-lg font-semibold">Unauthorized</h2>
          </div>
          
          <p className="text-gray-700 mb-4">
            You don't have permission to access this page. 
            {userRole && <span> You are logged in as <strong>{userRole}</strong> user.</span>}
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="button button-primary"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;