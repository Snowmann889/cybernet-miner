// --- GAME STATE ---
let gameState = {
    coins: 0.0,
    totalCoins: 0.0,
    clicks: 0,
    dpc: 1.0,
    dps: 0.0,
    upgradesOwned: 0,
    upgrades: {
        // Automation (Passive Income)
        bot: { level: 0, cost: 15, baseCost: 15, mult: 1.15, val: 0.1, category: 'auto', name: 'Sub-Routine Bot', desc: 'Low-level automated script running basic hacks.' },
        cpu: { level: 0, cost: 100, baseCost: 100, mult: 1.15, val: 1.0, category: 'auto', name: 'Quantum CPU Node', desc: 'Overclocked multi-thread processor node.' },
        grid: { level: 0, cost: 1100, baseCost: 1100, mult: 1.15, val: 8.0, category: 'auto', name: 'Mainframe Grid', desc: 'Decentralized cluster of cloud servers.' },
        ai: { level: 0, cost: 12000, baseCost: 12000, mult: 1.15, val: 47.0, category: 'auto', name: 'AI DeepMiner', desc: 'Autonomous neural agent optimized for extraction.' },
        singularity: { level: 0, cost: 130000, baseCost: 130000, mult: 1.15, val: 260.0, category: 'auto', name: 'Singularity Core', desc: 'Harvests quantum energy from a micro-singularity.' },
        
        // Click/Hardware Upgrades (Active Income)
        buffer: { level: 0, cost: 50, baseCost: 50, mult: 1.18, val: 1.0, category: 'click', name: 'Buffer Overclocker', desc: 'Boosts click power with high-speed memory buffers.' },
        neural: { level: 0, cost: 500, baseCost: 500, mult: 1.18, val: 5.0, category: 'click', name: 'Neural Link Interface', desc: 'Direct synaptic connection for ultra-fast clicking.' },
        firewall: { level: 0, cost: 3000, baseCost: 3000, mult: 1.18, val: 25.0, category: 'click', name: 'Firewall Breaker', desc: 'Bypasses nodes to extract large packet injections.' },
        exploit: { level: 0, cost: 25000, baseCost: 25000, mult: 1.18, val: 150.0, category: 'click', name: 'Zero-Day Exploit', desc: 'Unleashes a critical payload on the mainframe.' }
    }
};

// --- SYSTEM CONSTANTS & TIPS ---
const SAVESTR = "cybernet_miner_save_state";
const TIPS = [
    "Tip: Automated subroutines run even when you are not clicking.",
    "Tip: Neural Link and Firewall Breaker multiply click power dramatically.",
    "Tip: Manual saving ensures your cyber-progress is securely uploaded.",
    "Tip: Look out for Critical Hacks (5x multiplier) on core clicks!",
    "Tip: Sub-Routine Bots are cheap but stack up in large numbers.",
    "Tip: Keep upgrading CPUs to unlock faster clock cycles.",
    "Tip: Reaching high Datacoin levels allows you to breach deep security layers."
];
let currentTipIndex = 0;
let activeCategory = 'auto';

// --- INITIALIZE GAME ---
document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    setupEventListeners();
    renderShop();
    updateUI();
    
    // Start game tick loop (every 100ms)
    setInterval(gameTick, 100);
    
    // Auto-save every 15 seconds
    setInterval(saveGame, 15000);

    // Rotate tips every 15 seconds
    setInterval(rotateTips, 15000);
});

// --- LOAD & SAVE MANAGEMENT ---
function saveGame() {
    localStorage.setItem(SAVESTR, JSON.stringify(gameState));
    showNotification("STATE UPLOADED", "Game autosaved successfully to local mainframe.", "cyan");
}

function loadGame() {
    const savedData = localStorage.getItem(SAVESTR);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            // Deep merge to handle added features/upgrades in updates
            if (parsed.coins !== undefined) gameState.coins = parsed.coins;
            if (parsed.totalCoins !== undefined) gameState.totalCoins = parsed.totalCoins;
            if (parsed.clicks !== undefined) gameState.clicks = parsed.clicks;
            
            // Rebuild upgrades structure to avoid issues if game keys change
            if (parsed.upgrades) {
                for (let key in parsed.upgrades) {
                    if (gameState.upgrades[key]) {
                        gameState.upgrades[key].level = parsed.upgrades[key].level;
                        // Recalculate cost based on level
                        gameState.upgrades[key].cost = Math.round(
                            gameState.upgrades[key].baseCost * Math.pow(gameState.upgrades[key].mult, gameState.upgrades[key].level)
                        );
                    }
                }
            }
            recalculateStats();
            showNotification("SESSION RESTORED", "Loaded previous encryption keys.", "cyan");
        } catch (e) {
            console.error("Save state corrupted, resetting...", e);
            resetGame(true);
        }
    }
}

