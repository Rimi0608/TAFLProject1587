import React from 'react';
import { motion } from 'framer-motion';

const PROJECTS = [
  {
    id: 'cnf',
    title: 'CNF Converter',
    tags: 'CONCEPT • AUTOMATA • DEVELOPMENT',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    icon: 'CNF',
  },
  {
    id: 'gnf',
    title: 'GNF Converter',
    tags: 'THEORY • DESIGN • DEVELOPMENT • ANIMATION',
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2a3f54 100%)',
    icon: 'GNF',
  },
  {
    id: 'cyk',
    title: 'CYK Engine',
    tags: 'PARSING • DESIGN • DEVELOPMENT • 3D',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a2e 100%)',
    icon: 'CYK',
  },
  {
    id: 'latex',
    title: 'LaTeX Export',
    tags: 'CONCEPT • ACADEMIC • EXPORT',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d1f3d 100%)',
    icon: 'LaTeX',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function FeaturedWorkSection({ onOpenConverter }) {
  return (
    <section className="featured-section" id="featured-work">
      <div className="featured-header">
        <span className="section-label">FEATURED WORK</span>
      </div>
      <div className="featured-grid">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.id}
            className="featured-card"
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onOpenConverter}
          >
            <div className="featured-card__thumb" style={{ background: project.gradient }}>
              <span className="featured-card__icon">{project.icon}</span>
            </div>
            <div className="featured-card__info">
              <h3 className="featured-card__title">{project.title}</h3>
              <p className="featured-card__tags">{project.tags}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
