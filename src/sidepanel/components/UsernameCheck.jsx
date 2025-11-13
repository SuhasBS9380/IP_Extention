import React, { useState } from 'react';
import Button from './Button';

function UsernameCheck({ onSearch, loading }) {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('all');
  const [error, setError] = useState('');

  const validateUsername = (value) => {
    if (!value) {
      setError('');
      return false;
    }
    const validPattern = /^[a-zA-Z0-9_]+$/;
    if (!validPattern.test(value)) {
      setError('Only letters, numbers, and underscores allowed');
      return false;
    }
    if (value.length > 30) {
      setError('Username must be 30 characters or less');
      return false;
    }
    setError('');
    return true;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    validateUsername(value);
  };

  const handleSearch = () => {
    if (validateUsername(username)) {
      onSearch({ username, platforms: [platform] });
    }
  };

  const canSearch = username && !error;

  return (
    <div className="search-container">
      <div className="glass-card">
        <label className="input-label">Username</label>
        <input
          type="text"
          className="glass-input"
          placeholder="Enter username (e.g., john_doe)"
          value={username}
          onChange={handleUsernameChange}
          maxLength={30}
        />
        <div className="char-count">{username.length}/30</div>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="glass-card">
        <label className="input-label">Check on Platform</label>
        <select
          className="glass-select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="all">All Platforms</option>
          <option value="twitter">Twitter / X</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>

      <Button
        onClick={handleSearch}
        disabled={!canSearch || loading}
        loading={loading}
      >
        {loading ? 'Checking...' : 'Check Availability'}
      </Button>
    </div>
  );
}

export default UsernameCheck;
