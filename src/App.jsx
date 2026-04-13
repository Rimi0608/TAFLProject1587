import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRightToLine, ArrowRight } from 'lucide-react';
import './index.css';

import CFGInput from './components/CFGInput';
import GrammarStep from './components/GrammarStep';
import Navbar from './components/Navbar';
import { Home, AboutCFG, WhatIsCNF, StepsCNF, WhatIsGNF, StepsGNF } from './components/InfoPages';
import { convertToCNF, convertToGNF } from './utils/converter';
import GlowProvider from './components/GlowProvider';
import StringParser from './components/StringParser';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

function App() {
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null); // 'cnf' | 'gnf'
  const [activeTab, setActiveTab] = useState('home');
  const [cnfGrammar, setCnfGrammar] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleConvert = (grammarConfig, type) => {
    setError(null);
    setSteps([]);
    setCnfGrammar(null);
    setLastAction(type);
    setIsLoading(true);

    setTimeout(() => {
      try {
        const outputSteps = type === 'gnf' ? convertToGNF(grammarConfig) : convertToCNF(grammarConfig);
        setSteps(outputSteps);
        if (outputSteps.length > 0) {
          if (type === 'cnf') {
            setCnfGrammar(outputSteps[outputSteps.length - 1].grammar);
          } else if (type === 'gnf') {
            // In GNF pipeline, Step 5 is the CNF preparation step which we can use for CYK
            const cnfStep = outputSteps.find(s => s.title.includes('CNF preparation') || s.title.includes('Step 5'));
            if (cnfStep) setCnfGrammar(cnfStep.grammar);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Conversion Error:', err);
        setError(err.message || 'Failed to parse or convert grammar.');
        setSteps([]);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <GlowProvider>
      <div className="app-layout" style={{ flexDirection: 'column' }}>
        
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />

        {/* ── Main content ── */}
        <main className="main-content">
          <div className="app-container">

            <AnimatePresence mode="wait">

              {activeTab === 'home' && (
                <motion.div key="home" className="info-page" {...pageVariants}>
                  <Home />
                </motion.div>
              )}
              {activeTab === 'cfg' && (
                <motion.div key="cfg" className="info-page" {...pageVariants}>
                  <AboutCFG />
                </motion.div>
              )}
              {activeTab === 'cnf-what' && (
                <motion.div key="cnf-what" className="info-page" {...pageVariants}>
                  <WhatIsCNF />
                  <div style={{ marginTop: '32px' }}><StepsCNF /></div>
                </motion.div>
              )}
              {activeTab === 'gnf-what' && (
                <motion.div key="gnf-what" className="info-page" {...pageVariants}>
                  <WhatIsGNF />
                  <div style={{ marginTop: '32px' }}><StepsGNF /></div>
                </motion.div>
              )}

              {activeTab === 'converter' && (
                <motion.div key="converter" className="converter-layout" {...pageVariants}>
                  {/* Hero Section Simplified */}
                  <div className="converter-hero">
                    <h1 className="heading-xl">CFG Transformation Portal</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                      Enter your CFG below to witness real-time step-by-step transformation.
                    </p>
                  </div>

                  <div className="input-section">
                    <CFGInput
                      onConvert={handleConvert}
                      error={error}
                      isLoading={isLoading}
                      lastAction={lastAction}
                    />
                  </div>

                  <div className="output-section">
                    {isLoading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <div className="spin-ring" />
                        <h3>{lastAction === 'gnf' ? 'Converting to GNF…' : 'Converting to CNF…'}</h3>
                        <p style={{ fontSize: '0.88rem' }}>Applying formal transformations, please wait…</p>
                      </motion.div>
                    ) : steps.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                        <ArrowRightToLine size={44} style={{ opacity: 0.2, marginBottom: '14px', color: 'var(--accent-primary)' }} />
                        <h3>Awaiting Your Grammar</h3>
                        <p style={{ fontSize: '0.9rem' }}>Input rules and choose your target normal form.</p>
                      </motion.div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Conversion Steps Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ height: '1px', flex: 1, background: 'var(--border-glass)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                              Transformation Steps
                            </span>
                            <div style={{ height: '1px', flex: 1, background: 'var(--border-glass)' }} />
                          </div>
                          {steps.map((step, index) => <GrammarStep key={index} step={step} isActive />)}
                        </div>

                        {/* Testing Playground Section */}
                        <AnimatePresence>
                          {cnfGrammar && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4 }}
                            >
                              <StringParser cnfGrammar={cnfGrammar} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ── Floating Action Button (FAB) ── */}
        {activeTab !== 'converter' && (
          <motion.button
            className="fab-converter btn-primary"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setActiveTab('converter'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <Sparkles size={16} />
            Converter
            <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </motion.button>
        )}
      </div>
    </GlowProvider>
  );
}

export default App;
