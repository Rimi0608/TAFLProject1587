import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';

const MENU_LINKS = [
  { id: 'home',      label: 'Home' },
  { id: 'cfg',       label: 'About CFG' },
  { id: 'cnf-what',  label: 'Chomsky Normal Form' },
  { id: 'gnf-what',  label: 'Greibach Normal Form' },
  { id: 'converter', label: 'Open Converter' },
];

export default function LusionNavbar({ onNavigate, onOpenConverter, scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLink = (id) => {
    setMenuOpen(false);
    if (id === 'converter') {
      onOpenConverter();
    } else {
      onNavigate(id);
    }
  };

  return (
    <>
      <nav className={`lusion-nav ${scrolled ? 'lusion-nav--scrolled' : ''}`}>
        <div className="lusion-nav__inner">
          <div className="lusion-nav__logo" onClick={() => handleLink('home')}>
            TAFL
          </div>
          <div className="lusion-nav__actions">
            <button className="lusion-nav__cta" onClick={onOpenConverter}>
              Let's Convert
            </button>
            <button
              className="lusion-nav__menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              Menu <span className="menu-dots">···</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lusion-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="lusion-menu-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className="lusion-menu-close" onClick={() => setMenuOpen(false)}>
                <X size={24} />
              </button>
              <div className="lusion-menu-links">
                {MENU_LINKS.map((link, i) => (
                  <motion.button
                    key={link.id}
                    className="lusion-menu-link"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
                    onClick={() => handleLink(link.id)}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} className="menu-link-arrow" />
                  </motion.button>
                ))}
              </div>
              <div className="lusion-menu-footer">
                <p>Rishab Kumar — 2024UCS1587</p>
                <p>Theory of Automata & Formal Languages</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
