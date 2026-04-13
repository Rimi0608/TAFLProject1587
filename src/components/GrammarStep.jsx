import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { grammarToLatex } from '../utils/latexExport';

function renderProduction(symbols) {
  if (!symbols || symbols.length === 0) {
    return (
      <span className="terminal" style={{ marginRight: '3px' }}>
        ε
      </span>
    );
  }
  return symbols.map((symbol, idx) => {
    const isTerminal = /^[a-z0-9ε_]$/.test(symbol) || symbol === 'ε';
    return (
      <span key={idx} className={isTerminal ? 'terminal' : 'non-terminal'} style={{ marginRight: '3px' }}>
        {symbol}
      </span>
    );
  });
}

export default function GrammarStep({ step }) {
  const [copied, setCopied] = useState(false);

  if (!step) return null;

  const handleCopyLatex = () => {
    const latexStr = grammarToLatex(step.grammar);
    navigator.clipboard.writeText(latexStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card step-card"
    >
      {/* Header row */}
      <div className="step-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 className="step-title" style={{ margin: 0 }}>{step.title}</h3>
          <span className="step-badge">Step</span>
        </div>
        <button
          onClick={handleCopyLatex}
          className="btn-reset-pill"
          style={{
            color: copied ? '#10b981' : 'var(--text-main)',
            background: copied ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-glass-active)',
            border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)'}`
          }}
          title="Copy as LaTeX"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'LaTeX'}</span>
        </button>
      </div>

      {/* Description block */}
      {step.description && (
        <div className="step-description">
          {step.description.split('\n').map((line, idx) =>
            line.trim() ? <p key={idx} style={{ marginBottom: '6px' }}>{line}</p> : null
          )}
        </div>
      )}

      {/* Algorithmic Metadata Visualization */}
      {step.metadata && (
        <div className="step-metadata-viz" style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {step.metadata.nullable && (
            <div className="meta-tag nullable">
              <span className="meta-label">Nullable:</span>
              {step.metadata.nullable.length > 0 ? step.metadata.nullable.join(', ') : 'None'}
            </div>
          )}
          {step.metadata.unitClosures && Object.keys(step.metadata.unitClosures).length > 0 && (
            <div className="meta-tag closures">
              <span className="meta-label">Unit Closures:</span>
              {Object.entries(step.metadata.unitClosures).map(([v, c]) => `${v}→{${c.join(',')}}`).join('; ')}
            </div>
          )}
          {step.metadata.generating && (
            <div className="meta-tag generating">
              <span className="meta-label">Generating:</span>
              {step.metadata.generating.join(', ')}
            </div>
          )}
          {step.metadata.reachable && (
            <div className="meta-tag reachable">
              <span className="meta-label">Reachable:</span>
              {step.metadata.reachable.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Grammar display */}
      <div className="grammar-display">
        {Object.entries(step.grammar).map(([head, productions], i) => (
          <div key={i} className="rule">
            <span className="rule-left">{head}</span>
            <span className="rule-arrow">→</span>
            <div className="rule-right" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'baseline' }}>
              {productions.map((prod, j) => (
                <React.Fragment key={j}>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'baseline' }}>
                    {renderProduction(prod)}
                  </div>
                  {j < productions.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', padding: '0 2px' }}>|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(step.grammar).length === 0 && (
          <div style={{ fontStyle: 'italic', opacity: 0.5 }}>Empty grammar at this stage</div>
        )}
      </div>
    </motion.div>
  );
}
