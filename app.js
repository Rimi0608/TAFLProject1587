/* ================================================================
   CFG → CNF & GNF Converter  (corrected & expanded)
   ================================================================ */

// ── Parsing ────────────────────────────────────────────────────

function parseGrammar(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Grammar is empty.');

    const productions = new Map();
    const variables = new Set();
    const terminals = new Set();
    let start = null;

    for (const line of lines) {
        const m = line.match(/^([A-Z])\s*(?:→|->)\s*(.+)$/);
        if (!m) throw new Error(`Invalid production: "${line}".  Use  A → α | β`);
        const lhs = m[1];
        if (!start) start = lhs;
        variables.add(lhs);
        if (!productions.has(lhs)) productions.set(lhs, []);
        for (const alt of m[2].split('|').map(s => s.trim()).filter(Boolean)) {
            productions.get(lhs).push(parseBody(alt));
        }
    }

    for (const [, prods] of productions)
        for (const prod of prods)
            for (const s of prod) {
                if (s === 'ε') continue;
                if (/^[A-Z]$/.test(s)) variables.add(s);
                else terminals.add(s);
            }

    return { variables: [...variables], terminals: [...terminals], start, productions: cloneP(productions) };
}

function parseBody(s) {
    s = s.trim();
    if (s === 'ε' || s === 'eps' || s === 'epsilon' || s === 'ϵ') return ['ε'];
    const out = [];
    for (const ch of s) if (ch !== ' ') out.push(ch);
    return out;
}

function parseVisualGrammar() {
    const vars = val('variablesInput').split(',').map(s => s.trim()).filter(Boolean);
    const terms = val('terminalsInput').split(',').map(s => s.trim()).filter(Boolean);
    const start = val('startSymbolInput');
    if (!vars.length || !terms.length || !start) throw new Error('Fill in variables, terminals, and start symbol.');
    if (!vars.includes(start)) throw new Error(`Start "${start}" not in variables.`);

    const productions = new Map();
    for (const row of document.querySelectorAll('.production-row')) {
        const lhs = row.querySelector('.prod-lhs').value.trim();
        const rhs = row.querySelector('.prod-rhs').value.trim();
        if (!lhs || !rhs) continue;
        if (!vars.includes(lhs)) throw new Error(`"${lhs}" not in variables.`);
        if (!productions.has(lhs)) productions.set(lhs, []);
        for (const alt of rhs.split('|').map(s => s.trim()).filter(Boolean))
            productions.get(lhs).push(parseBody(alt));
    }
    if (!productions.size) throw new Error('Add at least one production.');
    return { variables: vars, terminals: terms, start, productions };
}

function val(id) { return document.getElementById(id).value.trim(); }

// ── Deep-copy helpers ──────────────────────────────────────────

function cloneP(m) { const c = new Map(); for (const [k, v] of m) c.set(k, v.map(p => [...p])); return c; }
function cloneG(g) { return { variables: [...g.variables], terminals: [...g.terminals], start: g.start, productions: cloneP(g.productions) }; }

function updateSets(g) {
    const V = new Set(), T = new Set();
    V.add(g.start);
    for (const [v, ps] of g.productions) { V.add(v); for (const p of ps) for (const s of p) { if (s === 'ε') continue; /^[A-Z]$/.test(s) ? V.add(s) : T.add(s); } }
    g.variables = [...V]; g.terminals = [...T];
}

function dedup(g) {
    for (const [v, ps] of g.productions) {
        const seen = new Set(), u = [];
        for (const p of ps) { const k = p.join(','); if (!seen.has(k)) { seen.add(k); u.push(p); } }
        g.productions.set(v, u);
    }
}

function eq(g1, g2) {
    if (g1.variables.length !== g2.variables.length || g1.terminals.length !== g2.terminals.length) return false;
    for (const [v, p1] of g1.productions) {
        const p2 = g2.productions.get(v);
        if (!p2 || p1.length !== p2.length) return false;
        for (let i = 0; i < p1.length; i++) { if (p1[i].length !== p2[i].length) return false; for (let j = 0; j < p1[i].length; j++) if (p1[i][j] !== p2[i][j]) return false; }
    }
    return true;
}

// ── Variable name allocator ────────────────────────────────────

const usedVars = new Set();
function resetVars(g) { usedVars.clear(); g.variables.forEach(v => usedVars.add(v)); }
function freshVar() {
    for (let c = 65; c <= 90; c++) { const v = String.fromCharCode(c); if (!usedVars.has(v)) { usedVars.add(v); return v; } }
    throw new Error('No more single-letter variable names available.');
}

// ── Nullable detection ─────────────────────────────────────────

function findNullable(g) {
    const n = new Set();
    for (const [v, ps] of g.productions) for (const p of ps) if (p.length === 1 && p[0] === 'ε') n.add(v);
    let ch = true;
    while (ch) { ch = false; for (const [v, ps] of g.productions) { if (n.has(v)) continue; for (const p of ps) if (p.every(s => n.has(s))) { n.add(v); ch = true; break; } } }
    return n;
}

function nullCombos(prod, nullable) {
    const np = [];
    for (let i = 0; i < prod.length; i++) if (nullable.has(prod[i])) np.push(i);
    if (!np.length) return [prod];
    const out = [];
    for (let mask = 0; mask < (1 << np.length); mask++) {
        const c = [];
        for (let i = 0; i < prod.length; i++) { const idx = np.indexOf(i); if (idx === -1 || !(mask & (1 << idx))) c.push(prod[i]); }
        if (c.length) out.push(c);
    }
    return out;
}

// ── ε-elimination (shared helper) ──────────────────────────────

function doEpsilonElim(g) {
    const nullable = findNullable(g);
    if (!nullable.size) return nullable;
    const np = new Map();
    for (const [v, ps] of g.productions) {
        np.set(v, []);
        for (const p of ps) {
            if (p.length === 1 && p[0] === 'ε') continue;
            for (const c of nullCombos(p, nullable)) if (c.length) np.get(v).push(c);
        }
    }
    if (nullable.has(g.start)) np.get(g.start).push(['ε']);
    g.productions = np;
    dedup(g);
    updateSets(g);
    return nullable;
}

// ── Unit production elimination ────────────────────────────────

function elimUnit(g) {
    for (const v of [...g.variables]) {
        const closure = new Set([v]), q = [v];
        while (q.length) { const cur = q.shift(); if (!g.productions.has(cur)) continue; for (const p of g.productions.get(cur)) if (p.length === 1 && /^[A-Z]$/.test(p[0]) && !closure.has(p[0])) { closure.add(p[0]); q.push(p[0]); } }
        const np = [];
        if (g.productions.has(v)) for (const p of g.productions.get(v)) if (!(p.length === 1 && /^[A-Z]$/.test(p[0]))) np.push(p);
        for (const u of closure) { if (u === v || !g.productions.has(u)) continue; for (const p of g.productions.get(u)) if (!(p.length === 1 && /^[A-Z]$/.test(p[0]))) np.push([...p]); }
        g.productions.set(v, np);
    }
}

function listUnits(g) {
    const u = [];
    for (const [v, ps] of g.productions) for (const p of ps) if (p.length === 1 && /^[A-Z]$/.test(p[0])) u.push(`${v} → ${p[0]}`);
    return u.length ? 'Unit productions: ' + u.join(', ') : null;
}

// ── Useless symbol elimination ─────────────────────────────────

function elimUseless(g) {
    // generating
    const gen = new Set();
    let ch = true;
    while (ch) { ch = false; for (const [v, ps] of g.productions) { if (gen.has(v)) continue; for (const p of ps) if (p.every(s => s === 'ε' || g.terminals.includes(s) || gen.has(s))) { gen.add(v); ch = true; break; } } }
    const m1 = new Map();
    for (const [v, ps] of g.productions) { if (!gen.has(v)) continue; const f = ps.filter(p => p.every(s => s === 'ε' || g.terminals.includes(s) || gen.has(s))); if (f.length) m1.set(v, f); }
    g.productions = m1;
    // reachable
    const reach = new Set([g.start]), q = [g.start];
    while (q.length) { const c = q.shift(); if (!g.productions.has(c)) continue; for (const p of g.productions.get(c)) for (const s of p) { if (s !== 'ε' && !reach.has(s)) { reach.add(s); if (/^[A-Z]$/.test(s)) q.push(s); } } }
    const m2 = new Map();
    for (const [v, ps] of g.productions) { if (!reach.has(v)) continue; const f = ps.filter(p => p.every(s => s === 'ε' || reach.has(s))); if (f.length) m2.set(v, f); }
    g.productions = m2;
    updateSets(g);
}

