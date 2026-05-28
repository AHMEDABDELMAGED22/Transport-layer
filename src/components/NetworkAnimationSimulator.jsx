import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const packetsData = [
  // Cycle 1
  { id: 1, txStart: 0, txEnd: 2, arr: 10 },
  { id: 2, txStart: 2, txEnd: 4, arr: 12 },
  { id: 3, txStart: 4, txEnd: 6, arr: 14 },
  { id: 4, txStart: 6, txEnd: 8, arr: 16 },
  // Cycle 2
  { id: 5, txStart: 22, txEnd: 24, arr: 32 },
  { id: 6, txStart: 24, txEnd: 26, arr: 34 },
  { id: 7, txStart: 26, txEnd: 28, arr: 36 },
  // Cycle 3
  { id: 8, txStart: 42, txEnd: 44, arr: 52 },
  { id: 9, txStart: 44, txEnd: 46, arr: 54 },
  { id: 10, txStart: 46, txEnd: 48, arr: 56 },
  // Cycle 4
  { id: 11, txStart: 62, txEnd: 64, arr: 72 },
  { id: 12, txStart: 64, txEnd: 66, arr: 74 },
];

const acksData = [
  { id: 3, sent: 14, arr: 22 },
  { id: 6, sent: 34, arr: 42 },
  { id: 9, sent: 54, arr: 62 },
  { id: 12, sent: 74, arr: 82 },
];

