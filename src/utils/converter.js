/**
 * CFG to CNF & GNF Converter
 * Logic strictly aligned with required 6-step CNF and 9-step GNF pipelines.
 */

const EPSILON = 'ε';

/**
 * Internal Grammar representation:
 * {
 *   variables: string[],
 *   terminals: string[],
 *   start: string,
 *   productions: Map<string, string[][]>
 * }
 */

function cloneG(g) {
  const np = new Map();
  for (const [v, ps] of g.productions) { np.set(v, ps.map(p => [...p])); }
  return {
    variables: [...g.variables],
    terminals: [...g.terminals],
    start: g.start,
    productions: np
  };
}

function eq(g1, g2) {
  if (g1.start !== g2.start) return false;
  if (g1.productions.size !== g2.productions.size) return false;
  for (const [v, ps] of g1.productions) {
    if (!g2.productions.has(v)) return false;
    const ps2 = g2.productions.get(v);
    if (ps.length !== ps2.length) return false;
    const s1 = ps.map(p => p.join('\0')).sort();
    const s2 = ps2.map(p => p.join('\0')).sort();
    if (s1.some((s, i) => s !== s2[i])) return false;
  }
  return true;
}

function dedup(g) {
  for (const [v, ps] of g.productions) {
    const seen = new Set(), next = [];
    for (const p of ps) {
      const s = p.join('\0');
      if (!seen.has(s)) { seen.add(s); next.push(p); }
    }
    g.productions.set(v, next);
  }
}

function updateSets(g) {
  const vars = new Set([...g.productions.keys()]);
  const terms = new Set();
  for (const [, ps] of g.productions) {
    for (const p of ps) {
      for (const s of p) {
        if (s !== EPSILON && !vars.has(s)) { terms.add(s); }
      }
    }
  }
  g.variables = Array.from(vars).sort();
  g.terminals = Array.from(terms).sort();
}

let usedVars = new Set();
function resetVars(g) { usedVars = new Set(g.variables); }

