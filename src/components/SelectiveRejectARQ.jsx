import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, DownloadCloud, Activity, Zap } from 'lucide-react';

export default function SelectiveRejectARQ({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  
  const [demoState, setDemoState] = useState('idle'); 

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

  const simulateCorrupt4 = () => {
    setDemoState('sending');
    setTimeout(() => setDemoState('corrupt4'), 1000);
    setTimeout(() => setDemoState('buffering'), 3000);
    setTimeout(() => setDemoState('retransmitting'), 5000);
    setTimeout(() => setDemoState('assembling'), 7000);
    setTimeout(() => setDemoState('idle'), 10000);
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Selective-Reject ARQ</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Highly efficient. The receiver only rejects the specific corrupted frame (SREJ 4), buffers the good frames that arrive after it, and the sender ONLY retransmits the missing frame.
      </p>

      <div className="grid-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Interactive Demonstration</h2>
          
          <button className="btn-primary" style={{ marginBottom: '2rem' }} onClick={simulateCorrupt4} disabled={demoState !== 'idle'}>
            <Zap size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Simulate Corrupt Frame 4
          </button>
          
          {/* Efficiency Comparison */}
          <div style={{ marginTop: 'auto', background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity /> Efficiency Comparison</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                <span>Go-Back-N</span>
                <span style={{ color: 'var(--color-orange)' }}>60%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '5px' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--color-orange)', borderRadius: '5px' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                <span>Selective-Reject</span>
                <span style={{ color: 'var(--color-green)' }}>95%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: '5px' }}>
                <div style={{ width: '95%', height: '100%', background: 'var(--color-green)', borderRadius: '5px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--color-orange)', fontSize: '0.8rem', background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}><b>Complexity Warning:</b> Despite higher efficiency, Go-Back-N is more common. Selective-Reject requires large buffers and complex logic to reinsert frames in the proper sequence.</p>
          </div>
        </div>

        <div className="glass-panel" style={{ position: 'relative', height: '450px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '20px', top: '10px', fontWeight: 'bold' }}>Sender</div>
          <div style={{ position: 'absolute', right: '20px', top: '10px', fontWeight: 'bold' }}>Receiver</div>
          <div style={{ position: 'absolute', top: '40px', left: '60px', bottom: 0, width: '2px', background: 'var(--border-color)' }}></div>
          <div style={{ position: 'absolute', top: '40px', right: '120px', bottom: 0, width: '2px', background: 'var(--border-color)' }}></div>

          {/* The Buffer Shelf */}
          <div style={{ position: 'absolute', right: '10px', top: '120px', width: '80px', height: '100px', border: '2px dashed var(--color-cyan)', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-cyan)', textAlign: 'center', marginBottom: '0.5rem' }}>BUFFER<br/>Wait for F4</span>
            {(demoState === 'buffering' || demoState === 'retransmitting') && (
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <div style={{ width: '20px', height: '20px', background: 'var(--color-green)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', animation: 'fadeIn 0.5s' }}>5</div>
                <div style={{ width: '20px', height: '20px', background: 'var(--color-green)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', animation: 'fadeIn 0.5s 0.2s' }}>6</div>
              </div>
            )}
            {demoState === 'assembling' && (
              <div style={{ fontSize: '0.7rem', color: 'var(--color-green)', animation: 'fadeIn 0.5s', fontWeight: 'bold' }}>DELIVERED!</div>
            )}
          </div>

          {(demoState !== 'idle') && (
            <div style={{ position: 'absolute', top: '60px', width: '100%', height: '100%' }}>
              
              <div style={{ position: 'absolute', top: 0, left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F3</span> </div>
              <div style={{ position: 'absolute', top: '40px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards 0.2s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem', color: demoState==='corrupt4' ? 'var(--color-red)' : 'inherit'}}>F4</span> </div>
              <div style={{ position: 'absolute', top: '80px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRightToBuffer 1s linear forwards 0.4s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F5</span> </div>
              <div style={{ position: 'absolute', top: '120px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRightToBuffer 1s linear forwards 0.6s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F6</span> </div>

              {(demoState === 'corrupt4' || demoState === 'buffering' || demoState === 'retransmitting' || demoState === 'assembling') && (
                <div style={{ position: 'absolute', top: '60px', right: '100px', color: 'var(--color-red)', fontWeight: 'bold' }}>X</div>
              )}

              {(demoState === 'buffering' || demoState === 'retransmitting' || demoState === 'assembling') && (
                <div style={{ position: 'absolute', top: '100px', right: '120px', width: '10px', height: '10px', background: 'var(--color-red)', animation: 'flyLeft 1s linear forwards' }}>
                  <span style={{position:'absolute', top:'-20px', right:'-20px', width:'50px', fontSize:'0.8rem', color:'var(--color-red)'}}>SREJ 4</span>
                </div>
              )}

              {(demoState === 'retransmitting' || demoState === 'assembling') && (
                <>
                  <div style={{ position: 'absolute', top: '160px', left: '70px', color: 'var(--color-purple)', fontWeight: 'bold', fontSize: '0.9rem', animation: 'fadeIn 0.5s' }}>
                    ONLY resent F4
                  </div>
                  <div style={{ position: 'absolute', top: '200px', left: '60px', width: '10px', height: '10px', background: 'var(--color-purple)', animation: 'flyRight 1s linear forwards' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F4</span> </div>
                </>
              )}

              {demoState === 'assembling' && (
                <div style={{ position: 'absolute', top: '260px', right: '20px', color: 'var(--color-green)', fontWeight: 'bold', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                  <DownloadCloud size={24}/>
                  <div style={{ fontSize: '0.8rem' }}>Assembled<br/>3,4,5,6</div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes flyRightToBuffer { 0% { left: 60px; } 100% { left: calc(100% - 60px); top: 120px; opacity: 0; } }
      `}</style>
    </section>
  );
}
