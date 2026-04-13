import React, { useRef, useEffect, useCallback } from 'react';
import { AntiGravitySimulation, ParticleSystem, drawShape, responsiveConfig } from '../utils/physics';

export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const particlesRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameCountRef = useRef(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const config = responsiveConfig(rect.width);
    simRef.current = new AntiGravitySimulation(rect.width, rect.height, config.shapeCount);
    particlesRef.current = new ParticleSystem(config.particleCount, config.connectDist);

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const targetInterval = 1000 / config.fps;
    let lastTime = 0;

    const loop = (timestamp) => {
      const delta = timestamp - lastTime;
      if (delta >= targetInterval) {
        lastTime = timestamp - (delta % targetInterval);
        
        ctx.clearRect(0, 0, rect.width, rect.height);

        simRef.current.setMouse(mouseRef.current.x, mouseRef.current.y);
        simRef.current.tick();

        particlesRef.current.setMouse(mouseRef.current.x, mouseRef.current.y);
        frameCountRef.current++;
        if (frameCountRef.current % 3 === 0) {
          particlesRef.current.emit(1);
        }
        particlesRef.current.tick();
        particlesRef.current.draw(ctx, simRef.current.shapes);

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

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleTouch = (e) => {
      const canvas = canvasRef.current;
      if (!canvas || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, [init]);

  return (
    <section className="hero-section-lusion" id="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-content-overlay">
        <h1 className="hero-title-lusion">
          <span className="hero-title-line">Where Creative Ideas</span>
          <span className="hero-title-line hero-title-italic">Become Immersive Experiences</span>
        </h1>
        <p className="hero-tagline">
          We create <strong>3D visual storytelling</strong> and interactive web experiences<br />
          that help brands stand out
        </p>
      </div>
      <div className="hero-bottom-fade" />
    </section>
  );
}