// ── Restore original start symbol name ─────────────────────────

function restoreStartName(g, originalStart) {
    if (!originalStart || g.start === originalStart) return;
    // If the original start name is still in use as a different variable, skip
    if (g.productions.has(originalStart)) return;
    for (const [, ps] of g.productions)
        for (const p of ps)
            if (p.includes(originalStart)) return;
    // Rename current start variable back to original name
    const oldName = g.start;
    const newProds = new Map();
    for (const [v, ps] of g.productions) {
        const newV = (v === oldName) ? originalStart : v;
        newProds.set(newV, ps.map(p => p.map(s => s === oldName ? originalStart : s)));
    }
    g.productions = newProds;
    g.start = originalStart;
    g.variables = g.variables.map(v => v === oldName ? originalStart : v);
    updateSets(g);
}

// ── Merge duplicate variables ──────────────────────────────────

function mergeDuplicates(g) {
    let changed = true;
    while (changed) {
        changed = false;
        const vars = [...g.productions.keys()];
        for (let i = 0; i < vars.length && !changed; i++) {
            for (let j = i + 1; j < vars.length && !changed; j++) {
                const v1 = vars[i], v2 = vars[j];
                const p1 = g.productions.get(v1), p2 = g.productions.get(v2);
                if (!p1 || !p2) continue;
                const s1 = new Set(p1.map(p => p.join(','))),
                      s2 = new Set(p2.map(p => p.join(',')));
                if (s1.size !== s2.size) continue;
                let same = true;
                for (const k of s1) if (!s2.has(k)) { same = false; break; }
                if (!same) continue;
                // keep v1 (or the start symbol if one of them is start)
                const keep = (v2 === g.start) ? v2 : v1;
                const drop = (keep === v1) ? v2 : v1;
                for (const [, ps] of g.productions) {
                    for (const p of ps) {
                        for (let k = 0; k < p.length; k++) if (p[k] === drop) p[k] = keep;
                    }
                }
                g.productions.delete(drop);
                changed = true;
            }
        }
        if (changed) { dedup(g); updateSets(g); }
    }
}

// ── Convert to proper CNF form ─────────────────────────────────

function toCNFForm(g) {
    // replace terminals in mixed productions
    const tmap = new Map();
    for (const [, ps] of g.productions) {
        for (let i = 0; i < ps.length; i++) {
            if (ps[i].length <= 1) continue;
            const np = [];
            for (const s of ps[i]) {
                if (/^[A-Z]$/.test(s)) { np.push(s); }
                else {
                    if (!tmap.has(s)) { const nv = freshVar(); tmap.set(s, nv); g.productions.set(nv, [[s]]); g.variables.push(nv); }
                    np.push(tmap.get(s));
                }
            }
            ps[i] = np;
        }
    }
    // break long productions into binary
    for (const [v, ps] of [...g.productions.entries()]) {
        const built = [];
        for (const prod of ps) {
            if (prod.length <= 2) { built.push(prod); continue; }
            let rem = prod, tgt = v;
            while (rem.length > 2) {
                const nv = freshVar();
                g.variables.push(nv);
                if (tgt === v) built.push([rem[0], nv]);
                else g.productions.set(tgt, [[rem[0], nv]]);
                tgt = nv;
                rem = rem.slice(1);
            }
            g.productions.set(tgt, [rem]);
        }
        g.productions.set(v, built);
    }
}

// ── Add new start symbol (shared helper) ───────────────────────

function addNewStart(g) {
    let startOnRHS = false;
    for (const [, ps] of g.productions) {
        for (const p of ps) if (p.includes(g.start)) { startOnRHS = true; break; }
        if (startOnRHS) break;
    }
    if (!startOnRHS) return { added: false, oldStart: g.start };
    const ns = freshVar(), os = g.start;
    // insert ns -> os at the beginning of the map
    const newProd = new Map();
    newProd.set(ns, [[os]]);
    for (const [k, v] of g.productions) newProd.set(k, v);
    g.productions = newProd;
    g.start = ns;
    g.variables.unshift(ns);
    updateSets(g);
    return { added: true, oldStart: os, newStart: ns };
}

// ── CNF pipeline ───────────────────────────────────────────────

function convertToCNF(grammar) {
    const steps = [];
    let g = cloneG(grammar);
    resetVars(g);

    // 1. start symbol
    const startResult = addNewStart(g);
    if (startResult.added) {
        steps.push(step('New Start Symbol',
            `"${startResult.oldStart}" appears on the RHS. Added ${startResult.newStart} → ${startResult.oldStart}.`,
            `${startResult.newStart} → ${startResult.oldStart}`, g, true));
    } else {
        steps.push(step('Start Symbol Check',
            `"${g.start}" does not appear on any RHS — no change needed.`, null, g, false));
    }

    // 2. ε-elimination
    const bEps = cloneG(g);
    const nullable = doEpsilonElim(g);
    if (nullable.size) {
        steps.push(step('Eliminate ε-Productions',
            `Nullable: {${[...nullable].join(', ')}}. Generated all combinations omitting nullable variables.`,
            `Nullable variables: {${[...nullable].join(', ')}}`, g, !eq(bEps, g)));
    } else {
        steps.push(step('Eliminate ε-Productions', 'No ε-productions found.', null, g, false));
    }

    // 3. unit
    const bU = cloneG(g);
    const unitInfo = listUnits(g);
    elimUnit(g); dedup(g); updateSets(g);
    const uc = !eq(bU, g);
    steps.push(step('Eliminate Unit Productions',
        uc ? 'Replaced unit productions with their transitive non-unit expansions.' : 'No unit productions found.',
        uc ? unitInfo : null, g, uc));

    // 4. useless
    const bUs = cloneG(g);
    elimUseless(g); dedup(g); updateSets(g);
    const usc = !eq(bUs, g);
    steps.push(step('Remove Useless Symbols',
        usc ? 'Removed non-generating and unreachable symbols.' : 'All symbols are useful.', null, g, usc));

    // 5. proper CNF
    const bC = cloneG(g);
    toCNFForm(g); dedup(g); updateSets(g);
    steps.push(step('CNF Restructuring',
        'Replaced terminals in mixed productions with dedicated variables and broke long productions into binary pairs.',
        null, g, !eq(bC, g)));

    // 6. cleanup: merge duplicate helper variables & restore start name
    const bClean = cloneG(g);
    mergeDuplicates(g); dedup(g); updateSets(g);
    elimUseless(g); dedup(g); updateSets(g);
    restoreStartName(g, grammar.start);
    dedup(g); updateSets(g);
    if (!eq(bClean, g)) {
        steps.push(step('Simplify',
            'Merged duplicate variables, removed redundant symbols, and restored original start symbol.',
            null, g, true));
    }

    return { steps, result: g };
}

// ── GNF pipeline ───────────────────────────────────────────────

