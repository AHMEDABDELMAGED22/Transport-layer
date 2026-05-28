import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const steps = [
  { 
    title: "Step 1: Initial State", 
    desc: "Window size is 7. Neither station has sent any frames yet. Both windows span frames 0 to 6.",
    winA: [0, 6], winB: [0, 6],
    sentA: [], ackB: [], inflight: []
  },
  { 
    title: "Step 2: A sends F0, F1, F2", 
    desc: "Station A transmits frames 0, 1, and 2. Its window shrinks from the trailing edge. It can now send frames 3 through 6.",
    winA: [3, 6], winB: [0, 6],
    sentA: [0, 1, 2], ackB: [], inflight: [{f: 'F0'}, {f: 'F1'}, {f: 'F2'}]
  },
  { 
    title: "Step 3: B receives frames and sends RR 3", 
    desc: "Station B successfully receives 0, 1, and 2. It sends RR 3 (Receive Ready for frame 3). B's window slides forward, now accepting 3 to 1 (modulo 8).",
    winA: [3, 6], winB: [3, 1],
    sentA: [0, 1, 2], ackB: [0, 1, 2], inflight: [{f: 'RR 3', isAck: true}]
  },
  { 
    title: "Step 4: A receives RR 3", 
    desc: "Station A receives the ACK. It drops 0, 1, 2 from its buffer. Its window expands from the leading edge, now spanning 3 to 1.",
    winA: [3, 1], winB: [3, 1],
    sentA: [], ackB: [0, 1, 2], inflight: []
  },
  { 
    title: "Step 5: A sends F3, F4, F5, F6. RR 4 is lost.", 
    desc: "A sends 4 more frames. B receives F3 and sends RR 4, but it is lost. B receives F4, F5, F6.",
    winA: [7, 1], winB: [7, 5],
    sentA: [3, 4, 5, 6], ackB: [0, 1, 2, 3, 4, 5, 6], inflight: [{f: 'RR 4 (LOST)', isAck: true, error: true}]
  },
  { 
    title: "Step 6: B sends RR 7", 
    desc: "Even though RR 4 was lost, B eventually acknowledges up to 6 by sending RR 7. This is cumulative ACK! A gets RR 7 and clears its buffer.",
    winA: [7, 5], winB: [7, 5],
    sentA: [], ackB: [0, 1, 2, 3, 4, 5, 6], inflight: [{f: 'RR 7', isAck: true}]
  }
];

export default function SlidingWindowWalkthrough({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

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

  const step = steps[currentStep];

  const renderWindow = (win, label) => {
    const nums = [0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7];
    // Find the range. Since we might wrap around, we use the second set of numbers if end < start
    const start = win[0];
    const end = win[1] < win[0] ? win[1] + 8 : win[1];
    
    return (
      <div style={{ display: 'flex', gap: '0.2rem', margin: '1rem 0' }}>
        <div style={{ width: '60px', fontWeight: 'bold' }}>{label}</div>
        {nums.slice(0, 10).map((n, i) => {
          const inWindow = i >= start && i <= end;
          return (
            <div key={i} style={{
              width: '30px', height: '30px', 
              border: '1px solid var(--border-color)',
              background: inWindow ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-color)',
              borderColor: inWindow ? 'var(--color-cyan)' : 'var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)'
            }}>
              {n}
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Sliding Window Example Walkthrough</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Step-by-step breakdown of the lecture's example (Pages 18-19).
      </p>

      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <button className="btn-secondary" disabled={currentStep === 0} onClick={() => setCurrentStep(prev => prev - 1)}>
            <ChevronLeft style={{ display: 'inline' }} /> Previous
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Step {currentStep + 1} of {steps.length}</span>
          <button className="btn-secondary" disabled={currentStep === steps.length - 1} onClick={() => setCurrentStep(prev => prev + 1)}>
            Next <ChevronRight style={{ display: 'inline' }} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-color-secondary)', padding: '2rem', borderRadius: '8px', minHeight: '300px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-cyan)', marginBottom: '1rem' }}>{step.title}</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{step.desc}</p>

          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', position: 'relative' }}>
            {renderWindow(step.winA, 'Station A')}
            
            <div style={{ height: '60px', borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              {step.inflight.map((fl, i) => (
                <div key={i} style={{ 
                  background: fl.error ? 'rgba(239, 68, 68, 0.2)' : (fl.isAck ? 'rgba(139, 92, 246, 0.2)' : 'rgba(6, 182, 212, 0.2)'),
                  border: `1px solid ${fl.error ? 'var(--color-red)' : (fl.isAck ? 'var(--color-purple)' : 'var(--color-cyan)')}`,
                  padding: '0.2rem 1rem', borderRadius: '15px', color: fl.error ? 'var(--color-red)' : 'white',
                  animation: fl.error ? 'shake 0.5s' : 'none'
                }}>
                  {fl.f} {fl.error ? '❌' : (fl.isAck ? '←' : '→')}
                </div>
              ))}
              {step.inflight.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>Quiet on the link...</span>}
            </div>

            {renderWindow(step.winB, 'Station B')}
          </div>
        </div>
      </div>
    </section>
  );
}
