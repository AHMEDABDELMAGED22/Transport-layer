import React, { useState } from 'react';
import { Play, CheckCircle } from 'lucide-react';

const seqList = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3];

export default function QuestionOneSimulation() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      id: 'a',
      title: "a) Before A sends any frames",
      shortTitle: "a) Initial State",
      a_windowStart: 0,
      a_ackedIndex: -1,
      a_sentIndex: -1,
      b_windowStart: 0,
      b_receivedIndex: -1,
      explanation: "Both stations start with their windows at sequence number 0. No frames have been transmitted yet."
    },
    {
      id: 'b',
      title: "b) After A sends 0,1,2 and B acks 0,1 (ACK received by A)",
      shortTitle: "b) Send 0,1,2 & ACK 0,1",
      a_windowStart: 2,
      a_ackedIndex: 1,
      a_sentIndex: 2,
      b_windowStart: 3,
      b_receivedIndex: 2,
      explanation: "A receives an ACK for frames 0 and 1 (meaning B expects 2). A's window slides to start at 2. Frame 2 is still unacknowledged from A's perspective. B received frames 0, 1, and 2, so its window slides to expect frame 3."
    },
    {
      id: 'c',
      title: "c) After A sends 3,4,5 and B acks 4 (ACK received by A)",
      shortTitle: "c) Send 3,4,5 & ACK 4",
      a_windowStart: 5,
      a_ackedIndex: 4,
      a_sentIndex: 5,
      b_windowStart: 6,
      b_receivedIndex: 5,
      explanation: "A receives an ACK for up to frame 4 (meaning B expects 5). A's window slides to start at 5. Frame 5 is unacknowledged from A's perspective. Assuming B receives all frames A sends (including 5), B's window slides to expect frame 6."
    }
  ];

  const currentStep = steps[step];

  const renderTimeline = (isSender, windowStart, lastAckedOrReceived, lastSent) => {
    return (
      <div style={{ position: 'relative', height: '60px', display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
        {/* Window Highlight */}
        <div style={{
          position: 'absolute',
          left: `${windowStart * 42}px`,
          width: `${4 * 42 - 8}px`, // 4 boxes * 42px width - 8px margin to fit exactly around boxes
          height: '46px',
          background: isSender ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
          border: `2px solid ${isSender ? 'var(--color-cyan)' : 'var(--color-purple)'}`,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
          borderRadius: '4px',
          top: '7px'
        }}></div>

        <div style={{ display: 'flex', zIndex: 1, position: 'relative' }}>
          {seqList.map((seq, idx) => {
            let state = 'future';
            if (isSender) {
               if (idx <= lastAckedOrReceived) state = 'acked';
               else if (idx <= lastSent) state = 'inflight';
            } else {
               if (idx <= lastAckedOrReceived) state = 'received';
            }

            return (
              <div key={idx} style={{
                width: '34px', height: '34px', marginRight: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                background: (state === 'acked' || state === 'received') ? 'var(--bg-color-tertiary)' : 
                            (state === 'inflight') ? 'rgba(249, 115, 22, 0.2)' : 'var(--bg-color-primary)',
                borderStyle: state === 'inflight' ? 'dashed' : 'solid',
                borderColor: state === 'inflight' ? 'var(--color-orange)' : 'var(--border-color)',
                color: (state === 'acked' || state === 'received') ? 'var(--text-secondary)' : 'var(--text-primary)',
                transition: 'all 0.3s ease',
                borderRadius: '4px'
              }}>
                {seq}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '1rem', width: '100%' }}>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <button 
            key={i}
            className={step === i ? "btn-primary" : "btn-secondary"}
            onClick={() => setStep(i)}
            style={{ flex: 1, minWidth: '200px', padding: '0.75rem', fontSize: '0.9rem' }}
          >
            {s.shortTitle}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-color-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
        
        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          {currentStep.title}
        </h3>

        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ color: 'var(--color-cyan)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Station A (Transmitting)
          </h4>
          {renderTimeline(true, currentStep.a_windowStart, currentStep.a_ackedIndex, currentStep.a_sentIndex)}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--bg-color-tertiary)', border: '1px solid var(--border-color)' }}></div> ACKed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'rgba(249, 115, 22, 0.2)', border: '1px dashed var(--color-orange)' }}></div> UnACKed / In-flight</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '2px solid var(--color-cyan)' }}></div> Current Window [ {seqList.slice(currentStep.a_windowStart, currentStep.a_windowStart + 4).join(', ')} ]</span>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--color-purple)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Station B (Receiving)
          </h4>
          {renderTimeline(false, currentStep.b_windowStart, currentStep.b_receivedIndex, -1)}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'var(--bg-color-tertiary)', border: '1px solid var(--border-color)' }}></div> Received</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '12px', height: '12px', background: 'rgba(139, 92, 246, 0.15)', border: '2px solid var(--color-purple)' }}></div> Current Window [ {seqList.slice(currentStep.b_windowStart, currentStep.b_windowStart + 4).join(', ')} ]</span>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid var(--color-green)', borderRadius: '0 8px 8px 0', animation: 'fadeIn 0.5s ease-in' }} key={step}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <CheckCircle color="var(--color-green)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--color-green)', display: 'block', marginBottom: '0.25rem' }}>Correct Answer Breakdown:</strong> 
              <span style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{currentStep.explanation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