function convertToGNF(grammar) {
    const steps = [];
    let g = cloneG(grammar);
    resetVars(g);

    // ── Step 1: New start symbol ──
    const startResult = addNewStart(g);
    if (startResult.added) {
        steps.push(step('New Start Symbol',
            `"${startResult.oldStart}" appears on the RHS. Added ${startResult.newStart} → ${startResult.oldStart}.`,
            `${startResult.newStart} → ${startResult.oldStart}`, g, true));
    } else {
        steps.push(step('Start Symbol Check',
            `"${g.start}" does not appear on any RHS — no change needed.`, null, g, false));
    }

    // ── Step 2: ε-elimination ──
    const bEps = cloneG(g);
    const nullable = doEpsilonElim(g);
    if (nullable.size) {
        steps.push(step('Eliminate ε-Productions',
            `Nullable: {${[...nullable].join(', ')}}. Generated all combinations omitting nullable variables.`,
            `Nullable variables: {${[...nullable].join(', ')}}`, g, !eq(bEps, g)));
    } else {
        steps.push(step('Eliminate ε-Productions', 'No ε-productions found.', null, g, false));
    }

    // ── Step 3: unit production elimination ──
    const bU = cloneG(g);
    const unitInfo = listUnits(g);
    elimUnit(g); dedup(g); updateSets(g);
    const uc = !eq(bU, g);
    steps.push(step('Eliminate Unit Productions',
        uc ? 'Replaced unit productions with their transitive non-unit expansions.' : 'No unit productions found.',
        uc ? unitInfo : null, g, uc));

    // ── Step 4: useless symbol elimination ──
    const bUs = cloneG(g);
    elimUseless(g); dedup(g); updateSets(g);
    const usc = !eq(bUs, g);
    steps.push(step('Remove Useless Symbols',
        usc ? 'Removed non-generating and unreachable symbols.' : 'All symbols are useful.', null, g, usc));

    // ── Step 5: CNF restructuring ──
    const bC = cloneG(g);
    toCNFForm(g); dedup(g); updateSets(g);
    mergeDuplicates(g); dedup(g); updateSets(g);
    const cnfChanged = !eq(bC, g);
    steps.push(step('CNF Restructuring',
        cnfChanged ? 'Restructured grammar into Chomsky Normal Form (A → BC or A → a) as preparation for GNF.'
        : 'Grammar is already in CNF form.',
        null, g, cnfChanged));

    // handle ε separately for GNF
    let hasEps = false;
    if (g.productions.has(g.start)) {
        const sp = g.productions.get(g.start);
        const ei = sp.findIndex(p => p.length === 1 && p[0] === 'ε');
        if (ei !== -1) { hasEps = true; sp.splice(ei, 1); }
    }

    // ── Step 6: order variables ──
    const order = [g.start];
    for (const v of g.variables) if (v !== g.start && g.productions.has(v) && !order.includes(v)) order.push(v);
    steps.push(step('Order Variables',
        `Assign an ordering to variables for systematic substitution: ${order.map((v, i) => `A${i + 1}=${v}`).join(', ')}.`,
        `Ordering: ${order.join(', ')}`, g, false));

    // ── Step 7: forward substitution & left-recursion removal ──
    const bSub = cloneG(g);
    for (let i = 0; i < order.length; i++) {
        const Ai = order[i];
        if (!g.productions.has(Ai)) continue;
        // substitute lower-indexed
        let changed = true, iter = 0;
        while (changed && iter++ < 100) {
            changed = false;
            const cur = g.productions.get(Ai), next = [];
            for (const p of cur) {
                if (!p.length) continue;
                const f = p[0], j = order.indexOf(f);
                if (/^[A-Z]$/.test(f) && j !== -1 && j < i && g.productions.has(f)) {
                    for (const sp of g.productions.get(f))
                        next.push(sp[0] === 'ε' ? (p.length > 1 ? p.slice(1) : ['ε']) : [...sp, ...p.slice(1)]);
                    changed = true;
                } else next.push(p);
            }
            g.productions.set(Ai, next); dedup(g);
        }
        // remove direct left recursion
        const ps = g.productions.get(Ai);
        const lr = ps.filter(p => p.length && p[0] === Ai);
        const nlr = ps.filter(p => !p.length || p[0] !== Ai);
        if (lr.length) {
            const nv = freshVar(); g.variables.push(nv);
            const ai = [], nvi = [];
            for (const b of nlr) { ai.push(b); ai.push([...b, nv]); }
            for (const r of lr) { const a = r.slice(1); if (a.length) { nvi.push(a); nvi.push([...a, nv]); } }
            g.productions.set(Ai, ai);
            g.productions.set(nv, nvi);
        }
    }
    dedup(g); updateSets(g);
    const fwdDetail = [];
    for (let i = 0; i < order.length; i++) {
        const Ai = order[i];
        if (!g.productions.has(Ai)) continue;
        const ps = g.productions.get(Ai);
        fwdDetail.push(`${Ai} → ${ps.map(p => p.join('')).join(' | ')}`);
    }
    // include new left-recursion variables
    for (const [v, ps] of g.productions) {
        if (!order.includes(v)) fwdDetail.push(`${v} → ${ps.map(p => p.join('')).join(' | ')}`);
    }
    steps.push(step('Forward Substitution & Left-Recursion Removal',
        'For each Aᵢ: substituted all productions starting with Aⱼ (j < i) by replacing Aⱼ with its body; then eliminated any resulting direct left recursion.',
        fwdDetail.join('\n'), g, !eq(bSub, g)));

    // ── Step 8: back-substitution ──
    const bBack = cloneG(g);
    let fp = 0;
    while (fp++ < 60) {
        let any = false;
        for (const v of [...g.productions.keys()]) {
            const ps = g.productions.get(v); if (!ps) continue;
            const next = [];
            for (const p of ps) {
                if (!p.length) { next.push(p); continue; }
                const f = p[0];
                if (/^[A-Z]$/.test(f) && g.productions.has(f)) {
                    for (const sp of g.productions.get(f))
                        next.push(sp[0] === 'ε' ? (p.length > 1 ? p.slice(1) : ['ε']) : [...sp, ...p.slice(1)]);
                    any = true;
                } else next.push(p);
            }
            g.productions.set(v, next);
        }
        dedup(g);
        if (!any) break;
    }
    dedup(g); updateSets(g);
    if (hasEps) {
        if (!g.productions.has(g.start)) g.productions.set(g.start, []);
        g.productions.get(g.start).push(['ε']);
    }

    steps.push(step('Back-Substitution',
        'Replaced every production still starting with a variable by substituting that variable\'s body, until all productions begin with a terminal (A → aα form).',
        null, g, !eq(bBack, g)));

    // ── Step 9: cleanup ──
    const bClean = cloneG(g);
    elimUseless(g); dedup(g); updateSets(g);
    mergeDuplicates(g); dedup(g); updateSets(g);
    restoreStartName(g, grammar.start);
    dedup(g); updateSets(g);
    if (!eq(bClean, g)) {
        steps.push(step('Simplify',
            'Removed unreachable helper variables, merged duplicates, and restored original start symbol.',
            null, g, true));
    }

    return { steps, result: g };
}

function step(title, desc, detail, g, changed) {
    return { title, description: desc, details: detail, grammar: cloneG(g), changed };
}

// ── UI ─────────────────────────────────────────────────────────

function loadExample(n) {
    const ex = {
        1: 'S -> AB | aB\nA -> aA | a\nB -> bB | b',
        2: 'S -> AB | a\nA -> aA | ε\nB -> bB | b',
        3: 'S -> A | aB\nA -> B | aA\nB -> bB | b',
        4: 'S -> AA | a\nA -> SA | b',
        5: 'S -> aSb | ε',
        6: 'S -> aB | bA\nA -> aS | bAA | a\nB -> bS | aBB | b',
        7: 'S -> AB\nA -> aA | ε\nB -> bB | ε',
    };
    document.getElementById('grammarInput').value = ex[n] || '';
    hideError();
}

function clearInput() {
    document.getElementById('grammarInput').value = '';
    hideError();
    document.getElementById('resultsSection').classList.add('hidden');
}

function addProductionRow() {
    const r = document.createElement('div');
    r.className = 'production-row';
    r.innerHTML = '<input type="text" class="prod-lhs" placeholder="A" maxlength="1"/><span class="arr">→</span><input type="text" class="prod-rhs" placeholder="aAB | b"/><button class="row-x" onclick="removeProductionRow(this)">×</button>';
    document.getElementById('productionRows').appendChild(r);
}

function removeProductionRow(btn) {
    if (document.querySelectorAll('.production-row').length > 1) btn.closest('.production-row').remove();
}

// tab toggle
document.getElementById('textModeBtn').addEventListener('click', () => { show('textMode'); hide('visualMode'); hide('imageMode'); activate('textModeBtn'); deactivate('visualModeBtn'); deactivate('imageModeBtn'); });
document.getElementById('visualModeBtn').addEventListener('click', () => { show('visualMode'); hide('textMode'); hide('imageMode'); activate('visualModeBtn'); deactivate('textModeBtn'); deactivate('imageModeBtn'); });
document.getElementById('imageModeBtn').addEventListener('click', () => { show('imageMode'); hide('textMode'); hide('visualMode'); activate('imageModeBtn'); deactivate('textModeBtn'); deactivate('visualModeBtn'); });
function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function activate(id) { document.getElementById(id).classList.add('active'); }
function deactivate(id) { document.getElementById(id).classList.remove('active'); }