function resetGame(silent = false) {
    if (silent || confirm("WARNING: Clear all mainframe upgrades and coin records? This cannot be undone.")) {
        localStorage.removeItem(SAVESTR);
        gameState.coins = 0.0;
        gameState.totalCoins = 0.0;
        gameState.clicks = 0;
        gameState.dpc = 1.0;
        gameState.dps = 0.0;
        gameState.upgradesOwned = 0;
        for (let key in gameState.upgrades) {
            gameState.upgrades[key].level = 0;
            gameState.upgrades[key].cost = gameState.upgrades[key].baseCost;
        }
        recalculateStats();
        renderShop();
        updateUI();
        if (!silent) showNotification("SYSTEM RESET", "Mainframe cleared. Re-initializing...", "magenta");
    }
}

// --- STATS RECALCULATION ---
function recalculateStats() {
    let passiveIncome = 0;
    let clickPower = 1.0;
    let itemsOwned = 0;

    for (let key in gameState.upgrades) {
        const item = gameState.upgrades[key];
        itemsOwned += item.level;
        if (item.category === 'auto') {
            passiveIncome += item.level * item.val;
        } else if (item.category === 'click') {
            clickPower += item.level * item.val;
        }
    }

    gameState.dps = passiveIncome;
    gameState.dpc = clickPower;
    gameState.upgradesOwned = itemsOwned;
}

// --- CORE GAME LOOP ---
function gameTick() {
    // 100ms tick, add 10% of dps
    if (gameState.dps > 0) {
        const addedCoins = gameState.dps * 0.1;
        gameState.coins += addedCoins;
        gameState.totalCoins += addedCoins;
        updateUI();
    }
    
    // Check shop purchases eligibility
    updateShopButtonStates();
}

// --- NUMBER FORMATTING ---
function formatNumber(num) {
    if (num < 1000) {
        return num.toFixed(2);
    }
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx"];
    const i = Math.floor(Math.log10(num) / 3);
    const formatted = (num / Math.pow(10, i * 3)).toFixed(2);
    return formatted + " " + suffixes[i];
}

// --- UI UPDATING ---
function updateUI() {
    document.getElementById("coins-display").innerText = formatNumber(gameState.coins);
    document.getElementById("coins-per-sec").innerText = formatNumber(gameState.dps) + " / SEC";
    document.getElementById("dpc-display").innerText = formatNumber(gameState.dpc);
    document.getElementById("clicks-display").innerText = gameState.clicks.toLocaleString();
    document.getElementById("upgrades-display").innerText = gameState.upgradesOwned.toLocaleString();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Core click
    const coreBtn = document.getElementById("click-core");
    coreBtn.addEventListener("click", (e) => {
        handleCoreClick(e);
    });

    // Save & Reset Buttons
    document.getElementById("save-btn").addEventListener("click", saveGame);
    document.getElementById("reset-btn").addEventListener("click", () => resetGame(false));

    // Shop tab switching
    const tabBtns = document.querySelectorAll(".category-btn");
    tabBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            tabBtns.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.getAttribute("data-category");
            renderShop();
        });
    });
}

// --- CORE CLICK HANDLER ---
function handleCoreClick(event) {
    gameState.clicks++;
    
    // Critical Hack Logic (5% chance)
    const isCritical = Math.random() < 0.05;
    const clickVal = isCritical ? gameState.dpc * 5 : gameState.dpc;
    
    gameState.coins += clickVal;
    gameState.totalCoins += clickVal;
    
    updateUI();

    // Trigger visual float number
    spawnFloatingNumber(event, clickVal, isCritical);
}

