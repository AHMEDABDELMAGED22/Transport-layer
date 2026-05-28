# MASTER PROMPT: Build an Interactive Transport Layer Lecture Website

## CONTEXT
I have a 39-page Computer Networks lecture (Lecture 6: Transport Layer) in PDF format. I need you to build a **single, comprehensive, interactive educational website** that explains every concept, diagram, table, and problem from this lecture in extreme detail. The website should be visually stunning, fully interactive, and follow the exact page-by-page flow of the lecture.

## TARGET AUDIENCE
Computer science students who are visual learners and need step-by-step explanations with interactive examples.

## DESIGN REQUIREMENTS
- **Theme**: Dark mode cybersecurity/networking aesthetic (deep blues, neon cyans, electric purples, dark charcoal backgrounds)
- **Typography**: Clean, modern sans-serif. Monospace for technical terms and code/diagrams.
- **Layout**: Single-page scrolling experience with a sticky navigation sidebar that tracks progress.
- **Animations**: Smooth scroll-triggered fade-ins, packet transmission animations, sliding window visualizations, and interactive state changes.
- **Responsiveness**: Must work perfectly on desktop, tablet, and mobile.

## STRUCTURE — FOLLOW THE LECTURE EXACTLY (39 Pages)

### Section 1: Hero / Introduction
- Big animated title: "Transport Layer: The Internet's Delivery Service"
- Subtitle: "A complete interactive breakdown of Lecture 6"
- Background: Animated particles representing data packets flowing through a network mesh
- CTA button: "Start Learning" that smooth-scrolls to Section 2

### Section 2: What is the Transport Layer? (Pages 1-2)
- **TCP/IP Stack Visualization**: An interactive 4-layer building diagram. Each floor is clickable and expands to show its role.
  - Floor 4 (Top): Application Layer — HTTP, FTP, RTP icons
  - Floor 3: Transport Layer — TCP/UDP icons (THIS FLOOR IS HIGHLIGHTED/GLOWING)
  - Floor 2: Internet Layer — IPv4, IPv6 icons
  - Floor 1 (Bottom): Network Access — WiFi, Ethernet, ATM icons
- **The 6 Responsibilities**: Six interactive cards that flip on hover to reveal:
  1. Session Establishment — "Hey, can we talk?"
  2. Session Termination — "We're done. Goodbye!"
  3. Session Management — "Let's stay organized."
  4. Segmentation — "Break big data into chunks called segments"
  5. Sequencing — "Number every chunk"
  6. Error Detection & Correction — "Check and fix corruption"
- **Pizza Analogy Interactive**: A mini-game where users drag a large pizza to a small door. It breaks into 8 numbered slices. Users see that if slice #3 drops, they know exactly which one to request again.

### Section 3: Error Detection — CRC (Page 3)
- **CRC Interactive Demo**:
  - A "segment" data block with bits (0s and 1s)
  - A "magic CRC machine" animation: user clicks "Generate CRC", the machine runs a math equation, and a 4-byte checksum pops out and attaches to the segment like a sticky note
  - Split-screen: Sender side and Receiver side
  - User can "corrupt" a bit by clicking it (flip 0→1). The receiver runs the same equation. If checksums DON'T match, a red alert flashes: "CORRUPTED — DROP SEGMENT" and the segment falls into a trash can
  - If they match: green checkmark "CLEAN DATA"
- **Simple explanation text** below the demo explaining the 4-byte CRC result

### Section 4: TCP vs UDP — The Two Delivery Services (Pages 5-6)
- **Side-by-side comparison**: Two delivery vehicles
  - Left: Armored FedEx truck labeled "TCP" — features list appears on hover:
    - ✅ Guaranteed delivery
    - ✅ Ordered sequencing
    - ✅ Error checking
    - ✅ Flow control
    - 🐢 Slower but reliable
    - Apps: HTTP, HTTPS, SMTP, POP3, FTP, SSH, Telnet (show icons/logos)
  - Right: Speed motorcycle labeled "UDP" — features list on hover:
    - ⚡ Extremely fast
    - ❌ No guarantees
    - ❌ No retransmission
    - ❌ No ordering
    - Apps: RTP (video/voice), Gaming, DHCP, TFTP, SNMP, DNS (user→server)
- **Interactive Scenario**: "You're on a Zoom call. Do you want TCP or UDP?"
  - User clicks TCP → animation shows 3-second delay waiting for "perfect frame" while boss is talking. User gets fired (funny animation).
  - User clicks UDP → tiny glitch for 0.5s, call continues smoothly. Success!

