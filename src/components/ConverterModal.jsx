import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightToLine, ArrowRight } from 'lucide-react';

import CFGInput from './CFGInput';
import GrammarStep from './GrammarStep';
import StringParser from './StringParser';
import { Home, AboutCFG, WhatIsCNF, StepsCNF, WhatIsGNF, StepsGNF } from './InfoPages';
import { convertToCNF, convertToGNF } from '../utils/converter';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { y: '100%', opacity: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 300, mass: 0.8 },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
};

export default function ConverterModal({ isOpen, onClose, initialPage }) {
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [cnfGrammar, setCnfGrammar] = useState(null);
  const [activeView, setActiveView] = useState(initialPage || 'converter');

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

  const NAV_TABS = [
    { id: 'converter', label: 'Converter' },
    { id: 'home',      label: 'Home' },
    { id: 'cfg',       label: 'About CFG' },
    { id: 'cnf-what',  label: 'CNF' },
    { id: 'gnf-what',  label: 'GNF' },
  ];

  // Reset activeView when modal opens with a specific page
  React.useEffect(() => {
    if (isOpen && initialPage) {
      setActiveView(initialPage);
    }
  }, [isOpen, initialPage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="converter-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="converter-modal"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Modal header */}
            <div className="converter-modal__header">
              <div className="converter-modal__tabs">
                {NAV_TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`converter-modal__tab ${activeView === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveView(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button className="converter-modal__close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="converter-modal__body">
              <AnimatePresence mode="wait">
                {activeView === 'converter' && (
                  <motion.div
                    key="converter"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="converter-modal__content"
                  >
                    <div className="converter-hero" style={{ textAlign: 'center', marginBottom: '28px' }}>
                      <h1 className="heading-xl">CFG Transformation Portal</h1>
                      <p style={{ color: 'var(--text-muted)' }}>
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

                    <div className="output-section" style={{ marginTop: '24px' }}>
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

                {activeView === 'home' && (
                  <motion.div key="home" className="converter-modal__content info-page"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                    <Home />
                  </motion.div>
                )}
                {activeView === 'cfg' && (
                  <motion.div key="cfg" className="converter-modal__content info-page"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                    <AboutCFG />
                  </motion.div>
                )}
                {activeView === 'cnf-what' && (
                  <motion.div key="cnf" className="converter-modal__content info-page"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                    <WhatIsCNF />
                    <div style={{ marginTop: '32px' }}><StepsCNF /></div>
                  </motion.div>
                )}
                {activeView === 'gnf-what' && (
                  <motion.div key="gnf" className="converter-modal__content info-page"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                    <WhatIsGNF />
                    <div style={{ marginTop: '32px' }}><StepsGNF /></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