// --- FLOATING NUMBERS ON CLICK ---
function spawnFloatingNumber(event, value, isCritical) {
    const coreBtn = document.getElementById("click-core");
    const rect = coreBtn.getBoundingClientRect();
    
    // Calculate click offset relative to the viewport
    let x, y;
    if (event.clientX && event.clientY) {
        x = event.clientX;
        y = event.clientY;
    } else {
        // Fallback for keypress clicks/automated tests
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    const floater = document.createElement("div");
    floater.className = "floating-number";
    if (isCritical) {
        floater.classList.add("critical");
        floater.innerText = `CRIT! +${formatNumber(value)}`;
    } else {
        floater.innerText = `+${formatNumber(value)}`;
    }

    // Set position and randomized slight angle
    floater.style.left = `${x}px`;
    floater.style.top = `${y}px`;
    
    // Random offset
    const randomX = (Math.random() - 0.5) * 40;
    floater.style.transform = `translate(-50%, -50%) translate(${randomX}px, 0)`;

    document.body.appendChild(floater);

    // Remove element after animation completes
    floater.addEventListener("animationend", () => {
        floater.remove();
    });
}

// --- SHOP RENDERING & UPDATES ---
function renderShop() {
    const shopContainer = document.getElementById("shop-container");
    shopContainer.innerHTML = "";

    for (let key in gameState.upgrades) {
        const item = gameState.upgrades[key];
        
        // Filter out if not in the current category
        if (item.category !== activeCategory) continue;

        const card = document.createElement("div");
        card.className = "upgrade-card";
        card.id = `upgrade-${key}`;

        const effectText = item.category === 'auto' 
            ? `+${formatNumber(item.val)} coins/sec` 
            : `+${formatNumber(item.val)} clicks`;

        card.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-title-row">
                    <span class="upgrade-name">${item.name}</span>
                    <span class="upgrade-level" id="level-${key}">Lvl ${item.level}</span>
                </div>
                <div class="upgrade-desc">${item.desc}</div>
                <div class="upgrade-effect">${effectText}</div>
            </div>
            <button class="buy-btn" id="buy-btn-${key}" onclick="buyUpgrade('${key}')">
                <span class="cost-label">BREACH COST</span>
                <span class="cost-val" id="cost-${key}">${formatNumber(item.cost)}</span>
            </button>
        `;

        shopContainer.appendChild(card);
    }
    updateShopButtonStates();
}

function updateShopButtonStates() {
    for (let key in gameState.upgrades) {
        const item = gameState.upgrades[key];
        const btn = document.getElementById(`buy-btn-${key}`);
        if (btn) {
            btn.disabled = gameState.coins < item.cost;
        }
    }
}

// --- BUY UPGRADE HIERARCHY ---
window.buyUpgrade = function(key) {
    const item = gameState.upgrades[key];
    if (gameState.coins >= item.cost) {
        gameState.coins -= item.cost;
        item.level++;
        
        // Scale cost: Cost = BaseCost * (Multiplier ^ Level)
        item.cost = Math.round(item.baseCost * Math.pow(item.mult, item.level));
        
        recalculateStats();
        saveGame();
        
        // UI updates
        const levelSpan = document.getElementById(`level-${key}`);
        if (levelSpan) levelSpan.innerText = `Lvl ${item.level}`;
        
        const costSpan = document.getElementById(`cost-${key}`);
        if (costSpan) costSpan.innerText = formatNumber(item.cost);
        
        updateUI();
        updateShopButtonStates();
        
        showNotification(
            "BREACH SUCCESS", 
            `${item.name} is now upgraded to Level ${item.level}!`, 
            item.category === 'click' ? 'magenta' : 'cyan'
        );
    }
};

// --- SYSTEM TOAST NOTIFICATIONS ---
function showNotification(title, text, theme = "cyan") {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${theme === 'magenta' ? 'magenta' : ''}`;
    toast.innerHTML = `
        <div class="toast-body">
            <strong>${title}</strong>: ${text}
        </div>
    `;

    container.appendChild(toast);

    // Auto delete from DOM
    toast.addEventListener("animationend", (e) => {
        if (e.animationName === "toast-out") {
            toast.remove();
        }
    });
}

// --- TIP MANAGEMENT ---
function rotateTips() {
    currentTipIndex = (currentTipIndex + 1) % TIPS.length;
    const tipTextEl = document.getElementById("tip-text");
    if (tipTextEl) {
        tipTextEl.style.opacity = 0;
        setTimeout(() => {
            tipTextEl.innerText = TIPS[currentTipIndex];
            tipTextEl.style.opacity = 1;
        }, 300);
    }
}
