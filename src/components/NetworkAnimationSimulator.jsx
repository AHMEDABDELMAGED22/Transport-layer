import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

// ─── Timing Data ────────────────────────────────────────────────────────────
const MAX_TIME_MODE1 = 82; // Absolute ceiling

const packetsData = [
  // Cycle 1  (Seg 1–4, 0-8µs tx, arrive 10–16µs)
  { id: 1,  txStart: 0,  txEnd: 2,  arr: 10 },
  { id: 2,  txStart: 2,  txEnd: 4,  arr: 12 },
  { id: 3,  txStart: 4,  txEnd: 6,  arr: 14 },
  { id: 4,  txStart: 6,  txEnd: 8,  arr: 16 },
  // Cycle 2  (Seg 5–7, start after ACK3 at 22µs)
  { id: 5,  txStart: 22, txEnd: 24, arr: 32 },
  { id: 6,  txStart: 24, txEnd: 26, arr: 34 },
  { id: 7,  txStart: 26, txEnd: 28, arr: 36 },
  // Cycle 3  (Seg 8–10, start after ACK6 at 42µs)
  { id: 8,  txStart: 42, txEnd: 44, arr: 52 },
  { id: 9,  txStart: 44, txEnd: 46, arr: 54 },
  { id: 10, txStart: 46, txEnd: 48, arr: 56 },
  // Cycle 4  (Seg 11–12, start after ACK9 at 62µs)
  { id: 11, txStart: 62, txEnd: 64, arr: 72 },
  { id: 12, txStart: 64, txEnd: 66, arr: 74 }, // File completely delivered at 74µs
];

const acksData = [
  { id: 3,  sent: 14, arr: 22 },
  { id: 6,  sent: 34, arr: 42 },
  { id: 9,  sent: 54, arr: 62 },
  { id: 12, sent: 74, arr: 82 }, // Final ACK completes at 82µs
];

// ─── Window Slide Logic ──────────────────────────────────────────────────────
// Station A window (sender): [1–4] → [4–7] at 22µs → [7–10] at 42µs → [10–12] at 62µs
const getWindowAStart = (t) => {
  if (t < 22) return 1;
  if (t < 42) return 4;
  if (t < 62) return 7;
  return 10;
};
const getWindowASize = (t) => (t >= 62 ? 3 : 4); // Final window has only 3 segs

// Station B window (receiver): [1–4] → [4–7] at 14µs → [7–10] at 34µs → [10–12] at 54µs
const getWindowBStart = (t) => {
  if (t < 14) return 1;
  if (t < 34) return 4;
  if (t < 54) return 7;
  return 10;
};
const getWindowBSize = (t) => (t >= 54 ? 3 : 4);

// ─── Mode 2 Helpers ──────────────────────────────────────────────────────────
// Mode 2: B is busy from 10–20µs, drops all 4 segments.
// Timer starts at t=0 (a1) or t=2 (a2). Timeout at 22 or 24µs.
const getTimeoutTime = (assumption) => (assumption === 'a1' ? 22 : 24);
const MAX_TIME_MODE2 = (assumption) => (assumption === 'a1' ? 35 : 37);

// ─── Freeze Triggers ─────────────────────────────────────────────────────────
const FREEZE_TRIGGERS_MODE1 = [10, 14, 16, 22, 34, 42];

