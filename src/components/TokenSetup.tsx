import React, { useState } from 'react';
import { setJupyterToken } from '../services/jupyterApi';
import './TokenSetup.css';

interface TokenSetupProps {
  onTokenSet: () => void;
}

export const TokenSetup: React.FC<TokenSetupProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a valid token');
      return;
    }

    setJupyterToken(token);
    localStorage.setItem('jupyter_token', token);
    onTokenSet();
  };

  return (
    <div className="token-setup">
      <div className="token-setup-card">
        <h1> Interactive Model Analysis Workbench</h1>
        <p className="subtitle">Connect to JupyterHub</p>

        <div className="instructions">
          <h3>Setup Instructions:</h3>
          <ol>
            <li>Make sure JupyterHub is running at <code>http://localhost:8000</code></li>
            <li>Go to <a href="http://localhost:8000/hub/signup" target="_blank" rel="noopener noreferrer">
              http://localhost:8000/hub/signup
            </a></li>
            <li>Create an admin user (username: <strong>admin</strong>)</li>
            <li>Navigate to <a href="http://localhost:8000/hub/token" target="_blank" rel="noopener noreferrer">
              http://localhost:8000/hub/token
            </a></li>
            <li>Generate a token and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="token">JupyterHub Token:</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              placeholder="Enter your JupyterHub token..."
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="submit-button">
            Connect to JupyterHub
          </button>
        </form>

        <div className="footer-note">
          <small>
            Your token will be stored locally and used for API authentication.
          </small>
        </div>
      </div>
    </div>
  );
};
