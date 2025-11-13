import React from 'react';
import { motion } from 'framer-motion';
import { FaTwitter, FaInstagram, FaTiktok, FaLinkedin, FaFacebook } from 'react-icons/fa';

function Results({ results, type }) {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      className="results-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="results-title">Results ({results.length})</h3>
      <div className="results-container">
        {results.map((result, index) => (
          <ResultCard key={index} result={result} type={type} />
        ))}
      </div>
    </motion.div>
  );
}

function ResultCard({ result, type }) {
  const handleOpen = () => {
    if (result.url && result.url !== '#') {
      chrome.tabs.create({ url: result.url });
    }
  };

  // Map platforms to their icons
  const platformIcons = {
    twitter: <FaTwitter />,
    instagram: <FaInstagram />,
    tiktok: <FaTiktok />,
    linkedin: <FaLinkedin />,
    facebook: <FaFacebook />
  };

  const platform = result.platform?.toLowerCase();
  const PlatformIcon = platformIcons[platform];

  return (
    <motion.div
      className="result-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      {result.thumbnailUrl && (
        <img 
          src={result.thumbnailUrl} 
          alt="Thumbnail" 
          className="result-thumbnail"
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      <div className="result-info">
        <h4 className="result-title">{result.title}</h4>
        <p className="result-url">{result.url}</p>
        {result.metadata?.snippet && (
          <p className="result-snippet">{result.metadata.snippet}</p>
        )}
        <div className="result-badges">
          {PlatformIcon && (
            <span className={`platform-badge platform-icon-only ${platform}`} title={platform}>
              {PlatformIcon}
            </span>
          )}
          {result.metadata?.available !== undefined && (
            <span className={`status-badge ${result.metadata.available ? 'available' : 'taken'}`}>
              {result.metadata.available ? '✓ Available' : '✗ Taken'}
            </span>
          )}
        </div>
      </div>
      {result.url && result.url !== '#' && !result.metadata?.available && (
        <button className="open-link" onClick={handleOpen}>
          Open
        </button>
      )}
    </motion.div>
  );
}

export default Results;
