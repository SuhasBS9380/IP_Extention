import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ImageSearch from './components/ImageSearch';
import UsernameCheck from './components/UsernameCheck';
import Results from './components/Results';

function App() {
  const [activeTab, setActiveTab] = useState('image');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchData) => {
    setLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: activeTab === 'image' ? 'REVERSE_IMAGE_SEARCH' : 'USERNAME_CHECK',
        payload: searchData
      });
      
      if (response.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResults([]); // Clear results when switching tabs
  };

  return (
    <div className="app-container">
      <div className="background-orb" />
      <div className="content-wrapper">
        <Header />
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
        <AnimatePresence mode="wait">
          {activeTab === 'image' ? (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ImageSearch onSearch={handleSearch} loading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="username"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UsernameCheck onSearch={handleSearch} loading={loading} />
            </motion.div>
          )}
        </AnimatePresence>
        {results.length > 0 && (
          <Results results={results} type={activeTab} />
        )}
      </div>
    </div>
  );
}

export default App;
