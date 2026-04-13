import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Plus, Trash2, HelpCircle, ChevronRight, Layout, AlignLeft } from 'lucide-react';

const EXAMPLE_TEXT = `S -> ASB | ε
A -> aA | a
B -> bB | b`;

const EXAMPLE_FORM = {
  variables: ['S', 'A', 'B'],
  terminals: ['a', 'b'],
  startVar: 'S',
  rules: [
    { lhs: 'S', rhs: 'ASB | ε' },
    { lhs: 'A', rhs: 'aA | a' },
    { lhs: 'B', rhs: 'bB | b' }
  ]
};

export default function CFGInput({ onConvert, error, isLoading, lastAction }) {
  const [mode, setMode] = useState('text'); // 'text' | 'form'
  
  // Text Mode State
  const [textInput, setTextInput] = useState(EXAMPLE_TEXT);
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);

  // Form Mode State
  const [variables, setVariables] = useState(['S', 'A', 'B']);
  const [terminals, setTerminals] = useState(['a', 'b']);
  const [startVar, setStartVar] = useState('S');
  const [rules, setRules] = useState([...EXAMPLE_FORM.rules]);
  const [rawVars, setRawVars] = useState('S, A, B');
  const [rawTerms, setRawTerms] = useState('a, b');

  // Sync variables/terminals from raw text in Form Mode
  useEffect(() => {
    const v = rawVars.split(',').map(s => s.trim()).filter(Boolean);
    const uniqueV = Array.from(new Set(v));
    setVariables(uniqueV);
    if (uniqueV.length > 0 && !uniqueV.includes(startVar)) setStartVar(uniqueV[0]);
  }, [rawVars]);

  useEffect(() => {
    const t = rawTerms.split(',').map(s => s.trim()).filter(Boolean);
    setTerminals(Array.from(new Set(t)));
  }, [rawTerms]);

  const handleSyncScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleAddRule = () => setRules([...rules, { lhs: variables[0] || '', rhs: '' }]);
  const handleRemoveRule = (index) => rules.length > 1 && setRules(rules.filter((_, i) => i !== index));
  const updateRuleLHS = (index, val) => { const nr = [...rules]; nr[index].lhs = val; setRules(nr); };
  const updateRuleRHS = (index, val) => { const nr = [...rules]; nr[index].rhs = val; setRules(nr); };

  const handleConvert = (type) => {
    if (mode === 'text') {
      onConvert(textInput, type);
    } else {
      onConvert({
        variables,
        terminals,
        startVar,
        rules: rules
      }, type);
    }
  };

  const lineCount = textInput.split('\n').length || 1;
  const LINE_HEIGHT = 28;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ overflow: 'visible' }}
    >
      {/* Header with Mode Toggle */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Grammar Input</h2>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${mode === 'text' ? 'active' : ''}`}
            onClick={() => setMode('text')}
          >
            <AlignLeft size={14} /> Text Editor
          </button>
          <button 
            className={`tab-btn ${mode === 'form' ? 'active' : ''}`}
            onClick={() => setMode('form')}
          >
            <Layout size={14} /> Visual Form
          </button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-mode-container"
            >
              <p className="input-hint" style={{ marginBottom: '14px' }}>
                Enter rules like <code>S &rarr; AB | a</code>. Use <code>&epsilon;</code> or <code>eps</code> for epsilon.
              </p>
              <div className="code-editor-wrapper">
                <div ref={gutterRef} className="line-gutter">
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i} className="line-number">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="code-textarea"
                  spellCheck={false}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onScroll={handleSyncScroll}
                  placeholder="S -> A B | a&#10;A -> a | ε"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="form-mode-container"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="input-field-group">
                  <label className="input-label">NON-TERMINALS</label>
                  <input className="form-input" value={rawVars} onChange={e => setRawVars(e.target.value)} placeholder="S, A, B" />
                </div>
                <div className="input-field-group">
                  <label className="input-label">TERMINALS</label>
                  <input className="form-input" value={rawTerms} onChange={e => setRawTerms(e.target.value)} placeholder="a, b" />
                </div>
                <div className="input-field-group">
                  <label className="input-label">START</label>
                  <select className="form-select" value={startVar} onChange={e => setStartVar(e.target.value)}>
                    {variables.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="rules-table">
                <AnimatePresence initial={false}>
                  {rules.map((rule, index) => (
                    <motion.div layout key={index} className="rule-row">
                      <select className="form-select rule-lhs" value={rule.lhs} onChange={e => updateRuleLHS(index, e.target.value)}>
                        {variables.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <ChevronRight size={16} className="rule-arrow-icon" />
                      <input className="form-input rule-rhs" value={rule.rhs} onChange={e => updateRuleRHS(index, e.target.value)} placeholder="AB | a" />
                      <button className="del-btn" onClick={() => handleRemoveRule(index)} disabled={rules.length === 1}><Trash2 size={16} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button className="add-btn" onClick={handleAddRule}><Plus size={16} /> Add Rule</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="action-buttons-flex">
          <button className="btn-primary flex-1" onClick={() => handleConvert('cnf')} disabled={isLoading}>
            {isLoading && lastAction === 'cnf' ? <span className="spin-loader"></span> : 'Convert to CNF'}
          </button>
          <button className="btn-secondary flex-1" onClick={() => handleConvert('gnf')} disabled={isLoading}>
            {isLoading && lastAction === 'gnf' ? <span className="spin-loader"></span> : 'Convert to GNF'}
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="error-box">
             <HelpCircle size={18} /> <p>{error}</p>
          </motion.div>
        )}
      </div>

      <style jsx="true">{`
        .tab-switcher {
          display: flex;
          background: var(--bg-surface);
          padding: 4px;
          border-radius: 9999px;
          border: 1px solid var(--border-glass);
          width: fit-content;
          margin-bottom: 24px;
        }
        .tab-btn {
          padding: 8px 18px;
          border-radius: 9999px;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          cursor: pointer;
        }
        .tab-btn:hover {
          color: var(--text-main);
          background: var(--bg-glass-active);
        }
        .tab-btn.active {
          background: var(--btn-fill-bg) !important;
          color: var(--btn-fill-text) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .tab-btn:not(.active) {
          color: var(--text-muted) !important;
        }
        .tab-btn:not(.active):hover {
          color: var(--text-main) !important;
          background: var(--bg-glass-active) !important;
        }
        .action-buttons-flex {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }
        .flex-1 { flex: 1; }
        .spin-loader {
          width: 14px;
          height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        .code-editor-wrapper {
          display: flex;
          background: var(--code-bg);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          overflow: hidden;
          min-height: 200px;
        }
        .line-gutter {
          width: 38px;
          background: rgba(0,0,0,0.1);
          border-right: 1px solid var(--border-glass);
          padding: 12px 0;
          text-align: center;
          color: var(--text-dim);
          font-family: 'Poppins', monospace;
          font-size: 0.75rem;
          user-select: none;
          overflow: hidden;
        }
        .code-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          padding: 12px 16px;
          color: var(--code-text);
          font-family: 'Poppins', monospace;
          font-size: 0.92rem;
          line-height: ${LINE_HEIGHT}px;
        }
        .rule-row {
          display: grid;
          grid-template-columns: 100px 30px 1fr 40px;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          background: var(--bg-glass-subtle);
          padding: 6px;
          border-radius: 10px;
        }
        .form-input, .form-select {
          width: 100%;
          background: var(--bg-glass-active);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--text-main);
          font-size: 0.88rem;
        }
        .input-label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-bottom: 6px; display: block; letter-spacing: 0.05em; }
        .input-hint { font-size: 0.75rem; color: var(--text-dim); }
        .rule-arrow-icon { color: var(--accent-primary); justify-self: center; }
        .add-btn { 
          width: 100%; 
          padding: 12px; 
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px dashed rgba(255, 255, 255, 0.15); 
          border-radius: 12px; 
          font-size: 0.85rem; 
          font-weight: 700;
          color: rgba(255, 255, 255, 0.6); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px; 
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 12px;
          cursor: pointer;
        }
        .add-btn:hover { 
          background: rgba(255, 255, 255, 0.08); 
          border-color: #ffffff;
          color: #ffffff; 
          transform: translateY(-1px);
        }
        .del-btn { color: #ef4444; opacity: 0.6; transition: 0.2s; }
        .del-btn:hover:not(:disabled) { opacity: 1; transform: scale(1.1); }
        .error-box { margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; color: #ef4444; font-size: 0.85rem; display: flex; gap: 10px; }
      `}</style>
    </motion.div>
  );
}
