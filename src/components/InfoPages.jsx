import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -10 }
};

const transitionAttr = { duration: 0.4, ease: [0.16, 1, 0.3, 1] };

export function Home() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="home-container colorful-bg-home" style={{ padding: '40px', paddingBottom: '60px', borderRadius: '28px', border: '1px solid rgba(184, 242, 230, 0.3)' }}>
      <div className="hero-landing">
        <h1 className="heading-xl">
          CFG Conversion<br />
          <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>& Transformation Portal</span>
        </h1>
        <div className="hero-divider" />
        <p className="hero-subtitle" style={{ fontSize: '1.1rem', maxWidth: '700px' }}>
          An advanced educational tool designed to demystify <strong>Automata Theory</strong> through 
          mathematical precision, real-time visualization, and step-by-step logic.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card glass-panel">
          <div className="feature-icon">CNF</div>
          <h3>Theory to Logic</h3>
          <p>Translate abstract grammar rules into binary-decision trees optimized for algorithmic recognition.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">GNF</div>
          <h3>Automata Bridge</h3>
          <p>Construct terminal-first rules that form the direct blueprint for Pushdown Automata (PDA) transitions.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon">CYK</div>
          <h3>Visual Parsing</h3>
          <p>Witness the Cocke-Younger-Kasami engine in action with interactive tables and adaptive parse trees.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon" style={{ background: 'var(--accent-primary)', color: 'var(--btn-fill-text)' }}>LaTeX</div>
          <h3>Academic Export</h3>
          <p>Instantly copy derived grammar forms into LaTeX math blocks for seamless pasting into Overleaf and homework assignments.</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '32px', background: 'var(--bg-glass-active)', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary)', borderTop: '1px solid var(--border-glass)', borderRight: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>The Product Edge: Academic Export</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            <strong>Why this is a product:</strong> It saves users 30+ minutes of formatting LaTeX geometry and logic equations manually, making this tool an indispensable part of their homework/teaching workflow. 
            Instantly port your complex trees to Overleaf with a single click.
          </p>
        </div>
        <div style={{ background: 'var(--accent-primary)', color: 'var(--btn-fill-text)', padding: '12px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          LaTeX Ready
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '48px', marginTop: '48px', background: 'var(--bg-glass-active)' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em' }}>What this Software Intends to Do</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '20px' }}>
              The study of <strong>Theory of Automata and Formal Languages (TAFL)</strong> often feels abstract and disconnected from practical coding. This software acts as a specialized bridge, transforming clinical mathematical definitions into interactive, visual experiences.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8 }}>
              Whether you are a student struggling with manual <em>Unit Production</em> removal or a researcher testing complex grammars, this portal provides instant, error-free results with the mathematical derivation shown at every stage.
            </p>
          </div>
          <div style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Objectives</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.9, margin: 0 }}>
              <li>Visualize 6-step CNF and 9-step GNF pipelines.</li>
              <li>Provide a "No-Experience-Required" entry point to TAFL.</li>
              <li>Ensure 100% mathematical correctness in transformations.</li>
              <li>Render adaptive, non-overlapping derivation trees for any accepted string.</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '48px' }}>
        <h2 style={{ paddingLeft: '12px', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 900 }}>For Beginners: How can this help?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              title: "Step-by-Step Transparency",
              desc: "Don't know how to convert? Our 'Visual Form' tab breaks down every single subtraction, substitution, and addition made during the conversion process so you can learn while you use it."
            },
            {
              title: "Error Prevention",
              desc: "Manual grammar conversion is notoriously error-prone. One missed nullable variable can ruin a 20-minute derivation. This tool ensures your logic is sound from Step 1 to Step 9."
            },
            {
              title: "Instant Verification",
              desc: "Quickly test strings using the Testing Playground. If a string is accepted, we generate the full Parse Tree and Leftmost Derivation, helping you understand how the grammar reaches its final yield."
            }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '20px', padding: '24px', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: 'var(--btn-fill-text)', flexShrink: 0 }}>
                {idx + 1}
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{item.title}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '60px', borderTop: '1px solid var(--border-glass)', paddingTop: '32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}><strong>Developed by:</strong> Rishab Kumar (2024UCS1587)</p>
      </div>
    </motion.div>
  );
}

