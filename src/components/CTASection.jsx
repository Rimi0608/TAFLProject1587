import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection({ onOpenConverter }) {
  return (
    <section className="cta-section" id="cta">
      <div className="cta-inner">
        <motion.span
          className="cta-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          THEORY INTO PRACTICE
        </motion.span>

        <motion.h2
          className="cta-heading"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Where Formal Languages<br />
          Become <em>Interactive</em> Visualizations
        </motion.h2>

        <motion.p
          className="cta-desc"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Skip the tedious manual transformations. Enter your CFG and let mathematical precision handle the rest, with step-by-step transparency and one-click LaTeX export.
        </motion.p>

        <motion.button
          className="cta-button"
          onClick={onOpenConverter}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Sparkles size={18} />
          Open Converter
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </section>
  );
}
