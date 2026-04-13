/**
 * physics.js — Lightweight 2D physics for Lusion-style canvas animations.
 * Provides AntiGravitySimulation (drifting shapes) and ParticleSystem (connecting light trails).
 */

/* ─── helpers ─── */
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (min, max) => Math.random() * (max - min) + min;
const TAU = Math.PI * 2;

/* ─── Responsive config ─── */
export function responsiveConfig(width) {
  if (width <= 480)  return { shapeCount: 3,  fps: 30, particleCount: 15, connectDist: 120 };
  if (width <= 768)  return { shapeCount: 5,  fps: 40, particleCount: 25, connectDist: 150 };
  if (width <= 1024) return { shapeCount: 7,  fps: 50, particleCount: 35, connectDist: 180 };
  return                      { shapeCount: 10, fps: 60, particleCount: 50, connectDist: 220 };
}

/* ═══════════════════════════════════════════
   AntiGravitySimulation
   ═══════════════════════════════════════════ */
export class AntiGravitySimulation {
  constructor(width, height, count) {
    this.w = width;
    this.h = height;
    this.shapes = [];
    this.mouse = { x: width / 2, y: height / 2 };
    this._initShapes(count);
  }

  /* shape types: 'jack', 'sphere', 'cube', 'triangle', 'ring' */
  _initShapes(count) {
    const types = ['jack', 'sphere', 'cube', 'triangle', 'ring'];
    const colors = [
      '#4A80F0',   // blue
      '#6C9BF7',   // light blue
      '#B8C5E8',   // pale blue-grey
      '#ffffff',   // white
      '#8B9DC3',   // grey-blue
      '#E84393',   // pink accent
      '#DFE6F0',   // light grey
    ];

    for (let i = 0; i < count; i++) {
      this.shapes.push({
        x: rand(60, this.w - 60),
        y: rand(60, this.h - 60),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        rotation: rand(0, TAU),
        angularVel: rand(-0.008, 0.008),
        size: rand(18, 44),
        type: types[i % types.length],
        color: colors[i % colors.length],
        opacity: rand(0.35, 0.85),
        depth: rand(0.4, 1),          // parallax depth factor
      });
    }
  }

  resize(w, h) { this.w = w; this.h = h; }

  setMouse(x, y) { this.mouse.x = x; this.mouse.y = y; }

  tick() {
    const damping = 0.995;
    const mouseRadius = 200;
    const mouseForce = 0.015;

    for (const s of this.shapes) {
      /* mouse attraction/repulsion */
      const d = dist(s, this.mouse);
      if (d < mouseRadius && d > 1) {
        const angle = Math.atan2(s.y - this.mouse.y, s.x - this.mouse.x);
        const strength = ((mouseRadius - d) / mouseRadius) * mouseForce * s.depth;
        // gentle repulsion + slight perpendicular drift
        s.vx += Math.cos(angle) * strength;
        s.vy += Math.sin(angle) * strength;
        s.angularVel += strength * 0.3;
      }

      /* drift & damping */
      s.vx *= damping;
      s.vy *= damping;
      s.angularVel *= 0.998;

      /* small random wander */
      s.vx += rand(-0.02, 0.02);
      s.vy += rand(-0.02, 0.02);

      /* clamp velocity */
      const maxV = 1.2;
      s.vx = Math.max(-maxV, Math.min(maxV, s.vx));
      s.vy = Math.max(-maxV, Math.min(maxV, s.vy));

      /* integrate */
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.angularVel;

      /* boundary bounce */
      const pad = s.size + 10;
      if (s.x < pad)          { s.x = pad;          s.vx *= -0.5; }
      if (s.x > this.w - pad) { s.x = this.w - pad; s.vx *= -0.5; }
      if (s.y < pad)          { s.y = pad;          s.vy *= -0.5; }
      if (s.y > this.h - pad) { s.y = this.h - pad; s.vy *= -0.5; }
    }
  }
}

