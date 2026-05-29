import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, FileText, PlayCircle } from 'lucide-react';
import NetworkAnimationSimulator from './NetworkAnimationSimulator';

export default function QuestionTwoSimulation() {
  const [activeTab, setActiveTab] = useState('a');

  // Window states for part B
  const windowStates = {
    t10: {
      a: [0, 1, 2, 3], // Window hasn't moved, no ACKs received
      b: [1, 2, 3, 4]  // B just received 0, window shifted by 1
    },
    t15: {
      a: [0, 1, 2, 3], // Still no ACKs received
      b: [3, 4, 5, 6]  // B received 0, 1, 2. Sent ACK, window shifted by 3
    }
  };

  const renderWindow = (label, frames, color, highlightIndices = []) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <h5 style={{ color: color, marginBottom: '0.5rem' }}>{label}</h5>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
          <div key={num} style={{
            width: '35px', height: '35px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: frames.includes(num) ? `2px solid ${color}` : '1px solid var(--border-color)',
            background: frames.includes(num) ? `${color}22` : 'var(--bg-color-tertiary)',
            color: frames.includes(num) ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: frames.includes(num) ? 'bold' : 'normal',
            borderRadius: '4px',
            opacity: highlightIndices.includes(num) ? 1 : 0.6
          }}>
            {num}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '2rem', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h4 style={{ color: 'var(--color-cyan)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Problem 2 Rules & Constants
        </h4>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0' }}>
          <li><strong>File Size:</strong> 12 KB | <strong>MSS:</strong> 1 KB (Total 12 segments: 0 to 11)</li>
          <li><strong>Transmission Time (<span style={{fontFamily:'var(--font-mono)'}}>t<sub>t</sub></span>):</strong> 2 µs | <strong>Propagation Time (<span style={{fontFamily:'var(--font-mono)'}}>t<sub>p</sub></span>):</strong> 8 µs</li>
          <li><strong>Window Size:</strong> 4 segments</li>
          <li><strong>ACK Transmission Time:</strong> Negligible (0 µs)</li>
          <li><strong>ACK Rule:</strong> Station B delays ACKs until it receives <strong>3 consecutive segments</strong>.</li>
          <li><strong>Timeout Timer:</strong> 22 µs</li>
        </ul>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          style={{ padding: '0.75rem 2rem', background: activeTab === 'a' ? 'var(--bg-color-tertiary)' : 'transparent', color: activeTab === 'a' ? 'var(--color-cyan)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'a' ? '2px solid var(--color-cyan)' : 'none', fontWeight: 'bold' }}
          onClick={() => setActiveTab('a')}
        >
          a) Normal Transfer Time
        </button>
        <button 
          style={{ padding: '0.75rem 2rem', background: activeTab === 'b' ? 'var(--bg-color-tertiary)' : 'transparent', color: activeTab === 'b' ? 'var(--color-purple)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'b' ? '2px solid var(--color-purple)' : 'none', fontWeight: 'bold' }}
          onClick={() => setActiveTab('b')}
        >
          b) Window Positions
        </button>
        <button 
          style={{ padding: '0.75rem 2rem', background: activeTab === 'c' ? 'var(--bg-color-tertiary)' : 'transparent', color: activeTab === 'c' ? 'var(--color-red)' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'c' ? '2px solid var(--color-red)' : 'none', fontWeight: 'bold' }}
          onClick={() => setActiveTab('c')}
        >
          c) Busy Period (Timeout)
        </button>
        <button 
          style={{ padding: '0.75rem 2rem', background: activeTab === 'd' ? 'var(--bg-color-tertiary)' : 'transparent', color: activeTab === 'd' ? '#00f3ff' : 'var(--text-secondary)', border: 'none', borderBottom: activeTab === 'd' ? '2px solid #00f3ff' : 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setActiveTab('d')}
        >
          <PlayCircle size={18} /> d) Interactive Animation
        </button>
      </div>

      <div style={{ background: 'var(--bg-color-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '300px' }}>
        
        {activeTab === 'a' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock color="var(--color-cyan)" /> Calculating Normal Transfer Time
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We track the timeline of transmissions. A sends a window of 4, B acks every 3 segments. We assume the timer resets on any valid ACK.
            </p>
            
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.6', background: 'var(--bg-color-primary)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
              <div style={{ color: 'var(--color-cyan)' }}>// Cycle 1</div>
              <div>t=0: A starts sending Seg 0.</div>
              <div>t=2, 4, 6, 8: A finishes sending Seg 0, 1, 2, 3. A is now blocked (window full).</div>
              <div>t=10, 12, 14: B receives Seg 0, 1, 2. <span style={{ color: 'var(--color-green)' }}>B has 3 consecutive segments!</span></div>
              <div>t=14: B sends ACK for 0,1,2.</div>
              <div>t=22: A receives ACK (14 + 8). A's window slides. Timer resets.</div>
              <br/>
              <div style={{ color: 'var(--color-cyan)' }}>// Cycle 2</div>
              <div>t=22, 24, 26, 28: A sends Seg 4, 5, 6. (Seg 3 was already sent). A is blocked again.</div>
              <div>t=16: B had received Seg 3.</div>
              <div>t=32, 34: B receives Seg 4, 5. <span style={{ color: 'var(--color-green)' }}>B has 3 consecutive segments since last ACK (3,4,5)!</span></div>
              <div>t=34: B sends ACK for 3,4,5.</div>
              <div>t=42: A receives ACK (34 + 8). A's window slides.</div>
              <br/>
              <div style={{ color: 'var(--color-cyan)' }}>// Cycle 3</div>
              <div>t=42, 44, 46: A sends Seg 7, 8, 9.</div>
              <div>t=36: B had received Seg 6.</div>
              <div>t=52, 54: B receives Seg 7, 8. <span style={{ color: 'var(--color-green)' }}>B has 3 consecutive segments (6,7,8)!</span></div>
              <div>t=54: B sends ACK for 6,7,8.</div>
              <div>t=62: A receives ACK. A's window slides.</div>
              <br/>
              <div style={{ color: 'var(--color-cyan)' }}>// Cycle 4 (Final segments)</div>
              <div>t=62, 64: A sends Seg 10, 11 (End of 12 KB file).</div>
              <div>t=56: B had received Seg 9.</div>
              <div>t=72, 74: B receives Seg 10, 11. <span style={{ color: 'var(--color-green)' }}>B has 3 consecutive segments (9,10,11)!</span></div>
              <div>t=74: B sends final ACK.</div>
              <div>t=82: A receives final ACK. Transfer complete.</div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-green)' }}>
              <CheckCircle color="var(--color-green)" />
              <div>
                <strong>Final Answer:</strong> The complete file transfer takes <strong>82 µs</strong>.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'b' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Window Positions at Specific Times
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1 1 300px', background: 'var(--bg-color-primary)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>At t = 10 µs</h4>
                {renderWindow('Station A Window [0,1,2,3]', windowStates.t10.a, 'var(--color-cyan)', windowStates.t10.a)}
                {renderWindow('Station B Window [1,2,3,4]', windowStates.t10.b, 'var(--color-purple)', windowStates.t10.b)}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  A has sent 0,1,2,3 but received no ACKs. Window remains at 0.<br/>
                  B just received segment 0 exactly at t=10. Its window slides to expect 1.
                </p>
              </div>
              
              <div style={{ flex: '1 1 300px', background: 'var(--bg-color-primary)', padding: '1.5rem', borderRadius: '8px' }}>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>At t = 15 µs</h4>
                {renderWindow('Station A Window [0,1,2,3]', windowStates.t15.a, 'var(--color-cyan)', windowStates.t15.a)}
                {renderWindow('Station B Window [3,4,5,6]', windowStates.t15.b, 'var(--color-purple)', windowStates.t15.b)}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  A still hasn't received the ACK (arrives at 22). Window remains at 0.<br/>
                  B received 0,1,2 (by t=14) and sent an ACK. Its window slid to expect 3.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'c' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle color="var(--color-red)" /> Busy Period (Frames Dropped)
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Station B is busy from <strong>10 till 20 µs</strong>. Any frames arriving in this window are dropped.
            </p>
            
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.6', background: 'var(--bg-color-primary)', padding: '1rem', borderRadius: '8px' }}>
              <div>t=0 to 8: A transmits Seg 0, 1, 2, 3.</div>
              <div><span style={{ color: 'var(--color-red)' }}>t=10, 12, 14, 16: Seg 0, 1, 2, 3 arrive at B but are DROPPED.</span></div>
              <div>t=20: B is no longer busy.</div>
              <br/>
              <div style={{ color: 'var(--color-orange)' }}>// Timeout Occurs</div>
              <div>t=24: Timer for Seg 0 expires! (Started at end of frame 0 transmission: 2 + 22 = 24).</div>
              <div>t=24 to 32: A retransmits Seg 0, 1, 2, 3.</div>
              <br/>
              <div style={{ color: 'var(--color-cyan)' }}>// Normal Operation Resumes</div>
              <div>t=34, 36, 38: B receives Seg 0, 1, 2. B sends ACK at 38.</div>
              <div>t=46: A receives ACK (38 + 8). A's window slides.</div>
              <br/>
              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                Notice that the successful transmission of the entire file essentially started at t = 24 instead of t = 0. The entire remaining timeline is simply shifted by 24 µs.
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--color-red)' }}>
              <AlertTriangle color="var(--color-red)" />
              <div>
                <strong>Final Answer:</strong> The new complete transfer time is 82 + 22 = <strong>104 µs</strong>.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'd' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
             <h3 style={{ color: '#00f3ff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlayCircle color="#00f3ff" /> 3B1B Style Timing Animation
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Experience the math visually. Control the playback speed or drag the slider to scrub through the exact sequence of events, especially the crucial cycle calculation at 22µs!
            </p>
            <NetworkAnimationSimulator />
          </div>
        )}
        
      </div>
    </div>
  );
}
