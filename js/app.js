// 引入必要的 Firebase 函式
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 你的 Firebase 配置資訊
const firebaseConfig = {
    apiKey: "AIzaSyD5dsy5tG3BFg4T7GA_kAQ8a3p3qFWSf7M",  // production
    authDomain: "auth.captainai.app",
    projectId: "graceful-goods-488405-i7",
    storageBucket: "graceful-goods-488405-i7.firebasestorage.app",
    messagingSenderId: "909923853969",
    appId: "1:909923853969:web:48b5eb2c0f3ad260fc0130",
};

let initChecked = false;
let currentUser = null;

async function authWithEmailAndPasswordSync(auth, email, password) {
    try {
      // 1. 嘗試註冊
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("新用戶註冊並登入成功");
      return userCredential.user;
    } catch (error) {
      // 2. 如果錯誤是「Email 已被使用」，則執行登入
      if (error.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("現有用戶登入成功");
          return userCredential.user;
        } catch (loginError) {
          alert("Failed. Invalid email or password");
          console.error("登入失敗（密碼錯誤）:", loginError.code);
          throw loginError;
        }
      } else {
        // 其他錯誤（如：格式不對、密碼太弱）
        console.error("註冊過程發生錯誤:", error.code);
        throw error;
      }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // 初始化 Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    // 監聽登入狀態（這就是 Serverless 的核心：自動追蹤 Token）
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log(user);
            currentUser = user;
            if (initChecked) {
                // in sign-in flow
                goToStep('profile');
            } else {
                // first time check, control the state of screen
                // showSigninModal();
            }
            changeLogState(true);
        } else {
            console.error("尚未登入");
            changeLogState(false);
        }
        initChecked = true;
    });

    // --- Elements ---
    const stateSetup = document.getElementById('state-setup');
    const stateCombined = document.getElementById('state-combined');
    const evaluationArea = document.getElementById('evaluation-area');
    const inputArea = document.getElementById('input-area');
    const userResponsePlaceholder = document.getElementById('user-response-placeholder');
    
    const fleetBtns = document.querySelectorAll('.fleet-btn');
    const aircraftPillsContainer = document.getElementById('aircraft-pills');
    const challengeCards = document.querySelectorAll('.challenge-card');
    
    const btnStart = document.getElementById('btn-start-challenge');
    const btnMic = document.getElementById('btn-mic');
    const btnSubmit = document.getElementById('btn-submit');
    const btnSkip = document.getElementById('btn-skip');
    
    const timerElement = document.getElementById('timer');
    const audioVisualizer = document.getElementById('audio-visualizer');
    const conversationContainer = document.getElementById('conversation-container');

    function scrollToBottom(smooth = true) {
        if (!conversationContainer) return;
        if (smooth) {
            conversationContainer.scrollTo({
                top: conversationContainer.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            conversationContainer.scrollTop = conversationContainer.scrollHeight;
        }
    }
    
    // --- Sign In Flow Elements ---
    const btnSigninNav = document.getElementById('btn-signin-nav');
    const btnSignOutNav = document.getElementById('btn-signout-nav');

    const btnHeroCta = document.getElementById('btn-hero-cta');
    const btnUnlockCta = document.getElementById('btn-unlock-cta');
    const btnSigninGoogle = document.getElementById('btn-signin-google');
    const signinModal = document.getElementById('signin-modal');
    const modalSteps = {
        signin: document.getElementById('modal-step-signin'),
        profile: document.getElementById('modal-step-profile'),
        success: document.getElementById('modal-step-success')
    };
    const modalTitle = document.getElementById('modal-title');
    const formSignin = document.getElementById('form-signin');
    const formProfile = document.getElementById('form-profile');
    const airlineDropdown = document.getElementById('airline-dropdown');
    const profAirlineInput = document.getElementById('prof-airline');

    // Modal Loading Mask Control
    function toggleModalLoading(show) {
        const mask = document.getElementById('modal-loading-mask');
        if (!mask) return;
        
        if (show) {
            mask.classList.remove('hidden');
            mask.classList.add('flex');
        } else {
            mask.classList.add('hidden');
            mask.classList.remove('flex');
        }
    }

    // Expose to window for external control
    window.toggleModalLoading = toggleModalLoading;

    // login state control
    function changeLogState(isLogin) {
        if (isLogin) {
            btnSignOutNav.classList.remove('hidden');
            btnSigninNav.classList.add('hidden');
        } else {
            btnSignOutNav.classList.add('hidden');
            btnSigninNav.classList.remove('hidden');
        }
    }

    // google sign in
    btnSigninGoogle.onclick = async () => {
        toggleModalLoading(true);
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("登入出錯：", error.code, error.message);
            alert("Failed. Please try agiain later");
        }
        toggleModalLoading(false);
    };
    
    // New Modal elements
    const profFleetBtns = document.querySelectorAll('.prof-fleet-btn');
    const profAircraftPillsContainer = document.getElementById('prof-aircraft-pills');
    const profChallengeCards = document.querySelectorAll('.prof-challenge-card');
    const titlePills = document.querySelectorAll('.title-pill');

    let selectedModalFleet = 'boeing';
    let selectedModalAircraft = '';
    let selectedModalGouge = '';
    let selectedModalTitle = '';

    const airlines = [
        "Emirates", "Qatar Airways", "Singapore Airlines", "Cathay Pacific", 
        "Lufthansa", "Delta Air Lines", "United Airlines", "British Airways", 
        "Turkish Airlines", "EVA Air"
    ];

    let countdownInterval;
    let isRecording = false;

    // --- Mock Data ---
    const fleetData = {
        boeing: ['B777', 'B737', 'B787', 'B747', 'B767', 'B757'],
        airbus: ['A320', 'A350', 'A330', 'A380', 'A340'],
        general: ['HR', 'Technical', 'Weather', 'Regs']
    };

    // --- Sign In Flow Logic ---

    // Open Modal
    function showSigninModal() {
        signinModal.classList.add('active');
        signinModal.classList.remove('hidden');
    }

    if (btnSigninNav) {
        btnSigninNav.addEventListener('click', () => {
            showSigninModal();
            goToStep('signin');
        });
    }

    if (btnSignOutNav) {
        btnSignOutNav.addEventListener('click', () => {
            signOut(auth);
            changeLogState(false);
        });
    }

    if (btnHeroCta) {
        btnHeroCta.addEventListener('click', () => {
            showSigninModal();
            if (currentUser) goToStep('profile');
            else goToStep('signin');
        });
    }

    if (btnUnlockCta) {
        btnUnlockCta.addEventListener('click', () => {
            showSigninModal();
            if (currentUser) goToStep('profile');
            else goToStep('signin');
        });
    }

    // Close Modal
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            signinModal.classList.remove('active');
            signinModal.classList.add('hidden');
        });
    });

    function goToStep(step) {
        Object.values(modalSteps).forEach(el => el.classList.add('hidden'));
        modalSteps[step].classList.remove('hidden');
        
        if (step === 'signin') {
            modalTitle.textContent = 'Sign In';
        } else if (step === 'profile') {
            modalTitle.textContent = 'Complete Your Profile';
            prefillProfileData();
        } else if (step === 'success') {
            modalTitle.textContent = 'Welcome Aboard';
        }
    }

    function prefillProfileData() {
        console.log('Prefilling profile data...');

        if (currentUser) {
            document.getElementById('prof-name').value = currentUser.displayName || currentUser.email.split('@')[0];
        }

        // Get data from current selections in the main page
        const activeFleetBtn = document.querySelector('.fleet-btn.active');
        const activeAircraftPill = document.querySelector('.aircraft-pill.active');
        const activeChallengeCard = document.querySelector('.challenge-card.active');

        const manufacturer = activeFleetBtn?.getAttribute('data-fleet');
        const aircraft = activeAircraftPill?.textContent;
        const gouge = activeChallengeCard?.querySelector('span')?.textContent;

        console.log('Detected from main page:', { manufacturer, aircraft, gouge });

        if (manufacturer) {
            selectedModalFleet = manufacturer;
            updateModalFleetUI(manufacturer);
            renderModalAircraftPills(manufacturer, aircraft);
        } else {
            // Default to boeing if nothing selected
            updateModalFleetUI('boeing');
            renderModalAircraftPills('boeing');
        }
        
        if (gouge) {
            selectedModalGouge = gouge;
            updateModalGougeUI(gouge);
        }

        // Default title selection
        if (!selectedModalTitle) {
            const firstTitle = titlePills[0];
            if (firstTitle) {
                firstTitle.classList.remove('bg-slate-800', 'text-gray-400');
                firstTitle.classList.add('active', 'bg-aero-yellow', 'text-slate-900', 'font-bold');
                selectedModalTitle = firstTitle.getAttribute('data-title');
            }
        }
    }

    function updateModalFleetUI(fleet) {
        console.log('Updating modal fleet UI to:', fleet);
        const btns = document.querySelectorAll('.prof-fleet-btn');
        btns.forEach(btn => {
            const svg = btn.querySelector('svg');
            const span = btn.querySelector('span');
            if (btn.getAttribute('data-fleet') === fleet) {
                btn.classList.add('active');
                if (svg) svg.classList.add('text-white');
                if (span) span.classList.add('text-white');
            } else {
                btn.classList.remove('active');
                if (svg) svg.classList.remove('text-white');
                if (span) span.classList.remove('text-white');
            }
        });
    }

    function renderModalAircraftPills(fleet, selectedAircraft = '') {
        console.log('Rendering modal aircraft pills for:', fleet, 'selected:', selectedAircraft);
        const container = document.getElementById('prof-aircraft-pills');
        if (!container) return;
        
        container.innerHTML = '';
        const models = fleetData[fleet] || [];
        
        models.forEach((model, index) => {
            const pill = document.createElement('button');
            pill.type = 'button';
            // Default to first if selectedAircraft not found
            const isActive = selectedAircraft ? (model === selectedAircraft) : (index === 0);
            if (isActive) selectedModalAircraft = model;

            pill.className = `prof-aircraft-pill px-4 py-2 rounded-full font-mono text-sm whitespace-nowrap transition-all ${isActive ? 'active' : ''}`;
            pill.textContent = model;
            
            pill.addEventListener('click', () => {
                container.querySelectorAll('.prof-aircraft-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                selectedModalAircraft = model;
            });
            
            container.appendChild(pill);
        });
    }

    function updateModalGougeUI(gouge) {
        console.log('Updating modal gouge UI to:', gouge);
        const cards = document.querySelectorAll('.prof-challenge-card');
        cards.forEach(card => {
            const span = card.querySelector('span');
            const match = card.getAttribute('data-gouge') === gouge || span?.textContent === gouge;
            if (match) {
                card.classList.add('active');
                if (span) span.classList.add('text-white');
                selectedModalGouge = card.getAttribute('data-gouge') || span?.textContent;
            } else {
                card.classList.remove('active');
                if (span) span.classList.remove('text-white');
            }
        });
    }

    // Modal Fleet Selection
    profFleetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const fleet = btn.getAttribute('data-fleet');
            selectedModalFleet = fleet;
            updateModalFleetUI(fleet);
            renderModalAircraftPills(fleet);
        });
    });

    // Modal Gouge Selection
    profChallengeCards.forEach(card => {
        card.addEventListener('click', () => {
            const gouge = card.getAttribute('data-gouge');
            selectedModalGouge = gouge;
            updateModalGougeUI(gouge);
        });
    });

    // Title Pill Selection
    titlePills.forEach(pill => {
        pill.addEventListener('click', () => {
            titlePills.forEach(p => {
                p.classList.add('bg-slate-800', 'text-gray-400');
                p.classList.remove('active', 'bg-aero-yellow', 'text-slate-900', 'font-bold');
            });
            pill.classList.remove('bg-slate-800', 'text-gray-400');
            pill.classList.add('active', 'bg-aero-yellow', 'text-slate-900', 'font-bold');
            selectedModalTitle = pill.getAttribute('data-title');
        });
    });

    // Handle Sign In Form
    if (formSignin) {
        formSignin.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            toggleModalLoading(true);
            authWithEmailAndPasswordSync(auth, email, password)
                .then(user => {
                    console.log(user);
                    currentUser = user;
                    toggleModalLoading(false);
                    goToStep('profile');
                })
                .catch(res => {
                    console.error(res);
                    toggleModalLoading(false);
                });
        });
    }

    // Airline Search Dropdown
    if (profAirlineInput) {
        profAirlineInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            if (!val) {
                airlineDropdown.classList.add('hidden');
                return;
            }
            
            const filtered = airlines.filter(a => a.toLowerCase().includes(val));
            if (filtered.length > 0) {
                airlineDropdown.innerHTML = filtered.map(a => `<div class="dropdown-item p-3 text-sm cursor-pointer hover:bg-white/5 transition-colors">${a}</div>`).join('');
                airlineDropdown.classList.remove('hidden');
                
                // Add click event to items
                airlineDropdown.querySelectorAll('.dropdown-item').forEach(item => {
                    item.addEventListener('click', () => {
                        profAirlineInput.value = item.textContent;
                        airlineDropdown.classList.add('hidden');
                    });
                });
            } else {
                airlineDropdown.classList.add('hidden');
            }
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profAirlineInput.contains(e.target) && !airlineDropdown.contains(e.target)) {
                airlineDropdown.classList.add('hidden');
            }
        });
    }

    // Handle Profile Form
    if (formProfile) {
        formProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = selectedModalTitle || "Captain";
            const airline = profAirlineInput.value;
            const dateStr = document.getElementById('prof-date').value;
            const name = document.getElementById('prof-name').value || "Eric";
            const gouge = selectedModalGouge || "Emirates";
            
            document.getElementById('welcome-message').textContent = `Welcome to the flight deck, ${title} ${name}.`;
            
            if (dateStr) {
                const interviewDate = new Date(dateStr);
                const today = new Date();
                const diffTime = interviewDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0) {
                    document.getElementById('countdown-text').textContent = `⏳ ${diffDays} Days until your ${airline || gouge} Assessment`;
                    document.getElementById('countdown-card').classList.remove('hidden');
                } else {
                    document.getElementById('countdown-card').classList.add('hidden');
                }
            } else {
                document.getElementById('countdown-card').classList.add('hidden');
            }
            
            goToStep('success');
        });
    }

    // --- State 1: Setup Logic ---
    
    // Initialize default pills (Boeing)
    renderPills('boeing');

    // Fleet Selection
    fleetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Fleet button clicked:', btn.getAttribute('data-fleet'));
            // Remove active state from all fleet buttons
            fleetBtns.forEach(b => {
                b.classList.remove('active', 'border-aero-yellow/60', 'bg-aero-yellow/10', 'ring-1', 'ring-aero-yellow/30');
                b.classList.add('border-transparent', 'bg-slate-800/50');
                
                const icon = b.querySelector('svg');
                const text = b.querySelector('span');
                if (icon) {
                    icon.classList.remove('text-white');
                    icon.classList.add('text-gray-400');
                }
                if (text) {
                    text.classList.remove('text-white');
                    text.classList.add('text-gray-400');
                }
            });

            // Set active state for clicked button
            btn.classList.add('active', 'border-aero-yellow/60', 'bg-aero-yellow/10', 'ring-1', 'ring-aero-yellow/30');
            btn.classList.remove('border-transparent', 'bg-slate-800/50');
            
            const icon = btn.querySelector('svg');
            const text = btn.querySelector('span');
            if (icon) {
                icon.classList.remove('text-gray-400');
                icon.classList.add('text-white');
            }
            if (text) {
                text.classList.remove('text-gray-400');
                text.classList.add('text-white');
            }

            // Render Pills
            const fleet = btn.getAttribute('data-fleet');
            renderPills(fleet);
        });
    });

    function renderPills(fleet) {
        if (!aircraftPillsContainer) {
            console.error('aircraftPillsContainer not found');
            return;
        }
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
                c.classList.remove('active', 'bg-slate-800/80', 'border-aero-yellow/60', 'ring-1', 'ring-aero-yellow/30');
                c.classList.add('bg-slate-800/30', 'border-slate-700');
            });
            card.classList.remove('bg-slate-800/30', 'border-slate-700');
            card.classList.add('active', 'bg-slate-800/80', 'border-aero-yellow/60', 'ring-1', 'ring-aero-yellow/30');
        });
    });

    // Start Challenge Transition
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            console.log('Start button clicked');
            stateSetup.classList.add('opacity-0');
            
            setTimeout(() => {
                stateSetup.classList.add('hidden');
                stateCombined.classList.remove('hidden');
                
                // Trigger reflow
                void stateCombined.offsetWidth;
                
                stateCombined.classList.remove('opacity-0');
                
                // Start Timer (2:59 = 179 seconds)
                startTimer(179);
                
                // Generate Visualizer Bars
                createVisualizerBars();
                
                // Ensure scroll to top/start of state 2
                scrollToBottom(false);
                
            }, 500);
        });
    }

    // --- Combined State Logic ---

    function startTimer(seconds) {
        let timeLeft = seconds;
        updateTimerDisplay(timeLeft);
        
        countdownInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                showEvaluation();
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        if (!timerElement) return;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function createVisualizerBars() {
        if (!audioVisualizer) return;
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

    // Mic Interaction
    if (btnMic) {
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
    }

    function startRecording() {
        if (isRecording) return;
        isRecording = true;
        
        btnMic.classList.add('bg-red-500', 'text-white');
        btnMic.classList.remove('bg-red-500/10', 'text-red-500');
        
        animateVisualizer();
    }

    function stopRecording() {
        if (!isRecording) return;
        isRecording = false;
        
        btnMic.classList.remove('bg-red-500', 'text-white');
        btnMic.classList.add('bg-red-500/10', 'text-red-500');
        
        // Reset visualizer bars
        const bars = audioVisualizer.children;
        for (let bar of bars) {
            bar.style.height = '4px';
        }
    }

    // Submit & Skip
    if(btnSubmit) btnSubmit.addEventListener('click', () => {
        const input = document.getElementById('text-input');
        if (input && input.value.trim() !== "") {
            // Simulate sending message
            userResponsePlaceholder.innerHTML = `
                <div class="flex items-start gap-3 justify-end">
                    <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%]">
                        <p class="text-sm font-medium leading-relaxed">${input.value}</p>
                    </div>
                </div>
            `;
            input.value = '';
            
            // Scroll to bottom
            scrollToBottom();
            
            showEvaluation();
        } else {
            showEvaluation();
        }
    });

    if(btnSkip) btnSkip.addEventListener('click', showEvaluation);

    function showEvaluation() {
        clearInterval(countdownInterval);
        isRecording = false;
        
        // Hide Input Area
        inputArea.classList.add('hidden');
        
        // Show Evaluation with delay for "Thinking" feel
        setTimeout(() => {
            evaluationArea.classList.remove('hidden');
            void evaluationArea.offsetWidth;
            evaluationArea.classList.remove('opacity-0');
            
            // Scroll to bottom
            scrollToBottom();
        }, 800);
    }
});
