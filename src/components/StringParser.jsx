import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, ChevronRight, Hash, GitBranch, Terminal, Sparkles, ZoomIn, ZoomOut, RotateCcw, Copy, Check } from 'lucide-react';
import { checkString, buildParseTree, getDerivationSteps } from '../utils/converter';
import { parseTreeToLatex } from '../utils/latexExport';

// Simple SVG Tree Node Component
// Beautiful SVG Tree Node Component
// Beautiful SVG Tree Node Component with Adaptive Layout
const TreeNode = ({ node, x, y, allocatedWidth, depth = 0 }) => {
  if (!node) return null;
  const isTerminal = node.terminal;
  const childY = y + 120; // Increased vertical spacing for clarity

  // Use distinct colors for dark/light mode via CSS variables
  const circleFill = isTerminal ? "rgba(16, 185, 129, 0.15)" : "var(--accent-primary)";
  const circleStroke = isTerminal ? "#10b981" : "transparent";
  const textFill = isTerminal ? "#10b981" : "var(--btn-fill-text)";

  let currentXStart = x - allocatedWidth / 2;

  return (
    <g>
      {/* Lines between nodes */}
      {node.children && node.children.map((child, i) => {
        // Calculate child's horizontal share based on its subtree width
        const childShare = (child.subtreeWidth / node.subtreeWidth) * allocatedWidth;
        const childX = currentXStart + childShare / 2;
        
        // Update start for next sibling
        const prevXStart = currentXStart;
        currentXStart += childShare;

        return (
          <React.Fragment key={i}>
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 0.7, delay: depth * 0.08, ease: "easeOut" }}
              x1={x} y1={y} x2={childX} y2={childY}
              stroke="var(--text-main)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={isTerminal ? "none" : "4 4"}
              style={{ opacity: 0.4 }}
            />
            <TreeNode 
              node={child} 
              x={childX} 
              y={childY} 
              allocatedWidth={childShare} 
              depth={depth + 1} 
            />
          </React.Fragment>
        );
      })}

      {/* The Node itself */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: depth * 0.08 }}
      >
        <circle cx={x} cy={y} r="22" fill="var(--body-bg)" />
        <circle
          cx={x} cy={y} r="22"
          fill={circleFill}
          stroke={circleStroke}
          strokeWidth="2.5"
          style={{ 
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
            backdropFilter: 'blur(4px)'
          }}
        />
        <text
          x={x} y={y} dy="5"
          textAnchor="middle"
          fill={textFill}
          style={{ 
            fontSize: '13px', 
            fontWeight: 900, 
            fontFamily: 'Inter, monospace',
            userSelect: 'none'
          }}
        >
          {node.sym === '\u03B5' ? 'ε' : node.sym}
        </text>
      </motion.g>
    </g>
  );
};

