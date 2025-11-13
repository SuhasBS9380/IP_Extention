import React from 'react';
import { motion } from 'framer-motion';

function Header() {
  return (
    <header className="header">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Social Scanner
      </motion.h1>
      <p className="subtitle">Find profiles & check usernames across platforms</p>
      <div className="header-divider">
        <div className="divider-line"></div>
      </div>
    </header>
  );
}

export default Header;
