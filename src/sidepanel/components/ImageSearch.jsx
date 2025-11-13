import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

function ImageSearch({ onSearch, loading }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setPreviewUrl(url);
      setImageFile(null);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      setImageUrl('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSearch = () => {
    const searchData = imageFile ? 
      { imageData: previewUrl } : 
      { imageData: imageUrl };
    onSearch(searchData);
  };

  const clearImage = () => {
    setImageUrl('');
    setImageFile(null);
    setPreviewUrl('');
  };

  const canSearch = imageUrl || imageFile;

  return (
    <div className="search-container">
      <div className="glass-card">
        <label className="input-label">Image URL</label>
        <input
          type="url"
          className="glass-input"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={handleUrlChange}
        />
        <p className="hint">💡 Right-click on any image → "Copy Image Address"</p>
      </div>

      <div className="glass-card">
        <motion.div
          className="drop-zone"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="drop-icon">📸</div>
          <p className="drop-text">Drop an image here or click to browse</p>
          <p className="hint">Supports JPG, PNG, GIF up to 10MB</p>
        </motion.div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>

      {previewUrl && (
        <motion.div
          className="preview-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img src={previewUrl} alt="Preview" className="preview-image" />
          <button className="remove-button" onClick={clearImage}>×</button>
        </motion.div>
      )}

      <Button
        onClick={handleSearch}
        disabled={!canSearch || loading}
        loading={loading}
      >
        {loading ? 'Searching...' : 'Search Image'}
      </Button>
    </div>
  );
}

export default ImageSearch;
