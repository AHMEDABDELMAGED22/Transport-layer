import React, { useState, useEffect, useRef } from 'react';
import { Zap, AlertOctagon, CheckSquare, Trash2, ArrowRight } from 'lucide-react';

export default function ErrorControlIntro({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [demoState, setDemoState] = useState(0); // 0: idle, 1: lost, 2: damaged
  const [framePos, setFramePos] = useState(0);
  
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

  const simulateLost = () => {
    setDemoState(1);
    setFramePos(0);
    let pos = 0;
    const interval = setInterval(() => {
      pos += 10;
      setFramePos(pos);
      if (pos >= 40) { // Disappears in middle
        clearInterval(interval);
      }
    }, 50);
    setTimeout(() => { setDemoState(0); setFramePos(0); }, 3000);
  };

  const simulateDamaged = () => {
    setDemoState(2);
    setFramePos(0);
    let pos = 0;
    const interval = setInterval(() => {
      pos += 5;
      setFramePos(pos);
      if (pos >= 100) clearInterval(interval);
    }, 50);
    setTimeout(() => { setDemoState(0); setFramePos(0); }, 3000);
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Error Control & ARQ Overview</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Even with flow control, things go wrong. Error control turns an unreliable link into a reliable one.
      </p>

      <div className="grid-2">
        {/* Error Types Demo */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>The Two Types of Errors</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className="btn-secondary" onClick={simulateLost} disabled={demoState !== 0} style={{ borderColor: 'var(--color-orange)', color: 'var(--color-orange)' }}>Simulate Lost Frame</button>
            <button className="btn-secondary" onClick={simulateDamaged} disabled={demoState !== 0} style={{ borderColor: 'var(--color-red)', color: 'var(--color-red)' }}>Simulate Damaged Frame</button>
          </div>

          <div style={{ position: 'relative', height: '150px', background: 'var(--bg-color)', borderRadius: '8px', overflow: 'hidden', padding: '1rem' }}>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>Sender</div>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>Receiver</div>
            
            <div style={{ position: 'absolute', top: '50%', left: '80px', right: '80px', height: '2px', background: 'var(--border-color)', transform: 'translateY(-50%)' }}></div>

            {demoState !== 0 && (
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: `calc(80px + ${framePos * 0.6}%)`, 
                transform: 'translate(-50%, -50%)',
                width: '40px', height: '30px', 
                background: (demoState === 2 && framePos > 50) ? 'var(--color-red)' : 'var(--color-cyan)', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px',
                opacity: (demoState === 1 && framePos >= 40) ? 0 : 1,
                transition: 'opacity 0.2s',
                animation: (demoState === 2 && framePos > 50) ? 'shake 0.2s infinite' : 'none'
              }}>
                F2
              </div>
            )}

            {demoState === 1 && framePos >= 40 && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-orange)', textAlign: 'center' }}>
                <Zap size={32} />
                <div style={{ fontWeight: 'bold' }}>LOST IN TRANSIT</div>
              </div>
            )}

            {demoState === 2 && framePos >= 100 && (
              <div style={{ position: 'absolute', top: '50%', right: '80px', transform: 'translateY(-50%)', color: 'var(--color-red)', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontWeight: 'bold', background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '4px' }}>GARBLED FRAME — CRC FAILED</div>
                <Trash2 size={24} />
              </div>
            )}
          </div>
        </div>

        {/* ARQ Family Tree */}
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ARQ Family Tree</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Automatic Repeat Request (ARQ) comes in three main flavors:</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ borderLeft: '3px solid var(--color-cyan)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                1. Stop-and-Wait ARQ
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Based on Stop-and-Wait flow control. Simple, but very inefficient on long links.</p>
            </div>

            <div style={{ borderLeft: '3px solid var(--color-purple)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                2. Go-Back-N ARQ
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Based on sliding window. If a frame is lost, receiver drops all subsequent frames and asks sender to "Go Back" and resend everything from N.</p>
            </div>

            <div style={{ borderLeft: '3px solid var(--color-green)', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                3. Selective-Reject ARQ
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Highly efficient. Only the single corrupted frame is retransmitted. However, receiver needs complex logic to buffer and re-order frames.</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