/* ═══════════════════════════════════════════
   ParticleSystem — mouse-tracking light particles with connections
   ═══════════════════════════════════════════ */
export class ParticleSystem {
  constructor(maxCount, connectDist) {
    this.particles = [];
    this.max = maxCount;
    this.connectDist = connectDist;
    this.mouse = { x: 0, y: 0 };
  }

  setMouse(x, y) { this.mouse.x = x; this.mouse.y = y; }

  emit(count = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.max) break;
      this.particles.push({
        x: this.mouse.x + rand(-30, 30),
        y: this.mouse.y + rand(-30, 30),
        vx: rand(-0.5, 0.5),
        vy: rand(-0.5, 0.5),
        life: 1,
        decay: rand(0.003, 0.01),
        size: rand(1.5, 3),
      });
    }
  }

  tick() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  /** Draw particles and connecting lines to nearby shapes */
  draw(ctx, shapes) {
    /* draw connecting lines from particles to nearby shapes */
    ctx.lineWidth = 0.5;
    for (const p of this.particles) {
      for (const s of shapes) {
        const d = dist(p, s);
        if (d < this.connectDist) {
          const alpha = (1 - d / this.connectDist) * p.life * 0.25;
          ctx.strokeStyle = `rgba(74, 128, 240, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
      }
    }

    /* draw particles as glowing dots */
    for (const p of this.particles) {
      const alpha = p.life * 0.7;
      ctx.fillStyle = `rgba(184, 242, 230, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.fill();
    }
  }
}

/* ═══════════════════════════════════════════
   Shape Renderers — draw each shape type on canvas
   ═══════════════════════════════════════════ */
export function drawShape(ctx, shape) {
  const { x, y, rotation, size, type, color, opacity } = shape;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;

  switch (type) {
    case 'jack':
      drawJack(ctx, size, color);
      break;
    case 'sphere':
      drawSphere(ctx, size, color);
      break;
    case 'cube':
      drawCube(ctx, size, color);
      break;
    case 'triangle':
      drawTriangle(ctx, size, color);
      break;
    case 'ring':
      drawRing(ctx, size, color);
      break;
    default:
      drawSphere(ctx, size, color);
  }

  ctx.restore();
}

function drawJack(ctx, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  // 3 crossing bars
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();
    // small spheres at ends
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(-size, 0, 4, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(size, 0, 4, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

function drawSphere(ctx, size, color) {
  const grad = ctx.createRadialGradient(-size * 0.3, -size * 0.3, size * 0.1, 0, 0, size);
  grad.addColorStop(0, lighten(color, 40));
  grad.addColorStop(0.7, color);
  grad.addColorStop(1, darken(color, 30));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, TAU);
  ctx.fill();
}

function drawCube(ctx, size, color) {
  const s = size * 0.8;
  // top face
  ctx.fillStyle = lighten(color, 15);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.8, -s * 0.4);
  ctx.lineTo(0, s * 0.2);
  ctx.lineTo(-s * 0.8, -s * 0.4);
  ctx.closePath();
  ctx.fill();
  // left face
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * 0.8, -s * 0.4);
  ctx.lineTo(0, s * 0.2);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.8, s * 0.4);
  ctx.closePath();
  ctx.fill();
  // right face
  ctx.fillStyle = darken(color, 20);
  ctx.beginPath();
  ctx.moveTo(s * 0.8, -s * 0.4);
  ctx.lineTo(0, s * 0.2);
  ctx.lineTo(0, s);
  ctx.lineTo(s * 0.8, s * 0.4);
  ctx.closePath();
  ctx.fill();
}

function drawTriangle(ctx, size, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = lighten(color, 20);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.866, size * 0.5);
  ctx.lineTo(-size * 0.866, size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawRing(ctx, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, 0, TAU);
  ctx.stroke();
  // inner dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, TAU);
  ctx.fill();
}

/* ─── color helpers ─── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
}

function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r - amt, g - amt, b - amt);
}
