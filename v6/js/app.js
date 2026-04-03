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

import { 
    verifyFirebaseToken, 
    updateProfile,
    getAirlines
} from "./api.js";

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyD5dsy5tG3BFg4T7GA_kAQ8a3p3qFWSf7M",
    authDomain: "auth.captainai.app",
    projectId: "graceful-goods-488405-i7",
    storageBucket: "graceful-goods-488405-i7.firebasestorage.app",
    messagingSenderId: "909923853969",
    appId: "1:909923853969:web:48b5eb2c0f3ad260fc0130",
};

let currentUser = null;
let fromLoginPopup = false;
let userShouldFillProfile = false;

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 監聽登入狀態
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const idToken = await user.getIdToken();
            const verifyResult = await verifyFirebaseToken(idToken);
            userShouldFillProfile = verifyResult.is_first_login;
            changeLogState(true);
            
            if (fromLoginPopup && userShouldFillProfile) {
                // 如果是從彈窗登入且需要填寫資料
                window.location.href = `https://console.captainai.app/?token=${idToken}&new=1`;
            } else if (fromLoginPopup) {
                window.location.href = `https://console.captainai.app/?token=${idToken}`;
            }
        } catch (error) {
            console.error("Auth Error:", error);
        }
    } else {
        changeLogState(false);
    }
});

function changeLogState(isLogin) {
    const btnSigninNav = document.getElementById('btn-signin-nav');
    if (btnSigninNav) {
        btnSigninNav.textContent = isLogin ? 'Open Console' : 'Sign In';
        btnSigninNav.onclick = isLogin ? () => {
            currentUser.getIdToken().then(token => {
                window.location.href = `https://console.captainai.app/?token=${token}`;
            });
        } : null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const stateSetup = document.getElementById('state-setup');
    const stateCombined = document.getElementById('state-combined');
    const evaluationArea = document.getElementById('evaluation-area');
    const inputArea = document.getElementById('input-area');
    const userResponsePlaceholder = document.getElementById('user-response-placeholder');
    const conversationContainer = document.getElementById('conversation-container');
    
    const moduleBtns = document.querySelectorAll('.module-btn');
    const btnStart = document.getElementById('btn-start-challenge');
    const btnSubmit = document.getElementById('btn-submit');
    const btnMic = document.getElementById('btn-mic');
    const aiQuestionText = document.getElementById('ai-question');
    const timerElement = document.getElementById('timer');

    let selectedModule = 'technical';
    let isEvaluationShown = false;

    const questions = {
        technical: "You are at V1, right engine failure, explicit fire warning. The fire bell rings after V1 but before Vr. What is your immediate decision and callout?",
        hr: "Describe a time when you had to deal with a difficult crew member or superior. How did you handle the situation while maintaining safety standards?",
        situational: "Your aircraft is experiencing a total electrical failure in IMC. You have limited battery life. What are your immediate priorities and how do you communicate your intentions?"
    };

    // Module Selection Logic
    moduleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moduleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedModule = btn.getAttribute('data-module');
            
            // Update AI preview question if needed
            if (aiQuestionText) {
                aiQuestionText.textContent = `"${questions[selectedModule]}"`;
            }
        });
    });

    // Start Challenge
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            stateSetup.classList.add('opacity-0');
            setTimeout(() => {
                stateSetup.classList.add('hidden');
                stateCombined.classList.remove('hidden');
                void stateCombined.offsetWidth;
                stateCombined.classList.remove('opacity-0');
                
                // Set the question based on selection
                aiQuestionText.textContent = `"${questions[selectedModule]}"`;
                
                // Start a simple visual timer
                startTimer(180);
            }, 500);
        });
    }

    // Submit Response
    if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
            const input = document.getElementById('text-input');
            if (input && input.value.trim() !== "") {
                appendUserMessage(input.value);
                input.value = '';
                showEvaluation();
            }
        });
    }

    // Mic Button (Visual Only)
    if (btnMic) {
        btnMic.addEventListener('click', () => {
            const input = document.getElementById('text-input');
            input.value = "Actually, according to SOP, I would continue the takeoff since we are past V1...";
            // Simulate voice-to-text
            setTimeout(() => {
                appendUserMessage(input.value);
                input.value = '';
                showEvaluation();
            }, 1000);
        });
    }

    function appendUserMessage(text) {
        userResponsePlaceholder.innerHTML = `
            <div class="flex items-start gap-3 justify-end animate-fade-in-up">
                <div class="bg-captain-purple text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] shadow-lg">
                    <p class="text-sm font-medium leading-relaxed">${text}</p>
                </div>
            </div>
        `;
        scrollToBottom();
    }

    function showEvaluation() {
        if (isEvaluationShown) return;
        isEvaluationShown = true;
        
        // Hide input area
        inputArea.classList.add('opacity-0');
        setTimeout(() => inputArea.classList.add('hidden'), 300);

        // Show thinking state or evaluation
        setTimeout(() => {
            evaluationArea.classList.remove('hidden');
            void evaluationArea.offsetWidth;
            evaluationArea.classList.remove('opacity-0');
            scrollToBottom();
        }, 1000);
    }

    function startTimer(seconds) {
        let timeLeft = seconds;
        const interval = setInterval(() => {
            timeLeft--;
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) clearInterval(interval);
        }, 1000);
    }

    function scrollToBottom() {
        conversationContainer.scrollTo({
            top: conversationContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Sign in trigger from navbar/hero
    const btnSigninNav = document.getElementById('btn-signin-nav');
    const btnHeroCta = document.getElementById('btn-hero-cta');
    const btnUnlockCta = document.getElementById('btn-unlock-cta');

    const handleAuth = () => {
        if (currentUser) {
            currentUser.getIdToken().then(token => {
                window.location.href = `https://console.captainai.app/?token=${token}`;
            });
        } else {
            fromLoginPopup = true;
            signInWithPopup(auth, provider).catch(err => console.error(err));
        }
    };

    if (btnSigninNav) btnSigninNav.onclick = handleAuth;
    if (btnHeroCta) btnHeroCta.onclick = handleAuth;
    if (btnUnlockCta) btnUnlockCta.onclick = handleAuth;
});
