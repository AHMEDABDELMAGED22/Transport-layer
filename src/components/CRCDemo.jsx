import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle, Trash2, Cpu, RefreshCw, XOctagon } from 'lucide-react';

const calculateSimpleCRC = (bits) => {
  let hash = 0;
  for (let i = 0; i < bits.length; i++) {
    hash = ((hash << 5) - hash) + bits[i];
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8).padStart(8, '0').toUpperCase();
};

export default function CRCDemo({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  
  const initialBits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0];
  const [senderBits] = useState([...initialBits]);
  const [receiverBits, setReceiverBits] = useState([...initialBits]);
  
  const [senderCRC, setSenderCRC] = useState(null);
  const [receiverCRC, setReceiverCRC] = useState(null);
  
  const [step, setStep] = useState(0); // 0: Start, 1: Sender CRC Generated, 2: Transmitted, 3: Receiver Checked
  
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

  const handleGenerateCRC = () => {
    setSenderCRC(calculateSimpleCRC(senderBits));
    setStep(1);
  };

  const handleTransmit = () => {
    setStep(2);
  };

  const toggleBit = (index) => {
    if (step < 2) return; // Only allow corruption after transmission
    const newBits = [...receiverBits];
    newBits[index] = newBits[index] === 0 ? 1 : 0;
    setReceiverBits(newBits);
    if (step === 3) {
      setStep(2); // Reset check if they modify bits after checking
    }
  };

  const handleCheckCRC = () => {
    setReceiverCRC(calculateSimpleCRC(receiverBits));
    setStep(3);
  };

  const handleReset = () => {
    setReceiverBits([...initialBits]);
    setSenderCRC(null);
    setReceiverCRC(null);
    setStep(0);
  };

  const isValid = senderCRC === receiverCRC;

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Error Detection — CRC</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        The sender runs the <b>Cyclic Redundancy Check</b> equation to generate a 4-byte checksum. The receiver runs the same equation on the received data. If the checksums don't match, the data was corrupted in transit!
      </p>
      
      <div className="grid-2">
        {/* Sender Side */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sender</h2>
          
          <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '2rem' }}>
            {senderBits.map((b, i) => (
              <div key={i} style={{ width: '25px', height: '35px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                {b}
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleGenerateCRC} disabled={step > 0}>
            <Cpu style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Generate CRC
          </button>

          {step >= 1 && (
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--color-cyan)', borderRadius: '8px', animation: 'fadeIn 0.5s', textAlign: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>4-byte Checksum</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-cyan)', letterSpacing: '2px' }}>
                {senderCRC}
              </div>
            </div>
          )}

          {step === 1 && (
            <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={handleTransmit}>
              Transmit Data <ArrowRight size={16} style={{ verticalAlign: 'middle' }} />
            </button>
          )}
        </div>

        {/* Receiver Side */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= 2 ? 1 : 0.4, transition: 'opacity 0.5s' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Receiver</h2>
          
          <p style={{ color: 'var(--color-orange)', fontSize: '0.9rem', marginBottom: '0.5rem', visibility: step >= 2 ? 'visible' : 'hidden' }}>Click bits to simulate corruption!</p>
          <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '2rem', cursor: step >= 2 ? 'pointer' : 'default' }}>
            {receiverBits.map((b, i) => (
              <div 
                key={i} 
                onClick={() => toggleBit(i)}
                style={{ 
                  width: '25px', height: '35px', 
                  background: b !== senderBits[i] ? 'rgba(239, 68, 68, 0.3)' : 'var(--bg-color)', 
                  border: `1px solid ${b !== senderBits[i] ? 'var(--color-red)' : 'var(--border-color)'}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 'bold', fontFamily: 'var(--font-mono)',
                  color: b !== senderBits[i] ? 'var(--color-red)' : 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                {b}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {step >= 2 && (
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(6,182,212,0.1)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Attached Checksum</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--color-cyan)' }}>{senderCRC}</div>
              </div>
            )}
            
            {step >= 3 && (
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(139,92,246,0.1)', border: '1px solid var(--color-purple)', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Calculated Checksum</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--color-purple)' }}>{receiverCRC}</div>
              </div>
            )}
          </div>

          {step === 2 && (
            <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={handleCheckCRC}>
              <Cpu style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Verify CRC
            </button>
          )}

          {step === 3 && (
            <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s', width: '100%' }}>
              {isValid ? (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--color-green)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <CheckCircle color="var(--color-green)" size={32} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-green)' }}>CLEAN DATA</span>
                </div>
              ) : (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed var(--color-red)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', animation: 'shake 0.5s' }}>
                  <XOctagon color="var(--color-red)" size={32} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-red)' }}>CORRUPTED — DROP SEGMENT</span>
                  <Trash2 color="var(--color-red)" size={24} style={{ marginLeft: 'auto' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button className="btn-secondary" onClick={handleReset}>
          <RefreshCw size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Reset Simulation
        </button>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }
      `}</style>
    </section>
  );
}
