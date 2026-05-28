import React, { useState, useEffect, useRef } from 'react';
import { Globe, Download, Video, Box, Hash, ShieldAlert, PhoneCall, PhoneOff, Settings, Scissors, ListOrdered, CheckCircle, ArrowRight } from 'lucide-react';

const StackLayer = ({ title, layerNum, isActive, isGlowing, onClick, children }) => (
  <div 
    onClick={onClick}
    style={{
      background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'var(--glass-bg)',
      border: `2px solid ${isGlowing ? 'var(--color-cyan)' : 'var(--border-color)'}`,
      boxShadow: isGlowing ? '0 0 20px var(--color-cyan-glow)' : 'none',
      padding: '1.5rem',
      margin: '0.5rem 0',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: isActive ? '120px' : '70px'
    }}
  >
    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: isActive ? '1rem' : '0', color: isGlowing ? 'var(--color-cyan)' : 'inherit' }}>
      Layer {layerNum}: {title}
    </div>
    {isActive && <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn 0.5s' }}>
      {children}
    </div>}
  </div>
);

const FlipCard = ({ title, desc, icon: Icon }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div 
      style={{ perspective: '1000px', height: '180px', width: '100%', cursor: 'pointer' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%', transition: 'transform 0.6s',
        transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none'
      }}>
        {/* Front */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <Icon size={40} color="var(--color-cyan)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', margin: 0, textAlign: 'center' }}>{title}</h3>
        </div>
        {/* Back */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
          background: 'var(--bg-color-tertiary)', border: '1px solid var(--color-cyan)', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          transform: 'rotateY(180deg)', textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
};

const PizzaAnalogy = () => {
  const [sliced, setSliced] = useState(false);

  return (
    <div className="glass-panel" style={{ marginTop: '3rem', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Segmentation: The Pizza Analogy</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Imagine pushing a large pizza through a small door. You must break it into smaller segments!</p>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem', margin: '3rem 0' }}>
        <div 
          onClick={() => setSliced(true)}
          style={{
            width: '180px', height: '180px', 
            borderRadius: '50%', background: 'var(--color-orange)', 
            cursor: 'pointer', position: 'relative',
            display: 'flex', flexWrap: 'wrap', overflow: 'hidden',
            border: '6px solid #c2410c',
            boxShadow: '0 10px 25px rgba(249, 115, 22, 0.3)',
            transition: 'all 0.5s ease',
            transform: sliced ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {sliced ? (
            Array.from({length: 4}).map((_, i) => (
              <div key={i} style={{ display: 'flex', width: '100%', height: '50%' }}>
                 <div style={{ width: '50%', borderRight: '2px solid #9a3412', borderBottom: '2px solid #9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i===1 ? 'var(--color-red)' : 'transparent', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{i*2 + 1}</div>
                 <div style={{ width: '50%', borderBottom: '2px solid #9a3412', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i===1 ? 'var(--color-red)' : 'transparent', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{i*2 + 2}</div>
              </div>
            ))
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1.3rem', textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Click to Slice
            </div>
          )}
        </div>

        <ArrowRight size={48} color="var(--color-cyan)" style={{ opacity: sliced ? 1 : 0.3, transition: 'opacity 0.5s' }} />

        <div style={{
          width: '70px', height: '140px', background: 'var(--bg-color-secondary)', border: '3px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '10px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)', right: '10px' }}></div>
        </div>
      </div>
      
      <div style={{ minHeight: '30px' }}>
        {sliced && <p style={{ color: 'var(--color-red)', fontWeight: 'bold', fontSize: '1.1rem', animation: 'fadeIn 0.5s' }}>If slice #3 drops, we know exactly which one to request again!</p>}
      </div>
      <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => setSliced(false)}>Reset Pizza</button>
    </div>
  );
};

export default function TransportLayerIntro({ id, setActiveSection }) {
  const sectionRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState(3);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [id, setActiveSection]);

  const responsibilities = [
    { title: "Session Establishment", desc: "\"Hey, can we talk?\" - Setting up the connection.", icon: PhoneCall },
    { title: "Session Termination", desc: "\"We're done. Goodbye!\" - Gracefully closing connection.", icon: PhoneOff },
    { title: "Session Management", desc: "\"Let's stay organized.\" - Keeping track of active flows.", icon: Settings },
    { title: "Segmentation", desc: "Break big data into chunks called segments.", icon: Scissors },
    { title: "Sequencing", desc: "Number every chunk so they can be reassembled.", icon: ListOrdered },
    { title: "Error Control", desc: "Check and fix corruption via checksums and retransmissions.", icon: ShieldAlert }
  ];

  return (
    <section id={id} ref={sectionRef} className="section-container">
      <h1 className="glow-text" style={{ textAlign: 'center', marginBottom: '3rem' }}>What is the Transport Layer?</h1>
      
      <div className="grid-2">
        {/* TCP/IP Stack */}
        <div className="glass-panel">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>The TCP/IP Stack</h2>
          
          <StackLayer title="Application Layer" layerNum={4} isActive={activeLayer === 4} isGlowing={false} onClick={() => setActiveLayer(4)}>
            <div style={{ textAlign: 'center' }}><Globe color="var(--color-green)" /><p>HTTP</p></div>
            <div style={{ textAlign: 'center' }}><Download color="var(--color-purple)" /><p>FTP</p></div>
            <div style={{ textAlign: 'center' }}><Video color="var(--color-cyan)" /><p>RTP</p></div>
          </StackLayer>

          <StackLayer title="Transport Layer" layerNum={3} isActive={activeLayer === 3} isGlowing={true} onClick={() => setActiveLayer(3)}>
            <div style={{ textAlign: 'center', background: 'rgba(6,182,212,0.2)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
              <Box color="var(--color-cyan)" size={32} />
              <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>TCP / UDP</p>
            </div>
          </StackLayer>

          <StackLayer title="Internet Layer" layerNum={2} isActive={activeLayer === 2} isGlowing={false} onClick={() => setActiveLayer(2)}>
            <div style={{ textAlign: 'center' }}><Hash color="var(--color-orange)" /><p>IPv4</p></div>
            <div style={{ textAlign: 'center' }}><Hash color="var(--color-orange)" /><p>IPv6</p></div>
          </StackLayer>

          <StackLayer title="Network Access" layerNum={1} isActive={activeLayer === 1} isGlowing={false} onClick={() => setActiveLayer(1)}>
            <div style={{ textAlign: 'center' }}><Globe color="var(--text-secondary)" /><p>WiFi / Ethernet</p></div>
          </StackLayer>
        </div>

        {/* The 6 Responsibilities */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>The 6 Responsibilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {responsibilities.map((resp, idx) => (
              <FlipCard key={idx} title={resp.title} desc={resp.desc} icon={resp.icon} />
            ))}
          </div>
        </div>
      </div>

      <PizzaAnalogy />
      
      {/* Add global keyframes for fadeIn if not exists, we can just inject a style block */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
