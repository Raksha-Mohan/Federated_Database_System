import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // For a real app, this would be an API call to a backend service
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Simple hardcoded authentication for demo purposes
    // In a real app, this would be an API call with proper security measures
    if (username === 'hospital' && password === 'hospital123') {
      // Use the login function from AuthContext
      login('hospital');
      navigate('/');
    } else if (username === 'insurance' && password === 'insurance123') {
      login('insurance');
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Healthcare & Insurance System</h1>
        
        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="button button-primary w-full py-2 rounded-lg"
          >
            Log In
          </button>
        </form>
        
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-500 text-center">Demo Credentials:</p>
          <div className="flex justify-around mt-2">
            <div>
              <p className="text-xs font-bold">Hospital Staff</p>
              <p className="text-xs">Username: hospital</p>
              <p className="text-xs">Password: hospital123</p>
            </div>
            <div>
              <p className="text-xs font-bold">Insurance Staff</p>
              <p className="text-xs">Username: insurance</p>
              <p className="text-xs">Password: insurance123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;