export default function NetworkAnimationSimulator() {
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.25);
  const [mode, setMode] = useState('mode1');
  const [assumption, setAssumption] = useState('a1'); // 'a1' = timer at 0, 'a2' = timer at 2
  
  const requestRef = useRef();
  const lastUpdateRef = useRef();
  const freezeUntilRef = useRef(0);
  const isFrozenRef = useRef(false);
  const passedTriggersRef = useRef(new Set());

  const animate = (timestamp) => {
    if (!isPlaying) return;

    if (isFrozenRef.current) {
      if (timestamp >= freezeUntilRef.current) {
        isFrozenRef.current = false;
        lastUpdateRef.current = timestamp; // Reset delta so we don't jump forward
      } else {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    if (lastUpdateRef.current !== undefined) {
      const deltaTime = timestamp - lastUpdateRef.current;
      let newTime = timeRef.current + (deltaTime / 1000) * 10 * speed;
      
      // Triggers for 2-second freeze
      const triggers = mode === 'mode1' 
        ? [10, 14, 16, 22, 34, 42] 
        : [10, 14, assumption === 'a1' ? 22 : 24];

      for (let t of triggers) {
        if (timeRef.current < t && newTime >= t && !passedTriggersRef.current.has(t)) {
          newTime = t;
          isFrozenRef.current = true;
          freezeUntilRef.current = timestamp + 2000;
          passedTriggersRef.current.add(t);
          break; // Stop loop to freeze here
        }
      }

      const maxTime = mode === 'mode1' ? 85 : (assumption === 'a1' ? 35 : 37);
      if (newTime >= maxTime) {
        newTime = maxTime;
        setIsPlaying(false);
      }

      timeRef.current = newTime;
      setTime(newTime);
    }
    
    lastUpdateRef.current = timestamp;
    if (!isFrozenRef.current && isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, speed, mode, assumption]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setTime(val);
    timeRef.current = val;
    setIsPlaying(false);
    isFrozenRef.current = false;
    
    // Rebuild passed triggers
    const newTriggers = new Set();
    const triggers = mode === 'mode1' ? [10, 14, 16, 22, 34, 42] : [10, 14, assumption === 'a1' ? 22 : 24];
    triggers.forEach(t => { if (val >= t) newTriggers.add(t); });
    passedTriggersRef.current = newTriggers;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTime(0);
    timeRef.current = 0;
    setIsPlaying(false);
    isFrozenRef.current = false;
    passedTriggersRef.current = new Set();
  };

  const switchAssumption = (newAssump) => {
    setAssumption(newAssump);
    setTime(0);
    timeRef.current = 0;
    setIsPlaying(false);
    isFrozenRef.current = false;
    passedTriggersRef.current = new Set();
  };

  const maxTime = mode === 'mode1' ? 85 : (assumption === 'a1' ? 35 : 37);
  const timeoutTime = assumption === 'a1' ? 22 : 24;

  // Render logic for Packets
  const renderPackets = () => {
    let renderedPackets = mode === 'mode1' ? packetsData : packetsData.slice(0, 4);
    
    // Mode 2 Retransmission Injection
    if (mode === 'mode2' && time >= timeoutTime) {
      renderedPackets = [
        ...renderedPackets,
        { id: 1, txStart: timeoutTime, txEnd: timeoutTime + 2, arr: timeoutTime + 10, isRetx: true },
        { id: 2, txStart: timeoutTime + 2, txEnd: timeoutTime + 4, arr: timeoutTime + 12, isRetx: true },
        { id: 3, txStart: timeoutTime + 4, txEnd: timeoutTime + 6, arr: timeoutTime + 14, isRetx: true },
        { id: 4, txStart: timeoutTime + 6, txEnd: timeoutTime + 8, arr: timeoutTime + 16, isRetx: true },
      ];
    }

    return renderedPackets.map((p, i) => {
      if (time < p.txStart || time > p.arr) return null;

      const progress = (time - p.txStart) / (p.arr - p.txStart);
      const leftPercent = Math.min(Math.max(progress * 100, 0), 100);
      
      const isDropped = mode === 'mode2' && !p.isRetx && leftPercent >= 99 && time >= 10 && time <= 20;

      return (
        <div key={`fly-${p.id}-${i}`} style={{ 
          position: 'absolute', left: `${leftPercent}%`, top: '10px', 
          transform: `translateX(-50%) ${isDropped ? 'scale(2) rotate(30deg)' : 'scale(1)'}`, 
          width: '32px', height: '32px', 
          background: isDropped ? '#ff3333' : 'rgba(0,0,0,0.95)', 
          border: `2px solid ${isDropped ? '#ff3333' : '#00f3ff'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: isDropped ? '#000' : '#00f3ff', fontWeight: 'bold', borderRadius: '4px', 
          boxShadow: `0 0 15px ${isDropped ? '#ff3333' : 'rgba(0,243,255,0.8)'}`,
          opacity: isDropped ? 0 : 1,
          transition: isDropped ? 'all 0.5s ease-out' : 'none',
          zIndex: 50
        }}>
          {p.id}
        </div>
      );
    });
  };

  // Window positions
  const getWindowA = () => {
    if (mode === 'mode2') return 1;
    if (time < 22) return 1;
    if (time < 42) return 4;
    if (time < 62) return 7;
    return 10; 
  };
  const getWindowB = () => {
    if (mode === 'mode2') return 1;
    if (time < 14) return 1;
    if (time < 34) return 4;
    if (time < 54) return 7;
    return 10;
  };
  
  const windowAStart = getWindowA();
  const windowBStart = getWindowB();

  return (
    <div style={{ backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', fontFamily: 'sans-serif', position: 'relative' }}>
      
      {/* Interactive Scenario Toggle */}
      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        <button onClick={() => switchMode('mode1')} style={{ flex: 1, padding: '1rem', background: mode === 'mode1' ? 'rgba(0, 243, 255, 0.1)' : '#1e1e1e', color: mode === 'mode1' ? '#00f3ff' : '#aaa', border: 'none', borderBottom: mode === 'mode1' ? '2px solid #00f3ff' : 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
          Mode 1: Normal Operation (82 µs)
        </button>
        <button onClick={() => switchMode('mode2')} style={{ flex: 1, padding: '1rem', background: mode === 'mode2' ? 'rgba(255, 51, 51, 0.1)' : '#1e1e1e', color: mode === 'mode2' ? '#ff3333' : '#aaa', border: 'none', borderBottom: mode === 'mode2' ? '2px solid #ff3333' : 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
          Mode 2: Station B Busy & Timeout
        </button>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#252526' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={togglePlay} style={{ background: mode === 'mode1' ? '#00f3ff' : '#ff3333', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {isPlaying ? <Pause size={20} fill="#000" /> : <Play size={20} fill="#000" />}
          </button>
          <button onClick={() => { setTime(0); timeRef.current = 0; setIsPlaying(false); passedTriggersRef.current = new Set(); isFrozenRef.current = false; }} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}>
            <RotateCcw size={20} />
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem', background: '#1e1e1e', padding: '0.25rem', borderRadius: '8px' }}>
            {[0.25, 0.5, 1].map(s => (
              <button key={s} onClick={() => setSpeed(s)} style={{ background: speed === s ? '#333' : 'transparent', color: speed === s ? (mode === 'mode1' ? '#00f3ff' : '#ff3333') : '#aaa', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, margin: '0 2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
            {time.toFixed(1)} <span style={{ fontSize: '1rem', color: '#aaa' }}>µs</span>
          </div>
          <input type="range" min="0" max={maxTime} step="0.1" value={time} onChange={handleSlider} style={{ width: '100%', marginTop: '0.5rem', accentColor: mode === 'mode1' ? '#00f3ff' : '#ff3333' }} />
        </div>
      </div>

      {/* Main Animation Arena */}
      <div style={{ position: 'relative', height: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        
        {/* Network Nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
          
          {/* Station A */}
          <div style={{ width: '120px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(0, 243, 255, 0.1)', border: '2px solid #00f3ff', borderRadius: '8px', padding: '1rem', boxShadow: '0 0 20px rgba(0,243,255,0.2)' }}>
              <h3 style={{ color: '#00f3ff', margin: 0, fontSize: '1.1rem', textShadow: '0 0 5px #00f3ff' }}>Station A</h3>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>Sender</div>
            </div>
            
            {/* Strict DOM Window A Visualization */}
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
               
               {/* Past Blocks */}
               {windowAStart > 1 && (
                 <div style={{ display: 'flex', gap: '4px' }}>
                   {Array.from({length: windowAStart - 1}).map((_, i) => {
                     const id = i + 1;
                     return (
                       <div key={`past-a-${id}`} style={{ width: '24px', height: '24px', background: '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', opacity: 0.2, borderRadius: '2px', boxSizing: 'border-box' }}>
                         {id}
                       </div>
                     );
                   })}
                 </div>
               )}

               {/* ACTIVE WINDOW A */}
               <div id="Active-Window-A" style={{ display: 'flex', gap: '4px', border: '2px solid #00f3ff', background: 'rgba(0,243,255,0.15)', padding: '2px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', position: 'relative', transition: 'all 0.3s ease' }}>
                 <div style={{ position: 'absolute', top: '-20px', left: '0', color: '#00f3ff', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Active-Window-A</div>
                 {Array.from({length: 4}).map((_, i) => {
                   const id = windowAStart + i;
                   if (id > (mode === 'mode1' ? 12 : 8)) return null;
                   
                   const p = packetsData.find(x => x.id === id);
                   let opacity = 1;
                   if (time >= p?.txStart && !(mode === 'mode2' && time >= timeoutTime && id <= 4 && time < (timeoutTime + (id-1)*2))) opacity = 0.2; 
                   
                   return (
                     <div key={`active-a-${id}`} style={{ width: '24px', height: '24px', background: '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', opacity, borderRadius: '2px', boxSizing: 'border-box' }}>
                       {id}
                     </div>
                   );
                 })}
               </div>

               {/* Future Blocks */}
               {windowAStart + 3 < (mode === 'mode1' ? 12 : 8) && (
                 <div style={{ display: 'flex', gap: '4px' }}>
                   {Array.from({length: (mode === 'mode1' ? 12 : 8) - (windowAStart + 3)}).map((_, i) => {
                     const id = windowAStart + 4 + i;
                     return (
                       <div key={`future-a-${id}`} style={{ width: '24px', height: '24px', background: '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', opacity: 1, borderRadius: '2px', boxSizing: 'border-box' }}>
                         {id}
                       </div>
                     );
                   })}
                 </div>
               )}

            </div>

            {/* Sub-toggle for Mode 2 Assumption */}
            {mode === 'mode2' && (
              <div style={{ marginTop: '3rem', background: '#252526', padding: '0.75rem', borderRadius: '8px', border: '1px solid #444', textAlign: 'left', fontSize: '0.75rem', width: '220px', marginLeft: '-50px' }}>
                <div style={{ color: '#aaa', marginBottom: '0.5rem', fontWeight: 'bold' }}>Assumption Settings:</div>
                <label style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" checked={assumption === 'a1'} onChange={() => switchAssumption('a1')} /> Timer starts at t=0
                </label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  <input type="radio" checked={assumption === 'a2'} onChange={() => switchAssumption('a2')} /> Timer starts at t=2
                </label>
                <div style={{ marginTop: '0.5rem', color: '#ff3333', fontWeight: 'bold' }}>
                  Timeout: {timeoutTime} µs
                </div>
              </div>
            )}
          </div>

          {/* Station B */}
          <div style={{ width: '120px', textAlign: 'center', position: 'relative' }}>
            <div style={{ background: 'rgba(0, 255, 102, 0.1)', border: '2px solid #00ff66', borderRadius: '8px', padding: '1rem', boxShadow: '0 0 20px rgba(0,255,102,0.2)' }}>
              <h3 style={{ color: '#00ff66', margin: 0, fontSize: '1.1rem', textShadow: '0 0 5px #00ff66' }}>Station B</h3>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>Receiver</div>
            </div>

            {/* Busy Barrier Mode 2 */}
            {mode === 'mode2' && (
              <div style={{ position: 'absolute', top: '70px', left: '-20px', right: '-20px', padding: '0.5rem', background: (time >= 10 && time < 20) ? 'rgba(255, 51, 51, 0.8)' : 'rgba(0, 255, 102, 0.8)', color: '#000', fontWeight: 'bold', fontSize: '0.75rem', borderRadius: '4px', zIndex: 30, transition: 'all 0.2s' }}>
                {(time >= 10 && time < 20) ? 'BUSY (Dropping Packets)' : 'STATUS: FREE'}
              </div>
            )}
            
            {/* The literal red barrier wall */}
            {mode === 'mode2' && time >= 10 && time < 20 && (
              <div style={{ position: 'absolute', top: '100px', bottom: '-150px', left: '-5px', width: '10px', background: '#ff3333', boxShadow: '0 0 15px #ff3333', zIndex: 5, animation: 'redWallPulse 0.5s infinite alternate' }} />
            )}

            {/* Strict DOM Window B Visualization */}
            <div style={{ marginTop: '4rem', display: 'flex', gap: '4px', position: 'relative', width: '300px', marginLeft: '-150px', justifyContent: 'flex-end', alignItems: 'center' }}>
               
               {/* Past Blocks (B) */}
               {windowBStart > 1 && (
                 <div style={{ display: 'flex', gap: '4px' }}>
                   {Array.from({length: windowBStart - 1}).map((_, i) => {
                     const id = i + 1;
                     return (
                       <div key={`past-b-${id}`} style={{ width: '24px', height: '24px', background: '#00ff66', border: '1px solid #00ff66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#000', fontWeight: 'bold', borderRadius: '2px', boxSizing: 'border-box' }}>
                         {id}
                       </div>
                     );
                   })}
                 </div>
               )}

               {/* ACTIVE WINDOW B */}
               <div id="Active-Window-B" style={{ display: 'flex', gap: '4px', border: '2px solid #00ff66', background: 'rgba(0,255,102,0.15)', padding: '2px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,255,102,0.3)', position: 'relative', transition: 'all 0.3s ease' }}>
                 <div style={{ position: 'absolute', top: '-20px', left: '0', color: '#00ff66', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>Active-Window-B</div>
                 {Array.from({length: 4}).map((_, i) => {
                   const id = windowBStart + i;
                   if (id > (mode === 'mode1' ? 12 : 8)) return null;
                   
                   const p = packetsData.find(x => x.id === id);
                   const hasArrived = mode === 'mode1' ? (time >= p.arr) : (time >= timeoutTime + p.arr && time > timeoutTime);
                   
                   return (
                     <div key={`active-b-${id}`} style={{ width: '24px', height: '24px', background: hasArrived ? '#00ff66' : '#333', border: `1px solid ${hasArrived ? '#00ff66' : '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: hasArrived ? '#000' : '#888', fontWeight: 'bold', borderRadius: '2px', boxSizing: 'border-box', boxShadow: hasArrived ? '0 0 8px #00ff66' : 'none', transition: 'background 0.2s' }}>
                       {id}
                     </div>
                   );
                 })}
               </div>

               {/* Future Blocks (B) */}
               {windowBStart + 3 < (mode === 'mode1' ? 12 : 8) && (
                 <div style={{ display: 'flex', gap: '4px' }}>
                   {Array.from({length: (mode === 'mode1' ? 12 : 8) - (windowBStart + 3)}).map((_, i) => {
                     const id = windowBStart + 4 + i;
                     return (
                       <div key={`future-b-${id}`} style={{ width: '24px', height: '24px', background: '#333', border: '1px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#888', fontWeight: 'bold', borderRadius: '2px', boxSizing: 'border-box' }}>
                         {id}
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* The Network Link */}
        <div style={{ position: 'absolute', top: '150px', left: '160px', right: '160px', height: '140px', borderTop: '2px dashed #444', borderBottom: '2px dashed #444' }}>
          {renderPackets()}

          {/* ACKs flying (Only Mode 1) */}
          {mode === 'mode1' && acksData.map(a => {
             if (time < a.sent || time > a.arr) return null;
             const progress = (time - a.sent) / (a.arr - a.sent);
             const leftPercent = 100 - Math.min(Math.max(progress * 100, 0), 100);

             return (
               <div key={`ack-${a.id}`} style={{ position: 'absolute', left: `${leftPercent}%`, bottom: '10px', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00ff66', fontWeight: 'bold', textShadow: '0 0 5px #00ff66', background: 'rgba(0,0,0,0.9)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(0,255,102,0.3)', zIndex: 50 }}>
                 <div style={{ width: '0', height: '0', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '10px solid #00ff66', filter: 'drop-shadow(0 0 5px #00ff66)' }}></div>
                 ACK {a.id}
               </div>
             );
          })}
        </div>

        {/* Bottom Area: Parameters & Overlays / Subtitles */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 20 }}>
          
          {/* Network Parameters Static Panel (Relocated to bottom) */}
          <div style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid #444', borderRadius: '8px', padding: '0.5rem 1.5rem', display: 'flex', gap: '2rem', fontSize: '0.8rem', color: '#aaa', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <div><strong style={{color: '#fff'}}>Transmission Time (T<sub>t</sub>):</strong> 2 µs</div>
            <div><strong style={{color: '#fff'}}>Propagation Time (T<sub>p</sub>):</strong> 8 µs</div>
            <div><strong style={{color: '#fff'}}>Window Size (W):</strong> 4 Segments</div>
          </div>

          {/* Dynamic Subtitles Container */}
          <div style={{ textAlign: 'center', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          
          {/* Mode 1 Overlays */}
          {mode === 'mode1' && (
            <>
              {time >= 10 && time < 14 && (
                 <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid #444' }}>Segment 1 arrives. B's Window stays strictly at [1, 2, 3, 4].</div>
              )}
              {time >= 14 && time < 16 && (
                 <div style={{ background: 'rgba(0,255,102,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #00ff66', color: '#00ff66' }}>Segment 3 arrives. ACK 3 is sent. B's Window slides to [4, 5, 6, 7].</div>
              )}
              {time >= 16 && time < 22 && (
                 <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid #444' }}>Segment 4 arrives and sits passively in B's new window.</div>
              )}
              {time >= 22 && time <= 33 && (
                 <div style={{ background: 'rgba(0,243,255,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #00f3ff', color: '#00f3ff' }}>
                   <strong>Crucial Concept:</strong> ACK 3 unlocks the window. Station A sends Segments 5 and 6.<br/>
                   <em>Wait... why not send 3 segments?</em> Because Segment 4 is ALREADY at Station B! This makes each subsequent batch cycle exactly 20 µs.
                 </div>
              )}
            </>
          )}

          {/* Mode 2 Overlays */}
          {mode === 'mode2' && (
            <>
              {time >= 10 && time < 12 && (
                 <div style={{ background: 'rgba(255,51,51,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff3333', color: '#ff3333' }}><strong>Segment 1: Dropped</strong></div>
              )}
              {time >= 12 && time < 14 && (
                 <div style={{ background: 'rgba(255,51,51,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff3333', color: '#ff3333' }}><strong>Segment 2: Dropped</strong></div>
              )}
              {time >= 14 && time < 16 && (
                 <div style={{ background: 'rgba(255,51,51,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff3333', color: '#ff3333' }}><strong>Segment 3: Dropped</strong></div>
              )}
              {time >= 16 && time < timeoutTime && (
                 <div style={{ background: 'rgba(255,51,51,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff3333', color: '#ff3333' }}><strong>Segment 4: Dropped</strong></div>
              )}
              {time >= timeoutTime && time < timeoutTime + 2 && (
                 <div style={{ background: 'rgba(255,51,51,0.4)', padding: '1.5rem', borderRadius: '8px', border: '2px solid #ff3333', color: '#fff', fontSize: '1.2rem', animation: 'redWallPulse 0.3s infinite alternate' }}>
                   <strong>TIMEOUT EXPIRED AT {timeoutTime} µs!</strong>
                 </div>
              )}
              {time >= timeoutTime + 2 && (
                 <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid #444', color: '#fff' }}>
                   Retransmitting... <br/>
                   <span style={{ color: '#ff3333' }}>New Total Time = {timeoutTime}µs (Timeout) + 82µs (Transfer) = <strong>{timeoutTime + 82} µs</strong></span>
                 </div>
              )}
            </>
          )}

          </div>
        </div>

      </div>

      <style>{`
        @keyframes redWallPulse {
          0% { box-shadow: 0 0 10px #ff3333; opacity: 0.8; }
          100% { box-shadow: 0 0 30px #ff3333; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
