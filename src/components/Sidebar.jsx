import React from 'react';

const sections = [
  { id: 'hero', title: 'Introduction' },
  { id: 'transport-layer', title: 'What is Transport Layer?' },
  { id: 'crc', title: 'Error Detection (CRC)' },
  { id: 'tcp-vs-udp', title: 'TCP vs UDP' },
  { id: 'ports', title: 'Port Numbers' },
  { id: 'flow-control', title: 'Flow Control' },
  { id: 'stop-and-wait', title: 'Stop-and-Wait Flow' },
  { id: 'sliding-window', title: 'Sliding Window Simulator' },
  { id: 'sliding-walkthrough', title: 'Sliding Window Walkthrough' },
  { id: 'error-control', title: 'Error Control & ARQ' },
  { id: 'stop-wait-arq', title: 'Stop-and-Wait ARQ' },
  { id: 'go-back-n', title: 'Go-Back-N ARQ' },
  { id: 'selective-reject', title: 'Selective-Reject ARQ' },
  { id: 'problems', title: 'Practice Problems' },
  { id: 'summary', title: 'Summary & Quiz' },
];

export default function Sidebar({ activeSection }) {
  return (
    <nav style={{
      width: '280px',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      background: 'var(--glass-bg)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1.5rem',
      overflowY: 'auto',
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--color-cyan)', textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
        Transport Layer
      </h2>
      <ul style={{ listStyle: 'none' }}>
        {sections.map(sec => (
          <li key={sec.id} style={{ marginBottom: '1rem' }}>
            <a 
              href={`#${sec.id}`}
              style={{
                color: activeSection === sec.id ? 'var(--color-cyan)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: activeSection === sec.id ? '600' : '400',
                transition: 'color 0.2s',
                display: 'block',
                fontSize: '0.95rem'
              }}
            >
              {sec.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
