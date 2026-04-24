/**
 * Chat Typing Effect Animation
 * 實作 AI 提問、User 模擬輸入、AI 思考中、AI 回饋的打字效果
 */

const chatData = {
    initial: {
        question: "CX888, HKG-JFK, 15 hours flight duration, Augmented Crew (4 Pilots). 6 hours into the flight over the North Pacific, the Relief Captain (currently on rest) reports severe, acute abdominal pain and persistent dizziness. Concurrently, the aircraft EICAS displays a FUEL CTR L PUMP pressure message, followed by a minor fuel imbalance. Medlink suggests potential appendicitis for the Relief Captain, requiring clinical observation.",
        userAnswer: `I would stabilize the aircraft first and run the fuel QRH so I know the fuel situation is contained.
At the same time, I would remove the relief captain from duty and keep him under continuous cabin crew observation with MedLink support.
Then I would reassess the remaining three-pilot crew against two things: whether we still have a legal and sustainable FDP for the rest of the flight, and whether the fuel system abnormal changes our ETOPS or destination margin.
If both the technical issue and the crew situation remain stable, I can continue. If either one starts reducing my safety margin, I will divert early to a suitable airport with medical support.`,
        // aiFeedback: "Excellent. Your prioritization of attitude over airspeed is correct. By setting continuous ignition, you protect the engines from flameout, and the CRM coordination ensures the workload is shared during a high-stress phase.",
        followUps: [
            { 
                id: "f1",
                // label: "How would you handle a cabin altitude warning?", 
                question: "If the fuel abnormal starts affecting ETOPS suitability, how does that change your continuation decision?", 
                answer: `If the fuel abnormal starts affecting ETOPS suitability, my continuation bias changes immediately.
At that point, I need to confirm whether the aircraft still supports the route legally and safely. If the ETOPS margin is no longer protected, I will not continue deeper into the Pacific. I will coordinate with ATC and Dispatch and divert early to the nearest suitable airport.
The key point is that once ETOPS margin becomes uncertain, I treat that as a decision trigger, not something to manage optimistically.`
            },
            { 
                id: "f2",
                // label: "What are the specific pitch/N1 values?", 
                question: "Which diversion field would you prefer in the North Pacific, and why?", 
                answer: `My first preference would usually be Anchorage, because it gives me the best medical support for a possible appendicitis and the strongest engineering support for the fuel system issue.
If time becomes more critical and a closer field is clearly suitable, then I would take the nearer option, such as Cold Bay, provided weather, runway, and support are acceptable.
So the decision is not just nearest versus farthest. It is the best balance between medical urgency, aircraft support, and safe recovery of the operation.` 
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
            <p class="text-sm text-gray-200 leading-relaxed whitespace-pre-line">${text}</p>
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
        span.className = 'bg-blue-500/10 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors follow-up-btn w-full';
        span.textContent = `Follow-up: ${item.question}`;
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
function simulateInputTyping(element, text, maxChars = 80, speed = 25) {
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

    // 2. 模擬 User 在 Input Box 輸入 (約 80 字)
    await simulateInputTyping(chatInputText, chatData.initial.userAnswer);
    
    await sleep(500);

    // 3. User 訊息出現在對話框
    const uContainer = createUserMessageContainer(chatData.initial.userAnswer);
    chatBody.appendChild(uContainer);
    // if it contains new line wait 50ms for rendering
    setTimeout(() => chatBody.scrollTop = chatBody.scrollHeight, 50);
    
    // 重置 Input Box
    chatInputText.textContent = 'Type your response...';
    chatInputText.classList.remove('text-white');
    chatInputText.classList.add('text-gray-500');

    // await sleep(800);

    // // 4. 顯示 AI 思考中動畫
    // await showAiThinking();

    // // 5. AI 打字輸出 Feedback
    // const fContainer = createAiMessageContainer();
    // chatBody.appendChild(fContainer);
    // const fTextElement = fContainer.querySelector('p');
    // await typeWriter(fTextElement, chatData.initial.aiFeedback, 15);
    
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

    // 2. 模擬 User 在 Input Box 輸入 (約 80 字)
    await simulateInputTyping(chatInputText, item.answer);
    
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
