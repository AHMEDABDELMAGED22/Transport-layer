import React, { useState, useEffect, useRef } from 'react';
import { Download, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';

const quizQuestions = [
  { q: "Which protocol provides guaranteed delivery and ordered sequencing?", options: ["UDP", "IP", "TCP"], a: 2 },
  { q: "What port number is typically used for secure web traffic (HTTPS)?", options: ["80", "443", "22"], a: 1 },
  { q: "What is the standard size of the CRC used for error detection in this lecture?", options: ["2 bytes", "4 bytes", "8 bytes"], a: 1 },
  { q: "In Sliding Window with a 3-bit sequence number, what is the max sequence value before wrapping?", options: ["3", "7", "8"], a: 1 },
  { q: "Which ARQ protocol is highly efficient but requires complex receiver buffering?", options: ["Stop-and-Wait", "Go-Back-N", "Selective-Reject"], a: 2 },
];

export default function SummarySection({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

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

  const handleSubmit = () => {
    let s = 0;
    quizQuestions.forEach((q, i) => {
      if (answers[i] === q.a) s++;
    });
    setScore(s);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id={id} ref={sectionRef} className="section-container" style={{ paddingBottom: '8rem' }}>
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '3rem' }}>Summary & Cheat Sheet</h1>
      
      <div className="grid-2">
        {/* Mind Map / Cheat Sheet Info */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BrainCircuit color="var(--color-cyan)"/> Key Takeaways
          </h2>
          
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '1rem' }}><strong style={{ color: 'var(--text-primary)' }}>Transport Layer:</strong> Floor 3 of the TCP/IP stack. Handles end-to-end (process-to-process) delivery.</li>
            <li style={{ marginBottom: '1rem' }}><strong style={{ color: 'var(--text-primary)' }}>Ports:</strong> Identifiers for specific applications (e.g., 80=HTTP, 443=HTTPS).</li>
            <li style={{ marginBottom: '1rem' }}><strong style={{ color: 'var(--text-primary)' }}>TCP vs UDP:</strong> TCP is the reliable, ordered armored truck. UDP is the fast, best-effort motorcycle.</li>
            <li style={{ marginBottom: '1rem' }}><strong style={{ color: 'var(--text-primary)' }}>Flow Control:</strong> Preventing buffer overflow. Sliding Window is vastly more efficient than Stop-and-Wait.</li>
            <li style={{ marginBottom: '1rem' }}><strong style={{ color: 'var(--text-primary)' }}>Error Control (ARQ):</strong> 
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <li><b>Stop-and-Wait:</b> Send 1, wait for ACK.</li>
                <li><b>Go-Back-N:</b> Discard everything after a lost frame. Resend from N.</li>
                <li><b>Selective-Reject:</b> Buffer good frames, resend ONLY the lost frame.</li>
              </ul>
            </li>
          </ul>

          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Download style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Download Cheat Sheet (PDF)
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>(Uses browser print-to-PDF feature)</p>
          </div>
        </div>

        {/* Quick Quiz */}
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Quick Quiz</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {quizQuestions.map((q, qIndex) => (
              <div key={qIndex}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{qIndex + 1}. {q.q}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {q.options.map((opt, oIndex) => {
                    const isSelected = answers[qIndex] === oIndex;
                    const showCorrect = score !== null && oIndex === q.a;
                    const showWrong = score !== null && isSelected && oIndex !== q.a;
                    
                    let bg = isSelected ? 'var(--color-cyan)' : 'transparent';
                    let border = isSelected ? 'var(--color-cyan)' : 'var(--border-color)';
                    let color = isSelected ? '#000' : 'var(--text-primary)';
                    
                    if (showCorrect) { bg = 'var(--color-green)'; border = 'var(--color-green)'; color = '#fff'; }
                    if (showWrong) { bg = 'var(--color-red)'; border = 'var(--color-red)'; color = '#fff'; }

                    return (
                      <button 
                        key={oIndex} 
                        style={{
                          background: bg, border: `1px solid ${border}`, color: color,
                          padding: '0.5rem 1rem', borderRadius: '4px', cursor: score === null ? 'pointer' : 'default',
                          transition: 'all 0.2s', flex: 1, minWidth: '120px'
                        }}
                        onClick={() => score === null && setAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            {score === null ? (
              <button className="btn-primary" onClick={handleSubmit} disabled={Object.keys(answers).length < quizQuestions.length}>
                Submit Answers
              </button>
            ) : (
              <div style={{ background: 'var(--bg-color-tertiary)', padding: '1rem', borderRadius: '8px' }}>
                <h3 style={{ color: score === 5 ? 'var(--color-green)' : 'var(--color-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {score === 5 ? <CheckCircle /> : <XCircle />} You scored {score} out of 5!
                </h3>
                <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setScore(null); setAnswers({}); }}>Retake Quiz</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
