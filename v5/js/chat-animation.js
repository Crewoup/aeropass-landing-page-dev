/**
 * Chat Typing Effect Animation
 * 實作 AI 提問、User 模擬輸入、AI 思考中、AI 回饋的打字效果
 */

const chatData = {
    initial: {
        question: "You're at FL350 and encounter unexpected severe turbulence. Your airspeed fluctuates wildly. Walk me through your immediate actions and CRM process.",
        userAnswer: "First, I would disconnect the autothrottle and maintain a target attitude rather than chasing airspeed. I'd set continuous ignition, check the seatbelt sign, and communicate with the FO to execute the Severe Turbulence checklist while requesting a block altitude from ATC.",
        aiFeedback: "Excellent. Your prioritization of attitude over airspeed is correct. By setting continuous ignition, you protect the engines from flameout, and the CRM coordination ensures the workload is shared during a high-stress phase.",
        followUps: [
            { 
                id: "f1",
                label: "How would you handle a cabin altitude warning?", 
                question: "How would you handle a cabin altitude warning during this scenario?", 
                answer: "I would immediately don oxygen masks and establish communication. Then I'd initiate an emergency descent if the cabin altitude is uncontrollable, while coordinating with ATC and the cabin crew." 
            },
            { 
                id: "f2",
                label: "What are the specific pitch/N1 values?", 
                question: "What are the specific pitch/N1 values for your aircraft type during severe turbulence?", 
                answer: "For the B777 at cruise altitude, I would target approximately 4 degrees pitch and 85% N1 as a starting point, adjusting for actual weight and altitude as per the QRH." 
            }
        ]
    }
};

const chatBody = document.getElementById('chat-body-content');
const chatInputText = document.getElementById('chat-input-text');

/**
 * 建立打字指示器 (Typing Indicator) 的 HTML
 */
function createTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'ai-typing-indicator';
    div.className = 'flex items-start gap-3 animation-fade-in';
    div.innerHTML = `
        <div class="bg-captain-card border border-white/5 rounded-2xl rounded-tl-none p-4 shadow-md">
            <div class="flex gap-1.5 items-center h-5">
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
            </div>
        </div>
    `;
    return div;
}

/**
 * 建立 AI 訊息的 HTML 結構
 */
function createAiMessageContainer() {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3';
    div.innerHTML = `
        <div class="bg-captain-card border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[90%] shadow-md">
            <p class="text-sm text-gray-200 leading-relaxed"></p>
        </div>
    `;
    return div;
}

/**
 * 建立 User 訊息的 HTML 結構
 */
function createUserMessageContainer(text) {
    const div = document.createElement('div');
    div.className = 'flex items-start gap-3 justify-end';
    div.innerHTML = `
        <div class="bg-captain-blue/20 border border-captain-blue/30 rounded-2xl rounded-tr-none p-4 max-w-[90%] shadow-lg">
            <p class="text-sm text-gray-200 leading-relaxed">${text}</p>
        </div>
    `;
    return div;
}

/**
 * 建立 Follow-up Questions 的 HTML 結構
 */
function createFollowUpsContainer(followUps) {
    const div = document.createElement('div');
    div.className = 'mt-4 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-500';
    div.id = 'follow-up-container';
    
    followUps.forEach(item => {
        const span = document.createElement('span');
        span.className = 'bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors follow-up-btn';
        span.textContent = `Follow-up: ${item.label}`;
        span.dataset.followUpId = item.id;
        span.onclick = () => handleFollowUpClick(item);
        div.appendChild(span);
    });
    return div;
}

/**
 * 打字效果函數
 * @param {HTMLElement} element 要寫入文字的元素
 * @param {string} text 完整文字內容
 * @param {number} speed 打字速度 (ms)
 * @returns {Promise}
 */
function typeWriter(element, text, speed = 15) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                // 自動捲動到底部
                chatBody.scrollTop = chatBody.scrollHeight;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

/**
 * 模擬在 Input Box 打字的效果
 * @param {HTMLElement} element 顯示打字內容的元素
 * @param {string} text 要模擬輸入的文字
 * @param {number} maxChars 最多打多少個字就停止
 * @param {number} speed 打字速度 (ms)
 * @returns {Promise}
 */
