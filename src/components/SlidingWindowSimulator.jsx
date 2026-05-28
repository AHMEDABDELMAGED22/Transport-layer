import React, { useState, useEffect, useRef } from 'react';
import { Play, Check, AlertOctagon, MessageSquare, ArrowRight, Maximize, RotateCcw } from 'lucide-react';

const MAX_SEQ = 8;
const TOTAL_FRAMES = 32;

export default function SlidingWindowSimulator({ id, setActiveSection }) {
  const sectionRef = useRef(null);

  const [windowSize, setWindowSize] = useState(4);
  const [lastAcked, setLastAcked] = useState(-1); // Index of last acked
  const [lastSent, setLastSent] = useState(-1);   // Index of last sent
  const [rnrActive, setRnrActive] = useState(false);
  const [piggyActive, setPiggyActive] = useState(false);
  
  const [viewTab, setViewTab] = useState('sender'); // 'sender' or 'receiver'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [id, setActiveSection]);

  const handleSend = () => {
    if (rnrActive) return;
    if (lastSent - lastAcked < windowSize) {
      setLastSent(prev => prev + 1);
    }
  };

  const handleAck = () => {
    if (lastAcked < lastSent) {
      setLastAcked(prev => prev + 1);
      if (rnrActive) setRnrActive(false); // Clear RNR on normal ACK
    }
  };

  const handleRNR = () => {
    setRnrActive(true);
  };

  const handlePiggy = () => {
    setPiggyActive(true);
    setTimeout(() => {
      handleAck();
      setPiggyActive(false);
    }, 1500);
  };

  const handleReset = () => {
    setLastAcked(-1);
    setLastSent(-1);
    setRnrActive(false);
    setPiggyActive(false);
  };

  const frames = Array.from({ length: TOTAL_FRAMES }).map((_, i) => i % MAX_SEQ);

  const renderTimeline = (isSender) => {
    const windowStart = lastAcked + 1;
    const windowEnd = windowStart + windowSize - 1;

    return (
      <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'center', marginTop: '2rem', overflowX: 'hidden', padding: '0 2rem' }}>
        
        {/* The Window Box (Slider) */}
        <div style={{
          position: 'absolute',
          left: `calc(2rem + ${windowStart * 40}px)`,
          width: `${windowSize * 40}px`,
          height: '50px',
          background: isSender ? (rnrActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.2)') : 'rgba(139, 92, 246, 0.2)',
          border: `2px solid ${isSender ? (rnrActive ? 'var(--color-red)' : 'var(--color-cyan)') : 'var(--color-purple)'}`,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
          top: '35px'
        }}></div>

        <div style={{ display: 'flex', zIndex: 1, position: 'relative', transform: `translateX(-${Math.max(0, lastAcked - 5) * 40}px)`, transition: 'transform 0.5s' }}>
          {frames.map((seq, idx) => {
            let state = 'future';
            if (isSender) {
              if (idx <= lastAcked) state = 'acked';
              else if (idx <= lastSent) state = 'inflight';
              else if (idx <= windowEnd) state = 'allowed';
            } else {
              // Receiver perspective
              if (idx <= lastAcked) state = 'received';
              else if (idx <= windowEnd) state = 'allowed';
            }

            return (
              <div key={idx} style={{
                width: '40px', height: '40px', flexShrink: 0,
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontFamily: 'var(--font-mono)',
                background: state === 'acked' || state === 'received' ? 'var(--bg-color-tertiary)' : 
                            state === 'inflight' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                borderStyle: state === 'inflight' ? 'dashed' : 'solid',
                borderColor: state === 'inflight' ? 'var(--color-orange)' : 'var(--border-color)',
                color: state === 'acked' || state === 'received' ? 'var(--text-secondary)' : 'var(--text-primary)',
                position: 'relative'
              }}>
                {seq}
                {isSender && idx === lastSent && <div style={{ position: 'absolute', top: '-25px', color: 'var(--color-orange)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Last Sent ▼</div>}
                {isSender && idx === lastAcked && <div style={{ position: 'absolute', bottom: '-25px', color: 'var(--color-cyan)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>▲ Last ACK</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Sliding Window Simulator</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '800px', margin: '0 auto 2rem auto' }}>
        Efficiency is improved by allowing multiple frames to be in transit simultaneously. The sender and receiver maintain a "window" of frames they are allowed to process.
      </p>

      <div className="glass-panel" style={{ position: 'relative' }}>
        
        <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold' }}>Window Size (W): {windowSize}</span>
            <input type="range" min="1" max="7" value={windowSize} onChange={(e) => {setWindowSize(Number(e.target.value)); handleReset();}} style={{ width: '100px' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleSend} disabled={lastSent - lastAcked >= windowSize || rnrActive}>
              Send Frame
            </button>
            <button className="btn-secondary" onClick={handleAck} disabled={lastAcked >= lastSent}>
              Receive ACK
            </button>
            <button className="btn-secondary" onClick={handlePiggy} disabled={lastAcked >= lastSent || piggyActive} style={{ borderColor: 'var(--color-green)', color: 'var(--color-green)' }}>
              Piggyback ACK
            </button>
            <button className="btn-secondary" onClick={handleRNR} disabled={rnrActive} style={{ borderColor: 'var(--color-red)', color: 'var(--color-red)' }}>
              Send RNR
            </button>
            <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.5rem' }}>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <button 
            style={{ padding: '0.5rem 2rem', background: viewTab === 'sender' ? 'var(--bg-color-tertiary)' : 'transparent', color: viewTab === 'sender' ? 'var(--color-cyan)' : 'var(--text-secondary)', border: 'none', borderBottom: viewTab === 'sender' ? '2px solid var(--color-cyan)' : 'none', fontWeight: 'bold', fontSize: '1.1rem' }}
            onClick={() => setViewTab('sender')}
          >
            Sender Perspective
          </button>
          <button 
            style={{ padding: '0.5rem 2rem', background: viewTab === 'receiver' ? 'var(--bg-color-tertiary)' : 'transparent', color: viewTab === 'receiver' ? 'var(--color-purple)' : 'var(--text-secondary)', border: 'none', borderBottom: viewTab === 'receiver' ? '2px solid var(--color-purple)' : 'none', fontWeight: 'bold', fontSize: '1.1rem' }}
            onClick={() => setViewTab('receiver')}
          >
            Receiver Perspective
          </button>
        </div>

        {/* Info Legend */}
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          {viewTab === 'sender' ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', background: 'var(--bg-color-tertiary)' }}></div> Frames already transmitted</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', border: '1px dashed var(--color-orange)', background: 'rgba(249, 115, 22, 0.2)' }}></div> Frames buffered / In-flight</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', border: '2px solid var(--color-cyan)', background: 'rgba(6, 182, 212, 0.2)' }}></div> Window (Allowed to transmit)</span>
            </>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', background: 'var(--bg-color-tertiary)' }}></div> Frames already received</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '15px', height: '15px', border: '2px solid var(--color-purple)', background: 'rgba(139, 92, 246, 0.2)' }}></div> Window (May be accepted)</span>
            </>
          )}
        </div>

        {/* Timelines */}
        <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
          <h3 style={{ color: viewTab === 'sender' ? 'var(--color-cyan)' : 'var(--color-purple)', margin: '0 0 1rem 1rem' }}>{viewTab === 'sender' ? 'Sender (Station A)' : 'Receiver (Station B)'}</h3>
          
          {renderTimeline(viewTab === 'sender')}

          {/* Demos Overlay */}
          {piggyActive && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--color-green)', color: 'white', padding: '1rem 2rem', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'flyAcross 1.5s ease-in-out', zIndex: 10 }}>
              <MessageSquare /> Data + ACK Riding Together! (Piggybacking)
            </div>
          )}

          {rnrActive && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--color-red)', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem', animation: 'pulse 1s infinite', zIndex: 10 }}>
              <AlertOctagon size={32} />
              <div>
                <div>RNR {frames[lastAcked + 1]} Received!</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Buffer full — waiting...</div>
              </div>
            </div>
          )}
        </div>
        
      </div>

      <style>{`
        @keyframes flyAcross {
          0% { left: 100%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 0%; opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </section>
  );
}