export function AboutCFG() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="glass-panel colorful-bg-home" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>About Context-Free Grammar (CFG)</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
        A Context-Free Grammar is a fundamental structure in formal language theory, utilized mathematically to generate strings in a specific formal language. A standard CFG is formally defined as a 4-tuple <strong style={{ color: 'var(--accent-secondary)' }}>G = (V, T, P, S)</strong> where:
      </p>
      <ul style={{ paddingLeft: '24px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        <li style={{ marginBottom: '8px' }}><strong>V (Variables/Non-terminals):</strong> A finite, non-empty set of symbols representing syntactic categories or sub-trees in the language.</li>
        <li style={{ marginBottom: '8px' }}><strong>T (Terminals):</strong> A finite, non-empty set of basic symbols from which the actual output strings are formed. By definition, variables and terminals must be disjoint sets (V &cap; T = &empty;).</li>
        <li style={{ marginBottom: '8px' }}><strong>P (Productions):</strong> A finite set of production mapping rules taking the form <em>A &rarr; &alpha;</em>, where A is exactly one variable, and &alpha; is any continuous string composed of variables and/or terminals.</li>
        <li><strong>S (Start Symbol):</strong> A specialized non-terminal serving as the immutable root of the grammar tree. All valid words generated by the language begin their derivation sequence from S.</li>
      </ul>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>The "Context-Free" Designation</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        The descriptor "context-free" originates purely from the production rules. In entirely context-free grammars, the left constraint of any production is strictly limited to an isolated, single Non-Terminal variable. This guarantees that whenever a grammar derives a string, any specific variable can instantly be recursively rewritten with its right-hand rule regardless of adjacent terminals—irrespective of its "context". 
      </p>
    </motion.div>
  );
}

export function WhatIsCNF() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="glass-panel colorful-bg-cnf" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', textShadow: '0 0 10px rgba(74, 128, 240, 0.4)' }}>What is CNF?</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
        Chomsky Normal Form (CNF) is a highly restrictive, computationally optimal structure for context-free grammars. It enforces a mathematically uniform structure, guaranteeing that syntax trees formulated under CNF are pure binary trees. A grammar resides strictly in Chomsky Normal Form if, and only if, every single production rule assumes one of two identical configurations:
      </p>
      <div style={{ background: 'var(--code-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-glass)' }}>
        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--code-text)', fontFamily: 'monospace', fontSize: '1.1rem' }}>
          <li style={{ marginBottom: '8px' }}>1. <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>A</span> &rarr; <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>B C</span>  (A variable derives exactly two variables)</li>
          <li>2. <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>A</span> &rarr; <span style={{ color: 'var(--code-term)' }}>a</span>     (A variable derives exactly one terminal)</li>
        </ul>
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Mathematical Bounds</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Structurally limiting grammar to CNF ensures immense algorithmic determinism. Due to the strict binary derivations, any valid string <em>w</em> of length <em>n</em> within the language will predictably require exactly <em>2n - 1</em> derivation steps to generate entirely. Furthermore, the parse tree will contain precisely <em>2n - 1</em> total nodes. This deterministic property acts as the foundational mechanism behind matrix-based language recognition algorithms, such as the Cocke-Younger-Kasami (CYK) algorithm.
      </p>
    </motion.div>
  );
}

export function StepsCNF() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="glass-panel colorful-bg-cnf" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', textShadow: '0 0 10px rgba(74, 128, 240, 0.4)' }}>Steps of converting CFG to CNF</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        The conversion to Chomsky Normal Form follows a mathematically rigorous 6-step pipeline to ensure the grammar is reduced to binary and terminal productions:
      </p>
      
      <ol style={{ paddingLeft: '24px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Preprocessing (Start Symbol Augmentation):</strong>
          <br/>To ensure the start variable never appears on the right-hand side, a new start symbol <em>S<sub>0</sub></em> is introduced.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>S &rarr; aS | a</em> &nbsp;&rarr;&nbsp; <em>S<sub>0</sub> &rarr; S, S &rarr; aS | a</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Epsilon (&epsilon;) Elimination:</strong>
          <br/>Nullable variables are identified and replaced with all possible combinations.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>S &rarr; AB, A &rarr; a | &epsilon;</em> &nbsp;&rarr;&nbsp; <em>S &rarr; AB | B, A &rarr; a</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Unit Production Elimination:</strong>
          <br/>Unit productions (A &rarr; B) are removed by substituting derivations directly.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; B, B &rarr; a | b</em> &nbsp;&rarr;&nbsp; <em>A &rarr; a | b</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Useless Symbol Removal:</strong>
          <br/>Non-generating variables and unreachable variables are pruned.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>S &rarr; A, B &rarr; b</em> (B unreachable) &nbsp;&rarr;&nbsp; Prune B.
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Terminal Replacement:</strong>
          <br/>In rules with length &ge; 2, terminals are replaced by unique proxy variables.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; aB</em> &nbsp;&rarr;&nbsp; <em>A &rarr; T<sub>a</sub>B, T<sub>a</sub> &rarr; a</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Binarization:</strong>
          <br/>Long productions are broken down into cascading binary chains.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; BCD</em> &nbsp;&rarr;&nbsp; <em>A &rarr; BX, X &rarr; CD</em>
          </div>
        </li>
      </ol>
    </motion.div>
  );
}