function simulateInputTyping(element, text, maxChars = 50, speed = 30) {
    return new Promise(resolve => {
        let i = 0;
        element.textContent = '';
        element.classList.remove('text-gray-500');
        element.classList.add('text-white');
        
        function type() {
            if (i < text.length && i < maxChars) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // 打到指定字數後，補上 ... 表示還在輸入
                element.textContent += '...';
                setTimeout(resolve, 500);
            }
        }
        type();
    });
}

/**
 * 延遲函數
 * @param {number} ms 
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 啟動主對話動畫流程
 */
async function startInitialChatAnimation() {
    if (!chatBody || !chatInputText) return;

    // 清空初始內容
    chatBody.innerHTML = '';
    
    // 1. AI 輸出 Question
    const qContainer = createAiMessageContainer();
    chatBody.appendChild(qContainer);
    const qTextElement = qContainer.querySelector('p');
    await typeWriter(qTextElement, chatData.initial.question, 15);
    
    await sleep(1000);

    // 2. 模擬 User 在 Input Box 輸入 (約 50 字)
    await simulateInputTyping(chatInputText, chatData.initial.userAnswer, 50, 25);
    
    await sleep(500);

    // 3. User 訊息出現在對話框
    const uContainer = createUserMessageContainer(chatData.initial.userAnswer);
    chatBody.appendChild(uContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // 重置 Input Box
    chatInputText.textContent = 'Type your response...';
    chatInputText.classList.remove('text-white');
    chatInputText.classList.add('text-gray-500');

    await sleep(800);

    // 4. 顯示 AI 思考中動畫
    await showAiThinking();

    // 5. AI 打字輸出 Feedback
    const fContainer = createAiMessageContainer();
    chatBody.appendChild(fContainer);
    const fTextElement = fContainer.querySelector('p');
    await typeWriter(fTextElement, chatData.initial.aiFeedback, 15);
    
    await sleep(800);

    // 6. 出現 Follow-up questions
    showFollowUps(chatData.initial.followUps);
}

/**
 * 處理 AI 思考中效果
 */
async function showAiThinking() {
    const indicator = createTypingIndicator();
    chatBody.appendChild(indicator);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    const thinkTime = Math.floor(Math.random() * 2000) + 3000; // 3000ms - 5000ms
    await sleep(thinkTime);
    
    indicator.remove();
}

/**
 * 顯示 Follow-up Questions
 */
function showFollowUps(followUps) {
    const container = createFollowUpsContainer(followUps);
    chatBody.appendChild(container);
    setTimeout(() => {
        container.classList.remove('opacity-0');
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
}

const followUpShowsMap = {};

/**
 * 處理 Follow-up 點擊
 */
async function handleFollowUpClick(item) {
    // 移除現有的 Follow-up 按鈕
    const container = document.getElementById('follow-up-container');
    if (container) container.remove();

    // 0. shows flag
    followUpShowsMap[item.id] = true;

    // 1. AI 提問 (左側)
    const qContainer = createAiMessageContainer();
    chatBody.appendChild(qContainer);
    const qTextElement = qContainer.querySelector('p');
    await typeWriter(qTextElement, item.question, 15);

    await sleep(1000);

    // 2. 模擬 User 在 Input Box 輸入 (約 50 字)
    await simulateInputTyping(chatInputText, item.answer, 50, 25);
    
    await sleep(500);

    // 3. User 回答出現在對話框 (右側)
    const uContainer = createUserMessageContainer(item.answer);
    chatBody.appendChild(uContainer);
    chatBody.scrollTop = chatBody.scrollHeight;

    // 重置 Input Box
    chatInputText.textContent = 'Type your response...';
    chatInputText.classList.remove('text-white');
    chatInputText.classList.add('text-gray-500');

    await sleep(800);
    
    // 顯示剩餘的 Follow-up
    const remaining = chatData.initial.followUps.filter(f => !(f.id in followUpShowsMap));
    if (remaining.length > 0) {
        showFollowUps(remaining);
    }
}

// 當元素進入視窗時才開始播放動畫
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startInitialChatAnimation();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.glass-card');
    if (chatContainer) {
        observer.observe(chatContainer);
    }
});
