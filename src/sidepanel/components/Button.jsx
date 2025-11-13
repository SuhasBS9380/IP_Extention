import React from 'react';
import { motion } from 'framer-motion';

function Button({ children, loading, disabled, onClick, ...props }) {
  return (
    <motion.button
      className="primary-button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      <div className="button-content">
        {loading && <div className="spinner" />}
        {children}
      </div>
    </motion.button>
  );
}

export default Button;
