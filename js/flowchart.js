document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('voice-bot-flowchart-container');
    if (!container) return;

    // Clear placeholder
    container.innerHTML = '';

    // Create SVG Element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 600 370");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("id", "flowchart-svg");

    // Add CSS styles specifically for the flowchart
    const style = document.createElement('style');
    style.textContent = `
        #flowchart-svg {
            font-family: 'Outfit', sans-serif;
            background: transparent;
            user-select: none;
        }
        .flow-path {
            fill: none;
            stroke: var(--border-color);
            stroke-width: 2;
            stroke-dasharray: 6, 4;
            opacity: 0.25;
            transition: stroke var(--transition-smooth), stroke-width var(--transition-fast), opacity var(--transition-smooth);
        }
        .flow-path.active {
            stroke-width: 3;
            stroke-dasharray: none;
            opacity: 1;
        }
        .node-circle {
            fill: var(--bg-secondary);
            stroke: var(--border-color);
            stroke-width: 2;
            transition: stroke var(--transition-smooth), transform var(--transition-smooth), filter var(--transition-smooth);
            cursor: pointer;
        }
        .node-circle.active {
            stroke: var(--pastel-orange-text);
            filter: drop-shadow(0 0 8px rgba(234, 88, 12, 0.25));
        }
        .node-circle.node-system.active {
            stroke: var(--pastel-indigo-text);
            filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.25));
        }
        .node-circle.node-db.active {
            stroke: var(--pastel-emerald-text);
            filter: drop-shadow(0 0 8px rgba(5, 150, 105, 0.25));
        }
        .node-circle:hover {
            transform: scale(1.05);
        }
        .node-label {
            font-size: 0.72rem;
            font-weight: 700;
            fill: var(--text-secondary);
            text-anchor: middle;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .node-label.active {
            fill: var(--text-primary);
        }
        .blip-dot {
            fill: var(--pastel-orange-text);
            filter: drop-shadow(0 0 6px var(--pastel-orange-text));
            transition: fill var(--transition-smooth);
        }
        .status-ticker-wrapper {
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-pill);
            padding: 8px 20px;
            box-shadow: var(--shadow-subtle);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 90%;
            white-space: nowrap;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--pastel-orange-text);
            animation: ticker-pulse 1.2s infinite;
        }
        .status-text {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-secondary);
        }
        @keyframes ticker-pulse {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.8); opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);

    // SVG Definitions for Filters/Gradients
    const defs = document.createElementNS(svgNS, "defs");
    defs.innerHTML = `
        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
    `;
    svg.appendChild(defs);

    // Node Coordinates (Shifted upwards to secure more ticker padding)
    const coords = {
        twilio: { x: 70, y: 120, emoji: "📞", name: "Twilio API" },
        system: { x: 230, y: 120, emoji: "🖥️", name: "Orchestrator" },
        db: { x: 230, y: 240, emoji: "🗄️", name: "Internal DB/APIs" },
        stt: { x: 440, y: 45, emoji: "🎙️", name: "Deepgram STT" },
        llm: { x: 530, y: 120, emoji: "🧠", name: "GPT-4o-mini" },
        tts: { x: 440, y: 220, emoji: "🔊", name: "Deepgram TTS" }
    };

    // Spaced out curves between Orchestrator and GPT-4o-mini
    const paths = {
        'twilio-system': `M ${coords.twilio.x},${coords.twilio.y} Q 150,95 ${coords.system.x},${coords.system.y}`,
        'system-stt': `M ${coords.system.x},${coords.system.y} Q 330,65 ${coords.stt.x},${coords.stt.y}`,
        'stt-system': `M ${coords.stt.x},${coords.stt.y} Q 350,100 ${coords.system.x},${coords.system.y}`,
        
        // Dynamic, high-separation curve paths for LLM interaction stages
        'system-llm': `M ${coords.system.x},${coords.system.y} Q 380,50 ${coords.llm.x},${coords.llm.y}`,
        'llm-system-tool': `M ${coords.llm.x},${coords.llm.y} Q 380,155 ${coords.system.x},${coords.system.y}`,
        
        // DB Queries
        'system-db': `M ${coords.system.x},${coords.system.y} Q 200,180 ${coords.db.x},${coords.db.y}`,
        'db-system': `M ${coords.db.x},${coords.db.y} Q 260,180 ${coords.system.x},${coords.system.y}`,
        
        'system-llm-result': `M ${coords.system.x},${coords.system.y} Q 380,85 ${coords.llm.x},${coords.llm.y}`,
        'llm-system': `M ${coords.llm.x},${coords.llm.y} Q 380,190 ${coords.system.x},${coords.system.y}`,
        
        'system-tts': `M ${coords.system.x},${coords.system.y} Q 330,185 ${coords.tts.x},${coords.tts.y}`,
        'tts-system': `M ${coords.tts.x},${coords.tts.y} Q 350,155 ${coords.system.x},${coords.system.y}`,
        'system-twilio': `M ${coords.system.x},${coords.system.y} Q 150,145 ${coords.twilio.x},${coords.twilio.y}`
    };

    // Render Path Elements
    Object.entries(paths).forEach(([key, d]) => {
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", d);
        path.setAttribute("class", "flow-path");
        path.setAttribute("id", `path-${key}`);
        svg.appendChild(path);
    });

    // Render Node Group Elements
    Object.entries(coords).forEach(([key, node]) => {
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("id", `node-group-${key}`);
        
        // Circular Node Background
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", node.x);
        circle.setAttribute("cy", node.y);
        circle.setAttribute("r", key === 'system' ? 34 : (key === 'db' ? 30 : 28));
        circle.setAttribute("class", `node-circle node-${key}`);
        circle.setAttribute("id", `circle-${key}`);
        group.appendChild(circle);

        // Emoji Text Icon
        const textEmoji = document.createElementNS(svgNS, "text");
        textEmoji.setAttribute("x", node.x);
        textEmoji.setAttribute("y", node.y + (key === 'system' ? 9 : 7));
        textEmoji.setAttribute("font-size", key === 'system' ? "24" : "18");
        textEmoji.setAttribute("text-anchor", "middle");
        textEmoji.textContent = node.emoji;
        group.appendChild(textEmoji);

        // Text Label Below Node
        const textLabel = document.createElementNS(svgNS, "text");
        textLabel.setAttribute("x", node.x);
        textLabel.setAttribute("y", node.y + (key === 'system' ? 52 : (key === 'db' ? 48 : 44)));
        textLabel.setAttribute("class", "node-label");
        textLabel.setAttribute("id", `label-${key}`);
        textLabel.textContent = node.name;
        group.appendChild(textLabel);

        svg.appendChild(group);
    });

    // Render Animated Blip Element
    const blip = document.createElementNS(svgNS, "circle");
    blip.setAttribute("r", 6);
    blip.setAttribute("class", "blip-dot");
    blip.setAttribute("id", "flow-blip");
    blip.style.opacity = '0';
    svg.appendChild(blip);

    container.appendChild(svg);

    // Create Status Ticker
    const ticker = document.createElement('div');
    ticker.className = 'status-ticker-wrapper';
    ticker.innerHTML = `
        <div class="status-dot"></div>
        <span class="status-text" id="status-ticker-text">Pipeline Idle</span>
    `;
    container.appendChild(ticker);

    // Animation Loop Variables
    const steps = [
        {
            pathId: 'path-twilio-system',
            label: 'Inbound Audio Stream Connected',
            activeNodes: ['twilio', 'system'],
            color: '#EA580C', // Orange
            duration: 900
        },
        {
            pathId: 'path-system-stt',
            label: 'Streaming audio to Deepgram Flux STT',
            activeNodes: ['system', 'stt'],
            color: '#4F46E5', // Indigo
            duration: 800
        },
        {
            pathId: 'path-stt-system',
            label: 'Live transcription tokens returned via WebSockets',
            activeNodes: ['stt', 'system'],
            color: '#0369A1', // Sky
            duration: 800
        },
        {
            pathId: 'path-system-llm',
            label: 'Sending transcription stream to GPT-4o-mini',
            activeNodes: ['system', 'llm'],
            color: '#9333EA', // Purple
            duration: 1000
        },
        {
            pathId: 'path-llm-system-tool',
            label: 'GPT-4o-mini triggers parallel tool call (if required)',
            activeNodes: ['llm', 'system'],
            color: '#D97706', // Amber
            duration: 900
        },
        {
            pathId: 'path-system-db',
            label: 'Executing API mutation: getAvailableSlotsForDay / getBatchDetails',
            activeNodes: ['system', 'db'],
            color: '#059669', // Emerald
            duration: 1200
        },
        {
            pathId: 'path-db-system',
            label: 'Database returns live scheduling inventory states',
            activeNodes: ['db', 'system'],
            color: '#059669', // Emerald
            duration: 1000
        },
        {
            pathId: 'path-system-llm-result',
            label: 'Feeding database query results back to GPT-4o-mini',
            activeNodes: ['system', 'llm'],
            color: '#D97706', // Amber
            duration: 900
        },
        {
            pathId: 'path-llm-system',
            label: 'GPT-4o-mini generates final response text tokens',
            activeNodes: ['llm', 'system'],
            color: '#9333EA', // Purple
            duration: 1000
        },
        {
            pathId: 'path-system-tts',
            label: 'Streaming response text to Deepgram Aura-2 TTS',
            activeNodes: ['system', 'tts'],
            color: '#4F46E5', // Indigo
            duration: 800
        },
        {
            pathId: 'path-tts-system',
            label: 'Synthesizing binary audio buffers',
            activeNodes: ['tts', 'system'],
            color: '#0369A1', // Sky
            duration: 800
        },
        {
            pathId: 'path-system-twilio',
            label: 'Playing audio stream back to parent call',
            activeNodes: ['system', 'twilio'],
            color: '#EA580C', // Orange
            duration: 900
        }
    ];

    let currentStepIndex = 0;
    let startTime = null;

    // Elements cache
    const blipEl = document.getElementById('flow-blip');
    const tickerTextEl = document.getElementById('status-ticker-text');

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const currentStep = steps[currentStepIndex];

        const pathEl = document.getElementById(currentStep.pathId);
        if (!pathEl) return;

        const pathLength = pathEl.getTotalLength();
        const progress = Math.min(elapsed / currentStep.duration, 1);

        // Calculate current position on path
        const point = pathEl.getPointAtLength(progress * pathLength);
        blipEl.setAttribute("cx", point.x);
        blipEl.setAttribute("cy", point.y);
        blipEl.style.opacity = '1';

        // Highlight Active Path
        document.querySelectorAll('.flow-path').forEach(p => p.classList.remove('active'));
        pathEl.classList.add('active');
        pathEl.style.stroke = currentStep.color;

        // Change Blip Color and Ticker State
        blipEl.style.fill = currentStep.color;
        tickerTextEl.textContent = currentStep.label;
        tickerTextEl.style.color = currentStep.color;
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) statusDot.style.backgroundColor = currentStep.color;

        // Highlight Active Nodes
        document.querySelectorAll('.node-circle').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.node-label').forEach(l => l.classList.remove('active'));
        currentStep.activeNodes.forEach(nodeKey => {
            const circle = document.getElementById(`circle-${nodeKey}`);
            const label = document.getElementById(`label-${nodeKey}`);
            if (circle) circle.classList.add('active');
            if (label) label.classList.add('active');
        });

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Move to next step
            startTime = null;
            currentStepIndex = (currentStepIndex + 1) % steps.length;
            
            // Subtle transition delay before starting next path blip
            setTimeout(() => {
                requestAnimationFrame(animate);
            }, 150);
        }
    }

    // Start animation loop
    requestAnimationFrame(animate);
});
