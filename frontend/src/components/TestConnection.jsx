import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TestConnection = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const response = await api.get('/health');
      setMessage(`✅ Backend connected: ${response.data.status}`);
    } catch (error) {
      setMessage('❌ Backend connection failed. Make sure the server is running on port 8000.');
      console.error('Connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Backend Connection Test</h3>
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          <span>Testing connection...</span>
        </div>
      ) : (
        <p className={message.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {message}
        </p>
      )}
      <button
        onClick={testBackendConnection}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Test Again
      </button>
    </div>
  );
};

// Make sure this line exists - it's the default export!
export default TestConnection;