### Section 5: Port Numbers (Page 7)
- **Interactive Apartment Building**: A building labeled "Your Computer"
  - Each floor/door is a port number
  - Clicking a door opens it and reveals the application inside:
    - Door 20/21: FTP (File Transfer Protocol) — file icons moving
    - Door 22: SSH — terminal screen with lock icon
    - Door 23: Telnet — old terminal
    - Door 25: SMTP — envelope flying out
    - Door 53: DNS — domain name resolving animation
    - Door 80: HTTP — browser window opens
    - Door 110: POP3 — mailbox with letters
    - Door 443: HTTPS — browser with green lock/shield
  - **Mailroom Analogy**: Animated mailman sorts packages to correct doors based on port numbers on the package labels

### Section 6: Flow Control (Pages 8-10)
- **Fire Hose Analogy**: 
  - Animation: Fire hose blasting water into a tiny glass. Water overflows everywhere. Text: "OVERWHELMED — DATA LOST"
  - Slider control: User drags slider to reduce flow to a gentle pitcher pour. Glass fills perfectly. Text: "FLOW CONTROL ACTIVE — BUFFER SAFE"
- **Buffer Visualization**: A horizontal tank that fills up as segments arrive. When it hits max, it glows red: "BUFFER OVERFLOW!"

### Section 7: Stop-and-Wait Flow Control (Pages 11)
- **Interactive Timeline Animation**:
  - Vertical timeline: Source on left, Destination on right
  - "Send Frame 1" button: Frame 1 animates across. "Wait for ACK..." timer spins. ACK comes back. "Send Frame 2" unlocks.
  - Show the TIME GAP visually — a clock ticks, sender twiddles thumbs
  - Efficiency meter: Shows only 20% efficient
  - User can toggle "Auto-send" to see how painfully slow it is for 10 frames

### Section 8: Sliding Window Flow Control (Pages 12-17)
- **THE STAR FEATURE — Interactive Sliding Window Simulator**:
  - Two horizontal timelines (Sender top, Receiver bottom) with sequence numbers 0-7 repeating
  - Controls:
    - Window Size slider (1 to 7)
    - "Send Frame" button
    - "Receive ACK" button
  - Visuals:
    - Blue highlighted window shows allowed frames
    - Sent frames are marked with an arrow
    - ACKs received make the window SLIDE forward with a smooth animation
    - Frames between "last acknowledged" and "window" are shown as "in-flight" with a dotted outline
  - **Sender Perspective Tab**: Shows "Frames already transmitted", "Frames buffered until acknowledged", "Window of frames that may be transmitted"
  - **Receiver Perspective Tab**: Shows "Frames already received", "Window of frames that may be accepted"
  - **Piggybacking Demo**: When both sides send data, show an ACK "riding" on top of a data frame as a little passenger. Label: "Two birds, one stone!"
  - **RNR Demo**: A "STOP" sign pops up. Receiver sends RNR 5. Sender's window freezes. "Buffer full — waiting..." Then RNR clears, window resumes.

### Section 9: Sliding Window Example Walkthrough (Pages 18-19)
- **Step-by-step animated walkthrough** of the lecture diagrams:
  - Step 1: Show initial windows (0-6)
  - Step 2: Send F0, F1, F2. Animate them flying across.
  - Step 3: RR 3 comes back. Windows slide.
  - Step 4: Send F3, F4, F5. RR 4 lost (show asterisk). F6 sent.
  - Step 5: REJ 4 or timeout. Go back to 4.
  - User can click "Next Step" to advance through the lecture example at their own pace.

### Section 10: Error Control & ARQ Overview (Pages 24-25)
- **Error Types Interactive**:
  - Two buttons: "Simulate Lost Frame" and "Simulate Damaged Frame"
  - Lost Frame: Frame 2 flies, lightning strikes, it disappears. Never arrives.
  - Damaged Frame: Frame 4 arrives but bits are glitching, distorted, red static overlay. Label: "GARBLED FRAME — CRC FAILED"
- **ARQ Family Tree**: Three branches growing from "ARQ" root:
  1. Stop-and-Wait ARQ
  2. Go-Back-N ARQ
  3. Selective-Reject ARQ
  - Clicking each branch expands to its definition and scrolls to that section

