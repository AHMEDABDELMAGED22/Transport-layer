import React, { useState, useEffect, useRef } from 'react';
import { Truck, Zap, CheckCircle, XCircle, Globe, Mail, MonitorDown, Terminal, Video, Gamepad2, Database, ShieldAlert } from 'lucide-react';

export default function TCPvsUDP({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [scenario, setScenario] = useState(null); // 'tcp', 'udp', null
  const [scenarioState, setScenarioState] = useState(0);

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
    if (scenario) {
      setScenarioState(1); // Call started
      const timer1 = setTimeout(() => {
        setScenarioState(2); // Glitch/Delay happens
      }, 1500);
      
      const timer2 = setTimeout(() => {
        setScenarioState(3); // Result
      }, scenario === 'tcp' ? 4500 : 2000);

      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    } else {
      setScenarioState(0);
    }
  }, [scenario]);

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '3rem' }}>TCP vs UDP — The Two Delivery Services</h1>
      
      <div className="grid-2" style={{ marginBottom: '4rem' }}>
        {/* TCP Card */}
        <div className="glass-panel" style={{ borderTop: '4px solid var(--color-cyan)', transition: 'transform 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(6,182,212,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Truck size={40} color="var(--color-cyan)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>TCP</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Transmission Control Protocol</p>
            </div>
          </div>
          
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle color="var(--color-green)" size={20} /> Guaranteed delivery</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle color="var(--color-green)" size={20} /> Ordered sequencing</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle color="var(--color-green)" size={20} /> Error checking & recovery</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle color="var(--color-green)" size={20} /> Flow control</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-orange)' }}><span style={{ fontSize: '1.2rem' }}>🐢</span> Slower but reliable</li>
          </ul>

          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Common Applications:</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Globe size={16}/> HTTP(S)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Mail size={16}/> SMTP/POP3</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><MonitorDown size={16}/> FTP</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Terminal size={16}/> SSH/Telnet</span>
            </div>
          </div>
        </div>

        {/* UDP Card */}
        <div className="glass-panel" style={{ borderTop: '4px solid var(--color-purple)', transition: 'transform 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(139,92,246,0.1)', padding: '1rem', borderRadius: '50%' }}>
              <Zap size={40} color="var(--color-purple)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-purple)' }}>UDP</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>User Datagram Protocol</p>
            </div>
          </div>
          
          <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-green)' }}><span style={{ fontSize: '1.2rem' }}>⚡</span> Extremely fast</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle color="var(--color-red)" size={20} /> No delivery guarantees</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle color="var(--color-red)" size={20} /> No retransmission</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle color="var(--color-red)" size={20} /> No ordering</li>
            <li style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><XCircle color="var(--color-red)" size={20} /> No flow control</li>
          </ul>

          <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Common Applications:</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Video size={16}/> RTP (Voice/Video)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Gamepad2 size={16}/> Gaming</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}><Database size={16}/> DNS/DHCP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scenario */}
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Interactive Scenario: The Zoom Call</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You're on an important video call with your boss. Which protocol do you want to use?</p>
        
        {!scenario ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <button className="btn-primary" style={{ background: 'var(--color-cyan)', color: '#000' }} onClick={() => setScenario('tcp')}>Use TCP</button>
            <button className="btn-primary" style={{ background: 'var(--color-purple)' }} onClick={() => setScenario('udp')}>Use UDP</button>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-color-secondary)', padding: '2rem', borderRadius: '8px', minHeight: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            
            {scenarioState === 1 && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <Video size={48} color="var(--color-green)" style={{ marginBottom: '1rem' }} />
                <p>Call is going smoothly...</p>
              </div>
            )}

            {scenarioState === 2 && scenario === 'tcp' && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <div style={{ width: '50px', height: '50px', border: '5px solid var(--border-color)', borderTopColor: 'var(--color-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                <p style={{ color: 'var(--color-orange)' }}>Frame lost! TCP pauses EVERYTHING to retransmit perfectly...</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(3 seconds of awkward silence)</p>
              </div>
            )}

            {scenarioState === 2 && scenario === 'udp' && (
              <div style={{ animation: 'fadeIn 0.1s' }}>
                <Video size={48} color="var(--color-orange)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--color-orange)' }}>Frame lost! UDP drops it and keeps playing the next frame.</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Tiny 0.5s glitch, barely noticeable)</p>
              </div>
            )}

            {scenarioState === 3 && scenario === 'tcp' && (
              <div style={{ animation: 'shake 0.5s', color: 'var(--color-red)' }}>
                <ShieldAlert size={64} style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: 'var(--color-red)' }}>YOU'RE FIRED!</h3>
                <p>The boss thought you froze during the important question.</p>
              </div>
            )}

            {scenarioState === 3 && scenario === 'udp' && (
              <div style={{ animation: 'fadeIn 0.5s', color: 'var(--color-green)' }}>
                <CheckCircle size={64} style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: 'var(--color-green)' }}>PROMOTION!</h3>
                <p>The call continued smoothly. Real-time media needs speed, not perfection!</p>
              </div>
            )}

            {scenarioState === 3 && (
              <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={() => setScenario(null)}>Try Again</button>
            )}

          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
