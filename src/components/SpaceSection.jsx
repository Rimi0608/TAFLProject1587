import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AntiGravitySimulation, drawShape, responsiveConfig } from '../utils/physics';

/* ─── Inline SVG astronaut (simplified silhouette) ─── */
function Astronaut({ mouseX, mouseY }) {
  const tiltX = ((mouseX || 0) - 0.5) * 12;
  const tiltY = ((mouseY || 0) - 0.5) * 8;

  return (
    <motion.div
      className="astronaut-wrapper"
      animate={{ rotate: [0, 3, -2, 1, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        transform: `perspective(800px) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`,
      }}
    >
      <svg viewBox="0 0 200 260" className="astronaut-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Helmet */}
        <ellipse cx="100" cy="70" rx="50" ry="55" fill="#e0e0e0" stroke="#ccc" strokeWidth="2"/>
        <ellipse cx="100" cy="65" rx="35" ry="38" fill="#1a1a2e" stroke="#4A80F0" strokeWidth="1.5"/>
        {/* Visor reflection */}
        <ellipse cx="88" cy="55" rx="12" ry="16" fill="rgba(74,128,240,0.15)"/>
        {/* Body / suit */}
        <rect x="60" y="115" width="80" height="80" rx="20" fill="#d4d4d4" stroke="#bbb" strokeWidth="1.5"/>
        {/* Backpack */}
        <rect x="45" y="120" width="18" height="55" rx="6" fill="#aaa"/>
        <rect x="137" y="120" width="18" height="55" rx="6" fill="#aaa"/>
        {/* Life support */}
        <rect x="75" y="130" width="50" height="20" rx="6" fill="#4A80F0" opacity="0.3"/>
        <circle cx="100" cy="140" r="5" fill="#4A80F0" opacity="0.6"/>
        {/* Arms */}
        <rect x="30" y="130" width="35" height="14" rx="7" fill="#d4d4d4" stroke="#bbb" strokeWidth="1" transform="rotate(-15 47 137)"/>
        <rect x="135" y="130" width="35" height="14" rx="7" fill="#d4d4d4" stroke="#bbb" strokeWidth="1" transform="rotate(15 153 137)"/>
        {/* Legs */}
        <rect x="68" y="190" width="22" height="50" rx="10" fill="#d4d4d4" stroke="#bbb" strokeWidth="1" transform="rotate(-5 79 215)"/>
        <rect x="110" y="190" width="22" height="50" rx="10" fill="#d4d4d4" stroke="#bbb" strokeWidth="1" transform="rotate(5 121 215)"/>
        {/* Boots */}
        <ellipse cx="76" cy="240" rx="16" ry="10" fill="#888"/>
        <ellipse cx="124" cy="240" rx="16" ry="10" fill="#888"/>
      </svg>
    </motion.div>
  );
}

export default function SpaceSection({ onScrollDown }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const animRef = useRef(null);
  const mouseNorm = useRef({ x: 0.5, y: 0.5 });
  const mouseAbs = useRef({ x: 0, y: 0 });

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const config = responsiveConfig(rect.width);
    const shapeCount = Math.max(3, Math.floor(config.shapeCount * 0.6));
    simRef.current = new AntiGravitySimulation(rect.width, rect.height, shapeCount);
    // Make shapes smaller and more subtle for space section
    for (const s of simRef.current.shapes) {
      s.size *= 0.6;
      s.opacity *= 0.5;
    }

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const targetInterval = 1000 / config.fps;
    let lastTime = 0;

    const loop = (timestamp) => {
      const delta = timestamp - lastTime;
      if (delta >= targetInterval) {
        lastTime = timestamp - (delta % targetInterval);
        ctx.clearRect(0, 0, rect.width, rect.height);
        simRef.current.setMouse(mouseAbs.current.x, mouseAbs.current.y);
        simRef.current.tick();
        for (const shape of simRef.current.shapes) {
          drawShape(ctx, shape);
        }
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    init();
    const handleResize = () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      init();
    };
    const handleMouse = (e) => {
      mouseNorm.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        mouseAbs.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [init]);

  return (
    <section className="space-section" id="space">
      <canvas ref={canvasRef} className="space-canvas" />

      <div className="space-content">
        <Astronaut mouseX={mouseNorm.current.x} mouseY={mouseNorm.current.y} />

        <div className="space-text">
          <motion.h2
            className="space-heading"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            DEMYSTIFY COMPLEX GRAMMARS WITH VISUAL PARSING
          </motion.h2>
          <motion.p
            className="space-subtext"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Experience theory in motion. Watch real-time algorithms parse strings in a unified, interactive space.
          </motion.p>
        </div>

        <motion.button
          className="scroll-cta"
          onClick={onScrollDown}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <span className="scroll-cta__line" />
          <span className="scroll-cta__text">CONTINUE TO SCROLL</span>
          <ChevronDown size={16} className="scroll-cta__arrow" />
        </motion.button>
      </div>

      {/* Floating icon accents */}
      <div className="space-icons">
        <motion.span
          className="space-float-icon"
          animate={{ y: [-10, 10, -10], rotate: [0, 15, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', color: '#4A80F0', textShadow: '0 0 10px rgba(74, 128, 240, 0.5)' }}
        >
          ∑
        </motion.span>
        <motion.span
          className="space-float-icon space-float-icon--2"
          animate={{ y: [10, -10, 10], rotate: [0, -10, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', color: '#B8F2E6', textShadow: '0 0 10px rgba(184, 242, 230, 0.5)' }}
        >
          ε
        </motion.span>
        <motion.span
          className="space-float-icon space-float-icon--3"
          animate={{ y: [-8, 12, -8], rotate: [-5, 10, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', color: '#E84393', textShadow: '0 0 10px rgba(232, 67, 147, 0.5)' }}
        >
          δ
        </motion.span>
        <motion.span
          className="space-float-icon space-float-icon--4"
          animate={{ y: [5, -15, 5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', color: '#F5F5F5', textShadow: '0 0 10px rgba(245, 245, 245, 0.5)' }}
        >
          Γ
        </motion.span>
      </div>
    </section>
  );
}