### Section 11: Stop-and-Wait ARQ (Pages 26-29)
- **Full Interactive Scenario**:
  - Two vertical lanes: Station A (left), Station B (right)
  - Timeline flows downward
  - Scenario 1: Frame 0 sent → lost in transit (asterisk). Timer at A expires. Frame 0 retransmits.
  - Scenario 2: Frame 0 arrives → ACK1 sent back → ACK1 lost. Timer expires. Frame 0 sent again → B receives duplicate, checks sequence number (already got 0), DISCARDS it.
  - **Sequence Number Toggle**: Show how alternating 0/1 prevents duplicates. User can click frames to see their sequence number.

### Section 12: Go-Back-N ARQ (Pages 30-35)
- **Interactive Go-Back-N Simulator**:
  - Window size = 4 (or adjustable)
  - Send frames 0, 1, 2, 3, 4, 5, 6...
  - User can click "Corrupt Frame 4"
  - Animation: Frame 4 gets red X. Frames 5 and 6 arrive at receiver but are THROWN IN TRASH (even though they're perfect!)
  - Receiver sends REJ 4
  - Big red arrow: "GO BACK TO 4"
  - Sender retransmits 4, 5, 6, 7...
  - **Cumulative ACK Demo**: Show how RR 7 acknowledges 0-6 all at once.
  - **P-bit Timer Demo**: Timeout occurs. Sender sends RR(P=1). Receiver MUST respond. If no response, retry.

### Section 13: Selective-Reject ARQ (Pages 36-37)
- **Interactive Selective-Reject Simulator**:
  - Same setup as Go-Back-N
  - User corrupts Frame 4
  - Frames 5 and 6 arrive → NOT thrown away! They go into a "BUFFER" shelf labeled "Waiting for Frame 4"
  - Receiver sends SREJ 4 (Selective Reject)
  - Sender retransmits ONLY Frame 4
  - When Frame 4 arrives, all buffered frames are assembled in correct order and delivered
  - **Efficiency Comparison**: Side-by-side meters showing Go-Back-N at 60% vs Selective-Reject at 95%
  - **Complexity Warning**: Pop-up explaining why Go-Back-N is more common despite lower efficiency (buffer size, logic complexity)

### Section 14: Solved Problems / Practice (Pages 23, 38-39)
- **Interactive Problem Workspace**:
  - **Problem 1 (Page 23)**: Sliding window size 4. Show window positions for 3 scenarios. User drags a slider to see before/after each event.
  - **Problem 2 (Page 38)**: Go-Back-N with 3-bit sequence, window 4. Interactive window position tracker.
  - **Problem 3 (Page 39)**: Selective-Reject step-by-step. User clicks through a-d steps and sees windows update.
  - **Problem 4 (Page 39)**: "Show that 3-bit sequence is needed for W=4" — interactive proof showing 2-bit would cause overlap/ambiguity.

### Section 15: Summary & Cheat Sheet
- **Interactive Mind Map**: All concepts connected visually
  - Click any node to expand details
- **Downloadable Cheat Sheet**: Generate a PDF-style summary with:
  - Port numbers table
  - TCP vs UDP comparison table
  - ARQ comparison table
  - Key formulas and rules
- **Quick Quiz**: 5 random questions from the lecture. Instant feedback.

## TECHNICAL REQUIREMENTS
- Built as a single-page application (SPA)
- Use Canvas or SVG for packet animations
- All interactive simulators must work in real-time without page reload
- Include a "Reset Simulation" button on every interactive element
- Add a "Lecture PDF Download" button (placeholder link)
- Include a progress bar at the top of the page
- Add keyboard navigation (arrow keys to move between sections)

## CONTENT ACCURACY RULES
- Every technical term must match the lecture exactly: Segmentation, Sequencing, CRC, ACK, RR, REJ, SREJ, RNR, Piggybacking, P-bit, modulo 8, window size, buffer, timeout, cumulative acknowledgment
- Port numbers must be exact: 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 443 HTTPS
- Sequence numbers: 3-bit field = 0-7, then wraps to 0
- CRC is 4 bytes
- Go-Back-N retransmits the bad frame AND all subsequent frames
- Selective-Reject retransmits ONLY the bad frame and buffers subsequent frames

## FINAL INSTRUCTIONS
Make this website feel like a **premium interactive course**, not a static wiki. Every concept from the 39 pages must be represented visually or interactively. Students should be able to learn the entire lecture just by exploring this website. Use the exact flow and order of the lecture pages. Do not skip any page or any concept.

Generate the complete, production-ready code for this website.