const StringParser = ({ cnfGrammar, startSymbol = 'S' }) => {
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [treeCopied, setTreeCopied] = useState(false);

  const handleCopyTreeLatex = () => {
    if (!result || !result.tree) return;
    const latex = parseTreeToLatex(result.tree);
    navigator.clipboard.writeText(latex);
    setTreeCopied(true);
    setTimeout(() => setTreeCopied(false), 2000);
  };

  const gInternal = useMemo(() => {
    if (!cnfGrammar) return null;
    const productions = new Map();
    const variables = Object.keys(cnfGrammar);
    for (const v of variables) {
      productions.set(v, cnfGrammar[v].map(p => p.length === 0 ? ['\u03B5'] : p));
    }
    return {
      variables,
      start: variables.includes('S0') ? 'S0' : (variables.includes(startSymbol) ? startSymbol : variables[0]),
      productions
    };
  }, [cnfGrammar, startSymbol]);

  const handleParse = () => {
    if (isParsing || !gInternal) return;
    setIsParsing(true);
    setResult(null);

    // Recursive helper to calculate subtree widths for layout
    const calculateSubtreeWidths = (node) => {
      if (!node) return 0;
      if (!node.children || node.children.length === 0) {
        node.subtreeWidth = 1;
        return 1;
      }
      let totalWidth = 0;
      for (const child of node.children) {
        totalWidth += calculateSubtreeWidths(child);
      }
      node.subtreeWidth = totalWidth;
      return totalWidth;
    };

    setTimeout(() => {
      const cykRes = checkString(gInternal, inputString.trim());
      let tree = null;
      let derivation = [];

      if (cykRes.accepted) {
        tree = buildParseTree(gInternal, cykRes.table, cykRes.tokens, cykRes.tokens.length, 0, gInternal.start);
        calculateSubtreeWidths(tree);
        derivation = getDerivationSteps(tree);
      }

      setResult({ ...cykRes, tree, derivation });
      setIsParsing(false);
      setShowExtras(cykRes.accepted);
    }, 400);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            Testing Playground
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
            Verify if a string belongs to the language. Using the <strong>internally generated CNF</strong> for high-performance membership testing (CYK).
          </p>
        </div>
        <div style={{ background: 'var(--bg-glass-active)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          CYK Engine v1.0
        </div>
      </div>

      <div className="playground-input-group" style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Hash
            size={16}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
          />
          <input
            type="text"
            placeholder="Enter string (e.g. aabb)"
            value={inputString}
            onChange={(e) => { setInputString(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            className="glass-input"
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
        <button
          onClick={handleParse}
          disabled={isParsing || !cnfGrammar}
          className="btn-primary playground-test-btn"
        >
          {isParsing ? <div className="spin" style={{ width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'currentColor', borderRadius: '50%' }} /> : 'Test String'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key={inputString + result.accepted}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'var(--bg-glass-active)',
              border: `1px solid ${result.accepted ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {result.accepted ? (
                  <CheckCircle2 size={24} style={{ color: '#10b981' }} />
                ) : (
                  <XCircle size={24} style={{ color: '#ef4444' }} />
                )}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                    String "{inputString}" is {result.accepted ? 'ACCEPTED' : 'REJECTED'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                    {result.accepted ? 'Matches the grammar rules.' : 'Cannot be generated by this grammar.'}
                  </p>
                </div>
              </div>
              {result.accepted && (
                <button
                  onClick={() => setShowExtras(!showExtras)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {showExtras ? 'Hide Details' : 'Show Tree & Derivation'}
                  <ChevronRight size={14} style={{ transform: showExtras ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </div>

            {/* CYK Table Render */}
            <div className="cyk-table-wrapper" style={{ overflowX: 'auto', marginBottom: '32px', borderRadius: '12px' }}>
              <table className="cyk-table" style={{ borderCollapse: 'collapse', width: '100%', minWidth: '300px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}></th>
                    {inputString.split('').map((c, i) => (
                      <th key={i} style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inputString.length > 0 && Array.from({ length: inputString.length }).map((_, lIdx) => {
                    const len = lIdx + 1;
                    return (
                      <tr key={len} style={{ borderTop: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                          l={len}
                        </td>
                        {Array.from({ length: inputString.length }).map((_, pos) => {
                          const j = pos + len - 1;
                          if (j >= inputString.length) return <td key={pos}></td>;
                          
                          // Safety check: ensure table entry exists (prevents crash during rapid typing/HMR)
                          const tableCell = result.table && result.table[len] && result.table[len][pos];
                          if (!tableCell) return <td key={pos}></td>;

                          const vars = Array.from(tableCell).sort();
                          const isStart = len === inputString.length && pos === 0 && vars.includes(gInternal.start);
                          return (
                            <td key={pos} style={{ padding: '8px', textAlign: 'center' }}>
                              <div style={{
                                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3px',
                                minHeight: '28px', alignItems: 'center'
                              }}>
                                {vars.map(v => (
                                  <span key={v} style={{
                                    fontSize: '0.7rem', fontWeight: 800, padding: '2px 5px',
                                    borderRadius: '5px',
                                    background: isStart ? "var(--accent-primary)" : "var(--bg-glass-active)",
                                    color: isStart ? "var(--btn-fill-text)" : "var(--text-main)",
                                    border: isStart ? "none" : "1px solid var(--border-glass)"
                                  }}>
                                    {v}
                                  </span>
                                ))}
                                {vars.length === 0 && <span style={{ opacity: 0.1, fontSize: '0.6rem' }}>-</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tree & Derivation Section */}
            {showExtras && result.accepted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '18px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Terminal size={18} style={{ color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Leftmost Derivation</h4>
                  </div>

                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
                    padding: '16px', background: 'var(--bg-glass)', borderRadius: '12px',
                    marginBottom: '32px', fontSize: '0.85rem', fontFamily: 'monospace'
                  }}>
                    {result.derivation.map((step, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {i > 0 && <span style={{ opacity: 0.3, fontSize: '1.1rem' }}>⇒</span>}
                        <span style={{
                          padding: '6px 12px', borderRadius: '8px',
                          background: i === result.derivation.length - 1 ? "rgba(16,185,129,0.08)" : "var(--bg-glass-subtle)",
                          color: i === result.derivation.length - 1 ? "#10b981" : "var(--text-main)",
                          fontWeight: i === result.derivation.length - 1 ? 800 : 400,
                          border: `1px solid ${i === result.derivation.length - 1 ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`,
                          boxShadow: i === result.derivation.length - 1 ? '0 4px 12px rgba(16,185,129,0.1)' : 'none'
                        }}>
                          {/* We don't split by character, we just render the step string */}
                          {step.split(/(\s+|[A-Z][0-9']*)/).filter(Boolean).map((part, ci) => (
                            <span key={ci} style={{
                              color: /^[A-Z]/.test(part) ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                            }}>
                              {part}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GitBranch size={18} style={{ color: 'var(--accent-primary)' }} />
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Parse Tree Visualization</h4>
                    </div>
                    
                    {/* Enhanced Control Bar */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      background: 'var(--bg-glass)', 
                      padding: '4px', 
                      borderRadius: '14px', 
                      border: '1px solid var(--border-glass)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '8px', padding: '0 4px' }}>
                        <button 
                          onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} 
                          className="icon-btn-pill" 
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          minWidth: '42px', 
                          textAlign: 'center',
                          color: 'var(--text-main)',
                          opacity: 0.8
                        }}>
                          {Math.round(zoom * 100)}%
                        </div>
                        <button 
                          onClick={() => setZoom(z => Math.min(3, z + 0.1))} 
                          className="icon-btn-pill" 
                          title="Zoom In"
                        >
                          <ZoomIn size={14} />
                        </button>
                      </div>

                      <div style={{ width: '1px', height: '16px', background: 'var(--border-glass)' }} />

                      <button 
                        onClick={() => { setZoom(1); setDragPosition({ x: 0, y: 0 }); }} 
                        className="btn-reset-pill"
                      >
                        <RotateCcw size={14} />
                        <span>Reset</span>
                      </button>

                      <div style={{ width: '1px', height: '16px', background: 'var(--border-glass)' }} />

                      <button 
                        onClick={handleCopyTreeLatex} 
                        className="btn-reset-pill"
                        style={{
                          color: treeCopied ? '#10b981' : 'var(--accent-primary)',
                          background: treeCopied ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                        }}
                      >
                        {treeCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{treeCopied ? 'Copied!' : 'LaTeX'}</span>
                      </button>
                    </div>
                  </div>

                  <div 
                    className="tree-view-viewport"
                    style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '600px',
                      overflow: 'hidden', 
                      background: 'var(--bg-glass-subtle)', 
                      borderRadius: '24px',
                      border: '1px solid var(--border-glass)',
                      boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)',
                      cursor: 'grab'
                    }}
                    onWheel={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.05 : 0.05;
                        setZoom(z => Math.max(0.1, Math.min(3, z + delta)));
                      }
                    }}
                  >
                    <motion.div
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      animate={{ 
                        scale: zoom, 
                        x: dragPosition.x, 
                        y: dragPosition.y 
                      }}
                      style={{ 
                        width: '3000px', 
                        height: '2000px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        position: 'absolute',
                        top: '40px', // Start near the top of the viewport
                        left: 'calc(50% - 1500px)',
                        cursor: 'grabbing',
                        transformOrigin: 'top center'
                      }}
                      onDragEnd={(e, info) => {
                        setDragPosition(prev => ({ 
                          x: prev.x + info.offset.x, 
                          y: prev.y + info.offset.y 
                        }));
                      }}
                    >
                      <svg 
                        width="3000" 
                        height="2000"
                        viewBox="0 0 3000 2000"
                        style={{ overflow: 'visible' }}
                      >
                        <TreeNode
                           node={result.tree}
                           x={1500}
                           y={80}
                           allocatedWidth={Math.max(800, result.tokens.length * 100)}
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StringParser;
