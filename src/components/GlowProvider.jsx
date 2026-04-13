import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const GlowContext = createContext();

export const useGlow = () => useContext(GlowContext);

export default function GlowProvider({ children }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkMobile();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <GlowContext.Provider value={{ mousePos, isMobile }}>
      <div 
        ref={containerRef}
        style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}
      >
        {/* The global spotlight effect */}
        {!isMobile && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              zIndex: 999,
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--glow-color, rgba(255,255,255,0.06)), transparent 80%)`,
              transition: 'background 0.3s ease',
            }}
          />
        )}
        {children}
      </div>
    </GlowContext.Provider>
  );
}
