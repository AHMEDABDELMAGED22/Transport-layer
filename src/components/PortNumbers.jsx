import React, { useState, useEffect, useRef } from 'react';
import { Mail, Globe, Lock, Terminal, Download, Inbox, Hash, Package, MoveRight } from 'lucide-react';

const ports = [
  { num: 443, proto: 'HTTPS', desc: 'Secure Web', icon: Lock, color: '#22c55e' },
  { num: 110, proto: 'POP3', desc: 'Receive Mail', icon: Inbox, color: '#eab308' },
  { num: 80, proto: 'HTTP', desc: 'Web Browser', icon: Globe, color: '#3b82f6' },
  { num: 53, proto: 'DNS', desc: 'Domain Names', icon: Hash, color: '#8b5cf6' },
  { num: 25, proto: 'SMTP', desc: 'Send Mail', icon: Mail, color: '#ef4444' },
  { num: 23, proto: 'Telnet', desc: 'Unsecured Shell', icon: Terminal, color: '#94a3b8' },
  { num: 22, proto: 'SSH', desc: 'Secure Shell', icon: Lock, color: '#10b981' },
  { num: '20/21', proto: 'FTP', desc: 'File Transfer', icon: Download, color: '#0ea5e9' },
];

export default function PortNumbers({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [openDoors, setOpenDoors] = useState({});
  const [mailAnimation, setMailAnimation] = useState(null);

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

  const toggleDoor = (num) => {
    setOpenDoors(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const deliverPackage = (num) => {
    setMailAnimation(num);
    setOpenDoors(prev => ({ ...prev, [num]: true }));
    setTimeout(() => {
      setMailAnimation(null);
    }, 2000);
  };

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '1rem' }}>Port Numbers</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
        If an IP address gets the data to your building (computer), the <b>Port Number</b> gets it to the correct apartment (application).
      </p>

      <div className="grid-2">
        {/* The Apartment Building */}
        <div style={{ background: '#1e293b', border: '4px solid #334155', borderBottom: 'none', borderRadius: '16px 16px 0 0', padding: '2rem 2rem 0 2rem', position: 'relative' }}>
          <h2 style={{ textAlign: 'center', color: '#cbd5e1', fontSize: '1.2rem', marginBottom: '2rem', borderBottom: '2px solid #334155', paddingBottom: '1rem' }}>Your Computer Building</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ports.map((port) => {
              const isOpen = openDoors[port.num];
              const Icon = port.icon;
              return (
                <div key={port.num} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {/* The Room / Application behind the door */}
                  <div style={{ flex: 1, background: isOpen ? 'rgba(0,0,0,0.3)' : 'var(--bg-color)', border: `2px solid ${isOpen ? port.color : 'var(--border-color)'}`, borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.5s', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* The Door (slides right) */}
                    <div 
                      onClick={() => toggleDoor(port.num)}
                      style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        background: 'linear-gradient(90deg, #475569, #334155)', 
                        borderRight: '2px solid #1e293b',
                        transform: isOpen ? 'translateX(100%)' : 'translateX(0)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#94a3b8' }}>Door {port.num}</span>
                    </div>

                    {/* Inside content */}
                    <div style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s delay 0.2s', display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                      <Icon color={port.color} size={24} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: port.color }}>{port.proto}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{port.desc}</div>
                      </div>
                      
                      {mailAnimation === port.num && (
                        <div style={{ marginLeft: 'auto', animation: 'flyIn 1s forwards' }}>
                          <Package color="var(--color-orange)" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Mailroom Analogy */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>The Mailroom Analogy</h2>
          <p style={{ marginBottom: '2rem' }}>Click a package to send it to the correct port. The Transport Layer acts as the mailroom sorting these packages!</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => deliverPackage(80)}>
              <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Web Request (80)
            </button>
            <button className="btn-secondary" onClick={() => deliverPackage(443)}>
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Secure Web (443)
            </button>
            <button className="btn-secondary" onClick={() => deliverPackage(25)}>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Send Email (25)
            </button>
            <button className="btn-secondary" onClick={() => deliverPackage(53)}>
              <Hash size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              DNS Query (53)
            </button>
            <button className="btn-secondary" onClick={() => deliverPackage(22)}>
              <Terminal size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              SSH Command (22)
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes flyIn {
          0% { transform: translateX(100px) scale(0.5); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
