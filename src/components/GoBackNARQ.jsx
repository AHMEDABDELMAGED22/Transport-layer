import React, { useState, useEffect, useRef } from 'react';
import { Trash2, AlertOctagon, CornerUpLeft, Timer, Play } from 'lucide-react';

export default function GoBackNARQ({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  
  const [demoState, setDemoState] = useState('idle'); // idle, sending, corrupt4, rejecting, retransmitting, timeout
  const [frames, setFrames] = useState([]); 

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
    setTimeout(() => setDemoState('rejecting'), 3000);
    setTimeout(() => setDemoState('retransmitting'), 5000);
    setTimeout(() => setDemoState('idle'), 8000);
  };

  const simulateTimeout = () => {
    setDemoState('timeout_start');
    setTimeout(() => setDemoState('pbit'), 2000);
    setTimeout(() => setDemoState('idle'), 5000);
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Go-Back-N ARQ</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Based on Sliding Window. If a frame is lost or corrupted, the receiver discards it AND all subsequent frames. It sends a REJ (Reject), and the sender must "Go Back" and retransmit everything from that point.
      </p>

      <div className="grid-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Interactive Demonstrations</h2>
          
          <button className="btn-primary" style={{ marginBottom: '1rem' }} onClick={simulateCorrupt4} disabled={demoState !== 'idle'}>
            <AlertOctagon size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Simulate Corrupt Frame 4
          </button>
          
          <button className="btn-secondary" onClick={simulateTimeout} disabled={demoState !== 'idle'}>
            <Timer size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Simulate Timeout & P-Bit
          </button>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-cyan)' }}>Cumulative ACK</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              In Go-Back-N, if B sends <b>RR 7</b>, it acknowledges that it has successfully received frames 0 through 6 all at once!
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '20px', top: '10px', fontWeight: 'bold' }}>Sender</div>
          <div style={{ position: 'absolute', right: '20px', top: '10px', fontWeight: 'bold' }}>Receiver</div>
          <div style={{ position: 'absolute', top: '40px', left: '60px', bottom: 0, width: '2px', background: 'var(--border-color)' }}></div>
          <div style={{ position: 'absolute', top: '40px', right: '60px', bottom: 0, width: '2px', background: 'var(--border-color)' }}></div>

          {/* Animations for Corrupt 4 */}
          {(demoState === 'sending' || demoState === 'corrupt4' || demoState === 'rejecting' || demoState === 'retransmitting') && (
            <div style={{ position: 'absolute', top: '60px', width: '100%', height: '100%' }}>
              
              <div style={{ position: 'absolute', top: 0, left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F3</span> </div>
              <div style={{ position: 'absolute', top: '40px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards 0.2s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem', color: demoState==='corrupt4' ? 'var(--color-red)' : 'inherit'}}>F4</span> </div>
              <div style={{ position: 'absolute', top: '80px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards 0.4s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F5</span> </div>
              <div style={{ position: 'absolute', top: '120px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards 0.6s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F6</span> </div>

              {(demoState === 'corrupt4' || demoState === 'rejecting' || demoState === 'retransmitting') && (
                <>
                  <div style={{ position: 'absolute', top: '60px', right: '40px', color: 'var(--color-red)', fontWeight: 'bold' }}>X</div>
                  
                  {/* Receiver throwing away 5 and 6 */}
                  <div style={{ position: 'absolute', top: '100px', right: '10px', animation: 'fadeIn 0.5s' }}>
                    <Trash2 color="var(--color-orange)" size={20} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-orange)' }}>Drop 5 (Valid!)</span>
                  </div>
                  <div style={{ position: 'absolute', top: '140px', right: '10px', animation: 'fadeIn 0.5s 0.2s' }}>
                    <Trash2 color="var(--color-orange)" size={20} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-orange)' }}>Drop 6 (Valid!)</span>
                  </div>
                </>
              )}

              {(demoState === 'rejecting' || demoState === 'retransmitting') && (
                <div style={{ position: 'absolute', top: '160px', right: '60px', width: '10px', height: '10px', background: 'var(--color-red)', animation: 'flyLeft 1s linear forwards' }}>
                  <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem', color:'var(--color-red)'}}>REJ 4</span>
                </div>
              )}

              {demoState === 'retransmitting' && (
                <>
                  <div style={{ position: 'absolute', top: '220px', left: '70px', color: 'var(--color-red)', fontWeight: 'bold', fontSize: '1.2rem', animation: 'fadeIn 0.5s' }}>
                    <CornerUpLeft style={{display:'inline'}}/> GO BACK TO 4
                  </div>
                  <div style={{ position: 'absolute', top: '260px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F4</span> </div>
                  <div style={{ position: 'absolute', top: '300px', left: '60px', width: '10px', height: '10px', background: 'var(--color-cyan)', animation: 'flyRight 1s linear forwards 0.2s' }}> <span style={{position:'absolute', top:'-20px', fontSize:'0.8rem'}}>F5</span> </div>
                </>
              )}
            </div>
          )}

          {/* Animations for Timeout/P-bit */}
          {(demoState === 'timeout_start' || demoState === 'pbit') && (
            <div style={{ position: 'absolute', top: '100px', width: '100%', textAlign: 'center' }}>
               <div style={{ color: 'var(--color-orange)', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}><Timer/> TIMEOUT</div>
               {demoState === 'pbit' && (
                 <>
                   <div style={{ position: 'absolute', left: '60px', width: '10px', height: '10px', background: 'var(--color-purple)', animation: 'flyRight 1s linear forwards' }}>
                     <span style={{position:'absolute', top:'-20px', left:'-20px', width:'100px', fontSize:'0.8rem'}}>RR (P-bit = 1)</span>
                   </div>
                   <div style={{ position: 'absolute', right: '60px', top: '60px', width: '10px', height: '10px', background: 'var(--color-purple)', animation: 'flyLeft 1s linear forwards 1s' }}>
                     <span style={{position:'absolute', top:'-20px', right:'-20px', width:'100px', fontSize:'0.8rem', textAlign:'right'}}>RR 4</span>
                   </div>
                   <div style={{ position: 'absolute', top: '60px', right: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem', animation:'fadeIn 0.5s 1s' }}>
                     Must reply!
                   </div>
                 </>
               )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
