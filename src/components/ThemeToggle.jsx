import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle-pill"
      style={{
        /* Saki: floating pill nav style */
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(18,18,18,0.05)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(18,18,18,0.12)'}`,
        borderRadius: '9999px',
        height: '36px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        color: 'var(--text-main)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: '0.01em',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        whiteSpace: 'nowrap',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
          {isDark ? 'Light' : 'Dark'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
