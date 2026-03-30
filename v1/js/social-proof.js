// Mock Data Pool based on structure.md
const notifications = [
    // Type A: Competition/Activity
    { icon: "fa-plane", text: "A B777 Captain just started the Question Bank mode.", time: "Just now", color: "text-accent-cyan" },
    { icon: "fa-users", text: "An A320 FO is currently practicing HR scenarios.", time: "2 mins ago", color: "text-accent-green" },
    { icon: "fa-globe", text: "A pilot is currently preparing for an Emirates interview.", time: "5 mins ago", color: "text-accent-cyan" },
    
    // Type B: Conversion/Value
    { icon: "fa-lock-open", text: "A B737 pilot just created an account to unlock AI feedback.", time: "1 min ago", color: "text-accent-violet" },
    { icon: "fa-check-circle", text: "An FO just completed an interview session with the AI Check Airman.", time: "Just now", color: "text-accent-green" },
    
    // Type C: Scarcity/Heat
    { icon: "fa-fire", text: "4 pilots are currently preparing in the HR mode.", time: "Live", color: "text-red-400" },
    { icon: "fa-clock", text: "12 interview sessions completed in the last hour.", time: "1 hour ago", color: "text-accent-cyan" }
];

const container = document.getElementById('toast-container');

function createToast(data) {
    const toast = document.createElement('div');
    // Using CSS classes defined in style.css for enter/exit animations
    toast.className = 'glass-card p-4 rounded-xl flex items-center gap-4 min-w-[320px] max-w-sm border-l-4 border-accent-cyan shadow-2xl backdrop-blur-xl bg-bg-primary/80 toast-enter';
    
    toast.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center ${data.color} font-bold border border-white/10 shadow-inner">
            <i class="fa-solid ${data.icon}"></i>
        </div>
        <div>
            <p class="text-xs font-bold text-text-main leading-tight mb-1">${data.text}</p>
            <p class="text-[10px] text-text-muted font-mono">${data.time}</p>
        </div>
    `;

    container.appendChild(toast);

    // Trigger Enter Animation
    requestAnimationFrame(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-enter-active');
    });

    // Remove after 4 seconds (Stay time)
    setTimeout(() => {
        toast.classList.remove('toast-enter-active');
        toast.classList.add('toast-exit-active');
        
        // Remove from DOM after transition
        setTimeout(() => {
            toast.remove();
        }, 500); // Match CSS transition duration
    }, 4000);
}

function scheduleNextNotification() {
    // Random interval between 12-25 seconds
    const interval = Math.random() * (25000 - 12000) + 12000;
    
    setTimeout(() => {
        // Pick random notification
        const randomData = notifications[Math.floor(Math.random() * notifications.length)];
        createToast(randomData);
        
        // Schedule the next one
        scheduleNextNotification();
    }, interval);
}

// Start the loop after initial page load with 5-8s delay
document.addEventListener('DOMContentLoaded', () => {
    const initialDelay = Math.random() * (8000 - 5000) + 5000;
    setTimeout(scheduleNextNotification, initialDelay);
});
