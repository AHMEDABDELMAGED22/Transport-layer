import React, { useEffect, useRef } from 'react';

export default function HeroSection({ id, setActiveSection }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [id, setActiveSection]);

  return (
    <section id={id} ref={sectionRef} className="section-container flex-center" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Particles Placeholder */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, var(--bg-color-tertiary) 0%, var(--bg-color) 100%)', zIndex: -1 }}>
        <svg width="100%" height="100%" style={{ opacity: 0.1 }}>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-cyan)" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{ textAlign: 'center', zIndex: 1, maxWidth: '800px' }} className="glass-panel">
        <h1 className="glow-text" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Transport Layer: The Internet's Delivery Service</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          A complete interactive breakdown of Lecture 6
        </p>
        <button 
          className="btn-primary" 
          onClick={() => {
            const nextSec = document.getElementById('transport-layer');
            if(nextSec) nextSec.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Start Learning
        </button>
      </div>
    </section>
  );
}