// main entry
function convertGrammar(mode) {
    hideError();
    let grammar;
    try {
        const textMode = !document.getElementById('textMode').classList.contains('hidden');
        if (textMode) {
            const v = document.getElementById('grammarInput').value;
            if (!v.trim()) { showError('Enter a grammar or load an example.'); return; }
            grammar = parseGrammar(v);
        } else grammar = parseVisualGrammar();
    } catch (e) { showError(e.message); return; }

    document.getElementById('resultsSection').classList.remove('hidden');
    renderGrammar(grammar, 'originalGrammarDisplay');
    renderMeta(grammar, 'originalGrammarMeta');

    // FIRST & FOLLOW sets
    try { renderFirstFollow(grammar); } catch (e) { /* non-critical */ }

    const cnfEl = document.getElementById('cnfResults');
    const gnfEl = document.getElementById('gnfResults');

    if (mode === 'cnf' || mode === 'both') {
        try {
            const r = convertToCNF(grammar);
            lastCnfResult = r.result;
            cnfEl.classList.remove('hidden');
            renderSteps(r.steps, 'cnfSteps', 'cnf');
            renderGrammar(r.result, 'cnfFinalDisplay');
            renderVerify('cnfVerify', verifyCNF(r.result));
            // reset CYK
            document.getElementById('cykResult').className = 'cyk-result';
            document.getElementById('cykResult').textContent = '';
            document.getElementById('cykTableWrap').innerHTML = '';
        }
        catch (e) { showError('CNF error: ' + e.message); cnfEl.classList.add('hidden'); lastCnfResult = null; }
    } else { cnfEl.classList.add('hidden'); lastCnfResult = null; }

    if (mode === 'gnf' || mode === 'both') {
        try {
            const r = convertToGNF(grammar);
            lastGnfResult = r.result;
            gnfEl.classList.remove('hidden');
            renderSteps(r.steps, 'gnfSteps', 'gnf');
            renderGrammar(r.result, 'gnfFinalDisplay');
            renderVerify('gnfVerify', verifyGNF(r.result));
        }
        catch (e) { showError('GNF error: ' + e.message); gnfEl.classList.add('hidden'); lastGnfResult = null; }
    } else { gnfEl.classList.add('hidden'); lastGnfResult = null; }

    setTimeout(() => document.getElementById('originalGrammarBlock').scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

// ── Rendering ──────────────────────────────────────────────────

function renderGrammar(g, id) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    const keys = [g.start, ...[...g.productions.keys()].filter(k => k !== g.start)];
    for (const v of keys) {
        const ps = g.productions.get(v);
        if (!ps || !ps.length) continue;
        const line = document.createElement('div');
        line.className = 'production-line';
        line.appendChild(span('variable', v));
        line.appendChild(span('arrow-symbol', ' → '));
        ps.forEach((p, i) => {
            if (i) line.appendChild(span('pipe', '|'));
            p.forEach(s => {
                if (s === 'ε') line.appendChild(span('epsilon', 'ε'));
                else if (/^[A-Z]$/.test(s)) line.appendChild(span('variable', s));
                else line.appendChild(span('terminal', s));
            });
        });
        el.appendChild(line);
    }
}

function span(cls, txt) { const s = document.createElement('span'); s.className = cls; s.textContent = txt; return s; }

function renderMeta(g, id) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    let count = 0;
    for (const [, ps] of g.productions) count += ps.length;
    const items = [
        ['V', g.variables.join(', ')],
        ['T', g.terminals.join(', ')],
        ['Start', g.start],
        ['Rules', count]
    ];
    items.forEach(([l, v]) => { const d = document.createElement('span'); d.className = 'meta-item'; d.innerHTML = `${l}: <strong>${v}</strong>`; el.appendChild(d); });
}

function renderSteps(steps, id, type) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    steps.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = `step ${type}-step${s.changed ? '' : ' unchanged'}`;
        card.style.animationDelay = `${i * 0.06}s`;
        const expanded = s.changed || i === steps.length - 1;
        card.innerHTML = `
            <div class="step-head" onclick="toggleStep(this)">
                <span class="step-num">${i + 1}</span>
                <span class="step-title">${s.title}</span>
                <span class="step-badge ${s.changed ? 'changed' : 'unchanged'}">${s.changed ? 'Modified' : 'No change'}</span>
                <span class="step-chevron${expanded ? ' open' : ''}">&#9660;</span>
            </div>
            <div class="step-body${expanded ? ' open' : ''}">
                <p class="step-desc">${s.description}</p>
                ${s.details ? `<div class="step-detail-label">Details</div><div class="step-detail">${s.details.replace(/\n/g, '<br>')}</div>` : ''}
                <div class="step-detail-label">Resulting Grammar</div>
                <div class="grammar-box" id="sg-${type}-${i}"></div>
            </div>`;
        el.appendChild(card);
        renderGrammar(s.grammar, `sg-${type}-${i}`);
    });
}

function toggleStep(head) {
    const body = head.nextElementSibling;
    const chev = head.querySelector('.step-chevron');
    body.classList.toggle('open');
    chev.classList.toggle('open');
}

// ── Error ──────────────────────────────────────────────────────

function showError(m) { const e = document.getElementById('errorDisplay'); document.getElementById('errorMessage').textContent = m; e.classList.remove('hidden'); }
function hideError() { document.getElementById('errorDisplay').classList.add('hidden'); }

// ── Keyboard shortcut ──────────────────────────────────────────

document.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') convertGrammar('both'); });

// ── Dark mode toggle ──────────────────────────────────────────

(function initTheme() {
    const saved = localStorage.getItem('tafl-theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    const iconEl = document.getElementById('toggleIcon');
    function updateIcon() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (iconEl) iconEl.innerHTML = isDark ? '&#9788;' : '&#9790;';
    }
    updateIcon();
    document.getElementById('themeToggle').addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tafl-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tafl-theme', 'dark');
        }
        updateIcon();
    });
})();

// ── Toast notification ────────────────────────────────────────

function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Copy grammar to clipboard ─────────────────────────────────

let lastCnfResult = null, lastGnfResult = null;

function grammarToText(g) {
    const keys = [g.start, ...[...g.productions.keys()].filter(k => k !== g.start)];
    const lines = [];
    for (const v of keys) {
        const ps = g.productions.get(v);
        if (!ps || !ps.length) continue;
        lines.push(`${v} → ${ps.map(p => p.join('')).join(' | ')}`);
    }
    return lines.join('\n');
}

function copyGrammar(type) {
    const g = type === 'cnf' ? lastCnfResult : lastGnfResult;
    if (!g) return;
    const text = grammarToText(g);
    navigator.clipboard.writeText(text).then(() => showToast('Grammar copied to clipboard'));
}

function exportGrammar(type) {
    const g = type === 'cnf' ? lastCnfResult : lastGnfResult;
    if (!g) return;
    const label = type.toUpperCase();
    let text = `=== ${label} Grammar ===\n\n`;
    text += grammarToText(g);
    text += `\n\nVariables: {${g.variables.join(', ')}}\n`;
    text += `Terminals: {${g.terminals.join(', ')}}\n`;
    text += `Start: ${g.start}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grammar-${type}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${label} grammar exported`);
}

// ── Verify CNF / GNF ──────────────────────────────────────────

function verifyCNF(g) {
    for (const [v, ps] of g.productions) {
        for (const p of ps) {
            if (p.length === 1 && p[0] === 'ε' && v === g.start) continue;
            if (p.length === 1 && /^[a-z0-9]$/.test(p[0])) continue;
            if (p.length === 2 && /^[A-Z]$/.test(p[0]) && /^[A-Z]$/.test(p[1])) continue;
            return false;
        }
    }
    return true;
}

function verifyGNF(g) {
    for (const [v, ps] of g.productions) {
        for (const p of ps) {
            if (p.length === 1 && p[0] === 'ε' && v === g.start) continue;
            if (p.length < 1) return false;
            if (!/^[a-z0-9]$/.test(p[0])) return false;
            for (let i = 1; i < p.length; i++) {
                if (!/^[A-Z]$/.test(p[i])) return false;
            }
        }
    }
    return true;
}

function renderVerify(elId, pass) {
    const el = document.getElementById(elId);
    if (pass) {
        el.innerHTML = '<span class="verify-badge pass"><span class="verify-icon">&#10003;</span> Verified</span>';
    } else {
        el.innerHTML = '<span class="verify-badge fail"><span class="verify-icon">&#10007;</span> Check</span>';
    }
}

// ── FIRST & FOLLOW Sets ───────────────────────────────────────