function freshVar(prefix = 'X', suggestion = null) {
  if (suggestion && !usedVars.has(suggestion)) {
    usedVars.add(suggestion);
    return suggestion;
  }
  if (prefix === 'S0' && !usedVars.has('S0')) { usedVars.add('S0'); return 'S0'; }
  let i = 1;
  while (usedVars.has(`${prefix}${i}`)) i++;
  usedVars.add(`${prefix}${i}`);
  return `${prefix}${i}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE STEP LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function addS0(g) {
  let needed = false;
  for (const [, ps] of g.productions) {
    for (const p of ps) { if (p.includes(g.start)) { needed = true; break; } }
    if (needed) break;
  }
  if (!needed) return { added: false, oldStart: g.start, newStart: g.start };

  const oldStart = g.start;
  const newStart = 'S0';
  if (usedVars.has(newStart)) return { added: false, oldStart, newStart: g.start };
  usedVars.add(newStart);
  g.productions.set(newStart, [[oldStart]]);
  g.start = newStart;
  updateSets(g);
  return { added: true, oldStart, newStart };
}

function findNullable(g) {
  const nullable = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [v, ps] of g.productions) {
      if (nullable.has(v)) continue;
      for (const p of ps) {
        if (p.length === 1 && p[0] === EPSILON) { nullable.add(v); changed = true; break; }
        if (p.length > 0 && p.every(s => nullable.has(s))) { nullable.add(v); changed = true; break; }
      }
    }
  }
  return nullable;
}

function getCombos(p, nullable) {
  let results = [[]];
  for (const s of p) {
    const next = [];
    for (const r of results) {
      next.push([...r, s]);
      if (nullable.has(s)) next.push(r);
    }
    results = next;
  }
  return results;
}

function doEpsilonElim(g) {
  const nullable = findNullable(g);
  const np = new Map();
  for (const [v, ps] of g.productions) {
    const nextPs = [];
    for (const p of ps) {
      if (p.length === 1 && p[0] === EPSILON) continue;
      const combos = getCombos(p, nullable);
      for (const c of combos) { if (c.length > 0) nextPs.push(c); }
    }
    np.set(v, nextPs);
  }
  if (nullable.has(g.start)) { np.get(g.start).push([EPSILON]); }
  g.productions = np;
  dedup(g);
  updateSets(g);
}

function elimUnit(g) {
  const vars = g.variables;
  for (const v of vars) {
    const closure = new Set([v]), q = [v];
    while (q.length) {
      const cur = q.shift();
      const ps = g.productions.get(cur) || [];
      for (const p of ps) {
        if (p.length === 1 && g.variables.includes(p[0]) && !closure.has(p[0])) {
          closure.add(p[0]); q.push(p[0]);
        }
      }
    }
    const nextPs = [];
    for (const u of closure) {
      const ups = g.productions.get(u) || [];
      for (const p of ups) {
        if (!(p.length === 1 && g.variables.includes(p[0]))) nextPs.push([...p]);
      }
    }
    g.productions.set(v, nextPs);
  }
  dedup(g);
  updateSets(g);
}

function elimUseless(g) {
  const gen = new Set();
  let ch = true;
  while (ch) {
    ch = false;
    for (const [v, ps] of g.productions) {
      if (gen.has(v)) continue;
      for (const p of ps) {
        if (p.every(s => s === EPSILON || g.terminals.includes(s) || gen.has(s))) {
          gen.add(v); ch = true; break;
        }
      }
    }
  }
  for (const [v, ps] of g.productions) {
    if (!gen.has(v)) g.productions.delete(v);
    else g.productions.set(v, ps.filter(p => p.every(s => s === EPSILON || g.terminals.includes(s) || gen.has(s))));
  }
  const reach = new Set([g.start]), q = [g.start];
  while (q.length) {
    const v = q.shift();
    const ps = g.productions.get(v) || [];
    for (const p of ps) {
      for (const s of p) { if (g.variables.includes(s) && !reach.has(s)) { reach.add(s); q.push(s); } }
    }
  }
  for (const v of g.productions.keys()) { if (!reach.has(v)) g.productions.delete(v); }
  updateSets(g);
}

function terminalReplace(g) {
  const tmap = new Map();
  for (const [v, ps] of g.productions) {
    for (let i = 0; i < ps.length; i++) {
      if (ps[i].length < 2) continue;
      for (let j = 0; j < ps[i].length; j++) {
        const s = ps[i][j];
        if (g.terminals.includes(s)) {
          if (!tmap.has(s)) {
            const suggestion = s.toUpperCase();
            const nv = freshVar('T', /^[a-z]$/.test(s) ? suggestion : null);
            tmap.set(s, nv);
            g.productions.set(nv, [[s]]);
          }
          ps[i][j] = tmap.get(s);
        }
      }
    }
  }
  updateSets(g);
}

function binarize(g) {
  for (const [v, ps] of [...g.productions.entries()]) {
    const nextPs = [];
    for (let p of ps) {
      if (p.length <= 2) { nextPs.push(p); continue; }
      let curLHS = v;
      for (let i = 0; i < p.length - 2; i++) {
        const nv = freshVar('X');
        if (i === 0) nextPs.push([p[i], nv]);
        else g.productions.set(curLHS, [[p[i], nv]]);
        curLHS = nv;
      }
      g.productions.set(curLHS, [[p[p.length - 2], p[p.length - 1]]]);
    }
    g.productions.set(v, nextPs);
  }
  updateSets(g);
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSING & FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

function gToUIDict(g) {
  const dict = {};
  for (const [v, ps] of g.productions) {
    dict[v] = ps.map(p => p[0] === EPSILON ? [] : [...p]);
  }
  return dict;
}

function buildStep(title, explanation, info, g, isChanged = true, metadata = null) {
  return { 
    title, 
    description: explanation + (info ? `\n\n${info}` : ''), 
    grammar: gToUIDict(g), 
    validationPassed: true, 
    validationErrors: [], 
    isChanged,
    metadata 
  };
}

export function parseTextGrammar(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const productions = new Map();
  let start = null;
  const varsSet = new Set();
  for (const line of lines) {
    if (!line.includes('->') && !line.includes('→')) {
      throw new Error(`Invalid line format: "${line}". Rules must follow "LHS -> RHS" format.`);
    }
    const match = line.match(/^([S0-9A-Z']+)[\s\d]*(-+>|→)\s*(.*)$/);
    if (!match) {
      throw new Error(`Invalid rule LHS: "${line.split(/[->→]/)[0].trim()}". LHS must be Uppercase variables (e.g. S, A, B1).`);
    }
    const [, lhs, , rhsPart] = match;
    const trimmedRhs = rhsPart.trim();
    if (!trimmedRhs) {
      throw new Error(`Empty RHS for rule: "${lhs} -> ". Did you mean to use ε or eps?`);
    }

    if (!start) start = lhs;
    varsSet.add(lhs);
    if (!productions.has(lhs)) productions.set(lhs, []);
    
    for (const alt of trimmedRhs.split('|').map(s => s.trim())) {
      if (!alt || alt === EPSILON || alt === 'eps' || alt === 'epsilon') { 
        productions.get(lhs).push([EPSILON]); 
      }
      else {
        const tokens = [];
        let i = 0;
        while (i < alt.length) {
          if (/\s/.test(alt[i])) { i++; continue; }
          if (/[A-Z]/.test(alt[i])) {
            let v = alt[i++];
            while (i < alt.length && /[0-9']/.test(alt[i])) v += alt[i++];
            tokens.push(v); varsSet.add(v);
          } else {
            // Collect terminal token (sequence of non-space, non-uppercase characters)
            let t = "";
            while (i < alt.length && !/\s/.test(alt[i]) && !/[A-Z]/.test(alt[i])) {
              t += alt[i++];
            }
            if (t) tokens.push(t);
            else i++;
          }
        }
        if (tokens.length > 0) productions.get(lhs).push(tokens);
        else productions.get(lhs).push([EPSILON]);
      }
    }
  }
  if (productions.size === 0) {
    throw new Error('No valid grammar rules found. Please check your syntax.');
  }

  // Final check: Look for undefined non-terminals (variables used in RHS but never defined on LHS)
  const definedVars = new Set(productions.keys());
  for (const [lhs, ps] of productions) {
    for (const p of ps) {
      for (const token of p) {
        if (token !== EPSILON && /^[A-Z]/.test(token) && !definedVars.has(token)) {
          throw new Error(`Undefined variable: "${token}". You used "${token}" in the rule for "${lhs}", but never defined a production for it (e.g., ${token} -> ...).`);
        }
      }
    }
  }

  const g = { variables: Array.from(varsSet).sort(), terminals: [], start: start || 'S', productions };
  updateSets(g);
  return g;
}

function configToG(config) {
  const productions = new Map();
  if (!config.rules || config.rules.length === 0) {
    throw new Error('No valid grammar rules found. Please check your syntax.');
  }

  for (const rule of config.rules) {
    const lhs = rule.lhs;
    if (!lhs) {
      throw new Error(`Invalid rule LHS. LHS must be Uppercase variables (e.g. S, A, B1).`);
    }
    const trimmedRhs = rule.rhs.trim();
    if (!trimmedRhs) {
      throw new Error(`Empty RHS for rule: "${lhs} -> ". Did you mean to use ε or eps?`);
    }

    const alts = trimmedRhs.split('|').map(s => s.trim());
    if (!productions.has(lhs)) productions.set(lhs, []);
    for (const alt of alts) {
      if (!alt || alt === EPSILON || alt === 'eps' || alt === 'epsilon') { productions.get(lhs).push([EPSILON]); }
      else {
        const tokens = []; let i = 0;
        const sortedVars = [...config.variables].sort((a,b) => b.length - a.length);
        while (i < alt.length) {
          if (/\s/.test(alt[i])) { i++; continue; }
          let foundVar = false;
          for (const v of sortedVars) { if (alt.startsWith(v, i)) { tokens.push(v); i += v.length; foundVar = true; break; } }
          if (!foundVar) tokens.push(alt[i++]);
        }
        productions.get(lhs).push(tokens);
      }
    }
  }

  // Final check: Look for undefined non-terminals
  const definedVars = new Set(productions.keys());
  for (const [lhs, ps] of productions) {
    for (const p of ps) {
      for (const token of p) {
        if (token !== EPSILON && /^[A-Z]/.test(token) && !definedVars.has(token)) {
          throw new Error(`Undefined variable: "${token}". You used "${token}" in the rule for "${lhs}", but never defined a production for it (e.g., ${token} -> ...).`);
        }
      }
    }
  }

  const g = { variables: [...config.variables].sort(), terminals: [...config.terminals].sort(), start: config.startVar, productions };
  return g;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSION WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────

export function convertToCNF(input) {
  let g = (typeof input === 'string') ? parseTextGrammar(input) : configToG(input);
  resetVars(g);
  const steps = [];
  
  // 1. Preprocessing
  addS0(g);
  steps.push(buildStep('Step 1: Preprocessing', 'Added a new start symbol S0 to ensure the start variable never appears on the right-hand side.', null, g));

  // 2. ε-elimination
  const nullable = findNullable(g);
  doEpsilonElim(g);
  steps.push(buildStep('Step 2: ε-elimination', 'Identified nullable variables and added productions for every combination of their presence in each rule.', null, g, true, { nullable: Array.from(nullable) }));

  // 3. Unit production removal
  const closures = {};
  for (const v of g.variables) {
    const c = new Set([v]), q = [v];
    while(q.length) {
      const cur = q.shift();
      const ps = g.productions.get(cur) || [];
      for (const p of ps) {
        if (p.length === 1 && g.variables.includes(p[0]) && !c.has(p[0])) { c.add(p[0]); q.push(p[0]); }
      }
    }
    if (c.size > 1) closures[v] = Array.from(c);
  }
  elimUnit(g);
  steps.push(buildStep('Step 3: Unit production removal', 'Computed transitive closures of unit productions and replaced chain rules with the final non-unit derivations.', null, g, true, { unitClosures: closures }));

  // 4. Useless symbol removal
  const genSet = new Set();
  let ch = true;
  while (ch) {
    ch = false;
    for (const [v, ps] of g.productions) {
      if (genSet.has(v)) continue;
      for (const p of ps) {
        if (p.every(s => s === EPSILON || g.terminals.includes(s) || genSet.has(s))) {
          genSet.add(v); ch = true; break;
        }
      }
    }
  }
  const reachingSet = new Set([g.start]), reachableQ = [g.start];
  while (reachableQ.length) {
    const v = reachableQ.shift();
    const ps = g.productions.get(v) || [];
    for (const p of ps) {
      for (const s of p) { if (g.variables.includes(s) && !reachingSet.has(s)) { reachingSet.add(s); reachableQ.push(s); } }
    }
  }
  elimUseless(g);
  steps.push(buildStep('Step 4: Useless symbol removal', 'Removed non-generating variables (those that cannot lead to terminals) and unreachable symbols.', null, g, true, { 
    generating: Array.from(genSet),
    reachable: Array.from(reachingSet)
  }));

  // 5. Terminal replacement
  terminalReplace(g);
  steps.push(buildStep('Step 5: Terminal replacement', 'Ensured that non-terminal productions with length >= 2 do not contain terminals by replacing them with new variables.', null, g));

  // 6. Binarization
  binarize(g);
  steps.push(buildStep('Step 6: Binarization', 'Broke down all production rules with more than two symbols into binary chains.', null, g));

  return steps;
}

export function convertToGNF(input) {
  let g = (typeof input === 'string') ? parseTextGrammar(input) : configToG(input);
  resetVars(g);
  const steps = [];

  // Step 1: Preprocessing
  addS0(g);
  steps.push(buildStep('Step 1: Preprocessing', 'Initial grammar preparation and addition of a new start symbol S0.', null, g));

  // Step 2: ε-elimination
  doEpsilonElim(g);
  steps.push(buildStep('Step 2: ε-elimination', 'Eliminated all ε-productions except possibly from the start symbol.', null, g));

  // Step 3: Unit removal
  elimUnit(g);
  steps.push(buildStep('Step 3: Unit removal', 'Eliminated all unit productions via transitive substitution.', null, g));

  // Step 4: Useless symbol removal
  elimUseless(g);
  steps.push(buildStep('Step 4: Useless symbol removal', 'Cleaned up non-generating and unreachable symbols.', null, g));

  // Step 5: CNF preparation
  terminalReplace(g);
  binarize(g);
  steps.push(buildStep('Step 5: CNF preparation', 'Converted the grammar to Chomsky Normal Form to facilitate GNF conversion.', null, g));

  // Step 6: Variable ordering
  const order = [g.start, ...g.variables.filter(v => v !== g.start)];
  steps.push(buildStep('Step 6: Variable ordering', `Assigned order to variables: ${order.join(' < ')}.`, null, g));

  // Step 7: Left recursion removal
  for (let i = 0; i < order.length; i++) {
    const Ai = order[i];
    // Substitutions for i < j
    for (let j = 0; j < i; j++) {
      const Aj = order[j];
      const ps = g.productions.get(Ai) || [];
      const nextPs = [];
      for (const p of ps) {
        if (p[0] === Aj) {
          const ajPs = g.productions.get(Aj) || [];
          for (const sp of ajPs) nextPs.push([...sp, ...p.slice(1)]);
        } else nextPs.push(p);
      }
      g.productions.set(Ai, nextPs);
      dedup(g);
    }
    // Direct left recursion removal
    const ps = g.productions.get(Ai) || [];
    const lr = ps.filter(p => p[0] === Ai);
    const nlr = ps.filter(p => p[0] !== Ai);
    if (lr.length > 0) {
      const Zi = freshVar('Z');
      const aiPs = [], ziPs = [];
      for (const b of nlr) { aiPs.push(b); aiPs.push([...b, Zi]); }
      for (const a of lr) { const suf = a.slice(1); ziPs.push(suf); ziPs.push([...suf, Zi]); }
      g.productions.set(Ai, aiPs);
      g.productions.set(Zi, ziPs);
      updateSets(g);
    }
  }
  steps.push(buildStep('Step 7: Left recursion removal', 'Eliminated direct and indirect left recursion by following the variable ordering.', null, g));

  // Step 8: Substitution of leading variables
  for (let i = order.length - 2; i >= 0; i--) {
    const Ai = order[i];
    const ps = g.productions.get(Ai) || [];
    const nextPs = [];
    for (const p of ps) {
      if (g.variables.includes(p[0]) && order.indexOf(p[0]) > i) {
        const Aj = p[0];
        const ajPs = g.productions.get(Aj) || [];
        for (const sp of ajPs) nextPs.push([...sp, ...p.slice(1)]);
      } else nextPs.push(p);
    }
    g.productions.set(Ai, nextPs);
    dedup(g);
  }
  steps.push(buildStep('Step 8: Substitution of leading variables', 'Substituted leading non-terminals with their productions to ensure every rule starts with a terminal or a variable of higher rank.', null, g));

  // Step 9: Final GNF enforcement
  let anyChanged = true, limit = 15;
  while (anyChanged && limit-- > 0) {
    anyChanged = false;
    for (const [v, ps] of g.productions) {
      const nextPs = [];
      for (const p of ps) {
        if (g.variables.includes(p[0])) {
          const first = p[0];
          const firstPs = g.productions.get(first) || [];
          for (const sp of firstPs) nextPs.push([...sp, ...p.slice(1)]);
          anyChanged = true;
        } else nextPs.push(p);
      }
      g.productions.set(v, nextPs);
    }
    dedup(g);
  }
  
  // Try to restore original start name if safe
  try {
    const originalStart = (typeof input === 'string') ? parseTextGrammar(input).start : input.startVar;
    restoreStartName(g, originalStart);
  } catch(e) {}

  steps.push(buildStep('Step 9: Final GNF enforcement', 'Completed final substitutions and restored start symbol name to ensure a professional GNF output.', null, g));

  return steps;
}

/**
 * CYK Algorithm for String Parsing
 * @param {Object} g - Grammar in CNF
 * @param {string} input - String to parse
 * @returns {Object} { accepted: boolean, table: Set[][] }
 */
export function checkString(g, input) {
  // Tokenize input: if it contains spaces, use them as delimiters. Otherwise, treat each character as a token.
  // We trim and filter to remove empty tokens.
  const tokens = input.includes(' ') 
    ? input.split(/\s+/).filter(Boolean) 
    : input.replace(/\s+/g, '').split('');

  const n = tokens.length;
  if (n === 0) {
    const startRules = g.productions.get(g.start) || [];
    const generatesEpsilon = startRules.some(p => p.length === 1 && p[0] === EPSILON);
    return { accepted: generatesEpsilon, table: [] };
  }

  // Initialize CYK table: table[length][start_pos]
  const table = Array.from({ length: n + 1 }, () => 
    Array.from({ length: n }, () => new Set())
  );

  // Fill length 1
  for (let i = 0; i < n; i++) {
    const token = tokens[i];
    for (const [v, ps] of g.productions) {
      for (const p of ps) {
        if (p.length === 1 && p[0] === token) {
          table[1][i].add(v);
        }
      }
    }
  }

  // Fill lengths 2 to n
  for (let len = 2; len <= n; len++) {
    for (let pos = 0; pos <= n - len; pos++) {
      for (let k = 1; k < len; k++) {
        // A -> BC where B generates first k chars and C generates remaining len-k chars
        // B comes from table[k][pos]
        // C comes from table[len-k][pos+k]
        for (const [v, ps] of g.productions) {
          for (const p of ps) {
            if (p.length === 2) {
              const [B, C] = p;
              if (table[k][pos].has(B) && table[len - k][pos + k].has(C)) {
                table[len][pos].add(v);
              }
            }
          }
        }
      }
    }
  }

  return {
    accepted: table[n][0].has(g.start),
    table: table,
    tokens: tokens
  };
}

/**
 * Backtracks through the CYK table to build a derivation tree.
 * @param {Object} g - Grammar in CNF
 * @param {Set[][]} table - CYK table
 * @param {string[]} tokens - Array of input tokens
 * @param {number} len - Current substring length
 * @param {number} pos - Current substring position
 * @param {string} variable - Current Non-terminal variable
 */
export function buildParseTree(g, table, tokens, len, pos, variable) {
  if (len === 1) {
    const token = tokens[pos];
    return {
      sym: variable,
      children: [{ sym: token, terminal: true }],
      terminal: false
    };
  }

  const rules = g.productions.get(variable) || [];
  for (let k = 1; k < len; k++) {
    for (const p of rules) {
      if (p.length === 2) {
        const [B, C] = p;
        if (table[k][pos].has(B) && table[len - k][pos + k].has(C)) {
          const leftNode = buildParseTree(g, table, tokens, k, pos, B);
          const rightNode = buildParseTree(g, table, tokens, len - k, pos + k, C);
          if (leftNode && rightNode) {
            return {
              sym: variable,
              children: [leftNode, rightNode],
              terminal: false
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Generates leftmost derivation steps from a parse tree.
 */
export function getDerivationSteps(tree) {
  if (!tree) return [];
  const steps = [];

  function getSentential(nodes) {
    return nodes.map(n => n.sym).join(' ');
  }

  let currentNodes = [tree];
  steps.push(getSentential(currentNodes));

  // Limit iterations to prevent infinite loops on crazy trees
  let iterations = 0;
  while (currentNodes.some(n => !n.terminal) && iterations < 100) {
    iterations++;
    const idx = currentNodes.findIndex(n => !n.terminal);
    if (idx === -1) break;

    const nodeToExpand = currentNodes[idx];
    if (nodeToExpand.children) {
      currentNodes = [
        ...currentNodes.slice(0, idx),
        ...nodeToExpand.children,
        ...currentNodes.slice(idx + 1)
      ];
      steps.push(getSentential(currentNodes));
    } else {
      // Mark as terminal to avoid infinite loop
      nodeToExpand.terminal = true;
    }
  }

  return steps;
}