export function WhatIsGNF() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="glass-panel colorful-bg-gnf" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', textShadow: '0 0 10px rgba(232, 67, 147, 0.4)' }}>What is GNF?</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
        Greibach Normal Form (GNF) is a specialized configuration where every production rule starts strictly with exactly one terminal. This structure is essential for constructing Pushdown Automata and efficient Top-Down parsing.
      </p>
      <div style={{ background: 'var(--code-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-glass)' }}>
        <p style={{ margin: 0, color: 'var(--code-text)', fontFamily: 'monospace', fontSize: '1.1rem' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>A</span> &rarr; <span style={{ color: 'var(--code-term)' }}>a</span> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>V<sub>1</sub> V<sub>2</sub> ... V<sub>n</sub></span>
        </p>
      </div>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
        In GNF, the right-hand side must begin with a terminal character (lowercase), followed by any number of non-terminal variables (uppercase). This layout eliminates left-recursion and guarantees path determinism.
      </p>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Theoretical Utility</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        GNF ensures that for every derivation step, exactly one input character is consumed from the string being parsed. This 1-to-1 mapping between terminals and transitions provides the mathematical foundation for converting context-free languages into hardware-level state machines.
      </p>
    </motion.div>
  );
}

export function StepsGNF() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={transitionAttr} className="glass-panel colorful-bg-gnf" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)', textShadow: '0 0 10px rgba(232, 67, 147, 0.4)' }}>Steps of converting CFG to GNF</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        Achieving Greibach Normal Form involves a complex 9-step procedure utilizing variable ordering and recursive substitution:
      </p>
      
      <ol style={{ paddingLeft: '24px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Preprocessing:</strong>
          <br/>Addition of a root start symbol to isolate derivation cycles.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>S<sub>0</sub> &rarr; S</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Epsilon (&epsilon;) Elimination:</strong>
          <br/>Removal of empty transitions by expanding rule combinations.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; BC | &epsilon;</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Unit Production Removal:</strong>
          <br/>Substitution of all single-variable rules with their terminal or binary leaves.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; B, B &rarr; a</em> &nbsp;&rarr;&nbsp; <em>A &rarr; a</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Useless Symbol Removal:</strong>
          <br/>Pruning of non-generating and unreachable variables.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> Pruning variables that never derive terminals.
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>CNF Preparation:</strong>
          <br/>Converting the grammar to Chomsky Normal Form to standardize rule length.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; BC</em> or <em>A &rarr; a</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Variable Ordering:</strong>
          <br/>Variables are ordered (A<sub>1</sub>, A<sub>2</sub>...) to detect and resolve indirect recursion.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A<sub>1</sub> &rarr; A<sub>2</sub>X</em> where 1 &lt; 2.
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Left Recursion Removal:</strong>
          <br/>Eliminating direct left recursion (A &rarr; A&alpha;) by introducing Z variables.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; Aa | b</em> becomes <em>A &rarr; b | bZ, Z &rarr; a | aZ</em>
          </div>
        </li>
        <li style={{ marginBottom: '24px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Leading Variable Substitution:</strong>
          <br/>Substituting variables to ensure rules begin with a terminal or a higher-indexed variable.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A<sub>1</sub> &rarr; A<sub>2</sub>X, A<sub>2</sub> &rarr; a</em> &nbsp;&rarr;&nbsp; <em>A<sub>1</sub> &rarr; aX</em>
          </div>
        </li>
        <li style={{ marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text-main)' }}>Final GNF Enforcement:</strong>
          <br/>Ensuring every rule strictly starts with a terminal followed by non-terminals.
          <div style={{ background: 'var(--bg-glass-active)', padding: '12px 18px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--border-glass)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>Ex: </span> <em>A &rarr; aBC...</em>
          </div>
        </li>
      </ol>
    </motion.div>
  );
}
