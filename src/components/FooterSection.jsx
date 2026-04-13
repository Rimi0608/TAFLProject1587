import React from 'react';

export default function FooterSection() {
  return (
    <footer className="lusion-footer">
      <div className="lusion-footer__inner">
        <div className="lusion-footer__brand">
          <span className="lusion-footer__logo">TAFL</span>
          <span className="lusion-footer__tagline">CFG → CNF & GNF Conversion Portal</span>
        </div>
        <div className="lusion-footer__meta">
          <p>Developed by <strong>Rishab Kumar</strong></p>
          <p>2024UCS1587 • Theory of Automata & Formal Languages</p>
        </div>
        <div className="lusion-footer__copy">
          <p>© {new Date().getFullYear()} TAFL Project. Educational use only.</p>
        </div>
      </div>
    </footer>
  );
}
