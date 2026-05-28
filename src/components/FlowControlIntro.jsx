import React, { useState, useEffect, useRef } from 'react';
import { Droplet, AlertTriangle } from 'lucide-react';

export default function FlowControlIntro({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [flowRate, setFlowRate] = useState(50); // 0 to 100
  const [bufferLevel, setBufferLevel] = useState(0);
  const drainRate = 30; // constant drain

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [id, setActiveSection]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBufferLevel(prev => {
        const newLevel = prev + (flowRate / 10) - (drainRate / 10);
        if (newLevel > 100) return 100;
        if (newLevel < 0) return 0;
        return newLevel;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [flowRate]);

  const isOverflow = bufferLevel >= 99;

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Flow Control</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Assuring that a transmitting entity does not overwhelm a receiving entity with data. If no flow control exists, the receiver's buffer may fill up and overflow.
      </p>

      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>The Fire Hose Analogy</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          
          {/* Sender / Hose */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '60px', background: '#334155', borderRadius: '8px 0 0 8px', border: '2px solid #475569', borderRight: 'none', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '-10px', top: '15px', width: '20px', height: '30px', background: '#475569', borderRadius: '4px' }}></div>
            </div>
            <span style={{ marginTop: '1rem', fontWeight: 'bold' }}>Sender</span>
            
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={flowRate} 
              onChange={(e) => setFlowRate(Number(e.target.value))}
              style={{ marginTop: '1rem', width: '150px' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Adjust Flow Rate: {flowRate}%</span>
          </div>

          {/* Flow Animation */}
          <div style={{ flex: 1, height: '40px', position: 'relative', overflow: 'hidden', margin: '0 1rem' }}>
            <div style={{ 
              width: '100%', height: `${Math.max(10, flowRate)}%`, background: 'var(--color-cyan)', 
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              opacity: flowRate > 0 ? 0.8 : 0, transition: 'height 0.3s'
            }}>
              <div style={{ position: 'absolute', width: '200%', height: '100%', background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)', animation: 'slideRight 0.5s linear infinite' }}></div>
            </div>
          </div>

          {/* Receiver / Glass */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ 
              width: '120px', height: '150px', 
              border: `4px solid ${isOverflow ? 'var(--color-red)' : '#cbd5e1'}`, borderTop: 'none', 
              borderRadius: '0 0 16px 16px', position: 'relative', overflow: 'visible',
              transition: 'border-color 0.3s'
            }}>
              {/* Water Level */}
              <div style={{ 
                position: 'absolute', bottom: 0, left: 0, width: '100%', 
                height: `${bufferLevel}%`, background: isOverflow ? 'var(--color-red)' : 'var(--color-cyan)',
                borderRadius: '0 0 12px 12px', transition: 'height 0.1s, background 0.3s'
              }}></div>
              
              {/* Spill effect */}
              {isOverflow && (
                <>
                  <div style={{ position: 'absolute', top: 0, left: '-20px', width: '20px', height: '100%', background: 'var(--color-red)', borderRadius: '10px', animation: 'spill 1s linear infinite' }}></div>
                  <div style={{ position: 'absolute', top: 0, right: '-20px', width: '20px', height: '100%', background: 'var(--color-red)', borderRadius: '10px', animation: 'spill 1s linear infinite 0.2s' }}></div>
                </>
              )}
            </div>
            <span style={{ marginTop: '1rem', fontWeight: 'bold' }}>Receiver Buffer</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Processing Rate: {drainRate}%</span>
          </div>

        </div>

        <div style={{ height: '60px' }}>
          {isOverflow ? (
            <div style={{ color: 'var(--color-red)', fontWeight: 'bold', fontSize: '1.2rem', animation: 'shake 0.5s' }}>
              <AlertTriangle size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              OVERWHELMED — DATA LOST
            </div>
          ) : flowRate <= drainRate ? (
            <div style={{ color: 'var(--color-green)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              FLOW CONTROL ACTIVE — BUFFER SAFE
            </div>
          ) : (
            <div style={{ color: 'var(--color-orange)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              Buffer filling up...
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slideRight { 0% { transform: translateX(0); } 100% { transform: translateX(-40px); } }
        @keyframes spill { 0% { height: 0; opacity: 1; top: 0; } 100% { height: 150px; opacity: 0; top: 50px; } }
      `}</style>
    </section>
  );
}