function computeFirst(g) {
    const first = new Map();
    for (const v of g.variables) first.set(v, new Set());

    let changed = true;
    while (changed) {
        changed = false;
        for (const [v, ps] of g.productions) {
            for (const p of ps) {
                if (p.length === 1 && p[0] === 'ε') {
                    if (!first.get(v).has('ε')) { first.get(v).add('ε'); changed = true; }
                    continue;
                }
                for (let i = 0; i < p.length; i++) {
                    const s = p[i];
                    if (/^[a-z0-9]$/.test(s)) {
                        if (!first.get(v).has(s)) { first.get(v).add(s); changed = true; }
                        break;
                    } else if (/^[A-Z]$/.test(s) && first.has(s)) {
                        for (const t of first.get(s)) {
                            if (t !== 'ε' && !first.get(v).has(t)) { first.get(v).add(t); changed = true; }
                        }
                        if (!first.get(s).has('ε')) break;
                        if (i === p.length - 1) {
                            if (!first.get(v).has('ε')) { first.get(v).add('ε'); changed = true; }
                        }
                    } else break;
                }
            }
        }
    }
    return first;
}

function computeFollow(g, first) {
    const follow = new Map();
    for (const v of g.variables) follow.set(v, new Set());
    follow.get(g.start).add('$');

    let changed = true;
    while (changed) {
        changed = false;
        for (const [v, ps] of g.productions) {
            for (const p of ps) {
                for (let i = 0; i < p.length; i++) {
                    const B = p[i];
                    if (!/^[A-Z]$/.test(B) || !follow.has(B)) continue;
                    const beta = p.slice(i + 1);
                    const firstBeta = firstOfString(beta, first);
                    for (const t of firstBeta) {
                        if (t !== 'ε' && !follow.get(B).has(t)) { follow.get(B).add(t); changed = true; }
                    }
                    if (firstBeta.has('ε') || beta.length === 0) {
                        for (const t of follow.get(v)) {
                            if (!follow.get(B).has(t)) { follow.get(B).add(t); changed = true; }
                        }
                    }
                }
            }
        }
    }
    return follow;
}

function firstOfString(symbols, first) {
    const result = new Set();
    if (!symbols.length) { result.add('ε'); return result; }
    for (let i = 0; i < symbols.length; i++) {
        const s = symbols[i];
        if (/^[a-z0-9]$/.test(s)) { result.add(s); return result; }
        if (/^[A-Z]$/.test(s) && first.has(s)) {
            for (const t of first.get(s)) if (t !== 'ε') result.add(t);
            if (!first.get(s).has('ε')) return result;
            if (i === symbols.length - 1) result.add('ε');
        } else return result;
    }
    return result;
}

function renderFirstFollow(g) {
    const first = computeFirst(g);
    const follow = computeFollow(g, first);
    const tbody = document.getElementById('ffTableBody');
    tbody.innerHTML = '';
    const vars = [g.start, ...g.variables.filter(v => v !== g.start)];
    const seen = new Set();
    for (const v of vars) {
        if (seen.has(v) || !g.productions.has(v)) continue;
        seen.add(v);
        const tr = document.createElement('tr');
        const formatSet = (s) => {
            return [...s].sort().map(t => {
                if (t === 'ε') return '<span class="ff-terminal" style="color:#7c3aed;font-style:italic">ε</span>';
                if (t === '$') return '<span class="ff-terminal" style="color:var(--err)">$</span>';
                return `<span class="ff-terminal">${t}</span>`;
            }).join(', ');
        };
        tr.innerHTML = `<td><span class="ff-var">${v}</span></td><td class="ff-set">{ ${formatSet(first.get(v) || new Set())} }</td><td class="ff-set">{ ${formatSet(follow.get(v) || new Set())} }</td>`;
        tbody.appendChild(tr);
    }
    document.getElementById('ffSetSection').classList.remove('hidden');
}

// ── CYK Algorithm ─────────────────────────────────────────────

function runCYK() {
    if (!lastCnfResult) { showError('Convert to CNF first.'); return; }
    const input = document.getElementById('cykInput').value.trim();
    if (!input) { showError('Enter a string to test.'); return; }
    hideError();

    const g = lastCnfResult;
    const n = input.length;

    // Handle empty string
    if (n === 0) {
        const hasEps = g.productions.has(g.start) && g.productions.get(g.start).some(p => p.length === 1 && p[0] === 'ε');
        const resultEl = document.getElementById('cykResult');
        if (hasEps) {
            resultEl.className = 'cyk-result accept';
            resultEl.textContent = '✓ The empty string ε is ACCEPTED by this grammar.';
        } else {
            resultEl.className = 'cyk-result reject';
            resultEl.textContent = '✗ The empty string ε is REJECTED by this grammar.';
        }
        document.getElementById('cykTableWrap').innerHTML = '';
        return;
    }

    // CYK table: table[i][j] = set of variables generating input[i..j]
    const table = Array.from({ length: n }, () => Array.from({ length: n }, () => new Set()));

    // Fill diagonal: single characters
    for (let i = 0; i < n; i++) {
        const ch = input[i];
        for (const [v, ps] of g.productions) {
            for (const p of ps) {
                if (p.length === 1 && p[0] === ch) table[i][i].add(v);
            }
        }
    }

    // Fill upper triangle
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            for (let k = i; k < j; k++) {
                for (const [v, ps] of g.productions) {
                    for (const p of ps) {
                        if (p.length === 2 && table[i][k].has(p[0]) && table[k + 1][j].has(p[1])) {
                            table[i][j].add(v);
                        }
                    }
                }
            }
        }
    }

    const accepted = table[0][n - 1].has(g.start);
    const resultEl = document.getElementById('cykResult');
    if (accepted) {
        resultEl.className = 'cyk-result accept';
        resultEl.innerHTML = `&#10003; String "<strong>${escapeHtml(input)}</strong>" is <strong>ACCEPTED</strong> by this grammar.`;
    } else {
        resultEl.className = 'cyk-result reject';
        resultEl.innerHTML = `&#10007; String "<strong>${escapeHtml(input)}</strong>" is <strong>REJECTED</strong> by this grammar.`;
    }

    // Render CYK table
    renderCYKTable(table, input, n);
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderCYKTable(table, input, n) {
    const wrap = document.getElementById('cykTableWrap');
    if (n > 15) { wrap.innerHTML = '<p style="font-size:.82rem;color:var(--muted);margin-top:8px">Table too large to display (string length > 15).</p>'; return; }

    let html = '<table class="cyk-table"><thead><tr><th></th>';
    for (let j = 0; j < n; j++) html += `<th>${input[j]}</th>`;
    html += '</tr></thead><tbody>';

    for (let len = 1; len <= n; len++) {
        html += `<tr><th>l=${len}</th>`;
        for (let i = 0; i < n; i++) {
            const j = i + len - 1;
            if (j >= n) { html += '<td></td>'; continue; }
            const vars = [...table[i][j]].sort().join(',');
            const cls = (len === n && i === 0) ? 'cyk-start-cell' : (vars ? 'cyk-filled' : '');
            html += `<td class="${cls}">${vars || '∅'}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    wrap.innerHTML = html;

    // Show derivation if accepted
    if (table[0][n - 1].has(lastCnfResult.start)) {
        buildAndShowDerivation(lastCnfResult, table, input, n);
    } else {
        document.getElementById('derivationSection').style.display = 'none';
    }
}

// ── Grammar Statistics Dashboard ──────────────────────────────

let lastOriginalGrammar = null;

function renderStats(g) {
    let ruleCount = 0, epsCount = 0, unitCount = 0;
    for (const [, ps] of g.productions) {
        ruleCount += ps.length;
        for (const p of ps) {
            if (p.length === 1 && p[0] === 'ε') epsCount++;
            if (p.length === 1 && /^[A-Z]$/.test(p[0])) unitCount++;
        }
    }
    const nullable = findNullable(g);

    document.getElementById('statVars').textContent = g.variables.length;
    document.getElementById('statTerms').textContent = g.terminals.length;
    document.getElementById('statRules').textContent = ruleCount;
    document.getElementById('statNullable').textContent = nullable.size;
    document.getElementById('statUnit').textContent = unitCount;
    document.getElementById('statEps').textContent = epsCount;

    // Animate stats
    document.querySelectorAll('.stat-num').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.08}s`;
    });

    // Properties
    const props = document.getElementById('statProps');
    props.innerHTML = '';
    const addProp = (text, type) => {
        const s = document.createElement('span');
        s.className = `stat-prop ${type}`;
        s.textContent = text;
        props.appendChild(s);
    };
    addProp(`Start: ${g.start}`, 'info');
    if (epsCount > 0) addProp(`Has ε-productions`, 'no');
    else addProp(`No ε-productions`, 'yes');
    if (unitCount > 0) addProp(`Has unit rules`, 'no');
    else addProp(`No unit rules`, 'yes');
    if (nullable.size > 0) addProp(`Nullable: {${[...nullable].join(',')}}`, 'info');
    // Check if already CNF
    let isCnf = true;
    for (const [v, ps] of g.productions) {
        for (const p of ps) {
            if (p.length === 1 && p[0] === 'ε' && v === g.start) continue;
            if (p.length === 1 && /^[a-z0-9]$/.test(p[0])) continue;
            if (p.length === 2 && /^[A-Z]$/.test(p[0]) && /^[A-Z]$/.test(p[1])) continue;
            isCnf = false; break;
        }
        if (!isCnf) break;
    }
    addProp(isCnf ? 'Already in CNF' : 'Not in CNF', isCnf ? 'yes' : 'info');

    document.getElementById('statsSection').classList.remove('hidden');
}

