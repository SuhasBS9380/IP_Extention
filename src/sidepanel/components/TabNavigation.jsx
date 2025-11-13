import React from 'react';
import { motion } from 'framer-motion';

function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="tab-container">
      <motion.button
        className={`tab ${activeTab === 'image' ? 'active' : ''}`}
        onClick={() => onTabChange('image')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="tab-icon">🔍</span>
        Image Search
      </motion.button>
      <motion.button
        className={`tab ${activeTab === 'username' ? 'active' : ''}`}
        onClick={() => onTabChange('username')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="tab-icon">👤</span>
        Username Check
      </motion.button>
    </div>
  );
}

export default TabNavigation;
