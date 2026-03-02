document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const stateSetup = document.getElementById('state-setup');
    const stateChallenge = document.getElementById('state-challenge');
    const statePaywall = document.getElementById('state-paywall');
    
    const fleetBtns = document.querySelectorAll('.fleet-btn');
    const aircraftPillsContainer = document.getElementById('aircraft-pills');
    const challengeCards = document.querySelectorAll('.challenge-card');
    
    const btnStart = document.getElementById('btn-start-challenge');
    const btnMic = document.getElementById('btn-mic');
    const btnSubmit = document.getElementById('btn-submit');
    const btnSkip = document.getElementById('btn-skip');
    
    const timerElement = document.getElementById('timer');
    const audioVisualizer = document.getElementById('audio-visualizer');
    
    let countdownInterval;
    let isRecording = false;

    // --- Mock Data ---
    const fleetData = {
        boeing: ['B777', 'B737', 'B787', 'B747', 'B767', 'B757'],
        airbus: ['A320', 'A350', 'A330', 'A380', 'A340'],
        general: ['HR', 'Technical', 'Weather', 'Regs']
    };

    // --- State 1: Setup Logic ---
    
    // Initialize default pills (Boeing)
    renderPills('boeing');

    // Fleet Selection
    fleetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active state from all fleet buttons
            fleetBtns.forEach(b => {
                b.classList.remove('active', 'border-aero-yellow', 'bg-aero-yellow/10');
                b.classList.add('border-transparent', 'bg-slate-800/50');
                
                const icon = b.querySelector('i');
                const text = b.querySelector('span');
                icon.classList.remove('text-white');
                icon.classList.add('text-gray-400');
                text.classList.remove('text-white');
                text.classList.add('text-gray-400');
            });

            // Set active state for clicked button
            btn.classList.add('active', 'border-aero-yellow', 'bg-aero-yellow/10');
            btn.classList.remove('border-transparent', 'bg-slate-800/50');
            
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            icon.classList.remove('text-gray-400');
            icon.classList.add('text-white');
            text.classList.remove('text-gray-400');
            text.classList.add('text-white');

            // Render Pills
            const fleet = btn.getAttribute('data-fleet');
            renderPills(fleet);
        });
    });

    function renderPills(fleet) {
        aircraftPillsContainer.innerHTML = '';
        const models = fleetData[fleet] || [];
        
        models.forEach((model, index) => {
            const pill = document.createElement('button');
            pill.className = `aircraft-pill px-4 py-2 rounded-full font-mono text-sm whitespace-nowrap transition-all ${index === 0 ? 'active bg-aero-yellow text-slate-900 font-bold' : 'bg-slate-800 border border-slate-700 text-gray-400 hover:bg-slate-700 hover:text-white'}`;
            pill.textContent = model;
            
            pill.addEventListener('click', () => {
                // Toggle active state
                document.querySelectorAll('.aircraft-pill').forEach(p => {
                    p.className = 'aircraft-pill px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-gray-400 font-mono text-sm whitespace-nowrap hover:bg-slate-700 hover:text-white transition-all';
                });
                pill.className = 'aircraft-pill active px-4 py-2 rounded-full bg-aero-yellow text-slate-900 font-bold font-mono text-sm whitespace-nowrap transition-all';
            });
            
            aircraftPillsContainer.appendChild(pill);
        });
    }

    // Challenge Card Selection
    challengeCards.forEach(card => {
        card.addEventListener('click', () => {
            challengeCards.forEach(c => {
                c.classList.remove('active', 'bg-slate-800/80', 'border-aero-yellow');
                c.classList.add('bg-slate-800/30', 'border-slate-700');
            });
            card.classList.remove('bg-slate-800/30', 'border-slate-700');
            card.classList.add('active', 'bg-slate-800/80', 'border-aero-yellow');
        });
    });

    // Start Challenge Transition
    btnStart.addEventListener('click', () => {
        stateSetup.classList.add('opacity-0');
        
        setTimeout(() => {
            stateSetup.classList.add('hidden');
            stateChallenge.classList.remove('hidden');
            
            // Trigger reflow
            void stateChallenge.offsetWidth;
            
            stateChallenge.classList.remove('opacity-0');
            
            // Start Timer (2:59 = 179 seconds)
            startTimer(179);
            
            // Generate Visualizer Bars
            createVisualizerBars();
            
        }, 500);
    });

    // --- State 2: Challenge Logic ---

    function startTimer(seconds) {
        let timeLeft = seconds;
        updateTimerDisplay(timeLeft);
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                finishChallenge();
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function createVisualizerBars() {
        audioVisualizer.innerHTML = '';
        const barCount = 20;
        
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'w-1 bg-red-500/50 rounded-full transition-all duration-100 ease-in-out';
            bar.style.height = '4px';
            audioVisualizer.appendChild(bar);
        }
    }

    function animateVisualizer() {
        if (!isRecording) return;
        
        const bars = audioVisualizer.children;
        for (let bar of bars) {
            // Random height between 4px and 48px
            const height = Math.floor(Math.random() * 44) + 4;
            bar.style.height = `${height}px`;
        }
        
        requestAnimationFrame(() => {
            setTimeout(animateVisualizer, 50); 
        });
    }

    // Mic Interaction (Hold to Speak Simulation via Click/Toggle for Desktop)
    btnMic.addEventListener('mousedown', startRecording);
    btnMic.addEventListener('mouseup', stopRecording);
    btnMic.addEventListener('mouseleave', stopRecording);
    
    // Touch support
    btnMic.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startRecording();
    });
    btnMic.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopRecording();
    });

    function startRecording() {
        if (isRecording) return;
        isRecording = true;
        
        const iconDiv = btnMic.querySelector('div');
        iconDiv.classList.add('bg-red-500', 'text-white', 'scale-110');
        iconDiv.classList.remove('bg-red-500/10', 'text-red-500');
        
        animateVisualizer();
    }

    function stopRecording() {
        if (!isRecording) return;
        isRecording = false;
        
        const iconDiv = btnMic.querySelector('div');
        iconDiv.classList.remove('bg-red-500', 'text-white', 'scale-110');
        iconDiv.classList.add('bg-red-500/10', 'text-red-500');
        
        // Reset visualizer bars
        const bars = audioVisualizer.children;
        for (let bar of bars) {
            bar.style.height = '4px';
        }
    }

    // Submit & Skip
    if(btnSubmit) btnSubmit.addEventListener('click', finishChallenge);
    if(btnSkip) btnSkip.addEventListener('click', finishChallenge);

    // --- State 3: Paywall Logic ---

    function finishChallenge() {
        clearInterval(countdownInterval);
        isRecording = false;
        
        // Blur the challenge content (simulated by blurring the whole container's children)
        // Note: The paywall overlay is absolute positioned over this, so we blur underneath.
        // We need to blur the specific input areas we just used.
        
        // Show Paywall Overlay
        statePaywall.classList.remove('hidden');
        void statePaywall.offsetWidth; // Trigger reflow
        statePaywall.classList.remove('opacity-0');
    }

});