// ── Step-Through Navigation ───────────────────────────────────

const stepState = { cnf: { current: 0, total: 0, playing: false, timer: null },
                    gnf: { current: 0, total: 0, playing: false, timer: null } };

function stepNav(type, action) {
    const state = stepState[type];
    const steps = document.querySelectorAll(`#${type}Steps .step`);
    if (!steps.length) return;

    // Close all
    const closeAll = () => steps.forEach(s => {
        s.querySelector('.step-body').classList.remove('open');
        s.querySelector('.step-chevron').classList.remove('open');
    });

    switch (action) {
        case 'first': state.current = 0; break;
        case 'prev': state.current = Math.max(0, state.current - 1); break;
        case 'next': state.current = Math.min(state.total - 1, state.current + 1); break;
        case 'last': state.current = state.total - 1; break;
    }

    closeAll();
    const target = steps[state.current];
    if (target) {
        target.querySelector('.step-body').classList.add('open');
        target.querySelector('.step-chevron').classList.add('open');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Flash effect
        target.style.transition = 'box-shadow .2s';
        target.style.boxShadow = '0 0 0 2px var(--focus)';
        setTimeout(() => { target.style.boxShadow = ''; }, 600);
    }

    document.getElementById(`${type}StepCurrent`).textContent = state.current + 1;
    const pct = state.total > 1 ? ((state.current) / (state.total - 1)) * 100 : 100;
    document.getElementById(`${type}ProgressFill`).style.width = pct + '%';
}

function toggleAutoPlay(type) {
    const state = stepState[type];
    const btn = document.getElementById(`${type}PlayBtn`);
    if (state.playing) {
        clearInterval(state.timer);
        state.playing = false;
        btn.classList.remove('active');
        btn.innerHTML = '&#9654;&#9654;';
    } else {
        state.playing = true;
        btn.classList.add('active');
        btn.innerHTML = '&#9632;';
        state.current = 0;
        stepNav(type, 'first');
        state.timer = setInterval(() => {
            if (state.current >= state.total - 1) {
                clearInterval(state.timer);
                state.playing = false;
                btn.classList.remove('active');
                btn.innerHTML = '&#9654;&#9654;';
                return;
            }
            stepNav(type, 'next');
        }, 1800);
    }
}

function initStepControls(type, total) {
    stepState[type].current = 0;
    stepState[type].total = total;
    document.getElementById(`${type}StepCurrent`).textContent = '1';
    document.getElementById(`${type}StepTotal`).textContent = total;
    document.getElementById(`${type}ProgressFill`).style.width = '0%';
}

// ── Grammar Diff View ─────────────────────────────────────────

function toggleDiff(type) {
    const sec = document.getElementById(`${type}DiffSection`);
    if (sec.classList.contains('hidden')) {
        sec.classList.remove('hidden');
        const result = type === 'cnf' ? lastCnfResult : lastGnfResult;
        if (lastOriginalGrammar && result) {
            renderDiffGrammar(lastOriginalGrammar, `${type}DiffOriginal`);
            renderDiffGrammar(result, `${type}DiffFinal`);
        }
    } else {
        sec.classList.add('hidden');
    }
}

function renderDiffGrammar(g, id) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    const keys = [g.start, ...[...g.productions.keys()].filter(k => k !== g.start)];
    for (const v of keys) {
        const ps = g.productions.get(v);
        if (!ps || !ps.length) continue;
        const line = document.createElement('div');
        line.className = 'production-line';
        line.appendChild(span('variable', v));
        line.appendChild(span('arrow-symbol', ' → '));
        ps.forEach((p, i) => {
            if (i) line.appendChild(span('pipe', '|'));
            p.forEach(s => {
                if (s === 'ε') line.appendChild(span('epsilon', 'ε'));
                else if (/^[A-Z]$/.test(s)) line.appendChild(span('variable', s));
                else line.appendChild(span('terminal', s));
            });
        });
        el.appendChild(line);
    }
}

// ── Confetti Effect ───────────────────────────────────────────

function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#2563eb', '#0d9488', '#f59e0b', '#dc2626', '#8b5cf6', '#16a34a', '#ec4899'];
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.top = '-10px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 1.5) + 's';
        piece.style.width = (6 + Math.random() * 6) + 'px';
        piece.style.height = (6 + Math.random() * 6) + 'px';
        if (Math.random() > 0.5) piece.style.borderRadius = '50%';
        container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 4000);
}

// ── Parse Tree & Derivation Tracer ────────────────────────────

function buildAndShowDerivation(g, cykTable, input, n) {
    const section = document.getElementById('derivationSection');
    section.style.display = 'block';

    // Build parse tree from CYK table via backtracking
    const tree = buildParseTree(g, cykTable, input, 0, n - 1, g.start);
    if (!tree) { section.style.display = 'none'; return; }

    // Extract leftmost derivation
    const derivation = [];
    extractDerivation(tree, derivation);

    // Render derivation steps
    renderDerivationSteps(derivation, 'derivationSteps');

    // Draw tree on canvas
    drawTree(tree, 'treeCanvas');
}

function buildParseTree(g, table, input, i, j, variable) {
    if (i === j) {
        // Terminal production: variable -> input[i]
        const ch = input[i];
        for (const p of (g.productions.get(variable) || [])) {
            if (p.length === 1 && p[0] === ch) {
                return { sym: variable, children: [{ sym: ch, children: [], terminal: true }], terminal: false };
            }
        }
        return null;
    }
    // Binary production: variable -> B C
    for (const p of (g.productions.get(variable) || [])) {
        if (p.length !== 2) continue;
        const [B, C] = p;
        for (let k = i; k < j; k++) {
            if (table[i][k].has(B) && table[k + 1][j].has(C)) {
                const left = buildParseTree(g, table, input, i, k, B);
                const right = buildParseTree(g, table, input, k + 1, j, C);
                if (left && right) {
                    return { sym: variable, children: [left, right], terminal: false };
                }
            }
        }
    }
    return null;
}

function extractDerivation(tree, steps) {
    if (!tree) return;
    // Leftmost derivation: expand leftmost non-terminal at each step
    const sentential = [tree];
    steps.push(tree.sym);

    function expand(nodes) {
        for (let idx = 0; idx < nodes.length; idx++) {
            const node = nodes[idx];
            if (node.terminal) continue;
            if (node.children.length > 0) {
                const newNodes = [...nodes.slice(0, idx), ...node.children, ...nodes.slice(idx + 1)];
                steps.push(newNodes.map(n => n.sym).join(''));
                expand(newNodes);
                return;
            }
        }
    }
    expand(sentential);
}

function renderDerivationSteps(steps, containerId) {
    const container = document.getElementById(containerId || 'derivationSteps');
    container.innerHTML = '';
    steps.forEach((s, i) => {
        if (i > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'deriv-arrow';
            arrow.textContent = '⇒';
            container.appendChild(arrow);
        }
        const stepEl = document.createElement('span');
        stepEl.className = 'deriv-step' + (i === steps.length - 1 ? ' active' : '');
        // Color each character
        for (const ch of s) {
            const sp = document.createElement('span');
            if (/^[A-Z]$/.test(ch)) { sp.className = 'deriv-var'; sp.textContent = ch; }
            else { sp.className = 'deriv-term'; sp.textContent = ch; }
            stepEl.appendChild(sp);
        }
        stepEl.addEventListener('click', () => {
            container.querySelectorAll('.deriv-step').forEach(e => e.classList.remove('active'));
            stepEl.classList.add('active');
        });
        container.appendChild(stepEl);
    });
}

