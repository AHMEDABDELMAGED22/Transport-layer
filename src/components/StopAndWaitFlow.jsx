import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock } from 'lucide-react';

export default function StopAndWaitFlow({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [status, setStatus] = useState('idle'); // idle, sending, waiting_ack, ack_returning
  const [autoSend, setAutoSend] = useState(false);

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

  // Handle simulation
  useEffect(() => {
    let timer;
    if (status === 'sending') {
      timer = setTimeout(() => {
        setStatus('waiting_ack');
      }, 1000); // 1s to reach destination
    } else if (status === 'waiting_ack') {
      // Receiver processes and sends ACK instantly
      timer = setTimeout(() => {
        setStatus('ack_returning');
      }, 500); // 0.5s processing time
    } else if (status === 'ack_returning') {
      timer = setTimeout(() => {
        setStatus('idle');
        setFrames(prev => [...prev, { id: currentFrame }]);
        setCurrentFrame(prev => prev + 1);
      }, 1000); // 1s for ACK to return
    } else if (status === 'idle' && autoSend && currentFrame <= 5) {
      timer = setTimeout(() => {
        setStatus('sending');
      }, 500);
    }

    if (currentFrame > 5 && autoSend) {
      setAutoSend(false); // Stop auto send when reaching max
    }

    return () => clearTimeout(timer);
  }, [status, autoSend, currentFrame]);

  const handleSend = () => {
    if (status === 'idle') setStatus('sending');
  };

  const resetSim = () => {
    setFrames([]);
    setCurrentFrame(1);
    setStatus('idle');
    setAutoSend(false);
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Stop-and-Wait Flow Control</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        The simplest form of flow control. The source transmits a frame and then <b>waits</b> for an acknowledgment (ACK) before sending the next.
      </p>

      <div className="grid-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Controls</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button className="btn-primary" onClick={handleSend} disabled={status !== 'idle' || currentFrame > 5}>
              Send Frame {currentFrame <= 5 ? currentFrame : '...'}
            </button>
            <button className="btn-secondary" onClick={() => setAutoSend(!autoSend)}>
              {autoSend ? <><Square size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Stop Auto</> : <><Play size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Auto-send</>}
            </button>
            <button className="btn-secondary" onClick={resetSim}>Reset</button>
          </div>

          <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', flex: 1 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Status</h3>
            <div style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {status === 'idle' && <span style={{ color: 'var(--color-green)' }}>Ready to send.</span>}
              {status === 'sending' && <span style={{ color: 'var(--color-cyan)' }}>Transmitting Frame {currentFrame}...</span>}
              {status === 'waiting_ack' && <><Clock className="spin" color="var(--color-orange)" size={20} /><span style={{ color: 'var(--color-orange)' }}>Waiting for ACK...</span></>}
              {status === 'ack_returning' && <span style={{ color: 'var(--color-purple)' }}>ACK is returning...</span>}
            </div>

            <h3 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem' }}>Efficiency</h3>
            <div style={{ width: '100%', height: '20px', background: 'var(--bg-color-secondary)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'var(--color-red)' }}></div>
            </div>
            <p style={{ color: 'var(--color-red)', fontWeight: 'bold', marginTop: '0.5rem' }}>~20% Efficient</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Notice the huge time gap between transmissions while the sender just waits!</p>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="glass-panel" style={{ height: '400px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Vertical Lines */}
          <div style={{ width: '2px', background: 'var(--border-color)', height: '100%', position: 'absolute', left: '10%' }}></div>
          <div style={{ width: '2px', background: 'var(--border-color)', height: '100%', position: 'absolute', right: '10%' }}></div>
          
          <div style={{ width: '20%', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-cyan)', zIndex: 1 }}>Source</div>
          <div style={{ width: '20%', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-purple)', zIndex: 1 }}>Destination</div>

          {/* Render past frames */}
          {frames.map((f, i) => (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', top: `${60 + i * 60}px`, left: '10%', width: '80%', height: '2px', background: 'var(--color-cyan)' }}>
                <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', color: 'var(--color-cyan)', fontSize: '0.8rem' }}>Frame {f.id}</span>
                <div style={{ position: 'absolute', right: '-5px', top: '-4px', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '10px solid var(--color-cyan)' }}></div>
              </div>
              <div style={{ position: 'absolute', top: `${90 + i * 60}px`, left: '10%', width: '80%', height: '2px', background: 'var(--color-purple)' }}>
                <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', color: 'var(--color-purple)', fontSize: '0.8rem' }}>ACK {f.id}</span>
                <div style={{ position: 'absolute', left: '-5px', top: '-4px', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '10px solid var(--color-purple)' }}></div>
              </div>
            </React.Fragment>
          ))}

          {/* Active Animation Layer */}
          {status !== 'idle' && (
            <div style={{ position: 'absolute', top: `${60 + (currentFrame - 1) * 60}px`, left: '10%', width: '80%', height: '30px' }}>
              {status === 'sending' && (
                <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-cyan)', top: 0, left: 0, animation: 'flyRight 1s linear forwards' }}>
                  <span style={{ position: 'absolute', top: '-20px', left: '-10px', color: 'var(--color-cyan)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Frame {currentFrame}</span>
                </div>
              )}
              {status === 'ack_returning' && (
                <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-purple)', top: '30px', right: 0, animation: 'flyLeft 1s linear forwards' }}>
                  <span style={{ position: 'absolute', top: '-20px', right: '-10px', color: 'var(--color-purple)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>ACK {currentFrame}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes flyRight { 0% { left: 0; } 100% { left: calc(100% - 20px); } }
        @keyframes flyLeft { 0% { right: 0; } 100% { right: calc(100% - 20px); } }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
    </section>
  );
}
