import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import TransportLayerIntro from './components/TransportLayerIntro';
import CRCDemo from './components/CRCDemo';
import TCPvsUDP from './components/TCPvsUDP';
import PortNumbers from './components/PortNumbers';
import FlowControlIntro from './components/FlowControlIntro';
import StopAndWaitFlow from './components/StopAndWaitFlow';
import SlidingWindowSimulator from './components/SlidingWindowSimulator';
import SlidingWindowWalkthrough from './components/SlidingWindowWalkthrough';
import ErrorControlIntro from './components/ErrorControlIntro';
import StopAndWaitARQ from './components/StopAndWaitARQ';
import GoBackNARQ from './components/GoBackNARQ';
import SelectiveRejectARQ from './components/SelectiveRejectARQ';
import ProblemWorkspace from './components/ProblemWorkspace';
import SummarySection from './components/SummarySection';

function App() {
  const [activeSection, setActiveSection] = useState('hero');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      <Sidebar activeSection={activeSection} />
      
      <main style={{ marginLeft: '280px', width: 'calc(100% - 280px)' }}>
        <HeroSection id="hero" setActiveSection={setActiveSection} />
        <TransportLayerIntro id="transport-layer" setActiveSection={setActiveSection} />
        <CRCDemo id="crc" setActiveSection={setActiveSection} />
        <TCPvsUDP id="tcp-vs-udp" setActiveSection={setActiveSection} />
        <PortNumbers id="ports" setActiveSection={setActiveSection} />
        <FlowControlIntro id="flow-control" setActiveSection={setActiveSection} />
        <StopAndWaitFlow id="stop-and-wait" setActiveSection={setActiveSection} />
        <SlidingWindowSimulator id="sliding-window" setActiveSection={setActiveSection} />
        <SlidingWindowWalkthrough id="sliding-walkthrough" setActiveSection={setActiveSection} />
        <ErrorControlIntro id="error-control" setActiveSection={setActiveSection} />
        <StopAndWaitARQ id="stop-wait-arq" setActiveSection={setActiveSection} />
        <GoBackNARQ id="go-back-n" setActiveSection={setActiveSection} />
        <SelectiveRejectARQ id="selective-reject" setActiveSection={setActiveSection} />
        <ProblemWorkspace id="problems" setActiveSection={setActiveSection} />
        <SummarySection id="summary" setActiveSection={setActiveSection} />
      </main>
    </div>
  );
}

export default App;