function drawTree(tree, canvasId) {
    const canvas = document.getElementById(canvasId || 'treeCanvas');
    const ctx = canvas.getContext('2d');

    // Calculate tree dimensions
    const nodeSize = 24;
    const hGap = 36, vGap = 52;

    // Assign positions
    let xCounter = 0;
    function assignPos(node, depth) {
        if (!node.children || !node.children.length) {
            node.x = xCounter * hGap + hGap;
            node.y = depth * vGap + 40;
            node.depth = depth;
            xCounter++;
            return;
        }
        for (const c of node.children) assignPos(c, depth + 1);
        node.x = node.children.reduce((s, c) => s + c.x, 0) / node.children.length;
        node.y = depth * vGap + 40;
        node.depth = depth;
    }
    assignPos(tree, 0);

    const width = Math.max((xCounter + 1) * hGap, 300);
    const maxDepth = (function getMaxDepth(n) {
        if (!n.children.length) return n.depth;
        return Math.max(...n.children.map(getMaxDepth));
    })(tree);
    const height = (maxDepth + 1) * vGap + 40;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Draw edges
    function drawEdges(node) {
        for (const c of (node.children || [])) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y + nodeSize / 2);
            ctx.lineTo(c.x, c.y - nodeSize / 2);
            ctx.strokeStyle = isDark ? '#3d4158' : '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            drawEdges(c);
        }
    }
    drawEdges(tree);

    // Draw nodes
    function drawNodes(node) {
        ctx.beginPath();
        if (node.terminal) {
            // Terminal: rounded rectangle
            const w = 22, h = 22;
            ctx.roundRect(node.x - w / 2, node.y - h / 2, w, h, 4);
            ctx.fillStyle = isDark ? '#422006' : '#fef3c7';
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = isDark ? '#fbbf24' : '#92400e';
            ctx.font = 'bold 12px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.sym, node.x, node.y);
        } else {
            // Variable: circle
            ctx.arc(node.x, node.y, nodeSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? '#1e3a5f' : '#dbeafe';
            ctx.fill();
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = isDark ? '#60a5fa' : '#1d4ed8';
            ctx.font = 'bold 12px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.sym, node.x, node.y);
        }
        for (const c of (node.children || [])) drawNodes(c);
    }
    drawNodes(tree);
}

// ── GNF Top-Down String Membership Test ──────────────────────

function runGNFTest() {
    if (!lastGnfResult) { showError('Convert to GNF first.'); return; }
    const input = document.getElementById('gnfTestInput').value.trim();
    if (!input) { showError('Enter a string to test.'); return; }
    hideError();

    const g = lastGnfResult;
    const n = input.length;
    const resultEl = document.getElementById('gnfTestResult');

    // Handle empty string
    if (n === 0) {
        const hasEps = g.productions.has(g.start) && g.productions.get(g.start).some(p => p.length === 1 && p[0] === 'ε');
        if (hasEps) {
            resultEl.className = 'cyk-result accept';
            resultEl.textContent = '✓ The empty string ε is ACCEPTED by this grammar.';
        } else {
            resultEl.className = 'cyk-result reject';
            resultEl.textContent = '✗ The empty string ε is REJECTED by this grammar.';
        }
        document.getElementById('gnfDerivationSection').style.display = 'none';
        return;
    }

    // Top-down parse with memoization
    // GNF: every production is A → a α  where α ∈ V*
    // We try to derive the input from the start symbol
    const memo = new Map();

    // Returns a parse tree node or null
    // Tries to derive input[pos..end-1] from `variable`
    // Returns { sym, children, terminal, endPos } or null
    function parse(variable, pos) {
        const key = `${variable},${pos}`;
        if (memo.has(key)) return memo.get(key);
        memo.set(key, null); // prevent infinite loops

        const prods = g.productions.get(variable) || [];
        for (const prod of prods) {
            if (prod.length === 1 && prod[0] === 'ε') {
                // ε-production
                const node = { sym: variable, children: [{ sym: 'ε', children: [], terminal: true }], terminal: false, endPos: pos };
                memo.set(key, node);
                return node;
            }
            // GNF: first symbol is terminal
            const firstSym = prod[0];
            if (pos >= n || input[pos] !== firstSym) continue;

            // Try to match remaining variables in sequence
            const vars = prod.slice(1); // remaining are all variables
            const children = [{ sym: firstSym, children: [], terminal: true }];

            let curPos = pos + 1;
            let success = true;
            for (const v of vars) {
                const sub = parse(v, curPos);
                if (!sub) { success = false; break; }
                children.push(sub);
                curPos = sub.endPos;
            }
            if (success) {
                const node = { sym: variable, children, terminal: false, endPos: curPos };
                memo.set(key, node);
                return node;
            }
        }
        memo.set(key, null);
        return null;
    }

    const tree = parse(g.start, 0);
    const accepted = tree && tree.endPos === n;

    if (accepted) {
        resultEl.className = 'cyk-result accept';
        resultEl.innerHTML = `&#10003; String "<strong>${escapeHtml(input)}</strong>" is <strong>ACCEPTED</strong> by this grammar.`;

        // Show derivation
        const section = document.getElementById('gnfDerivationSection');
        section.style.display = 'block';

        const derivation = [];
        extractDerivation(tree, derivation);
        renderDerivationSteps(derivation, 'gnfDerivationSteps');
        drawTree(tree, 'gnfTreeCanvas');
    } else {
        resultEl.className = 'cyk-result reject';
        resultEl.innerHTML = `&#10007; String "<strong>${escapeHtml(input)}</strong>" is <strong>REJECTED</strong> by this grammar.`;
        document.getElementById('gnfDerivationSection').style.display = 'none';
    }
}

// ── Production Hover Tooltip ──────────────────────────────────

document.addEventListener('mouseover', (e) => {
    const prodLine = e.target.closest('.production-line');
    if (prodLine && prodLine.closest('.grammar-box')) {
        prodLine.classList.add('highlight');
    }
});
document.addEventListener('mouseout', (e) => {
    const prodLine = e.target.closest('.production-line');
    if (prodLine) prodLine.classList.remove('highlight');
});

// ── Updated convertGrammar to wire up new features ────────────

const origConvertGrammar = convertGrammar;
convertGrammar = function(mode) {
    // Save original grammar for diff
    try {
        const textMode = !document.getElementById('textMode').classList.contains('hidden');
        if (textMode) {
            const v = document.getElementById('grammarInput').value;
            if (v.trim()) lastOriginalGrammar = parseGrammar(v);
        } else lastOriginalGrammar = parseVisualGrammar();
    } catch (e) { /* will be caught by main fn */ }

    origConvertGrammar(mode);

    // Render stats
    if (lastOriginalGrammar) {
        try { renderStats(lastOriginalGrammar); } catch (e) { /* non-critical */ }
    }

    // Init step controls
    const cnfSteps = document.querySelectorAll('#cnfSteps .step');
    const gnfSteps = document.querySelectorAll('#gnfSteps .step');
    if (cnfSteps.length) initStepControls('cnf', cnfSteps.length);
    if (gnfSteps.length) initStepControls('gnf', gnfSteps.length);

    // Hide diff sections on new conversion
    document.getElementById('cnfDiffSection').classList.add('hidden');
    document.getElementById('gnfDiffSection').classList.add('hidden');


};

// ── Keyboard navigation for steps ─────────────────────────────

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    const activeType = !document.getElementById('cnfResults').classList.contains('hidden') ? 'cnf' :
                       !document.getElementById('gnfResults').classList.contains('hidden') ? 'gnf' : null;
    if (!activeType) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stepNav(activeType, 'prev'); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stepNav(activeType, 'next'); }
    if (e.key === 'Home') { e.preventDefault(); stepNav(activeType, 'first'); }
    if (e.key === 'End') { e.preventDefault(); stepNav(activeType, 'last'); }
    if (e.key === ' ' && !e.ctrlKey) { e.preventDefault(); toggleAutoPlay(activeType); }
});

// ═══════════════════════════════════════════════════════════════
//  LANDING PAGE INTERACTIONS
// ═══════════════════════════════════════════════════════════════

// ── Particle canvas background ────────────────────────────────

(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    let w, h;

    function resize() {
        const hero = canvas.parentElement;
        w = canvas.width = hero.offsetWidth;
        h = canvas.height = hero.offsetHeight;
    }

    function createParticles() {
        const count = Math.min(Math.floor((w * h) / 18000), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 2 + 0.5,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.4 + 0.1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? '96, 165, 250' : '37, 99, 235';

        for (const p of particles) {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
            ctx.fill();
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });
})();

