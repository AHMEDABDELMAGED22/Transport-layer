import React, { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import QuestionOneSimulation from './QuestionOneSimulation';
import QuestionTwoSimulation from './QuestionTwoSimulation';

const ProblemCard = ({ title, page, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      <div 
        className="flex-between" 
        style={{ cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PenTool color="var(--color-cyan)" />
          <h3 style={{ margin: 0 }}>{title} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>(Page {page})</span></h3>
        </div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </div>
      
      {open && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.3s' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProblemWorkspace({ id, setActiveSection }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [id, setActiveSection]);

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Interactive Problem Workspace</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        Practice problems from the lecture notes (Pages 23, 38-39). Work through them interactively.
      </p>

      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        <ProblemCard title="Problem 1: Sliding Window Events" page="23">
          <p>Assuming A is transmitting and B is receiving, show the window positions at A and B (Window size 4, 3-bit sequence 0-7) for the following events:</p>
          <QuestionOneSimulation />
        </ProblemCard>

        <ProblemCard title="Problem 2: Timing & File Transfer" page="Unknown">
          <p>An application on station A was activated to send a 12 KB file to station B...</p>
          <QuestionTwoSimulation />
        </ProblemCard>

        <ProblemCard title="Problem 4: Show that 3-bit sequence is needed for W=4" page="39">
          <p>Why can't we use a 2-bit sequence number (0,1,2,3) for Window Size = 4?</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-red)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--color-red)' }}>The Overlap Problem</h4>
              <p>1. Sender sends frames 0, 1, 2, 3.<br/>2. Receiver gets them, sends RR 0 (which means it wants the NEXT 0).<br/>3. The RR 0 is LOST.<br/>4. Sender times out, retransmits old 0, 1, 2, 3.<br/>5. Receiver is expecting the NEW 0, 1, 2, 3.<br/>6. Receiver accepts old frames as new data! Data corruption!</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-green)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--color-green)' }}>The Solution</h4>
              <p>The sequence numbers must be greater than the window size. Usually MAX_SEQ ≥ 2 * W for Selective Reject, or MAX_SEQ {'>'} W for Go-Back-N. With 3 bits (0-7), the maximum window size for GBN is 7, so W=4 is perfectly safe!</p>
            </div>
          </div>
        </ProblemCard>

      </div>
    </section>
  );
}
