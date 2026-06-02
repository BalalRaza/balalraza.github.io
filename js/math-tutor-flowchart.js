document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('math-tutor-flowchart-container');
    if (!container) return;

    // Clear placeholder
    container.innerHTML = '';

    // Create SVG Element
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 600 370");
    svg.setAttribute("id", "flowchart-svg");
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.maxWidth = "600px";

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
            stroke: var(--text-muted);
            stroke-width: 2;
            stroke-dasharray: 6, 4;
            opacity: 0.55;
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
        .node-circle.node-orchestrator.active {
            stroke: var(--pastel-indigo-text);
            filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.25));
        }
        .node-circle.node-pro.active {
            stroke: var(--pastel-emerald-text);
            filter: drop-shadow(0 0 8px rgba(5, 150, 105, 0.25));
        }
        .node-circle:hover {
            transform: scale(1.05);
        }
        .node-label {
            font-size: 0.75rem;
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
            margin-top: 24px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-pill);
            padding: 8px 20px;
            box-shadow: var(--shadow-subtle);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 95%;
            justify-content: center;
            z-index: 5;
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
        .play-pause-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-primary);
            cursor: pointer;
            box-shadow: var(--shadow-subtle);
            transition: var(--transition-fast);
            z-index: 10;
        }
        .play-pause-btn:hover {
            border-color: var(--text-muted);
            transform: scale(1.05);
            background: var(--bg-tertiary);
        }
        .play-pause-btn svg {
            transition: transform 0.2s ease;
        }
        .play-pause-btn:active svg {
            transform: scale(0.9);
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

    // Node Coordinates - Spaced out and simplified to 4 nodes
    const coords = {
        canvas: { x: 80, y: 180, emoji: "🎨", name: "Canvas UI" },
        orchestrator: { x: 240, y: 180, emoji: "⚙️", name: "Orchestrator" },
        flash: { x: 480, y: 80, emoji: "⚡", name: "Gemini Flash" },
        pro: { x: 480, y: 280, emoji: "🧠", name: "Gemini Pro" }
    };

    // Connection paths
    const paths = {
        'canvas-orchestrator': `M ${coords.canvas.x},${coords.canvas.y} Q 160,160 240,180`,
        'orchestrator-flash': `M 240,180 Q 360,110 480,80`,
        'flash-orchestrator': `M 480,80 Q 360,140 240,180`,
        'orchestrator-canvas-flash': `M 240,180 Q 160,180 80,180`,
        'orchestrator-pro': `M 240,180 Q 360,250 480,280`,
        'pro-orchestrator': `M 480,280 Q 360,220 240,180`,
        'orchestrator-canvas-pro': `M 240,180 Q 160,200 80,180`
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
        circle.setAttribute("r", key === 'orchestrator' ? 34 : 30);
        circle.setAttribute("class", `node-circle node-${key}`);
        circle.setAttribute("id", `circle-${key}`);
        group.appendChild(circle);

        // Emoji Text Icon
        const textEmoji = document.createElementNS(svgNS, "text");
        textEmoji.setAttribute("x", node.x);
        textEmoji.setAttribute("y", node.y + (key === 'orchestrator' ? 9 : 8));
        textEmoji.setAttribute("font-size", key === 'orchestrator' ? "24" : "20");
        textEmoji.setAttribute("text-anchor", "middle");
        textEmoji.textContent = node.emoji;
        group.appendChild(textEmoji);

        // Text Label Below Node
        const textLabel = document.createElementNS(svgNS, "text");
        textLabel.setAttribute("x", node.x);
        textLabel.setAttribute("y", node.y + (key === 'orchestrator' ? 52 : 48));
        textLabel.setAttribute("class", "node-label");
        textLabel.setAttribute("id", `label-${key}`);
        textLabel.textContent = node.name;
        group.appendChild(textLabel);

        svg.appendChild(group);
    });

    // Render Main Blip Element
    const blip = document.createElementNS(svgNS, "circle");
    blip.setAttribute("r", 7);
    blip.setAttribute("class", "blip-dot");
    blip.setAttribute("id", "flow-blip");
    blip.style.opacity = '0';
    svg.appendChild(blip);

    // Render Streaming Blip Elements for Gemini Flash response
    const streamBlipsCount = 4;
    for (let i = 1; i <= streamBlipsCount; i++) {
        const sBlip = document.createElementNS(svgNS, "circle");
        sBlip.setAttribute("r", 5);
        sBlip.setAttribute("class", "blip-dot");
        sBlip.setAttribute("id", `stream-blip-${i}`);
        sBlip.style.opacity = '0';
        svg.appendChild(sBlip);
    }

    // Render Second Blip Element for parallel processing
    const blip2 = document.createElementNS(svgNS, "circle");
    blip2.setAttribute("r", 7);
    blip2.setAttribute("class", "blip-dot");
    blip2.setAttribute("id", "flow-blip-2");
    blip2.style.opacity = '0';
    svg.appendChild(blip2);

    container.appendChild(svg);

    // Create Status Ticker
    const ticker = document.createElement('div');
    ticker.className = 'status-ticker-wrapper';
    ticker.innerHTML = `
        <div class="status-dot"></div>
        <span class="status-text" id="status-ticker-text">Tutor System Idle</span>
    `;
    container.appendChild(ticker);

    // Create Pause/Resume Button
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'play-pause-btn';
    playPauseBtn.setAttribute('aria-label', 'Pause animation');
    playPauseBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" class="pause-icon">
            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
        </svg>
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" class="play-icon" style="display: none;">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
    container.appendChild(playPauseBtn);

    let isPaused = false;
    playPauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const playIcon = playPauseBtn.querySelector('.play-icon');
        if (isPaused) {
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            playPauseBtn.setAttribute('aria-label', 'Resume animation');
        } else {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            playPauseBtn.setAttribute('aria-label', 'Pause animation');
        }
    });

    let startTime = null;
    let lastFrameTime = null;
    let accumTime = 0;

    const blipEl = document.getElementById('flow-blip');
    const blip2El = document.getElementById('flow-blip-2');
    const tickerTextEl = document.getElementById('status-ticker-text');

    function animateSingleBlip(el, pathId, progress, blipColor, activeNodeKeys) {
        if (!el) return;
        const path = document.getElementById(pathId);
        if (!path) return;
        
        path.classList.add('active');
        path.style.stroke = blipColor;
        
        const pathLength = path.getTotalLength();
        const pt = path.getPointAtLength(progress * pathLength);
        el.setAttribute("cx", pt.x);
        el.setAttribute("cy", pt.y);
        el.style.opacity = '1';
        el.style.fill = blipColor;

        activeNodeKeys.forEach(key => {
            const circle = document.getElementById(`circle-${key}`);
            const label = document.getElementById(`label-${key}`);
            if (circle) circle.classList.add('active');
            if (label) label.classList.add('active');
        });
    }

    function animateStreamingBlips(pathId, progress, blipColor, activeNodeKeys) {
        const path = document.getElementById(pathId);
        if (!path) return;
        
        path.classList.add('active');
        path.style.stroke = blipColor;
        
        const pathLength = path.getTotalLength();

        activeNodeKeys.forEach(key => {
            const circle = document.getElementById(`circle-${key}`);
            const label = document.getElementById(`label-${key}`);
            if (circle) circle.classList.add('active');
            if (label) label.classList.add('active');
        });

        // Animate stream blips
        for (let i = 1; i <= streamBlipsCount; i++) {
            const sBlip = document.getElementById(`stream-blip-${i}`);
            if (!sBlip) continue;

            const blipOffset = (i - 1) * 0.12; // stagger offset
            let blipProgress = progress - blipOffset;

            if (blipProgress > 0) {
                blipProgress = Math.min(blipProgress / 0.65, 1);
                if (blipProgress < 1) {
                    const pt = path.getPointAtLength(blipProgress * pathLength);
                    sBlip.setAttribute("cx", pt.x);
                    sBlip.setAttribute("cy", pt.y);
                    sBlip.style.opacity = '1';
                    sBlip.style.fill = blipColor;
                } else {
                    sBlip.style.opacity = '0';
                }
            } else {
                sBlip.style.opacity = '0';
            }
        }
    }

    const loopDuration = 6800; // 6.8 seconds timeline loop

    function animate(timestamp) {
        if (lastFrameTime === null) {
            lastFrameTime = timestamp;
        }

        const delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        if (!isPaused) {
            accumTime += delta;
        }

        let elapsed = accumTime % loopDuration;

        // Reset active paths & colors
        document.querySelectorAll('.flow-path').forEach(p => {
            p.classList.remove('active');
            p.style.stroke = 'var(--border-color)';
        });
        document.querySelectorAll('.node-circle').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.node-label').forEach(l => l.classList.remove('active'));
        
        // Hide blips
        blipEl.style.opacity = '0';
        blip2El.style.opacity = '0';
        for (let i = 1; i <= streamBlipsCount; i++) {
            const sBlip = document.getElementById(`stream-blip-${i}`);
            if (sBlip) sBlip.style.opacity = '0';
        }

        let label = "Tutor System Idle";
        let color = "var(--text-secondary)";
        const statusDot = document.querySelector('.status-dot');

        // Timeline Scheduler
        
        // 0 to 900ms: Canvas UI -> Orchestrator (User submits math step)
        if (elapsed >= 0 && elapsed < 900) {
            label = "Student submits math step from Canvas UI";
            color = "#4F46E5"; // Indigo
            animateSingleBlip(blipEl, 'path-canvas-orchestrator', elapsed / 900, color, ['canvas', 'orchestrator']);
        }
        
        // 900ms to 1800ms: Orchestrator -> parallel dispatch to Flash and Pro simultaneously
        else if (elapsed >= 900 && elapsed < 1800) {
            label = "Orchestrator dispatches parallel requests to Flash & Pro models";
            color = "#D97706"; // Amber
            const progress = (elapsed - 900) / 900;
            animateSingleBlip(blipEl, 'path-orchestrator-flash', progress, "#0369A1", ['orchestrator', 'flash', 'pro']); // Sky (Flash)
            animateSingleBlip(blip2El, 'path-orchestrator-pro', progress, "#9333EA", []); // Purple (Pro)
        }
        
        // 1800ms to 3800ms: Flash model returns quickly (3-4s runtime equivalent)
        else if (elapsed >= 1800 && elapsed < 3800) {
            label = "Gemini Flash returns fast streaming response (3-4s latency context)";
            color = "#0369A1"; // Sky
            
            // 1800 to 2800: Flash to Orchestrator stream
            if (elapsed < 2800) {
                const progress = (elapsed - 1800) / 1000;
                animateStreamingBlips('path-flash-orchestrator', progress, color, ['flash', 'orchestrator']);
            } 
            // 2800 to 3800: Orchestrator to Canvas UI stream
            else {
                const progress = (elapsed - 2800) / 1000;
                animateStreamingBlips('path-orchestrator-canvas-flash', progress, color, ['orchestrator', 'canvas']);
            }
            // Keep Pro node highlighted representing continuous background logic processing
            document.getElementById('circle-pro').classList.add('active');
        }
        
        // 3800ms to 4800ms: Pro returns logical assessment to Orchestrator immediately
        else if (elapsed >= 3800 && elapsed < 4800) {
            label = "Gemini Pro logic validation check returned to Orchestrator (10-12s latency context)";
            color = "#9333EA"; // Purple
            const progress = (elapsed - 3800) / 1000;
            animateSingleBlip(blipEl, 'path-pro-orchestrator', progress, color, ['pro', 'orchestrator']);
        }
        
        // 4800ms to 5800ms: Orchestrator highlights error on Canvas UI
        else if (elapsed >= 4800 && elapsed < 5800) {
            label = "Detailed guidance loaded & mistake circled in red on Canvas";
            color = "#EF4444"; // Red
            const progress = (elapsed - 4800) / 1000;
            animateSingleBlip(blipEl, 'path-orchestrator-canvas-pro', progress, color, ['orchestrator', 'canvas']);
        }
        
        // 5800ms to 6800ms: Review/pause state
        else {
            label = "Student reviewing guidance (Mistake Highlight active)";
            color = "#059669"; // Emerald
            document.getElementById('circle-canvas').classList.add('active');
            document.getElementById('label-canvas').classList.add('active');
        }

        if (statusDot) statusDot.style.backgroundColor = color;
        tickerTextEl.textContent = label;
        tickerTextEl.style.color = color;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});