// ── Scroll reveal animation ──────────────────────────────────

(function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
})();

// ── Navbar scroll effect ─────────────────────────────────────

(function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 20);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

// ── Hero stat counter animation ──────────────────────────────

(function initCounters() {
    const counters = document.querySelectorAll('.hero-stat-num[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 20));
                const interval = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    el.textContent = current;
                }, 50);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
})();

// ── Image OCR Scanning ────────────────────────────────────────

(function initImageScan() {
    const dropZone = document.getElementById('imageDropZone');
    const fileInput = document.getElementById('imageFileInput');
    const previewWrap = document.getElementById('imagePreviewWrap');
    const previewImg = document.getElementById('imagePreview');
    const scanBtn = document.getElementById('scanBtn');
    const removeBtn = document.getElementById('imageRemoveBtn');
    if (!dropZone || !fileInput) return;

    let selectedFile = null;

    // Click to upload
    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('.link-btn')) return;
        fileInput.click();
    });

    // Drag & drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleImageFile(fileInput.files[0]);
    });

    removeBtn.addEventListener('click', () => {
        selectedFile = null;
        previewWrap.classList.add('hidden');
        dropZone.classList.remove('hidden');
        scanBtn.disabled = true;
        document.getElementById('scanResult').classList.add('hidden');
        document.getElementById('scanProgress').classList.add('hidden');
        fileInput.value = '';
    });

    function handleImageFile(file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewWrap.classList.remove('hidden');
            dropZone.classList.add('hidden');
            scanBtn.disabled = false;
            document.getElementById('scanResult').classList.add('hidden');
            document.getElementById('scanProgress').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    // Expose for global access
    window._getSelectedImageFile = () => selectedFile;
    window._getPreviewImgSrc = () => previewImg.src;
})();

async function scanImage() {
    const imgSrc = window._getPreviewImgSrc && window._getPreviewImgSrc();
    if (!imgSrc) { showError('Upload an image first.'); return; }

    const progressEl = document.getElementById('scanProgress');
    const fillEl = document.getElementById('scanProgressFill');
    const statusEl = document.getElementById('scanStatus');
    const resultEl = document.getElementById('scanResult');
    const resultText = document.getElementById('scanResultText');
    const scanBtn = document.getElementById('scanBtn');

    progressEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    scanBtn.disabled = true;
    fillEl.style.width = '0%';
    statusEl.textContent = 'Preprocessing image...';

    try {
        // Preprocess image for better OCR: increase contrast, scale up, convert to grayscale
        const processedImg = await preprocessImage(imgSrc);

        statusEl.textContent = 'Initializing OCR engine...';
        fillEl.style.width = '5%';

        const worker = await Tesseract.createWorker('eng', 1, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    const pct = Math.round(5 + m.progress * 90);
                    fillEl.style.width = pct + '%';
                    statusEl.textContent = `Recognizing text... ${pct}%`;
                } else if (m.status) {
                    statusEl.textContent = m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...';
                }
            }
        });

        // Set optimal parameters for text recognition
        await worker.setParameters({
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
            preserve_interword_spaces: '1',
        });

        const { data } = await worker.recognize(processedImg);
        await worker.terminate();

        fillEl.style.width = '100%';
        statusEl.textContent = 'Done!';

        // Show ALL raw text first, then also show cleaned version
        const raw = data.text.trim();
        const cleaned = cleanOCRText(raw);

        resultText.value = cleaned || raw;
        resultEl.classList.remove('hidden');
        scanBtn.disabled = false;

        // Store raw text so user can toggle
        resultEl.dataset.rawText = raw;
        resultEl.dataset.cleanedText = cleaned || raw;
        resultEl.dataset.showRaw = 'false';

        setTimeout(() => progressEl.classList.add('hidden'), 1200);
    } catch (err) {
        statusEl.textContent = 'OCR failed: ' + err.message;
        fillEl.style.width = '0%';
        scanBtn.disabled = false;
    }
}

// Preprocess image: scale up, grayscale, sharpen, high contrast
function preprocessImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Scale up small images for better OCR (Tesseract works best at 300+ DPI)
            const scale = Math.max(1, Math.min(3, 2000 / Math.max(img.width, img.height)));
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Draw scaled image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convert to grayscale and increase contrast
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
                // Grayscale
                const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                // Increase contrast
                const contrast = 1.6;
                const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
                // Threshold for very clear black/white
                const val = adjusted < 140 ? 0 : 255;
                d[i] = d[i + 1] = d[i + 2] = val;
            }
            ctx.putImageData(imageData, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(src); // fallback to original
        img.src = src;
    });
}

function cleanOCRText(raw) {
    let lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const cleaned = [];
    for (let line of lines) {
        // Normalize various arrow representations OCR might produce
        line = line.replace(/\u2192/g, '->');       // →
        line = line.replace(/\u2014/g, '->');       // —
        line = line.replace(/\u2013/g, '->');       // –
        line = line.replace(/[—–\-]{1,3}\s*>/g, '->');  // —>, –>, -->, --->
        line = line.replace(/=\s*>/g, '->');        // =>
        line = line.replace(/~\s*>/g, '->');        // ~>
        line = line.replace(/\|?\s*-+\s*>\s*/g, (match) => {
            return match.includes('|') ? ' | ' : ' -> ';  // don't eat pipes
        });

        // If a line has a single uppercase letter followed by anything, try to detect it as a production
        // Even without arrow: "S aAB | a" → "S -> aAB | a"
        if (!line.includes('->') && /^[A-Z]\s+[a-zA-Z\u03b5|]/.test(line)) {
            line = line.replace(/^([A-Z])\s+/, '$1 -> ');
        }

        // Fix epsilon variants
        line = line.replace(/\beps\b/gi, 'ε');
        line = line.replace(/\bepsilon\b/gi, 'ε');
        line = line.replace(/\u03B5/g, 'ε');
        line = line.replace(/\u2208/g, 'ε'); // ∈ sometimes misread

        // Normalize pipes
        line = line.replace(/\s*\|\s*/g, ' | ');

        // Clean up extra whitespace around arrow
        line = line.replace(/\s*->\s*/g, ' -> ');

        // Remove leading/trailing junk but keep the line
        line = line.replace(/^[^A-Za-z0-9\u03b5]+/, '').replace(/[^A-Za-z0-9\u03b5|]+$/, '');

        if (line.length > 0) {
            cleaned.push(line);
        }
    }
    return cleaned.join('\n');
}

function useScanResult() {
    const text = document.getElementById('scanResultText').value;
    if (!text) return;
    document.getElementById('grammarInput').value = text;
    // Switch to text mode
    show('textMode'); hide('visualMode'); hide('imageMode');
    activate('textModeBtn'); deactivate('visualModeBtn'); deactivate('imageModeBtn');
    // Trigger gutter update
    document.getElementById('grammarInput').dispatchEvent(new Event('input'));
    showToast('Grammar loaded from image');
}

function toggleRawClean() {
    const resultEl = document.getElementById('scanResult');
    const textEl = document.getElementById('scanResultText');
    const btn = document.getElementById('rawCleanToggle');
    const showRaw = resultEl.dataset.showRaw !== 'true';
    resultEl.dataset.showRaw = showRaw;
    textEl.value = showRaw ? resultEl.dataset.rawText : resultEl.dataset.cleanedText;
    btn.textContent = showRaw ? 'Show Cleaned' : 'Show Raw';
}

// ── Hamburger menu toggle ─────────────────────────────────────

(function initHamburger() {
    const btn = document.getElementById('navHamburger');
    const links = document.querySelector('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => links.classList.toggle('open'));
    // Close on link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => links.classList.remove('open'));
    });
})();



// ── Editor gutter line numbers ────────────────────────────────

(function initGutter() {
    const textarea = document.getElementById('grammarInput');
    const gutter = document.getElementById('editorGutter');
    if (!textarea || !gutter) return;
    function updateGutter() {
        const lines = textarea.value.split('\n').length;
        const count = Math.max(lines, 3);
        let html = '';
        for (let i = 1; i <= count; i++) html += '<span>' + i + '</span>';
        gutter.innerHTML = html;
    }
    textarea.addEventListener('input', updateGutter);
    textarea.addEventListener('keyup', updateGutter);
    textarea.addEventListener('paste', () => setTimeout(updateGutter, 0));
    updateGutter();
})();

// ── Back to top button ────────────────────────────────────────

(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ── Smooth scroll for nav links ───────────────────────────────

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