// ─── Component ───────────────────────────────────────────────────────────────
export default function NetworkAnimationSimulator() {
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.25);
  const [mode, setMode] = useState('mode1');
  const [assumption, setAssumption] = useState('a1');

  const requestRef = useRef();
  const lastUpdateRef = useRef();
  const freezeUntilRef = useRef(0);
  const isFrozenRef = useRef(false);
  const passedTriggersRef = useRef(new Set());

  // ── Milestone message state ──────────────────────────────────────────────
  const [milestoneMsg, setMilestoneMsg] = useState(null); // null | '74' | '82'
  const milestone74Shown = useRef(false);
  const milestone82Shown = useRef(false);

  const maxTime = mode === 'mode1' ? MAX_TIME_MODE1 : MAX_TIME_MODE2(assumption);
  const timeoutTime = getTimeoutTime(assumption);

  // ── Animation loop ────────────────────────────────────────────────────────
  const animate = useCallback((timestamp) => {
    if (!isPlaying) return;

    if (isFrozenRef.current) {
      if (timestamp >= freezeUntilRef.current) {
        isFrozenRef.current = false;
        lastUpdateRef.current = timestamp;
      } else {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
    }

    if (lastUpdateRef.current !== undefined) {
      const delta = timestamp - lastUpdateRef.current;
      let newTime = timeRef.current + (delta / 1000) * 10 * speed;

      const triggers = mode === 'mode1'
        ? FREEZE_TRIGGERS_MODE1
        : [10, 14, timeoutTime];

      for (const t of triggers) {
        if (timeRef.current < t && newTime >= t && !passedTriggersRef.current.has(t)) {
          newTime = t;
          isFrozenRef.current = true;
          freezeUntilRef.current = timestamp + 2000;
          passedTriggersRef.current.add(t);
          break;
        }
      }

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
  }, [isPlaying, speed, mode, maxTime, timeoutTime]);

  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, animate]);

  // ── Milestone triggers ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'mode1') return;
    if (time >= 74 && !milestone74Shown.current) {
      milestone74Shown.current = true;
      setMilestoneMsg('74');
    }
    if (time >= 82 && !milestone82Shown.current) {
      milestone82Shown.current = true;
      setMilestoneMsg('82');
    }
  }, [time, mode]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePlay = () => setIsPlaying(p => !p);

  const reset = () => {
    setTime(0);
    timeRef.current = 0;
    setIsPlaying(false);
    isFrozenRef.current = false;
    passedTriggersRef.current = new Set();
    milestone74Shown.current = false;
    milestone82Shown.current = false;
    setMilestoneMsg(null);
  };

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setTime(val);
    timeRef.current = val;
    setIsPlaying(false);
    isFrozenRef.current = false;

    const triggers = mode === 'mode1' ? FREEZE_TRIGGERS_MODE1 : [10, 14, timeoutTime];
    const passed = new Set();
    triggers.forEach(t => { if (val >= t) passed.add(t); });
    passedTriggersRef.current = passed;

    // Recompute milestone visibility from slider
    if (mode === 'mode1') {
      if (val >= 82) { milestone74Shown.current = true; milestone82Shown.current = true; setMilestoneMsg('82'); }
      else if (val >= 74) { milestone74Shown.current = true; milestone82Shown.current = false; setMilestoneMsg('74'); }
      else { milestone74Shown.current = false; milestone82Shown.current = false; setMilestoneMsg(null); }
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
  };

  const switchAssumption = (newAssump) => {
    setAssumption(newAssump);
    reset();
  };

  // ── Window helpers ────────────────────────────────────────────────────────
  const windowAStart = mode === 'mode1' ? getWindowAStart(time) : 1;
  const windowASize  = mode === 'mode1' ? getWindowASize(time)  : 4;
  const windowBStart = mode === 'mode1' ? getWindowBStart(time) : 1;
  const windowBSize  = mode === 'mode1' ? getWindowBSize(time)  : 4;

  // ── Packet rendering ──────────────────────────────────────────────────────
  const renderPackets = () => {
    let packets = mode === 'mode1' ? packetsData : packetsData.slice(0, 4);

    if (mode === 'mode2' && time >= timeoutTime) {
      packets = [
        ...packets,
        { id: 1, txStart: timeoutTime,     txEnd: timeoutTime + 2,  arr: timeoutTime + 10, isRetx: true },
        { id: 2, txStart: timeoutTime + 2,  txEnd: timeoutTime + 4,  arr: timeoutTime + 12, isRetx: true },
        { id: 3, txStart: timeoutTime + 4,  txEnd: timeoutTime + 6,  arr: timeoutTime + 14, isRetx: true },
        { id: 4, txStart: timeoutTime + 6,  txEnd: timeoutTime + 8,  arr: timeoutTime + 16, isRetx: true },
      ];
    }

    return packets.map((p, i) => {
      if (time < p.txStart || time > p.arr) return null;

      const progress = (time - p.txStart) / (p.arr - p.txStart);
      const leftPct = Math.min(Math.max(progress * 100, 0), 100);

      const isDropped = mode === 'mode2' && !p.isRetx && leftPct >= 99 && time >= 10 && time <= 20;

      const glowColor = isDropped ? '#ff3333' : (p.isRetx ? '#ffaa00' : '#00f3ff');

      return (
        <div
          key={`fly-${p.id}-${i}`}
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            top: '12px',
            transform: `translateX(-50%) ${isDropped ? 'scale(2) rotate(30deg)' : 'scale(1)'}`,
            width: '34px',
            height: '34px',
            background: isDropped ? 'rgba(255,51,51,0.3)' : 'rgba(0,0,0,0.95)',
            border: `2px solid ${glowColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: glowColor,
            fontWeight: 'bold',
            fontSize: '0.85rem',
            borderRadius: '6px',
            boxShadow: `0 0 18px ${glowColor}, 0 0 6px ${glowColor}`,
            opacity: isDropped ? 0 : 1,
            transition: isDropped ? 'all 0.5s ease-out' : 'none',
            zIndex: 60,
            fontFamily: 'monospace',
          }}
        >
          {p.id}
        </div>
      );
    });
  };

  // ── ACK rendering ─────────────────────────────────────────────────────────
  const renderAcks = () => {
    if (mode !== 'mode1') return null;
    return acksData.map(a => {
      if (time < a.sent || time > a.arr) return null;
      const progress = (time - a.sent) / (a.arr - a.sent);
      const leftPct = 100 - Math.min(Math.max(progress * 100, 0), 100);
      return (
        <div
          key={`ack-${a.id}`}
          style={{
            position: 'absolute',
            left: `${leftPct}%`,
            bottom: '12px',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#00ff88',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            textShadow: '0 0 8px #00ff88',
            background: 'rgba(0,0,0,0.92)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1.5px solid rgba(0,255,136,0.5)',
            boxShadow: '0 0 14px rgba(0,255,136,0.5)',
            zIndex: 60,
          }}
        >
          <span style={{ fontSize: '0.75rem' }}>◀</span>
          ACK {a.id}
        </div>
      );
    });
  };

  // ── Window Block Row ──────────────────────────────────────────────────────
  // Renders a full 12-block row with the active window highlighted.
  const renderWindowRow = (start, size, color, glowColor, totalBlocks, ackedUpTo) => {
    return (
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexWrap: 'nowrap' }}>
        {Array.from({ length: totalBlocks }, (_, i) => {
          const id = i + 1;
          const inWindow = id >= start && id < start + size;
          const isPast = id < start;
          const isFuture = id >= start + size;

          const bgColor = isPast
            ? 'rgba(0,255,136,0.25)'
            : inWindow
            ? 'rgba(0,0,0,0.7)'
            : 'rgba(255,255,255,0.03)';

          const borderColor = isPast
            ? 'rgba(0,255,136,0.4)'
            : inWindow
            ? color
            : 'rgba(255,255,255,0.12)';

          const boxShadow = inWindow ? `0 0 8px ${glowColor}` : 'none';

          const isAcked = ackedUpTo !== undefined && id <= ackedUpTo;

          return (
            <div
              key={id}
              style={{
                width: '26px',
                height: '26px',
                background: isAcked ? 'rgba(0,255,136,0.35)' : bgColor,
                border: `1.5px solid ${isAcked ? '#00ff88' : borderColor}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.68rem',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: isPast || isAcked ? '#00ff88' : inWindow ? color : 'rgba(255,255,255,0.3)',
                boxShadow: inWindow ? boxShadow : 'none',
                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                outline: inWindow ? `1px solid ${glowColor}` : 'none',
                outlineOffset: '2px',
                position: 'relative',
              }}
            >
              {id}
              {inWindow && (
                <span style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '14px',
                  height: '2px',
                  background: color,
                  borderRadius: '1px',
                  boxShadow: `0 0 4px ${color}`,
                }}/>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Dynamic Subtitle ──────────────────────────────────────────────────────
  const renderSubtitle = () => {
    if (mode === 'mode2') {
      if (time >= 10 && time < 12)  return <Overlay red>Segment 1: Dropped — Station B is BUSY</Overlay>;
      if (time >= 12 && time < 14)  return <Overlay red>Segment 2: Dropped — Station B is BUSY</Overlay>;
      if (time >= 14 && time < 16)  return <Overlay red>Segment 3: Dropped — Station B is BUSY</Overlay>;
      if (time >= 16 && time < timeoutTime) return <Overlay red>Segment 4: Dropped — Station B is BUSY</Overlay>;
      if (time >= timeoutTime && time < timeoutTime + 2)
        return <Overlay red pulse><strong>TIMEOUT EXPIRED AT {timeoutTime} µs! — Retransmitting all 4 segments</strong></Overlay>;
      if (time >= timeoutTime + 2)
        return (
          <Overlay dark>
            Retransmitting segments 1–4…<br />
            <span style={{ color: '#ff6666' }}>
              New Total Time = {timeoutTime}µs (Timeout) + 82µs (Transfer) = <strong>{timeoutTime + 82} µs</strong>
            </span>
          </Overlay>
        );
      return null;
    }

    // Mode 1
    if (time >= 10 && time < 14)
      return <Overlay dark>Segment 1 arrives at B. Window stays at [1, 2, 3, 4] — waiting for Segment 3.</Overlay>;
    if (time >= 14 && time < 16)
      return <Overlay green>✓ Segment 3 arrives. ACK 3 dispatched. B's window slides → [4, 5, 6, 7].</Overlay>;
    if (time >= 16 && time < 22)
      return <Overlay dark>Segment 4 arrives and waits in B's new window. ACK 3 still in flight.</Overlay>;
    if (time >= 22 && time < 34)
      return (
        <Overlay cyan>
          <strong>Crucial Concept:</strong> ACK 3 unlocks A's window → A sends Seg 5 &amp; 6.<br/>
          <em>Only 2 new segments because Seg 4 was already at B!</em> Each cycle = exactly 20 µs.
        </Overlay>
      );
    if (time >= 34 && time < 42)
      return <Overlay green>✓ Segment 6 arrives. ACK 6 dispatched. B's window slides → [7, 8, 9, 10].</Overlay>;
    if (time >= 42 && time < 54)
      return <Overlay cyan><strong>ACK 6</strong> received by A. Window slides → [7, 8, 9, 10]. Sending Seg 8 &amp; 9.</Overlay>;
    if (time >= 54 && time < 62)
      return <Overlay green>✓ Segment 9 arrives. ACK 9 dispatched. B's window slides → [10, 11, 12].</Overlay>;
    if (time >= 62 && time < 74)
      return <Overlay cyan><strong>ACK 9</strong> received. Final window: [10, 11, 12]. Sending last segments…</Overlay>;
    return null;
  };

  // ── Milestone Banner ─────────────────────────────────────────────────────
  const renderMilestoneBanner = () => {
    if (mode !== 'mode1' || !milestoneMsg) return null;
    const is82 = milestoneMsg === '82';
    return (
      <div style={{
        marginTop: '0.75rem',
        padding: '0.9rem 1.4rem',
        borderRadius: '10px',
        background: is82
          ? 'linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,243,255,0.08))'
          : 'linear-gradient(135deg, rgba(0,243,255,0.12), rgba(0,255,136,0.06))',
        border: `2px solid ${is82 ? '#00ff88' : '#00f3ff'}`,
        boxShadow: is82
          ? '0 0 28px rgba(0,255,136,0.4), 0 0 8px rgba(0,255,136,0.2)'
          : '0 0 28px rgba(0,243,255,0.4), 0 0 8px rgba(0,243,255,0.2)',
        animation: 'milestoneFlash 1.2s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <span style={{
          fontSize: '1.5rem',
          filter: `drop-shadow(0 0 8px ${is82 ? '#00ff88' : '#00f3ff'})`,
        }}>{is82 ? '🏁' : '📦'}</span>
        <div>
          <div style={{
            fontWeight: 800,
            fontSize: '0.95rem',
            color: is82 ? '#00ff88' : '#00f3ff',
            textShadow: `0 0 12px ${is82 ? '#00ff88' : '#00f3ff'}`,
            letterSpacing: '0.02em',
          }}>
            {is82
              ? 'Station A receives the final acknowledgment at 82 µs, confirming the transfer.'
              : 'The file is completely delivered to Station B at 74 µs.'}
          </div>
          {is82 && (
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
              Total RTT: Seg 12 tx ends at 66µs → arrives at 74µs → ACK 12 returns at 82µs ✓
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Acked segment count for windows ───────────────────────────────────────
  const ackedA = (() => {
    // A's acked count follows ACK arrivals
    if (mode !== 'mode1') return 0;
    if (time >= 62) return 9;
    if (time >= 42) return 6;
    if (time >= 22) return 3;
    return 0;
  })();

  const receivedB = (() => {
    if (mode !== 'mode1') return 0;
    if (time >= 74) return 12;
    if (time >= 72) return 11;
    if (time >= 56) return 10;
    if (time >= 54) return 9;
    if (time >= 52) return 8;
    if (time >= 36) return 7;
    if (time >= 34) return 6;
    if (time >= 32) return 5;
    if (time >= 16) return 4;
    if (time >= 14) return 3;
    if (time >= 12) return 2;
    if (time >= 10) return 1;
    return 0;
  })();

  const TOTAL_SEGS = mode === 'mode1' ? 12 : 8;

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      backgroundColor: '#111827',
      color: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative',
      boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    }}>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes milestoneFlash {
          0%   { opacity: 0; transform: scale(0.97); }
          20%  { opacity: 1; transform: scale(1.02); }
          40%  { transform: scale(0.99); }
          60%  { transform: scale(1.01); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,51,51,0.6); }
          50%       { box-shadow: 0 0 28px rgba(255,51,51,1); }
        }
        @keyframes windowSlide {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
        @keyframes tickerGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.4); }
          50%       { text-shadow: 0 0 20px rgba(255,255,255,0.9); }
        }
      `}</style>

      {/* ── Mode Tabs ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { key: 'mode1', label: 'Mode 1: Normal Operation (82 µs)', activeColor: '#00f3ff' },
          { key: 'mode2', label: 'Mode 2: Station B Busy & Timeout', activeColor: '#ff4444' },
        ].map(({ key, label, activeColor }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              background: mode === key ? `rgba(${key === 'mode1' ? '0,243,255' : '255,68,68'},0.08)` : 'transparent',
              color: mode === key ? activeColor : 'rgba(255,255,255,0.4)',
              border: 'none',
              borderBottom: mode === key ? `2.5px solid ${activeColor}` : '2.5px solid transparent',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              letterSpacing: '0.01em',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Controls Bar ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#1a2235',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            background: mode === 'mode1' ? '#00f3ff' : '#ff4444',
            border: 'none',
            borderRadius: '50%',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: mode === 'mode1' ? '0 0 14px rgba(0,243,255,0.5)' : '0 0 14px rgba(255,68,68,0.5)',
            flexShrink: 0,
          }}
        >
          {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" />}
        </button>

        {/* Reset */}
        <button
          onClick={reset}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}
        >
          <RotateCcw size={18} />
        </button>

        {/* Speed */}
        <div style={{ display: 'flex', gap: '4px', background: '#111827', padding: '3px', borderRadius: '8px', flexShrink: 0 }}>
          {[0.25, 0.5, 1].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                background: speed === s ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: speed === s ? (mode === 'mode1' ? '#00f3ff' : '#ff4444') : 'rgba(255,255,255,0.4)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Timer + Slider */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: time >= 82 && mode === 'mode1' ? '#00ff88' : '#fff',
              animation: isPlaying ? 'tickerGlow 1.2s infinite' : 'none',
              transition: 'color 0.5s',
            }}>
              {Math.min(time, maxTime).toFixed(1)}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>µs</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
              / {maxTime} µs max
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxTime}
            step={0.1}
            value={Math.min(time, maxTime)}
            onChange={handleSlider}
            style={{ width: '100%', accentColor: mode === 'mode1' ? '#00f3ff' : '#ff4444', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* ── Main Arena ───────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', minHeight: '460px', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Top row: Station A + Station B */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>

          {/* ── Station A Panel ─────────────────────────────────────────── */}
          <div style={{ flex: '0 0 auto', minWidth: '200px' }}>
            <StationBox label="Station A" sublabel="Sender" color="#00f3ff" />
            
            {/* Window A */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#00f3ff', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>
                Active-Window-A
                <span style={{ marginLeft: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, textTransform: 'none' }}>
                  [{windowAStart}–{windowAStart + windowASize - 1}]
                </span>
              </div>
              <div id="Active-Window-A" style={{
                display: 'inline-flex',
                gap: '3px',
                border: '2px solid #00f3ff',
                background: 'rgba(0,243,255,0.06)',
                padding: '4px',
                borderRadius: '6px',
                boxShadow: '0 0 14px rgba(0,243,255,0.25)',
                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                animation: 'windowSlide 0.4s ease',
              }}>
                {Array.from({ length: windowASize }, (_, i) => {
                  const id = windowAStart + i;
                  if (id > TOTAL_SEGS) return null;
                  const p = packetsData.find(x => x.id === id);
                  const sent = p && time >= p.txStart;
                  return (
                    <BlockCell key={id} id={id} dim={sent} color="#00f3ff" />
                  );
                })}
              </div>
              {/* Past blocks indicator */}
              {ackedA > 0 && (
                <div style={{ marginTop: '6px', fontSize: '0.68rem', color: 'rgba(0,255,136,0.7)' }}>
                  ✓ Segments 1–{ackedA} acknowledged
                </div>
              )}
            </div>

            {/* Mode 2 Assumption toggle */}
            {mode === 'mode2' && (
              <div style={{ marginTop: '2rem', background: '#1a2235', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 700 }}>Timer Assumption:</div>
                {[{ val: 'a1', label: 'Timer starts at t=0' }, { val: 'a2', label: 'Timer starts at t=2' }].map(({ val, label }) => (
                  <label key={val} style={{ display: 'block', marginBottom: '0.4rem', cursor: 'pointer', color: assumption === val ? '#ff4444' : 'rgba(255,255,255,0.6)' }}>
                    <input type="radio" checked={assumption === val} onChange={() => switchAssumption(val)} style={{ marginRight: '6px' }} />
                    {label}
                  </label>
                ))}
                <div style={{ marginTop: '0.5rem', color: '#ff4444', fontWeight: 700 }}>Timeout: {timeoutTime} µs</div>
              </div>
            )}
          </div>

          {/* ── Network Channel ──────────────────────────────────────────── */}
          <div style={{ flex: 1, position: 'relative', height: '130px', alignSelf: 'center', margin: '0 1rem' }}>
            {/* Channel lanes */}
            <div style={{
              position: 'absolute',
              top: '15px', left: 0, right: 0,
              height: '40px',
              background: 'linear-gradient(90deg, rgba(0,243,255,0.03), rgba(0,243,255,0.06), rgba(0,243,255,0.03))',
              borderTop: '1px solid rgba(0,243,255,0.15)',
              borderBottom: '1px solid rgba(0,243,255,0.15)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '15px', left: 0, right: 0,
              height: '40px',
              background: 'linear-gradient(90deg, rgba(0,255,136,0.03), rgba(0,255,136,0.06), rgba(0,255,136,0.03))',
              borderTop: '1px solid rgba(0,255,136,0.15)',
              borderBottom: '1px solid rgba(0,255,136,0.15)',
            }} />

            {/* Lane labels */}
            <div style={{ position: 'absolute', top: '18px', left: '-32px', fontSize: '0.6rem', color: 'rgba(0,243,255,0.5)', writingMode: 'horizontal-tb' }}>▶ DATA</div>
            <div style={{ position: 'absolute', bottom: '18px', left: '-28px', fontSize: '0.6rem', color: 'rgba(0,255,136,0.5)' }}>◀ ACK</div>

            {/* Packets & ACKs */}
            <div style={{ position: 'absolute', top: '15px', left: 0, right: 0, height: '40px', overflow: 'visible' }}>
              {renderPackets()}
            </div>
            <div style={{ position: 'absolute', bottom: '15px', left: 0, right: 0, height: '40px', overflow: 'visible' }}>
              {renderAcks()}
            </div>

            {/* Mode 2 busy wall */}
            {mode === 'mode2' && time >= 10 && time < 20 && (
              <div style={{
                position: 'absolute',
                right: 0, top: 0, bottom: 0, width: '6px',
                background: '#ff4444',
                boxShadow: '0 0 18px #ff4444',
                animation: 'neonPulse 0.5s infinite alternate',
                zIndex: 5,
              }} />
            )}
          </div>

          {/* ── Station B Panel ──────────────────────────────────────────── */}
          <div style={{ flex: '0 0 auto', minWidth: '200px', textAlign: 'right' }}>
            <StationBox label="Station B" sublabel="Receiver" color="#00ff88" align="right" />

            {/* Busy badge (Mode 2) */}
            {mode === 'mode2' && (
              <div style={{
                marginTop: '0.5rem',
                display: 'inline-block',
                padding: '4px 12px',
                background: (time >= 10 && time < 20) ? 'rgba(255,68,68,0.3)' : 'rgba(0,255,136,0.15)',
                border: `1px solid ${(time >= 10 && time < 20) ? '#ff4444' : '#00ff88'}`,
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: (time >= 10 && time < 20) ? '#ff4444' : '#00ff88',
                transition: 'all 0.3s',
                animation: (time >= 10 && time < 20) ? 'neonPulse 0.5s infinite alternate' : 'none',
              }}>
                {(time >= 10 && time < 20) ? 'BUSY – Dropping' : 'READY'}
              </div>
            )}

            {/* Window B */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.68rem', color: '#00ff88', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}>
                <span style={{ marginRight: '6px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, textTransform: 'none' }}>
                  [{windowBStart}–{windowBStart + windowBSize - 1}]
                </span>
                Active-Window-B
              </div>
              <div id="Active-Window-B" style={{
                display: 'inline-flex',
                gap: '3px',
                border: '2px solid #00ff88',
                background: 'rgba(0,255,136,0.06)',
                padding: '4px',
                borderRadius: '6px',
                boxShadow: '0 0 14px rgba(0,255,136,0.25)',
                transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {Array.from({ length: windowBSize }, (_, i) => {
                  const id = windowBStart + i;
                  if (id > TOTAL_SEGS) return null;
                  const p = packetsData.find(x => x.id === id);
                  const arrived = mode === 'mode1' ? (p && time >= p.arr) : false;
                  return (
                    <BlockCell key={id} id={id} arrived={arrived} color="#00ff88" />
                  );
                })}
              </div>
              {receivedB > 0 && mode === 'mode1' && (
                <div style={{ marginTop: '6px', fontSize: '0.68rem', color: 'rgba(0,255,136,0.7)' }}>
                  ✓ Segments 1–{receivedB} received
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Full segment row (Mode 1) ─────────────────────────────────── */}
        {mode === 'mode1' && (
          <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Station A — Sender Window</div>
                {renderWindowRow(windowAStart, windowASize, '#00f3ff', 'rgba(0,243,255,0.4)', TOTAL_SEGS, ackedA)}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Station B — Receiver Window</div>
                {renderWindowRow(windowBStart, windowBSize, '#00ff88', 'rgba(0,255,136,0.4)', TOTAL_SEGS, receivedB)}
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: '2px', display: 'inline-block' }}/>
                Future
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', border: '1.5px solid #00f3ff', borderRadius: '2px', display: 'inline-block', boxShadow: '0 0 6px rgba(0,243,255,0.4)' }}/>
                In Window
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', background: 'rgba(0,255,136,0.35)', border: '1.5px solid #00ff88', borderRadius: '2px', display: 'inline-block' }}/>
                ACKed / Received
              </span>
            </div>
          </div>
        )}

        {/* ── Network Parameters ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          padding: '0.6rem 1.2rem',
          border: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.55)',
          flexWrap: 'wrap',
        }}>
          <span><strong style={{ color: '#fff' }}>T<sub>t</sub>:</strong> 2 µs</span>
          <span><strong style={{ color: '#fff' }}>T<sub>p</sub>:</strong> 8 µs</span>
          <span><strong style={{ color: '#fff' }}>Window (W):</strong> 4 segments</span>
          <span><strong style={{ color: '#fff' }}>Total segments:</strong> {TOTAL_SEGS}</span>
          {mode === 'mode1' && <span><strong style={{ color: '#00ff88' }}>Timer ceiling:</strong> 82 µs</span>}
        </div>

        {/* ── Dynamic Subtitle ──────────────────────────────────────────── */}
        <div style={{ minHeight: '62px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {renderSubtitle()}
          {renderMilestoneBanner()}
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StationBox({ label, sublabel, color, align = 'left' }) {
  return (
    <div style={{
      background: `rgba(${color === '#00f3ff' ? '0,243,255' : '0,255,136'},0.06)`,
      border: `2px solid ${color}`,
      borderRadius: '10px',
      padding: '0.75rem 1rem',
      boxShadow: `0 0 22px rgba(${color === '#00f3ff' ? '0,243,255' : '0,255,136'},0.18)`,
      textAlign: align,
    }}>
      <h3 style={{ color, margin: 0, fontSize: '1rem', fontWeight: 800, textShadow: `0 0 8px ${color}` }}>{label}</h3>
      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{sublabel}</div>
    </div>
  );
}

function BlockCell({ id, dim, arrived, color }) {
  const active = arrived || false;
  return (
    <div style={{
      width: '26px',
      height: '26px',
      background: active ? `rgba(${color === '#00f3ff' ? '0,243,255' : '0,255,136'},0.3)` : 'rgba(255,255,255,0.05)',
      border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.7rem',
      fontWeight: 700,
      fontFamily: 'monospace',
      color: active ? color : (dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)'),
      boxShadow: active ? `0 0 10px ${color}` : 'none',
      transition: 'all 0.3s ease',
    }}>
      {id}
    </div>
  );
}

function Overlay({ children, cyan, green, red, dark, pulse }) {
  const bg = red
    ? 'rgba(255,51,51,0.12)'
    : green
    ? 'rgba(0,255,136,0.1)'
    : cyan
    ? 'rgba(0,243,255,0.1)'
    : 'rgba(255,255,255,0.05)';

  const border = red
    ? '#ff4444'
    : green
    ? '#00ff88'
    : cyan
    ? '#00f3ff'
    : 'rgba(255,255,255,0.12)';

  const textColor = red ? '#ff6666' : green ? '#00ff88' : cyan ? '#00e5ff' : '#ccc';

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      background: bg,
      border: `1.5px solid ${border}`,
      color: textColor,
      fontSize: '0.82rem',
      lineHeight: 1.55,
      animation: pulse ? 'neonPulse 0.4s infinite alternate' : 'none',
      boxShadow: `0 0 12px rgba(${red ? '255,68,68' : green ? '0,255,136' : cyan ? '0,243,255' : '255,255,255'},0.08)`,
    }}>
      {children}
    </div>
  );
}
