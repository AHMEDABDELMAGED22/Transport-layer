import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export default function StopAndWaitARQ({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  
  const [scenario, setScenario] = useState('none'); // 'lost_frame', 'lost_ack', 'none'
  const [step, setStep] = useState(0);

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
    if (scenario === 'lost_frame') {
      if (step === 0) { setTimeout(() => setStep(1), 1000); } // F0 sent
      if (step === 1) { setTimeout(() => setStep(2), 1500); } // Lost, timer ticking
      if (step === 2) { setTimeout(() => setStep(3), 2000); } // Timeout! Retransmit F0
      if (step === 3) { setTimeout(() => setStep(4), 1500); } // F0 arrives
      if (step === 4) { setTimeout(() => setStep(5), 1000); } // ACK1 sent back
    } else if (scenario === 'lost_ack') {
      if (step === 0) { setTimeout(() => setStep(1), 1000); } // F0 sent
      if (step === 1) { setTimeout(() => setStep(2), 1000); } // F0 arrives
      if (step === 2) { setTimeout(() => setStep(3), 1000); } // ACK1 sent, but lost
      if (step === 3) { setTimeout(() => setStep(4), 2000); } // Timeout! Retransmit F0
      if (step === 4) { setTimeout(() => setStep(5), 1500); } // F0 arrives again
      // Station B detects duplicate and discards
    }
  }, [scenario, step]);

  const startLostFrame = () => { setScenario('lost_frame'); setStep(0); };
  const startLostAck = () => { setScenario('lost_ack'); setStep(0); };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Stop-and-Wait ARQ</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        What happens when Stop-and-Wait goes wrong? The sender uses a <b>timeout timer</b>. If an ACK isn't received in time, it assumes the frame was lost and retransmits. To prevent duplicate frames, we alternate sequence numbers (0 and 1).
      </p>

      <div className="grid-2">
        {/* Scenarios Controls */}
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Simulate Failures</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" onClick={startLostFrame} style={{ background: 'var(--bg-color-tertiary)', border: '1px solid var(--color-cyan)', color: 'var(--text-primary)' }}>
              Scenario 1: Lost Frame
            </button>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Frame 0 is lost in transit. Sender's timer expires, so it retransmits Frame 0.</p>

            <button className="btn-primary" onClick={startLostAck} style={{ background: 'var(--bg-color-tertiary)', border: '1px solid var(--color-purple)', color: 'var(--text-primary)' }}>
              Scenario 2: Lost ACK
            </button>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Frame 0 arrives safely, but the ACK is lost! Sender's timer expires and it retransmits Frame 0. Receiver sees the sequence number is 0 again, realizes it's a duplicate, and DISCARDS it.</p>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="glass-panel" style={{ position: 'relative', height: '400px', display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
          <div style={{ width: '2px', background: 'var(--border-color)', height: '100%', position: 'absolute', left: '20%' }}></div>
          <div style={{ width: '2px', background: 'var(--border-color)', height: '100%', position: 'absolute', right: '20%' }}></div>
          
          <div style={{ width: '40%', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-cyan)', zIndex: 1 }}>Station A</div>
          <div style={{ width: '40%', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-purple)', zIndex: 1 }}>Station B</div>

          {/* Animations for Lost Frame */}
          {scenario === 'lost_frame' && (
             <div style={{ position: 'absolute', top: '50px', left: '20%', width: '60%', height: '300px' }}>
                {step >= 0 && <div style={{ position: 'absolute', top: 0, left: '-10px', color: 'var(--text-secondary)' }}><Clock size={16}/> Timer Start</div>}
                
                {step === 1 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-cyan)', top: '30px', left: 0, animation: 'flyRight 1.5s linear forwards' }}>Frame 0</div>}
                {step >= 2 && <div style={{ position: 'absolute', top: '70px', left: '40%', color: 'var(--color-red)' }}>* LOST</div>}
                
                {step >= 3 && <div style={{ position: 'absolute', top: '150px', left: '-10px', color: 'var(--color-orange)' }}><AlertTriangle size={16}/> TIMEOUT! Retransmit</div>}
                
                {step >= 3 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-cyan)', top: '180px', left: 0, animation: 'flyRight 1.5s linear forwards' }}>Frame 0</div>}
                
                {step >= 5 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-purple)', top: '230px', right: 0, animation: 'flyLeft 1s linear forwards' }}>ACK 1</div>}
             </div>
          )}

          {/* Animations for Lost ACK */}
          {scenario === 'lost_ack' && (
             <div style={{ position: 'absolute', top: '50px', left: '20%', width: '60%', height: '300px' }}>
                {step >= 0 && <div style={{ position: 'absolute', top: 0, left: '-10px', color: 'var(--text-secondary)' }}><Clock size={16}/> Timer Start</div>}
                
                {step >= 0 && step < 4 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-cyan)', top: '30px', left: 0, animation: 'flyRight 1s linear forwards' }}>Frame 0</div>}
                
                {step >= 2 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-purple)', top: '80px', right: 0, animation: 'flyLeft 1s linear forwards' }}>ACK 1</div>}
                
                {step >= 3 && <div style={{ position: 'absolute', top: '100px', right: '40%', color: 'var(--color-red)' }}>* ACK LOST</div>}
                {step >= 3 && <div style={{ position: 'absolute', top: '150px', left: '-10px', color: 'var(--color-orange)' }}><AlertTriangle size={16}/> TIMEOUT! Retransmit</div>}
                
                {step >= 3 && <div style={{ position: 'absolute', width: '20px', height: '10px', background: 'var(--color-cyan)', top: '180px', left: 0, animation: 'flyRight 1.5s linear forwards' }}>Frame 0</div>}
                
                {step >= 5 && <div style={{ position: 'absolute', top: '230px', right: '-110px', color: 'var(--color-orange)', background: 'rgba(0,0,0,0.8)', padding: '0.5rem', borderRadius: '4px', zIndex: 10 }}>Duplicate Frame 0!<br/>DISCARD</div>}
             </div>
          )}

        </div>
      </div>
    </section>
  );
}
