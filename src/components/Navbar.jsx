import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Home, BookOpen, Layers, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { id: 'home',       label: 'Home',      icon: Home },
  { id: 'cfg',       label: 'About CFG', icon: BookOpen },
  { id: 'cnf-what',  label: 'CNF',       icon: Layers },
  { id: 'gnf-what',  label: 'GNF',       icon: Zap },
];

const Navbar = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id) => {
    setActiveTab(id);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO */}
        <div className="navbar-logo" onClick={() => handleNav('home')}>
          {/* <div className="logo-icon">
            <Sparkles size={18} />
          </div> */}
          <div className="logo-text">
            <span>Rishab Kumar</span>
            <span className="logo-sub">2024UCS1587</span>
          </div>
        </div>

        {/* DESKTOP NAV */}
        <div className="navbar-desktop">
          {NAV_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => handleNav(id)}
            >
              <Icon size={14} className="nav-icon" />
              {label}
            </button>
          ))}
          <button
            className={`nav-link nav-converter-link ${activeTab === 'converter' ? 'active' : ''}`}
            onClick={() => handleNav('converter')}
          >
            Converter
          </button>
          <div className="nav-divider" />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* MOBILE TOGGLE */}
        <div className="navbar-mobile-controls">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="navbar-mobile-overlay"
          >
            <div className="mobile-nav-list">
              {NAV_LINKS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`mobile-nav-item ${activeTab === id ? 'active' : ''}`}
                  onClick={() => handleNav(id)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
              <div className="mobile-nav-divider" />
              <button
                className={`mobile-nav-item converter-item ${activeTab === 'converter' ? 'active' : ''}`}
                onClick={() => handleNav('converter')}
              >
                <Sparkles size={18} />
                Converter
              </button>
            </div>
            <div className="mobile-nav-footer">
              <p>Project by Rishab Kumar</p>
              <p>2024UCS1587</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
