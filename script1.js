// ===================================================
//                 ECHOVAULT
// ===================================================
//
// Version: 1.0
//
// Sections
//
// 1. Global Variables
// 2. Memory Form
// 3. Navigation
// 4. Load Memories
// 5. Memory Actions
// 6. Import / Export
// 7. Voice Recording
// 8. Vault Security
// 9. Toast Notifications
// 10. Initialization
//
// ===================================================


// ===================================================
// GLOBAL VARIABLES
// ===================================================
let editingMemoryId = null;
let editOriginalTime = null;
let deletingMemoryId = null;
let selectedCategory = "All";
let favouritesOnly = false;
let showFavouritesOnly = false;
let timelineFilterType = "all";
let timelineFilterCategory = "";
let mediaRecorder;
let audioChunks = [];
let recordedAudio = null;
let recordedAudioURL = null;
let recordingInterval;
let recordingSeconds = 0;


// ===================================================
// DEBOUNCE UTILITY (Prevents search lag)
// ===================================================

function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


async function hashPIN(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkPINMatch(enteredPin, storedValue) {

    // Legacy plain-text PIN (exactly 4 digits) — accept once, then upgrade it to a hash
    if (/^\d{4}$/.test(storedValue)) {
        if (enteredPin === storedValue) {
            const upgradedHash = await hashPIN(enteredPin);
            localStorage.setItem("vaultPIN", upgradedHash);
            vaultPIN = upgradedHash;
            return true;
        }
        return false;
    }

    // Already hashed — compare hashes
    const enteredHash = await hashPIN(enteredPin);
    return enteredHash === storedValue;
}

// ===== Memory Lock (Attic Idea A) =====
// Reuses the existing hashPIN()/checkPINMatch() from the vault PIN system, under a
// separate storage key so it's a distinct PIN from the main vault PIN.
let memoryLockVerifiedThisSession = false; // have they entered the correct PIN at least once this session
let memoryLockUnlockedIds = new Set();     // specific memory IDs revealed this session
let pendingLockAction = null; // { targetId, callback }


function hasMemoryLockPin() {
  return !!localStorage.getItem("memoryLockPIN");
}

function openMemoryLockPinModal(mode) {
  const modal = document.getElementById("memoryLockPinModal");
  const title = document.getElementById("memoryLockPinTitle");
  const subtext = document.getElementById("memoryLockPinSubtext");
  document.getElementById("memoryLockPinInput").value = "";
  document.getElementById("memoryLockPinError").classList.add("hidden");

  if (mode === "setup") {
    title.textContent = "🔒 Set a Lock PIN";
    subtext.textContent = "This PIN protects every memory you lock. Choose 4 digits.";
  } else {
    title.textContent = "🔒 Enter PIN";
    subtext.textContent = "Unlocks every locked memory for this session.";
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.getElementById("memoryLockPinInput").focus();
}

function closeMemoryLockPinModal() {
  const modal = document.getElementById("memoryLockPinModal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  pendingLockAction = null;
}

async function submitMemoryLockPin() {
  const entered = document.getElementById("memoryLockPinInput").value;
  if (!/^\d{4}$/.test(entered)) {
    document.getElementById("memoryLockPinError").textContent = "Enter a 4-digit PIN.";
    document.getElementById("memoryLockPinError").classList.remove("hidden");
    return;
  }

  if (!hasMemoryLockPin()) {
    // First-ever lock: this entry becomes the shared PIN.
    const hash = await hashPIN(entered);
    localStorage.setItem("memoryLockPIN", hash);
    memoryLockVerifiedThisSession = true;
    if (pendingLockAction) memoryLockUnlockedIds.add(pendingLockAction.targetId);
    closeMemoryLockPinModal();
    if (typeof loadMemories === "function") loadMemories();
    if (pendingLockAction && pendingLockAction.callback) pendingLockAction.callback();
    pendingLockAction = null;
    return;
  }

  const stored = localStorage.getItem("memoryLockPIN");
  const isMatch = await checkPINMatch(entered, stored);
  if (!isMatch) {
    document.getElementById("memoryLockPinError").textContent = "Incorrect PIN.";
    document.getElementById("memoryLockPinError").classList.remove("hidden");
    return;
  }

  memoryLockVerifiedThisSession = true;
  if (pendingLockAction) memoryLockUnlockedIds.add(pendingLockAction.targetId);
  closeMemoryLockPinModal();
  if (typeof loadMemories === "function") loadMemories();
  if (pendingLockAction && pendingLockAction.callback) pendingLockAction.callback();
  pendingLockAction = null;
}


// Called when a locked, still-blurred card is tapped.
function handleLockedCardTap(id) {
  if (memoryLockVerifiedThisSession) {
    // Already proved the PIN this session — reveal just this one memory, no reprompt.
    memoryLockUnlockedIds.add(id);
    if (typeof loadMemories === "function") loadMemories();
    viewMemory(id);
    return;
  }
  pendingLockAction = { targetId: id, callback: () => viewMemory(id) };
  openMemoryLockPinModal(hasMemoryLockPin() ? "unlock" : "setup");
}

// PASTE AT TOP OF script.js (line 1-2)
// ===== PINNED SYSTEM - FIXED =====
let pinnedIds = JSON.parse(localStorage.getItem('echovault_pinned') || '[]');
function isPinned(id){ return pinnedIds.includes(id); }
function togglePin(id, event){
  if(event) event.stopPropagation();
  const idx = pinnedIds.indexOf(id);
  if(idx > -1){
    pinnedIds.splice(idx,1);
  } else {
    if(pinnedIds.length >= 3){ alert('📌 Max 3 pinned - unpin one first!'); return; }
    pinnedIds.push(id);
  }
  localStorage.setItem('echovault_pinned', JSON.stringify(pinnedIds));
  if(typeof loadMemories === 'function') loadMemories();
  else if(typeof renderMemories === 'function') renderMemories();
  else location.reload();
}


// =========================
//  HTML Sanitizer (XSS Protection)
// =========================


function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function truncateText(text, maxLength = 140) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength).trim() + "…" : text;
}

function getFilteredTimelineMemories(memories) {

    let filtered = memories;

    if (timelineFilterType === "favourites") {
        filtered = filtered.filter(memory => memory.favourite);
    } else if (timelineFilterType === "photos") {
        filtered = filtered.filter(memory => !!memory.image);
    } else if (timelineFilterType === "voice") {
        filtered = filtered.filter(memory => !!memory.voice);
    }

    if (timelineFilterCategory) {
        filtered = filtered.filter(memory => memory.category === timelineFilterCategory);
    }

    return filtered;

}

function setTimelineFilter(type) {
    timelineFilterType = type;
    loadMemories();
}

function setTimelineCategoryFilter(value) {
    timelineFilterCategory = value;
    loadMemories();
}

function clearTimelineFilters() {
    timelineFilterType = "all";
    timelineFilterCategory = "";
    loadMemories();
}

function jumpToOnThisDay() {
    const el = document.getElementById("onThisDay");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}


function formatCardDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = new Date(now).setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}


// ===================================================
// CLOSE MODAL ON OVERLAY CLICK
// ===================================================

function closeModalOnOverlay(event) {
    // Only close if the click is directly on the overlay (not on a child element)
    if (event.target === event.currentTarget) {
        // Check which modal is open and close it
        const newMemoryModal = document.getElementById('newMemoryModal');
        const deleteModal = document.getElementById('deleteModal');
        const memoryModal = document.getElementById('memoryModal');
        const deleteAllModal = document.getElementById('deleteAllModal');
        const memoryChallengeModal = document.getElementById('memoryChallengeModal');
        const funChallengeModal = document.getElementById('funChallengeModal');
        const recoveryModal = document.getElementById('recoveryModal');
        const setNewPinModal = document.getElementById('setNewPinModal');
        const achievementPreviewModal = document.getElementById('achievementPreviewModal');
        const addCategoryModal = document.getElementById('addCategoryModal');

        // Check each modal and close it if it's visible
        if (newMemoryModal && !newMemoryModal.classList.contains('hidden')) {
            closeMemoryModal(true);
        }
        if (deleteModal && !deleteModal.classList.contains('hidden')) {
            closeDeleteModal();
        }
        if (memoryModal && !memoryModal.classList.contains('hidden')) {
            closeModal();
        }
        if (deleteAllModal && !deleteAllModal.classList.contains('hidden')) {
            closeDeleteAllModal();
        }
        if (memoryChallengeModal && !memoryChallengeModal.classList.contains('hidden')) {
            // Close challenge modal
            memoryChallengeModal.classList.add('hidden');
            memoryChallengeModal.classList.remove('flex');
            clearInterval(challengeInterval);
        }
        if (funChallengeModal && !funChallengeModal.classList.contains('hidden')) {
            closeFunChallenge();
        }
        if (recoveryModal && !recoveryModal.classList.contains('hidden')) {
            recoveryModal.classList.add('hidden');
            recoveryModal.classList.remove('flex');
        }
        if (setNewPinModal && !setNewPinModal.classList.contains('hidden')) {
            setNewPinModal.classList.add('hidden');
            setNewPinModal.classList.remove('flex');
        }
        if (achievementPreviewModal && !achievementPreviewModal.classList.contains('hidden')) {
            closeAchievementPreview();
        }
        if (addCategoryModal && !addCategoryModal.classList.contains('hidden')) {
            closeAddCategoryModal();
        }
    }
}


// ===================================================
// INDEXEDDB STORAGE ENGINE
// ===================================================

const DB_NAME = "EchoVaultDB";
const DB_VERSION = 1;
const STORE_NAME = "memories";

let memoriesCache = [];
let dbInstance = null;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function loadMemoriesFromDB() {
    try {
        dbInstance = await openDB();
        return new Promise((resolve, reject) => {
            const tx = dbInstance.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const result = (request.result || []).sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                // If we have a fallback flag, check if we need to restore
                if (localStorage.getItem("echovault_using_fallback") === "true") {
                    console.log("⚠️ Restoring from fallback localStorage");
                    const fallbackData = localStorage.getItem("echovault_memories_fallback");
                    if (fallbackData) {
                        try {
                            const parsed = JSON.parse(fallbackData);
                            if (parsed.length > result.length) {
                                console.log("✅ Restored data from localStorage fallback");
                                // Save it back to IndexedDB
                                saveMemoriesToDB(parsed);
                                return resolve(parsed);
                            }
                        } catch (e) {}
                    }
                    localStorage.removeItem("echovault_using_fallback");
                }
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error("IndexedDB load failed:", e);
        // Try to load from localStorage fallback
        try {
            const fallbackData = localStorage.getItem("echovault_memories_fallback");
            if (fallbackData) {
                const parsed = JSON.parse(fallbackData);
                console.log("✅ Loaded from localStorage fallback");
                return parsed;
            }
        } catch (fallbackError) {}
        return [];
    }
}


async function saveMemoriesToDB(memories) {
    try {
        if (!dbInstance) dbInstance = await openDB();
        return new Promise((resolve, reject) => {
            const tx = dbInstance.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.clear();
            memories.forEach(m => store.put(m));
            tx.oncomplete = () => resolve();
            tx.onerror = () => {
                console.error("IndexedDB transaction failed");
                reject(tx.error);
            };
        });
    } catch (e) {
        console.warn("⚠️ IndexedDB failed, falling back to localStorage:", e);
        
        // ✅ FALLBACK: Save to localStorage instead
        try {
            localStorage.setItem("echovault_memories_fallback", JSON.stringify(memories));
            console.log("✅ Data saved to localStorage fallback");
            // Also save a flag so we know to restore from fallback on next load
            localStorage.setItem("echovault_using_fallback", "true");
            return;
        } catch (fallbackError) {
            console.error("❌ localStorage fallback also failed:", fallbackError);
            // Last resort: show a toast to the user
            if (typeof showToast === "function") {
                showToast("⚠️ Could not save memories. Please export a backup.");
            }
        }
    }
}


// One-time migration: copies your existing localStorage memories into
// IndexedDB the first time this runs, then never touches localStorage again.
async function migrateFromLocalStorage() {
    const alreadyMigrated = localStorage.getItem("echovault_migratedToIndexedDB");
    if (alreadyMigrated) return;

    const oldData = localStorage.getItem("echovault_memories");
    if (oldData) {
        try {
            const oldMemories = JSON.parse(oldData);
            await saveMemoriesToDB(oldMemories);
            console.log(`Migrated ${oldMemories.length} memories to IndexedDB`);
        } catch (e) {
            console.error("Migration parse failed:", e);
        }
    }

    localStorage.setItem("echovault_migratedToIndexedDB", "true");
}

// Must run once, before anything else touches memories
async function initMemoriesCache() {
    await migrateFromLocalStorage();
    memoriesCache = await loadMemoriesFromDB();
}

// Drop-in replacements for the old localStorage pattern —
// synchronous to use, backed by IndexedDB underneath.
function getMemories() {
    return memoriesCache;
}

function setMemories(newMemories) {
    memoriesCache = newMemories;
    saveMemoriesToDB(memoriesCache); // persists in the background
}



// ===================================================
// fun challenge 
// ===================================================
let funChallengeQuestions = [];
let funChallengeIndex = 0;
let funChallengeScore = 0;

function startFunChallenge() {
    const memories = getMemories();
    if (memories.length < 5) {
        showToast("⚠️ You need at least 5 memories to play.");
        return;
    }

    let pool = buildQuestionPool(memories).sort(() => Math.random() - 0.5);
    funChallengeQuestions = pool.slice(0, 5);
    funChallengeIndex = 0;
    funChallengeScore = 0;

    document.getElementById("funChallengeModal").classList.remove("hidden");
    document.getElementById("funChallengeModal").classList.add("flex");

    showFunChallengeQuestion();
}

function showFunChallengeQuestion() {
    const q = funChallengeQuestions[funChallengeIndex];
    document.getElementById("funChallengeProgress").textContent = `Question ${funChallengeIndex + 1} / ${funChallengeQuestions.length}`;
    document.getElementById("funChallengeProgressBar").style.width = `${((funChallengeIndex + 1) / funChallengeQuestions.length) * 100}%`;
    document.getElementById("funChallengeQuestionText").textContent = q.question;

    const answersDiv = document.getElementById("funChallengeAnswers");
    answersDiv.innerHTML = "";

    q.options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "w-full bg-zinc-800 hover:bg-cyan-500 hover:text-black rounded-xl py-3 transition";
        btn.textContent = option;
        btn.onclick = () => {

            document.querySelectorAll("#funChallengeAnswers button").forEach(b => b.disabled = true);

            if (option === q.correct) {
                funChallengeScore++;
                btn.classList.remove("bg-zinc-800", "hover:bg-cyan-500", "hover:text-black");
                btn.classList.add("bg-green-600", "text-white");
            } else {
                btn.classList.remove("bg-zinc-800", "hover:bg-cyan-500", "hover:text-black");
                btn.classList.add("bg-red-600", "text-white");

                document.querySelectorAll("#funChallengeAnswers button").forEach(b => {
                    if (b.textContent === q.correct) {
                        b.classList.remove("bg-zinc-800");
                        b.classList.add("bg-green-600", "text-white");
                    }
                });
            }

            setTimeout(() => {
                funChallengeIndex++;
                if (funChallengeIndex >= funChallengeQuestions.length) {
                    finishFunChallenge();
                } else {
                    showFunChallengeQuestion();
                }
            }, 900);
        };
        answersDiv.appendChild(btn);
    });
}


function finishFunChallenge() {
    closeFunChallenge();
    showToast(`🧠 You scored ${funChallengeScore}/${funChallengeQuestions.length} — ${funChallengeScore >= 4 ? "great memory!" : "give it another go sometime!"}`);
}

function closeFunChallenge() {
    document.getElementById("funChallengeModal").classList.add("hidden");
    document.getElementById("funChallengeModal").classList.remove("flex");
}

// =========================
// Memory Challenge
// =========================

let challengeQuestions = [];
let currentChallengeIndex = 0;
let challengeScore = 0;


let memoryChallengeFails =
    Number(localStorage.getItem("memoryChallengeFails")) || 0;

let cooldownEnd =
    Number(localStorage.getItem("memoryChallengeCooldownEnd")) || 0;

let memoryChallengeLockoutTier =
    Number(localStorage.getItem("memoryChallengeLockoutTier")) || 0;

let memoryChallengeLocked = cooldownEnd > Date.now();

const MAX_CHALLENGE_FAILS = 3;

const LOCKOUT_DURATIONS = [
    60 * 1000,            // 1 minute
    5 * 60 * 1000,         // 5 minutes
    15 * 60 * 1000,        // 15 minutes
    60 * 60 * 1000,        // 1 hour
    Infinity                // permanent, until correct PIN entry
];

function formatLockoutDuration(ms) {
    if (ms === Infinity) return "permanently";
    const minutes = Math.ceil(ms / 60000);
    if (minutes < 60) return `for ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    const hours = Math.round(minutes / 60);
    return `for ${hours} hour${hours !== 1 ? "s" : ""}`;
}

function formatCountdown(ms) {
    if (ms === Infinity) return "🔒 Permanently locked";
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `🔒 ${hrs}h ${mins}m left`;
    if (mins > 0) return `🔒 ${mins}m ${secs}s left`;
    return `🔒 ${secs}s left`;
}


let pinFails =
    Number(localStorage.getItem("pinFails")) || 0;

let pinCooldownEnd =
    Number(localStorage.getItem("pinCooldownEnd")) || 0;

let pinLockoutTier =
    Number(localStorage.getItem("pinLockoutTier")) || 0;

const MAX_PIN_FAILS = 3;

// =========================
// Memory Challenge Timer
// =========================

let challengeTime = 60;
let challengeInterval = null;

function buildQuestionPool(memories) {

    const pool = [];
    const builtInCategories = ["Travel", "Family", "Growth", "Milestone", "Nature"];
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    function shuffle(arr) {
        return [...arr].sort(() => Math.random() - 0.5);
    }
    
    const titleCounts = {};
    memories.forEach(m => {
        const t = (m.title || "").trim().toLowerCase();
        if (t) titleCounts[t] = (titleCounts[t] || 0) + 1;
    });
    const isUniqueTitle = (title) => titleCounts[(title || "").trim().toLowerCase()] === 1;
    
    

    // Category questions
    const usedCategories = [...new Set(memories.map(m => m.category).filter(Boolean))];
    shuffle(memories).slice(0, 4).forEach(memory => {
        if (!memory.category) return;
        const distractors = shuffle([...new Set([...usedCategories, ...builtInCategories])].filter(c => c !== memory.category)).slice(0, 3);
        if (distractors.length < 3) return;
        pool.push({
            type: "category",
            question: `Which category is "${memory.title}" saved under?`,
            correct: memory.category,
            options: shuffle([memory.category, ...distractors])
        });
    });

    // Title completion questions
    const multiWordMemories = memories.filter(m => m.title && m.title.trim().split(/\s+/).length >= 2);
    shuffle(multiWordMemories).filter(m => isUniqueTitle(m.title)).slice(0, 4).forEach(memory => {
        const words = memory.title.trim().split(/\s+/);
        
        const lastWord = words[words.length - 1];
        const stem = words.slice(0, -1).join(" ");

        let distractorPool = multiWordMemories
            .filter(m => m.id !== memory.id)
            .map(m => {
                const w = m.title.trim().split(/\s+/);
                return w[w.length - 1];
            })
            .filter(w => w.toLowerCase() !== lastWord.toLowerCase());

        const fallbackWords = ["Day", "Time", "Trip", "Moment", "Story", "Memory", "Life"];
        distractorPool = [...new Set([...distractorPool, ...fallbackWords])].filter(w => w.toLowerCase() !== lastWord.toLowerCase());

        const distractors = shuffle(distractorPool).slice(0, 3);
        if (distractors.length < 3) return;

        pool.push({
            type: "titleCompletion",
            question: `Complete the title: "${stem} _____"`,
            correct: lastWord,
            options: shuffle([lastWord, ...distractors])
        });
    });

    // Favourite count
    const favCount = memories.filter(m => m.favourite).length;
    let favDistractors = [favCount + 1, favCount + 2, Math.max(favCount - 1, 0), Math.max(favCount - 2, 0)]
        .filter(n => n !== favCount);
    favDistractors = [...new Set(favDistractors)].slice(0, 3);
    if (favDistractors.length === 3) {
        pool.push({
            type: "favouriteCount",
            question: `How many of your memories are marked as favourite?`,
            correct: String(favCount),
            options: shuffle([String(favCount), ...favDistractors.map(String)])
        });
    }

    // Image recognition
    const imageMemories = memories.filter(m => m.image);
    shuffle(imageMemories).filter(m => isUniqueTitle(m.title)).slice(0, 4).forEach(memory => {
        const distractors = shuffle(memories.filter(m => m.id !== memory.id && isUniqueTitle(m.title)).map(m => m.title)).slice(0, 3);
        if (distractors.length < 3) return;
        pool.push({
            type: "imageRecognition",
            
            question: `Which memory does this photo belong to?`,
            image: memory.image,
            correct: memory.title,
            options: shuffle([memory.title, ...distractors])
        });
    });
    
    // Voice note presence
    const voiceMemories = memories.filter(m => m.voice && isUniqueTitle(m.title));
    const noVoiceMemories = memories.filter(m => !m.voice && isUniqueTitle(m.title));
    if (voiceMemories.length > 0 && noVoiceMemories.length >= 3) {
        const target = shuffle(voiceMemories)[0];
        const distractors = shuffle(noVoiceMemories).slice(0, 3).map(m => m.title);
        pool.push({
            type: "voicePresence",
            question: `Which of these memories has a voice note attached?`,
            correct: target.title,
            options: shuffle([target.title, ...distractors])
        });
    }

    // Oldest / newest memory
    if (memories.length >= 4) {
        const sorted = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));

        const oldest = sorted[0];
        const oldDistractors = shuffle(memories.filter(m => m.id !== oldest.id && isUniqueTitle(m.title)).map(m => m.title)).slice(0, 3);
        if (isUniqueTitle(oldest.title) && oldDistractors.length === 3) {
            
            pool.push({
                type: "oldestMemory",
                question: `What is the title of your oldest memory?`,
                correct: oldest.title,
                options: shuffle([oldest.title, ...oldDistractors])
            });
        }

        const newest = sorted[sorted.length - 1];
        const newDistractors = shuffle(memories.filter(m => m.id !== newest.id && isUniqueTitle(m.title)).map(m => m.title)).slice(0, 3);
        if (isUniqueTitle(newest.title) && newDistractors.length === 3) {
            
            pool.push({
                type: "newestMemory",
                question: `What is the title of your newest memory?`,
                correct: newest.title,
                options: shuffle([newest.title, ...newDistractors])
            });
        }
    }

    // Month created
    shuffle(memories).slice(0, 4).forEach(memory => {
        const correctMonth = monthNames[new Date(memory.date).getMonth()];
        const distractors = shuffle(monthNames.filter(mo => mo !== correctMonth)).slice(0, 3);
        pool.push({
            type: "monthCreated",
            question: `In which month did you save "${memory.title}"?`,
            correct: correctMonth,
            options: shuffle([correctMonth, ...distractors])
        });
    });

    return pool;

}

function generateMemoryChallenge() {

    if (cooldownEnd > Date.now()) {

        if (cooldownEnd === Infinity) {
            showToast(`🔒 Challenge permanently locked. Unlock your vault with your correct PIN to reset it.`);
        } else {
            const minutesLeft = Math.ceil((cooldownEnd - Date.now()) / 60000);
            showToast(`🔒 Challenge locked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`);
        }
        return false;

    }
    

    const memories = getMemories();

    if (memories.length < 5) {

        showToast("⚠️ You need at least 5 memories.");

        return false;

    }

    let pool = buildQuestionPool(memories);

    if (pool.length < 5) {
        showToast("⚠️ Not enough variety in your memories yet to build a challenge.");
        return false;
    }

    pool = pool.sort(() => Math.random() - 0.5);

    const selected = [];
    const usedTypes = new Set();

    for (const q of pool) {
        if (selected.length >= 5) break;
        if (!usedTypes.has(q.type)) {
            selected.push(q);
            usedTypes.add(q.type);
        }
    }

    if (selected.length < 5) {
        for (const q of pool) {
            if (selected.length >= 5) break;
            if (!selected.includes(q)) {
                selected.push(q);
            }
        }
    }

    challengeQuestions = selected.slice(0, 5);

    currentChallengeIndex = 0;
    challengeScore = 0;

    return true;

}


let vaultPIN = localStorage.getItem("vaultPIN");

    let recoveryKey =
    localStorage.getItem("recoveryKey");
    
    function generateRecoveryKey() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let key = "";

    for (let i = 0; i < 16; i++) {

        if (i === 4 || i === 8 || i === 12) {

            key += "-";

        }

        key += chars[Math.floor(Math.random() * chars.length)];

    }
    
    localStorage.setItem("recoveryKey", key);


    return key;

}
if (!recoveryKey) {

    recoveryKey = generateRecoveryKey();

    localStorage.setItem(
        "recoveryKey",
        recoveryKey
    );

}

function startChallengeTimer() {

    // Stop any old timer first
    clearInterval(challengeInterval);

    challengeTime = 60;

    document.getElementById("challengeTimer").textContent = "01:00";

    challengeInterval = setInterval(() => {

        challengeTime--;

        const minutes = String(Math.floor(challengeTime / 60)).padStart(2, "0");
        const seconds = String(challengeTime % 60).padStart(2, "0");

        document.getElementById("challengeTimer").textContent =
            `${minutes}:${seconds}`;

        if (challengeTime <= 0) {

            clearInterval(challengeInterval);

            timeUp();

        }

    }, 1000);

}



// ===================================================
// MOOD SELECTOR
// ===================================================
const MOODS = [
    { value: "happy", label: "😊 Happy" },
    { value: "peaceful", label: "😌 Peaceful" },
    { value: "excited", label: "🤩 Excited" },
    { value: "grateful", label: "🥹 Grateful" },
    { value: "nostalgic", label: "🌙 Nostalgic" },
    { value: "sad", label: "😢 Sad" },
    { value: "frustrated", label: "😤 Frustrated" },
    { value: "neutral", label: "😐 Neutral" }
];

function renderMoodSelector(selectedMood) {
    const container = document.getElementById("moodSelector");
    if (!container) return;

    container.innerHTML = MOODS.map(mood => `
        <button
            type="button"
            onclick="selectMood('${mood.value}')"
            class="mood-btn text-sm px-3 py-2 rounded-full border transition ${
                mood.value === selectedMood
                    ? "bg-cyan-500 border-cyan-500 text-black font-semibold"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-cyan-500"
            }">
            ${mood.label}
        </button>
    `).join("");

    document.getElementById("memoryMood").value = selectedMood || "";
}

function selectMood(value) {
    const current = document.getElementById("memoryMood").value;
    renderMoodSelector(current === value ? "" : value);
}

function getMoodLabel(value) {
    const found = MOODS.find(m => m.value === value);
    return found ? found.label : "";
}

// ===================================================
// LIGHTWEIGHT CATEGORY AUTO-SUGGEST
// ===================================================
const CATEGORY_KEYWORDS = {
    Travel: ["trip", "flight", "airport", "hotel", "vacation", "beach", "abroad", "passport", "travel", "journey", "road trip"],
    Family: ["mom", "dad", "mother", "father", "sister", "brother", "family", "kids", "grandma", "grandpa", "parents"],
    Growth: ["learned", "realized", "therapy", "goal", "improve", "growth", "reflect", "journal", "habit", "progress"],
    Milestone: ["graduated", "promotion", "wedding", "birthday", "anniversary", "achieved", "milestone", "new job", "engaged"],
    Nature: ["hike", "hiking", "forest", "mountain", "ocean", "garden", "sunset", "sunrise", "trail", "camping", "nature"]
};

function suggestCategoryFromText() {
    const categorySelect = document.getElementById("category");
    const chip = document.getElementById("categorySuggestChip");
    if (!categorySelect || !chip) return;

    if (categorySelect.value) {
        chip.classList.add("hidden");
        return;
    }

    const title = document.getElementById("title").value.toLowerCase();
    const desc = document.getElementById("description").value.toLowerCase();
    const text = `${title} ${desc}`;

    if (text.trim().length < 8) {
        chip.classList.add("hidden");
        return;
    }

    let bestCategory = null;
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const score = keywords.filter(kw => text.includes(kw)).length;
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
        }
    }

    if (bestCategory) {
        chip.innerHTML = `
            <button type="button" onclick="applyCategorySuggestion('${bestCategory}')"
                class="text-xs bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 px-3 py-1.5 rounded-full transition hover:bg-cyan-500/20">
                💡 Looks like <strong>${bestCategory}</strong> — tap to use
            </button>
        `;
        chip.classList.remove("hidden");
    } else {
        chip.classList.add("hidden");
    }
}

function applyCategorySuggestion(category) {
    document.getElementById("category").value = category;
    document.getElementById("categorySuggestChip").classList.add("hidden");
}

// ===================================================
// MEMORY FORM
// ===================================================
document.getElementById("memoryForm").addEventListener("submit", async function (e) {
    
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const favourite = document.getElementById("memoryFavourite").checked;
    const locked = document.getElementById("memoryLocked").checked;
   
   const tags = document.getElementById("memoryTags").value
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

    const mood = document.getElementById("memoryMood").value;
    const people = document.getElementById("memoryPeople").value.trim();
    const place = document.getElementById("memoryPlace").value.trim();

    const selectedDate = document.getElementById("memoryDate").value;

    const images = formPhotos.filter(Boolean);
    const image = images[0] || "";
    

    if (!title) return;

    const [year, month, day] = selectedDate.split("-").map(Number);

    let combinedDate;
    if (editingMemoryId !== null && editOriginalTime) {
        combinedDate = new Date(year, month - 1, day, editOriginalTime.hours, editOriginalTime.minutes, editOriginalTime.seconds);
    } else {
        const now = new Date();
        combinedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    let memories = getMemories();

    let savedId;

    if (editingMemoryId !== null) {

        const index = memories.findIndex(memory => memory.id === editingMemoryId);

        if (index !== -1) {
        memories[index] = {
                ...memories[index],
                title,
                category,
                description,
                favourite,
                locked,
                tags,
                mood,
                people,
                place,
                date: combinedDate.toISOString(),
                image,
                images
            };
            
            
            
        }

        savedId = editingMemoryId;

    } else {

        savedId = Date.now();

       memories.unshift({
            id: savedId,
            title,
            category,
            description,
            image,
            images,
            voice: recordedAudioURL || null,
            date: combinedDate.toISOString(),
            favourite,
            locked,
            tags,
            mood,
            people,
            place
        });
        
        
        

    }

    setMemories(memories);

    checkAchievements(savedId);

    closeMemoryModal(true);

    setTimeout(() => {
        showToast("✅ Memory saved successfully!");
    }, 300);

    loadMemories();

});

function renderImportedTracksSettings() {
  const container = document.getElementById("importedTracksList");
  if (!container) return;

  let owned = [];
  try { owned = JSON.parse(localStorage.getItem("atticImportedTracks") || "[]"); }
  catch (e) { owned = []; }

  if (owned.length === 0) {
    container.innerHTML = `<p class="text-zinc-600 text-sm italic">The Attic is quiet down here — import a track from the Music Corner to hear it.</p>`;
    return;
  }

  const catalog = (typeof IMPORTABLE_TRACKS !== "undefined") ? IMPORTABLE_TRACKS : [];

  container.innerHTML = owned.map(id => {
    const meta = catalog.find(t => t.id === id);
    const label = meta ? meta.label : id;
    return `
      <div class="bg-zinc-800/60 border border-amber-500/10 rounded-2xl p-4 hover:border-amber-500/30 transition">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-amber-400/80 text-sm">🎼</span>
          <p class="text-white font-medium text-sm">${label}</p>
        </div>
        <audio controls preload="none" class="w-full attic-track-player">
          <source src="Attic/audio/${id}.mp3" type="audio/mpeg">
        </audio>
      </div>
    `;
  }).join("");
}



// ===================================================
// NAVIGATION
// ===================================================
function showSection(sectionId, clickedLink) {
    
    trackPageVisit(sectionId);
if (typeof checkAchievements === "function") {
        checkAchievements();
    }
    
    // Hide all sections
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
       
    }

    );
         // Show selected section
const section = document.getElementById(sectionId);

if (section) {

    section.classList.remove("hidden");

    // Restart animation
    section.classList.remove("fade-in");

    void section.offsetWidth;

    section.classList.add("fade-in");

}

  

    // Remove active navigation
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("nav-active");
    });

    // Highlight clicked navigation
    if (clickedLink) {
        clickedLink.classList.add("nav-active");
    }
    if (sectionId === "insights") {
        updateInsights();
    }
    if (sectionId === "home") {
        renderHomeRecentMemories();
        updateHomeAchievementCount();
        showDailyPrompt();
        showHomeStreak();
        showHomeOnThisDay();
    }
    
    
    if (sectionId === "insights") {
        renderWordFrequency();
    }
    
    if (sectionId === "home") {
        renderHomeRecentMemories();
        updateHomeAchievementCount();
    }
    
    if (sectionId === "showcase") {
        renderShowcase();
        if (checkAtticDoorUnlock()) {
            showAtticDoor();
        }
    }
    
    
   if (sectionId === "settings") {
        initReminderSettings();
        renderImportedTracksSettings();
    }
    
    if (sectionId === "dashboard") {
        updateDashboardEmptyState();
    }
    
    function updateDashboardEmptyState() {
    const allMemories = getMemories();
    const emptyState = document.getElementById("dashboardEmptyState");
    if (!emptyState) return;

    if (allMemories.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
    }
}
}

// ===================================================
// MEMORY INSIGHTS
// ===================================================
function updateInsights() {
    const memories = getMemories();

    const mostActiveDayEl = document.getElementById("mostActiveDay");
    const currentStreakEl = document.getElementById("currentStreak");
    const longestStreakEl = document.getElementById("longestStreak");
    const totalWordsEl = document.getElementById("totalWords");
    const avgLengthEl = document.getElementById("avgMemoryLength");

    if (!mostActiveDayEl) return; // Insights page not in DOM yet

    const emptyState = document.getElementById("insightsEmptyState");
    const statsGrid = document.getElementById("insightsStatsGrid");

    if (memories.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (statsGrid) statsGrid.classList.add("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (statsGrid) statsGrid.classList.remove("hidden");

    // Most Active Day
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    memories.forEach(memory => {
        const d = new Date(memory.date);
        dayCounts[d.getDay()]++;
    });
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    mostActiveDayEl.textContent = dayNames[maxDayIndex];

    // Total Words + Average Length
    let totalWords = 0;
    memories.forEach(memory => {
        if (memory.description) {
            totalWords += memory.description.trim().split(/\s+/).filter(Boolean).length;
        }
    });
    totalWordsEl.textContent = totalWords.toLocaleString();
    avgLengthEl.textContent = Math.round(totalWords / memories.length).toLocaleString();

    // Streaks (current + longest)
    const uniqueDates = [...new Set(memories.map(memory => new Date(memory.date).toDateString()))]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a - b);

    let longestStreak = 1;
    let runningStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const diffDays = Math.round((uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            runningStreak++;
            longestStreak = Math.max(longestStreak, runningStreak);
        } else {
            runningStreak = 1;
        }
    }

    // Current streak: count backwards from today/yesterday
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = new Date(today);

    const dateSet = new Set(uniqueDates.map(d => d.toDateString()));
    // Allow streak to still count if today has no entry yet but yesterday does
    if (!dateSet.has(cursor.toDateString())) {
        cursor.setDate(cursor.getDate() - 1);
    }
    while (dateSet.has(cursor.toDateString())) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    currentStreakEl.textContent = `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`;
    longestStreakEl.textContent = `Longest: ${longestStreak} day${longestStreak !== 1 ? "s" : ""}`;
}


// ===================================================
// MEMORY LOADING
// ===================================================
// Load every saved memory,
// apply search/filter,
// then update all UI.

function highlightMatch(text, term) {

    const safeText = escapeHTML(text);

    if (!term) return safeText;

    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "gi");

    return safeText.replace(regex, `<mark class="bg-cyan-500 text-black rounded px-1">$1</mark>`);

}


function loadMemories() {
    
    updateStreakTracking();

  let memories = getMemories();
  



            // Recent Memories (Dashboard)
const recentMemories = document.getElementById("recentMemories");

if (recentMemories) {

   recentMemories.innerHTML = memories
    .slice(0, 3)
    .map(memory => `

<div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">

    <div class="flex justify-between items-start">

        <div>

            <h4 class="font-semibold text-white text-lg">
                📖 ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? "Locked memory" : escapeHTML(memory.title)}
            </h4>

            <p class="text-zinc-400 text-sm mt-2">
                ${new Date(memory.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })}
            </p>

        </div>

        <span class="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full">
            ${memory.category || "None"}
        </span>

    </div>

    <div class="flex gap-3 mt-5">

        <button
            onclick="viewMemory(${memory.id})"
            class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl py-2 transition">

            👁 View

        </button>

        <button
            onclick="editMemory(${memory.id})"
            class="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2 transition">

            ✏ Edit

        </button>

        <button
            onclick="confirmDelete(${memory.id})"
            class="flex-1 bg-red-600 hover:bg-red-500 rounded-xl py-2 transition">

            🗑 Delete

        </button>

    </div>

</div>

`)
.join("");
       


}

const searchInput = document.getElementById("searchInput");

const searchText = searchInput
    ? searchInput.value.toLowerCase()
    : "";

memories = memories.filter(memory => {

    return (
        memory.title.toLowerCase().includes(searchText)
        || (memory.tags && memory.tags.some(t => t.toLowerCase().includes(searchText)))
        ||
        memory.description.toLowerCase().includes(searchText) ||
        (memory.category || "").toLowerCase().includes(searchText)
    );

});



if (selectedCategory !== "All") {

    memories = memories.filter(memory =>
        memory.category === selectedCategory
    );
    

    
}
const contentFilter = document.getElementById("contentFilter")
    ? document.getElementById("contentFilter").value
    : "all";

if (favouritesOnly) {
    memories = memories.filter(memory => memory.favourite);
}

if (contentFilter === "voice") {

    memories = memories.filter(memory => memory.voice);

} else if (contentFilter === "image") {

    memories = memories.filter(memory => memory.image);

}




const dateFromEl = document.getElementById("dateFrom");
const dateToEl = document.getElementById("dateTo");

const dateFrom = dateFromEl && dateFromEl.value ? new Date(dateFromEl.value) : null;
const dateTo = dateToEl && dateToEl.value ? new Date(dateToEl.value) : null;

if (dateFrom) {

    memories = memories.filter(memory => new Date(memory.date) >= dateFrom);

}

if (dateTo) {

    dateTo.setHours(23, 59, 59, 999);

    memories = memories.filter(memory => new Date(memory.date) <= dateTo);

}

const customCategoriesForFilter = getCustomCategories();
const categories = ["All", "Travel", "Family", "Growth", "Milestone", "Nature", ...customCategoriesForFilter];

const categoryDropdown = document.getElementById("categoryDropdown");
if (categoryDropdown) {
    categoryDropdown.innerHTML = categories.map(category => `
        <option value="${category}" ${selectedCategory === category ? "selected" : ""}>
            ${category === "All" ? "All categories" : category}${customCategoriesForFilter.includes(category) ? " (Custom)" : ""}
        </option>
        
    `).join("");
}


    if (memories.length === 0) {
        
        if (searchText) {
            localStorage.setItem("echovault_hasZeroSearchResult", "true");
        }



const memoriesListEl = document.getElementById("memoriesList");
    if (memoriesListEl) {
        memoriesListEl.innerHTML = `

    <div class="bg-zinc-900 rounded-3xl p-8 text-center">

        <div class="text-5xl mb-4">
            ${searchText ? "🔍" : "📭"}
        </div>

        <h3 class="text-xl font-semibold text-white">
            ${searchText ? "No memories found" : "No memories saved yet"}
        </h3>

        <p class="text-zinc-400 mt-2">
            ${
                searchText
                    ? "Try another search term."
                    : "Start by creating your first memory."
            }
        </p>

        ${
            searchText
                ? ""
                : `<button
                    onclick="document.getElementById('title').scrollIntoView({behavior:'smooth', block:'center'}); document.getElementById('title').focus();"
                    class="mt-6 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl px-6 py-3 font-semibold transition">
                    ➕ Create Your First Memory
                </button>`
        }

    </div>
    
`;
    }

        const timelineListEmpty = document.getElementById("timelineList");
        if (timelineListEmpty) {
            timelineListEmpty.innerHTML = `
    <div class="bg-zinc-900 rounded-3xl p-8 text-center">

        <div class="text-5xl mb-4">🕰️</div>

        <h3 class="text-xl font-semibold text-white">
            Your timeline is empty
        </h3>

        <p class="text-zinc-400 mt-2">
            Once you save memories, they'll appear here in order.
        </p>

        <button
            onclick="openMemoryModal();"
            
            class="mt-6 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl px-6 py-3 font-semibold transition">
            ➕ Create Your First Memory
        </button>

    </div>
`;
        }

        const totalMemoriesEl = document.getElementById("totalMemories");
        if (totalMemoriesEl) totalMemoriesEl.textContent = 0;
        const totalCategoriesEl = document.getElementById("totalCategories");
        if (totalCategoriesEl) totalCategoriesEl.textContent = 0;
        const latestMemoryEl = document.getElementById("latestMemory");
        if (latestMemoryEl) latestMemoryEl.textContent = "None";
        


        return;
    }

    const sortOption = document.getElementById("sortOption")
        ? document.getElementById("sortOption").value
        : "newest";

    if (sortOption === "oldest") {
        memories = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "title") {
        memories = [...memories].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "favourite") {
        memories = [...memories].sort((a, b) => (b.favourite === true) - (a.favourite === true));
    } else {
        memories = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Memories list
  const memoriesListMain = document.getElementById("memoriesList");
  if (memoriesListMain) memoriesListMain.innerHTML = 
    memories.map((memory, index) => `
    
    
     
    <div onclick="${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `handleLockedCardTap(${memory.id})` : `viewMemory(${memory.id})`}" class="cursor-pointer bg-zinc-900 border border-zinc-700 hover:border-cyan-500/60 rounded-3xl overflow-hidden fade-in stagger-${(index % 5) + 1} transition-all">

    ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `
        <div class="p-10 flex flex-col items-center justify-center text-center gap-2" style="filter: blur(6px); user-select: none;">
            <span class="text-4xl">🔒</span>
            <span class="text-zinc-500 text-sm">Locked memory</span>
        </div>
    ` : `

<button onclick="togglePin(${memory.id}, event)" class="pin-btn ${isPinned(memory.id) ? 'is-pinned' : ''}">${isPinned(memory.id) ? '📌 Pinned' : '📍 Pin'}</button>

            ${memory.image ? `
                <div class="relative">
                    <img src="${memory.image}" alt="Memory Image" class="w-full aspect-[4/3] object-cover">
                    ${memory.images && memory.images.length > 1 ? `<span class="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">📷 ${memory.images.length}</span>` : ""}
                </div>
            ` : ""}
            

            <div class="p-6">
            

                <div class="flex items-center justify-between mb-3">
                    ${memory.category ? `<span class="bg-zinc-800 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-full">${escapeHTML(memory.category)}</span>` : "<span></span>"}
                    <span class="text-zinc-500 text-xs">${new Date(memory.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>

                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? "🔒 Locked memory" : highlightMatch(memory.title, searchText)}
                    ${memory.favourite ? `<span class="text-yellow-400 text-base">⭐</span>` : ""}
                    ${memory.mood ? `<span class="text-sm" title="${getMoodLabel(memory.mood)}">${getMoodLabel(memory.mood).split(" ")[0]}</span>` : ""}
                </h3>
                
                
                <p class="text-xs text-zinc-600 mt-1">
                    ${(() => {
                        const len = (memory.description || "").length;
                        if (len === 0) return "";
                        if (len < 100) return "📝 Quick note";
                        if (len < 500) return "📄 Short entry";
                        return "📖 Long story";
                    })()}
                </p>
                

                <p class="mt-2 text-zinc-400 text-sm leading-relaxed">
                    ${highlightMatch(truncateText(memory.description), searchText)}
                </p>
                
                
                ${memory.tags && memory.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1.5 mt-2">
                        ${memory.tags.map(tag => `<span class="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">#${tag}</span>`).join("")}
                    </div>
                ` : ""}
                

                ${memory.voice ? `
                    <div class="mt-3 bg-zinc-800 rounded-2xl p-3 flex items-center gap-3" onclick="event.stopPropagation()">
                        <button onclick="toggleVoicePlayback(${memory.id})" id="voicePlayBtn-${memory.id}" class="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 flex items-center justify-center text-black flex-shrink-0 transition">
                            <span id="voicePlayIcon-${memory.id}">▶</span>
                        </button>
                        <div class="flex-1 min-w-0">
                            <div class="h-1.5 bg-zinc-700 rounded-full cursor-pointer" onclick="seekVoice(event, ${memory.id})">
                                <div id="voiceProgress-${memory.id}" class="h-1.5 bg-cyan-400 rounded-full" style="width:0%"></div>
                            </div>
                            <p id="voiceTime-${memory.id}" class="text-xs text-zinc-500 mt-1">0:00 / 0:00</p>
                        </div>
                        <audio id="voiceAudio-${memory.id}" src="${memory.voice}" preload="metadata" class="hidden"></audio>
                    </div>
                ` : ""}
                

                <div class="flex gap-2 mt-4" onclick="event.stopPropagation()">

                    <button onclick="editMemory(${memory.id})" class="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-full transition">
                        ✏ Edit
                    </button>

                    <button onclick="toggleFavourite(${memory.id})" class="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-full transition">
                        ${memory.favourite ? "☆ Unfav" : "⭐ Fav"}
                    </button>

                    <button onclick="confirmDelete(${memory.id})" class="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm px-4 py-2 rounded-full transition">
                        🗑 Del
                    </button>

                </div>

            </div>
            `}

        </div>
    `).join("");
    
  
    
    // Timeline (grouped by year, then month)
    const timelineContainer = document.getElementById("timelineList");

    if (timelineContainer) {

    const groupedByYear = {};
    const filteredTimelineMemories = getFilteredTimelineMemories(memories);

    filteredTimelineMemories.forEach(memory => {

            const d = new Date(memory.date);
            const year = d.getFullYear();
            const month = d.toLocaleDateString("en-GB", { month: "long" });

            if (!groupedByYear[year]) groupedByYear[year] = {};
            if (!groupedByYear[year][month]) groupedByYear[year][month] = [];

            groupedByYear[year][month].push(memory);

        });
        

       // ===== On This Day =====

        const onThisDayEl = document.getElementById("onThisDay");

        if (onThisDayEl) {

            const today = new Date();

            const pastMatches = memories.filter(memory => {

                const md = new Date(memory.date);

                return (
                    md.getMonth() === today.getMonth() &&
                    md.getDate() === today.getDate() &&
                    md.getFullYear() < today.getFullYear()
                );

            });

            const timelineFiltersEl = document.getElementById("timelineFilters");

            if (timelineFiltersEl) {

                const allCategories = [...new Set(memories.map(memory => memory.category).filter(Boolean))].sort();

                const chipClass = (active) => active
                    ? "px-4 py-2 rounded-full text-sm font-semibold bg-cyan-500 text-black transition"
                    : "px-4 py-2 rounded-full text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition";

                timelineFiltersEl.innerHTML = `
                    <button onclick="setTimelineFilter('all')" class="${chipClass(timelineFilterType === "all")}">All</button>
                    <button onclick="setTimelineFilter('favourites')" class="${chipClass(timelineFilterType === "favourites")}">⭐ Favourites</button>
                    <button onclick="setTimelineFilter('photos')" class="${chipClass(timelineFilterType === "photos")}">📷 With Photos</button>
                    <button onclick="setTimelineFilter('voice')" class="${chipClass(timelineFilterType === "voice")}">🎙 With Voice</button>

                    ${allCategories.length > 0 ? `
                        <select onchange="setTimelineCategoryFilter(this.value)" class="px-4 py-2 rounded-full text-sm font-semibold bg-zinc-800 text-zinc-300 border-none focus:ring-2 focus:ring-cyan-500 transition">
                            <option value="">All Categories</option>
                            ${allCategories.map(cat => `<option value="${escapeHTML(cat)}" ${timelineFilterCategory === cat ? "selected" : ""}>${escapeHTML(cat)}</option>`).join("")}
                        </select>
                    ` : ""}

                    ${pastMatches.length > 0 ? `
                        <button onclick="jumpToOnThisDay()" class="px-4 py-2 rounded-full text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition ml-auto">📅 Jump to On This Day</button>
                    ` : ""}
                `;

            }

if (pastMatches.length > 0) {
    

    onThisDayEl.classList.remove("hidden");

    const sortedMatches = [...pastMatches].sort((a, b) => new Date(b.date) - new Date(a.date));
    const shownMatches = sortedMatches.slice(0, 3);
    const remainingCount = sortedMatches.length - shownMatches.length;

    const distinctYears = [...new Set(sortedMatches.map(memory => new Date(memory.date).getFullYear()))].sort((a, b) => a - b);

    let yearsLine = "";
    if (distinctYears.length === 1) {
        yearsLine = `You've written on this day in ${distinctYears[0]}.`;
    } else if (distinctYears.length === 2) {
        yearsLine = `You've written on this day in ${distinctYears[0]} and ${distinctYears[1]}.`;
    } else {
        yearsLine = `You've written on this day in ${distinctYears.slice(0, -1).join(", ")} and ${distinctYears[distinctYears.length - 1]}.`;
    }

    const cardsHTML = shownMatches.map(memory => {

        const yearsAgo = today.getFullYear() - new Date(memory.date).getFullYear();
        const excerpt = truncateText(memory.description);

        return `
<div onclick="viewMemory(${memory.id})" class="cursor-pointer bg-zinc-900 border border-cyan-500/60 hover:border-cyan-400 rounded-3xl overflow-hidden mb-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">

   ${memory.image ? `
        <div class="relative">
            <img src="${memory.image}" alt="" class="w-full aspect-[4/3] object-cover">
            ${memory.images && memory.images.length > 1 ? `<span class="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">📷 ${memory.images.length}</span>` : ""}
        </div>
    ` : ""}
    

    <div class="p-5">

        <div class="flex items-center justify-between mb-3">
            <span class="text-cyan-400 text-sm font-semibold">
                ✨ ${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago
            </span>
            ${memory.category ? `<span class="text-xs bg-cyan-500/15 text-cyan-300 px-2.5 py-1 rounded-full">${escapeHTML(memory.category)}</span>` : ""}
        </div>

        <h3 class="text-lg font-bold text-white leading-snug">${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? "🔒 Locked memory" : escapeHTML(memory.title)}</h3>
        ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? "" : (excerpt ? `<p class="text-zinc-400 text-sm mt-1.5 leading-relaxed">${excerpt}</p>` : "")}

    </div>
</div>
        `;

    }).join("");
    
    onThisDayEl.innerHTML = `
        <div class="bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-900 border border-cyan-500/30 rounded-3xl p-6">

            <div class="mb-4">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    📅 On This Day
                </h3>
                <p class="text-zinc-400 text-sm mt-1">${yearsLine}</p>
            </div>

            ${cardsHTML}

            ${remainingCount > 0 ? `
                <p class="text-zinc-500 text-sm text-center mb-3">+${remainingCount} more memor${remainingCount > 1 ? "ies" : "y"} from other years</p>
            ` : ""}

            <button
                onclick="openMemoryModal()"
                class="w-full mt-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-semibold py-3 rounded-2xl transition">
                ✍️ Write a memory for today
            </button>

        </div>
    `;

} else {

    onThisDayEl.classList.add("hidden");
    onThisDayEl.innerHTML = "";

}
        }

        const years = Object.keys(groupedByYear).sort((a, b) => b - a);

        const yearGraph = document.getElementById("timelineYearGraph");
        
        if (yearGraph) {

            const yearCounts = years.map(year =>
                Object.values(groupedByYear[year]).reduce((sum, monthMemories) => sum + monthMemories.length, 0)
            );

            const highestYearCount = Math.max(1, ...yearCounts);

            yearGraph.innerHTML = years.map((year, i) => {

                const count = yearCounts[i];
                const percent = Math.round((count / highestYearCount) * 100);

                return `
                <div class="mb-5">
                    <div class="flex justify-between mb-2">
                        <span class="font-medium text-white">${year}</span>
                        <span class="text-cyan-400 font-bold">${count}</span>
                    </div>
                    <div class="w-full bg-zinc-800 rounded-full h-3">
                        <div class="bg-cyan-500 h-3 rounded-full transition-all duration-700" style="width: ${percent}%"></div>
                    </div>
                </div>
                `;

            }).join("");

        }

        const yearNav = document.getElementById("timelineYearNav");
        if (yearNav) {

            yearNav.innerHTML = years.map(year => `
                <button
                    onclick="jumpToYear(${year})"
                    class="bg-zinc-800 hover:bg-cyan-500 hover:text-black text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold transition">
                    ${year}
                </button>
            `).join("");

        }

        // ---- Phase B: year/month stats + reflective insights ----

        const monthNamesFull = ["January","February","March","April","May","June","July","August","September","October","November","December"];

        const yearStats = {};
        years.forEach(year => {
            const monthCounts = new Array(12).fill(0);
            let favouritesTotal = 0;
            Object.values(groupedByYear[year]).forEach(list => {
                list.forEach(memory => {
                    monthCounts[new Date(memory.date).getMonth()]++;
                    if (memory.favourite) favouritesTotal++;
                });
            });
            const maxMonthCount = Math.max(...monthCounts);
            const busiestMonthIndex = monthCounts.indexOf(maxMonthCount);
            yearStats[year] = {
                total: monthCounts.reduce((a, b) => a + b, 0),
                monthCounts,
                maxMonthCount,
                busiestMonth: maxMonthCount > 0 ? monthNamesFull[busiestMonthIndex] : null,
                favouritesTotal
            };
        });

        const mostActiveYear = years.reduce((best, y) =>
            yearStats[y].total > yearStats[best].total ? y : best, years[0]);
        const earliestYear = years[years.length - 1];

        const monthFavouriteCounts = {};
        years.forEach(year => {
            Object.keys(groupedByYear[year]).forEach(month => {
                monthFavouriteCounts[`${year}-${month}`] =
                    groupedByYear[year][month].filter(m => m.favourite).length;
            });
        });

        const chronological = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));

        const firstOfYear = {};
        chronological.forEach(memory => {
            const y = new Date(memory.date).getFullYear();
            if (!(y in firstOfYear)) firstOfYear[y] = memory.id;
        });

        const gapInsight = {};
        for (let i = 1; i < chronological.length; i++) {
            const daysApart = Math.round(
                (new Date(chronological[i].date) - new Date(chronological[i - 1].date)) / (1000 * 60 * 60 * 24)
            );
            if (daysApart >= 30) gapInsight[chronological[i].id] = daysApart;
        }

        let timelineHtml = "";

        years.forEach((year, yearIndex) => {

            const months = Object.keys(groupedByYear[year]).sort((a, b) => {
                return new Date(`${b} 1, ${year}`) - new Date(`${a} 1, ${year}`);
            });

            let yearContent = "";

            months.forEach(month => {

                const monthCount = groupedByYear[year][month].length;
                const isBusiestMonth = yearStats[year].busiestMonth === month && yearStats[year].maxMonthCount > 1;
                const monthFavCount = monthFavouriteCounts[`${year}-${month}`] || 0;

                yearContent += `
                <div class="flex items-center gap-2 flex-wrap mt-6 mb-3 ml-3">
                    <h4 class="text-cyan-400 font-semibold text-lg">
                        ${month} ${year}
                    </h4>
                    <span class="text-zinc-500 text-sm">· ${monthCount} entr${monthCount === 1 ? "y" : "ies"}</span>
                    ${isBusiestMonth ? `<span class="bg-orange-500/15 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">🔥 Busiest month</span>` : ""}
                    ${monthFavCount > 0 ? `<span class="text-yellow-400 text-xs">⭐ ${monthFavCount} favourite${monthFavCount === 1 ? "" : "s"}</span>` : ""}
                </div>
                `;

                groupedByYear[year][month].forEach(memory => {

                const isToday = (() => {
                    const d = new Date(memory.date);
                    const t = new Date();
                    return d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
                })();

                const dotSizeClasses = memory.image
                    ? "w-5 h-5 -left-[10px] top-7 border-2 border-zinc-950"
                    : "w-3 h-3 -left-[6px] top-8";

                const dotColorClass = memory.favourite ? "bg-yellow-400" : "bg-cyan-500";
                const dotGlowClass = isToday ? "shadow-[0_0_0_4px_rgba(244,114,182,0.35)]" : "";

                const isFirstOfYear = firstOfYear[year] === memory.id;
                const gapDays = gapInsight[memory.id];

                yearContent += `
        <div class="relative border-l-4 border-cyan-500 pl-6 py-5 ml-3 fade-in">

            <div class="absolute ${dotSizeClasses} ${dotColorClass} ${dotGlowClass} rounded-full"></div>

            ${isFirstOfYear ? `<p class="text-emerald-400 text-xs font-semibold mb-2">🌱 First memory of the year</p>` : ""}
            ${gapDays ? `<p class="text-cyan-400 text-xs font-semibold mb-2">↩ You returned after ${gapDays} days</p>` : ""}

            <div onclick="${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `handleLockedCardTap(${memory.id})` : `viewMemory(${memory.id})`}" class="cursor-pointer bg-zinc-900 border border-cyan-500/30 hover:border-cyan-400 rounded-3xl overflow-hidden transition-all">

               ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `
                    <div class="p-10 flex flex-col items-center justify-center text-center gap-2" style="filter: blur(6px); user-select: none;">
                        <span class="text-4xl">🔒</span>
                        <span class="text-zinc-500 text-sm">Locked memory</span>
                    </div>
               ` : `

               ${memory.image ? `
                    <div class="relative">
                        <img src="${memory.image}" alt="Memory Image" class="w-full aspect-[4/3] object-cover">
                        ${memory.images && memory.images.length > 1 ? `<span class="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">📷 ${memory.images.length}</span>` : ""}
                    </div>
                ` : ""}
                

                <div class="p-6">

                    <div class="flex items-center justify-between mb-3">
                        ${memory.category ? `<span class="bg-zinc-800 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-full">${escapeHTML(memory.category)}</span>` : "<span></span>"}
                        <span class="text-zinc-500 text-xs">${formatCardDate(memory.date)}</span>
                    </div>

                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        ${escapeHTML(memory.title)}
                        ${memory.favourite ? `<span class="text-yellow-400 text-base">⭐</span>` : ""}
                        ${memory.mood ? `<span class="text-sm" title="${getMoodLabel(memory.mood)}">${getMoodLabel(memory.mood).split(" ")[0]}</span>` : ""}
                    </h3>
                    

                    <p class="mt-2 text-zinc-400 text-sm leading-relaxed">
                        ${escapeHTML(truncateText(memory.description))}
                    </p>
                    
                    
                    ${memory.voice ? `
                        <div onclick="event.stopPropagation()" class="mt-3 bg-zinc-800 rounded-2xl p-3 flex items-center gap-3">
                            <button onclick="toggleVoicePlayback(${memory.id})" id="voicePlayBtn-${memory.id}" class="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 flex items-center justify-center text-black flex-shrink-0 transition">
                                <span id="voicePlayIcon-${memory.id}">▶</span>
                            </button>
                            <div class="flex-1 min-w-0">
                                <div class="h-1.5 bg-zinc-700 rounded-full cursor-pointer" onclick="seekVoice(event, ${memory.id})">
                                    <div id="voiceProgress-${memory.id}" class="h-1.5 bg-cyan-400 rounded-full" style="width:0%"></div>
                                </div>
                                <p id="voiceTime-${memory.id}" class="text-xs text-zinc-500 mt-1">0:00 / 0:00</p>
                            </div>
                            <audio id="voiceAudio-${memory.id}" src="${memory.voice}" preload="metadata" class="hidden"></audio>
                        </div>
                    ` : ""}

                    <div class="flex gap-2 mt-4">
                        <button onclick="event.stopPropagation(); editMemory(${memory.id})" title="Edit" class="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition">
                            ✏
                        </button>
                        <button onclick="event.stopPropagation(); confirmDelete(${memory.id})" title="Delete" class="w-9 h-9 flex items-center justify-center bg-zinc-800 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 rounded-full transition">
                            🗑
                        </button>
                    </div>

                </div>
                `}

            </div>
            

        </div>
                    `;


                });

            });

        const stats = yearStats[year];

        const sparkline = stats.monthCounts.map(count => {
            const heightPercent = stats.maxMonthCount > 0 ? Math.round((count / stats.maxMonthCount) * 100) : 0;
            return `<div class="flex-1 bg-zinc-800 rounded-sm overflow-hidden flex items-end h-8"><div class="w-full bg-cyan-500 rounded-sm" style="height:${heightPercent}%"></div></div>`;
        }).join("");

        let yearReflection = "";
        if (years.length > 1 && year === mostActiveYear) {
            yearReflection = `<span class="text-cyan-400 text-xs font-semibold">⭐ Your most active year</span>`;
        } else if (years.length > 1 && year === earliestYear) {
            yearReflection = `<span class="text-emerald-400 text-xs font-semibold">🌱 The year you started</span>`;
        }

        timelineHtml += `
            <details id="year-${year}" ${yearIndex === 0 ? "open" : ""} class="mb-8 bg-zinc-900 border border-zinc-700 rounded-3xl p-6">

                <summary class="cursor-pointer select-none">
                    <div class="flex items-baseline justify-between flex-wrap gap-2">
                        <span class="text-3xl font-bold text-white">${year}</span>
                        <span class="text-zinc-400 text-sm">${stats.total} memor${stats.total === 1 ? "y" : "ies"}</span>
                    </div>
                    <div class="border-t border-zinc-700 my-3"></div>
                    <div class="flex gap-1 h-8 mb-2">
                        ${sparkline}
                    </div>
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        ${stats.busiestMonth ? `<span class="text-zinc-500 text-sm">Most written in: ${stats.busiestMonth} · ${stats.maxMonthCount} entr${stats.maxMonthCount === 1 ? "y" : "ies"}</span>` : `<span></span>`}
                        ${yearReflection}
                    </div>
                </summary>

                ${yearContent}

            </details>
            `;

        });
        

timelineContainer.innerHTML = timelineHtml || `
    <div class="bg-zinc-900 rounded-3xl p-8 text-center">

        <div class="text-5xl mb-4">🕰️</div>

        <h3 class="text-xl font-semibold text-white">
            Your timeline is empty
        </h3>

        <p class="text-zinc-400 mt-2">
            Once you save memories, they'll appear here in order.
        </p>

        <button
            onclick="openMemoryModal();"
            
            class="mt-6 bg-cyan-500 hover:bg-cyan-400 text-black rounded-2xl px-6 py-3 font-semibold transition">
            ➕ Create Your First Memory
        </button>

    </div>
`;

    }
    // Dashboard
    document.getElementById("totalMemories").textContent = memories.length;

const uniqueCategories = new Set(
    memories
        .filter(memory => memory.category)
        .map(memory => memory.category)
);

document.getElementById("totalCategories").textContent =
    uniqueCategories.size;

document.getElementById("latestMemory").textContent =
    memories.length ? memories[0].title : "None"; 
    
    const favouriteCount = memories.filter(
    memory => memory.favourite
).length;

document.getElementById("favouriteCount").textContent =
    favouriteCount;
    
    // Top Category
const categoryCount = {};

memories.forEach(memory => {

    if (memory.category) {

        categoryCount[memory.category] =
            (categoryCount[memory.category] || 0) + 1;

    }
    
});

let topCategory = "None";
let highestCount = 0;

for (const category in categoryCount) {

    if (categoryCount[category] > highestCount) {

        highestCount = categoryCount[category];
        topCategory = category;

    }

}

document.getElementById("topCategory").textContent = topCategory;

// ===== Memories This Month =====


const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const memoriesThisMonth = memories.filter(memory => {

    const d = new Date(memory.date);

    return (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
    );

});

document.getElementById("monthMemories").textContent =
    memoriesThisMonth.length;
    
    // ===== Memory Streak =====

let streak = 0;

if (memories.length > 0) {

    const today = new Date();

    const dates = memories
        .map(memory => new Date(memory.date).toDateString());

    const uniqueDates = [...new Set(dates)];

    streak = uniqueDates.length;

}

document.getElementById("memoryStreak").textContent = streak;

// ===== Longest Memory Title =====

let longestTitle = "None";

if (memories.length > 0) {

    longestTitle = memories.reduce((longest, memory) => {

        return memory.title.length > longest.title.length
            ? memory
            : longest;

    }).title;

}

document.getElementById("longestTitle").textContent =
    longestTitle;
    
    // ===== Weekly Activity =====

const today = new Date();

const oneWeekAgo = new Date();

oneWeekAgo.setDate(today.getDate() - 7);

const weeklyMemories = memories.filter(memory => {

    const d = new Date(memory.date);

    return d >= oneWeekAgo;

});

document.getElementById("weeklyActivity").textContent =
    weeklyMemories.length;

// ===== Category Chart =====

const chart = document.getElementById("categoryChart");

if (chart) {

    let html = "";

    for (const category in categoryCount) {

        const count = categoryCount[category];

        html += `
        <div class="mb-5">
            <div class="flex justify-between mb-2">
                <span class="font-medium text-white">${category}</span>
                <span class="text-cyan-400 font-bold">${count}</span>
            </div>
            <div class="w-full bg-zinc-800 rounded-full h-3">
                <div class="bg-cyan-500 h-3 rounded-full transition-all duration-700"
                     style="width: ${Math.min(100, Math.round((count / highestCount) * 100))}%">
                </div>
            </div>
        </div>
        `;
    }

    // ===== Monthly Activity Chart =====
    const monthlyChart = document.getElementById("monthlyActivityChart");

    if (monthlyChart) {

        const monthLabels = [];
        const monthCounts = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - i);

            const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
            const monthKey = `${d.getFullYear()}-${d.getMonth()}`;

            const count = memories.filter(memory => {
                const md = new Date(memory.date);
                return `${md.getFullYear()}-${md.getMonth()}` === monthKey;
            }).length;

            monthLabels.push(label);
            monthCounts.push(count);
        }

        const highestMonthCount = Math.max(1, ...monthCounts);

        let monthlyHtml = "";

        monthLabels.forEach((label, index) => {
            const count = monthCounts[index];
            const percent = Math.round((count / highestMonthCount) * 100);

            monthlyHtml += `
            <div class="mb-5">
                <div class="flex justify-between mb-2">
                    <span class="font-medium text-white">${label}</span>
                    <span class="text-cyan-400 font-bold">${count}</span>
                </div>
                <div class="w-full bg-zinc-800 rounded-full h-3">
                    <div class="bg-cyan-500 h-3 rounded-full transition-all duration-700"
                         style="width: ${percent}%">
                    </div>
                </div>
            </div>
            `;
        });

        monthlyChart.innerHTML = monthlyHtml;
    }

    chart.innerHTML = html || `
    <div class="text-center py-10">
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-xl font-semibold text-white">No category data yet</h3>
        <p class="text-zinc-400 mt-3">
            Create memories with categories to see your statistics here.
        </p>
    </div>
    `;
}

} // ← THIS closes the loadMemories() function

// ===================================================
// MEMORY ACTIONS
// ===================================================


function openMemoryModal(id = null) {

    const modal = document.getElementById("newMemoryModal");
    const modalTitle = document.getElementById("memoryModalTitle");
    const saveButton = document.querySelector("#memoryForm button[type='submit']");

    document.getElementById("memoryForm").reset();
    document.getElementById("audioPreview").classList.add("hidden");
    recordedAudioURL = null;
    editOriginalTime = null;

    renderMoodSelector("");
    document.getElementById("categorySuggestChip").classList.add("hidden");

    formPhotos = [null, null, null, null];

    if (id !== null) {

        const memories = getMemories();
        const memory = memories.find(m => m.id === id);
        if (!memory) return;

        editingMemoryId = id;
        
        modalTitle.textContent = "Edit Memory";
        saveButton.textContent = "Update Memory";

        document.getElementById("title").value = memory.title;
        document.getElementById("description").value = memory.description || "";
        document.getElementById("category").value = memory.category || "";
        document.getElementById("memoryFavourite").checked = !!memory.favourite;
        document.getElementById("memoryLocked").checked = !!memory.locked;
        
        document.getElementById("memoryTags").value = (memory.tags || []).join(", ");
        document.getElementById("memoryPeople").value = memory.people || "";
        document.getElementById("memoryPlace").value = memory.place || "";
        renderMoodSelector(memory.mood || "");

        const existingImages = (memory.images && memory.images.length)
            ? memory.images
            : (memory.image ? [memory.image] : []);
        existingImages.slice(0, 4).forEach((img, i) => { formPhotos[i] = img; });

        const d = new Date(memory.date);
        document.getElementById("memoryDate").value = d.toISOString().split("T")[0];
        
        editOriginalTime = { hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() };

    } else {

        editingMemoryId = null;
        modalTitle.textContent = "New Memory";
        saveButton.textContent = "Save to Vault";

        document.getElementById("memoryDate").value = new Date().toISOString().split("T")[0];

    }

    renderPhotoSlots();

    modal.classList.remove("hidden");
    modal.classList.add("flex");

}


// ===================================================
// MULTI-PHOTO SLOT ENGINE
// ===================================================
let formPhotos = [null, null, null, null];

function triggerPhotoSlotInput(slotIndex) {
    const input = document.getElementById("photoSlotInput");
    input.dataset.targetSlot = slotIndex;
    input.value = "";
    input.click();
}

document.getElementById("photoSlotInput").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const slotIndex = Number(this.dataset.targetSlot);
    const compressed = await compressImage(file);
    formPhotos[slotIndex] = compressed;
    renderPhotoSlots();
});

function removePhotoSlot(slotIndex, event) {
    if (event) event.stopPropagation();
    formPhotos.splice(slotIndex, 1);
    formPhotos.push(null);
    renderPhotoSlots();
}

function swapToCover(slotIndex) {
    if (slotIndex === 0 || !formPhotos[slotIndex]) return;
    [formPhotos[0], formPhotos[slotIndex]] = [formPhotos[slotIndex], formPhotos[0]];
    renderPhotoSlots();
    if (navigator.vibrate) navigator.vibrate(30);
    showToast("📌 Cover photo updated");
}

function attachLongPress(el, callback, duration = 500) {
    let timer = null;
    let triggered = false;
    const start = () => {
        triggered = false;
        el.classList.add("scale-95", "ring-4", "ring-cyan-500/50");
        timer = setTimeout(() => {
            triggered = true;
            callback();
            el.classList.remove("scale-95", "ring-4", "ring-cyan-500/50");
        }, duration);
    };
    const cancel = () => {
        clearTimeout(timer);
        el.classList.remove("scale-95", "ring-4", "ring-cyan-500/50");
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", cancel);
    el.addEventListener("pointerleave", cancel);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("click", (e) => {
        if (triggered) { e.stopPropagation(); e.preventDefault(); }
    }, true);
}

function renderPhotoSlots() {
    const coverSlot = document.getElementById("coverPhotoSlot");

    if (formPhotos[0]) {
        coverSlot.innerHTML = `
            <img src="${formPhotos[0]}" class="w-full h-full object-cover">
            <button type="button" onclick="removePhotoSlot(0, event)" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm">✕</button>
            <span class="absolute bottom-2 left-2 bg-cyan-500 text-black text-xs font-semibold px-2.5 py-1 rounded-full">Cover</span>
        `;
        coverSlot.onclick = null;
        coverSlot.classList.remove("border-dashed", "border-zinc-600");
    } else {
        coverSlot.innerHTML = `<span class="text-zinc-500 text-sm">+ Add Cover Photo</span>`;
        coverSlot.onclick = () => triggerPhotoSlotInput(0);
        coverSlot.classList.add("border-dashed", "border-zinc-600");
    }

    const extra = document.getElementById("extraPhotoSlots");
    extra.innerHTML = "";

    for (let i = 1; i <= 3; i++) {
        const slot = document.createElement("div");
        slot.className = "relative aspect-square rounded-xl overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center transition-all";

        if (formPhotos[i]) {
            slot.classList.remove("border-dashed", "border-zinc-600");
            slot.innerHTML = `
                <img src="${formPhotos[i]}" class="w-full h-full object-cover pointer-events-none">
                <button type="button" onclick="event.stopPropagation(); removePhotoSlot(${i}, event)" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs">✕</button>
            `;
            const capturedIndex = i;
            attachLongPress(slot, () => swapToCover(capturedIndex));
            slot.addEventListener("click", (e) => {
                if (e.target.tagName === "BUTTON") return;
                openImageViewer([formPhotos[capturedIndex]], 0);
            });
        } else {
            const capturedIndex = i;
            slot.innerHTML = `<span class="text-zinc-600 text-2xl">+</span>`;
            slot.onclick = () => triggerPhotoSlotInput(capturedIndex);
        }

        extra.appendChild(slot);
    }
}

function updatePhotoLabel() {
    const input = document.getElementById("memoryImage");
    const label = document.getElementById("photoFileName");
    if (input.files.length > 0) {
        label.textContent = `📎 ${input.files[0].name}`;
        label.classList.remove("hidden");
    } else {
        label.classList.add("hidden");
    }
}


function playUnlockSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = "sine";
            const start = ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
            osc.start(start);
            osc.stop(start + 0.4);
        });
    } catch (e) {}
}

function fireConfetti() {
    const colors = ["#22d3ee", "#fbbf24", "#a78bfa", "#34d399", "#f472b6"];
    for (let i = 0; i < 30; i++) {
        const piece = document.createElement("div");
        piece.style.cssText = `
            position: fixed; top: -20px; left: ${Math.random() * 100}vw;
            width: 8px; height: 8px; background: ${colors[Math.floor(Math.random() * colors.length)]};
            z-index: 9999; pointer-events: none; border-radius: 2px;
            transform: rotate(${Math.random() * 360}deg);
        `;
        document.body.appendChild(piece);
        const fall = piece.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], { duration: 2000 + Math.random() * 1500, easing: "ease-in" });
        fall.onfinish = () => piece.remove();
    }
}

function checkBackupReminder() {
    const memories = getMemories();
    const lastReminded = parseInt(localStorage.getItem("echovault_lastBackupReminder") || "0");
    const lastCount = parseInt(localStorage.getItem("echovault_lastBackupCount") || "0");

    if (memories.length >= lastCount + 10 && Date.now() - lastReminded > 3 * 24 * 60 * 60 * 1000) {
        localStorage.setItem("echovault_lastBackupReminder", Date.now());
        localStorage.setItem("echovault_lastBackupCount", memories.length);
        setTimeout(() => {
            showToast("💾 You've added a lot of memories — consider backing up your vault in Settings!");
        }, 2000);
    }
}

function showTimeCapsule() {
    const memories = getMemories();
    if (memories.length === 0) {
        showToast("📭 No memories yet — create one first!");
        return;
    }
    const random = memories[Math.floor(Math.random() * memories.length)];
    viewMemory(random.id);
}

function renderWordFrequency() {
    const container = document.getElementById("wordFrequencyList");
    if (!container) return;

    const memories = getMemories();
    const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","is","was","were","it","this","that","i","my","me","we","our","you","your","he","she","they","them","his","her","be","have","has","had","as","so","just","not","from","by","are"]);

    const wordCounts = {};
    memories.forEach(m => {
        const words = (m.description || "").toLowerCase().match(/[a-z']+/g) || [];
        words.forEach(w => {
            if (w.length > 3 && !stopWords.has(w)) {
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            }
        });
    });

    const top = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);

    if (top.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 text-sm">Write a few more memories to see your patterns here.</p>`;
        return;
    }

    const maxCount = top[0][1];
    container.innerHTML = top.map(([word, count]) => {
        const size = 0.75 + (count / maxCount) * 0.75;
        return `<span class="bg-zinc-800 text-cyan-300 px-3 py-1.5 rounded-full" style="font-size: ${size}rem;">${word}</span>`;
    }).join("");
}

function showDailyPrompt() {
    const el = document.getElementById("dailyPrompt");
    if (!el) return;

    const prompts = [
        "What made you smile today?",
        "Describe a moment you want to remember forever.",
        "Who did you think about today?",
        "What's something small that felt good recently?",
        "What are you grateful for right now?",
        "Describe a place that felt like home today.",
        "What's a conversation that stuck with you?",
        "What did you learn about yourself this week?",
        "What's something you almost forgot to notice?",
        "If today had a title, what would it be?"
    ];

    const dayIndex = Math.floor(Date.now() / 86400000) % prompts.length;
    el.textContent = prompts[dayIndex];
}

function showHomeStreak() {
    const banner = document.getElementById("homeStreakBanner");
    const countEl = document.getElementById("homeStreakCount");
    if (!banner) return;

    const streak = parseInt(localStorage.getItem("echovault_currentStreak") || "0");

    if (streak >= 2) {
        countEl.textContent = streak;
        banner.classList.remove("hidden");
    } else {
        banner.classList.add("hidden");
    }
}

function showHomeOnThisDay() {
    const el = document.getElementById("homeOnThisDay");
    if (!el) return;

    const memories = getMemories();
    const today = new Date();

    const match = memories.find(m => {
        const d = new Date(m.date);
        return d.getMonth() === today.getMonth() &&
               d.getDate() === today.getDate() &&
               d.getFullYear() < today.getFullYear();
    });

    if (match) {
        const yearsAgo = today.getFullYear() - new Date(match.date).getFullYear();
        el.innerHTML = `
            <p class="text-cyan-400 text-sm font-semibold">📅 On this day, ${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago</p>
            <p class="text-white font-bold mt-1">${match.title}</p>
            <button onclick="viewMemory(${match.id})" class="text-cyan-400 text-sm mt-2 underline">Revisit it →</button>
        `;
        el.classList.remove("hidden");
    } else {
        el.classList.add("hidden");
    }
}

function showReminderIntro() {
  const modal = document.getElementById("reminderIntroModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function hideReminderIntro() {
  const modal = document.getElementById("reminderIntroModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function requestReminderPermission() {
  if (!("Notification" in window)) {
    showToast("Notifications aren't supported in this browser", "error");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    localStorage.setItem("reminderEnabled", "true");
    showToast("Reminders enabled — see you soon 🔔", "success");
  } else {
    localStorage.setItem("reminderEnabled", "false");
    showToast("Reminders stayed off. You can enable them later in Settings.", "info");
  }

  hideReminderIntro();
}

document.getElementById("enableReminderButton").addEventListener("click", requestReminderPermission);
document.getElementById("skipReminderButton").addEventListener("click", () => {
  localStorage.setItem("reminderEnabled", "false");
  hideReminderIntro();
});



function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function editMemory(id) {
    const memories = getMemories();
    const memory = memories.find(m => m.id === id);
    if (memory && memory.locked && !memoryLockUnlockedIds.has(memory.id)) {
        handleLockedCardTap(id);
        return;
    }
    openMemoryModal(id);
}



function confirmDelete(id) {

    deletingMemoryId = id;

    const modal =
        document.getElementById("deleteModal");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeDeleteModal() {

    const modal =
        document.getElementById("deleteModal");

    modal.classList.remove("flex");
    modal.classList.add("hidden");
}
function deleteMemory() {

    let memories = getMemories();

    memories = memories.filter(
        memory => memory.id !== deletingMemoryId
    );

    setMemories(memories);
    if (locked) memoryLockUnlockedIds.delete(savedId);

    deletingMemoryId = null;

    closeDeleteModal();

    loadMemories();

}

function checkAtticDoorUnlock() {
  // Already unlocked previously? Stay unlocked forever, skip all checks.
  if (localStorage.getItem("atticDoorUnlocked") === "true") {
    return true;
  }

  const joinDateStr = localStorage.getItem("echovault_joinDate");
  if (!joinDateStr) return false;

  const joinDate = new Date(joinDateStr);
  const now = new Date();
  const fiveMonthsMs = 1000 * 60 * 60 * 24 * 30.44 * 5; // ~5 months
  const monthsMet = (now - joinDate) >= fiveMonthsMs;

  if (!monthsMet) return false;

  // Anti-cheat: at least one of memory count / streak thresholds
  const memories = getMemories ? getMemories() : []; // uses your existing IndexedDB getter
  const memoryCountMet = Array.isArray(memories) && memories.length >= 100;

  const longestStreak = parseInt(localStorage.getItem("echovault_longestStreak") || "0", 10);
  
  const streakMet = longestStreak >= 30;

  if (!memoryCountMet && !streakMet) return false;

  // Conditions met for the first time — lock it in permanently
  localStorage.setItem("atticDoorUnlocked", "true");
  localStorage.setItem("atticDoorUnlockedDate", now.toISOString());
  return true;
}

function showAtticDoor() {
  const container = document.getElementById("atticDoorContainer");
  container.classList.remove("hidden");

  const alreadyRevealed = localStorage.getItem("atticDoorRevealed") === "true";
  if (!alreadyRevealed) {
    container.classList.add("animate-[fadeIn_1s_ease]");
    spawnDustParticles(container);
    localStorage.setItem("atticDoorRevealed", "true");
  } else {
    document.getElementById("atticDoorNewBadge").classList.add("hidden");
  }

  startAtticDoorRhythm();
}

const ATTIC_WIGGLE_INTERVAL = 3000;
const ATTIC_PULSE_DURATION = 500;
const ATTIC_TAP_MAX_DURATION = 300;
const ATTIC_HOLD_REQUIRED = 1200;

function createAtticRhythmMachine({ onFeedback, onFail, onSuccess }) {
  let cycleStart = 0, tapsThisPulse = 0, pointerDownAt = null;
  let holdArmed = false, holdStartedAt = null, resolved = false, lastWiggling = null;

  function isWiggling(t) { return ((t - cycleStart) % ATTIC_WIGGLE_INTERVAL) < ATTIC_PULSE_DURATION; }
  function reset() { tapsThisPulse = 0; holdArmed = false; holdStartedAt = null; }
  function fail(reason) { reset(); onFail && onFail(reason); }

  return {
    start(t) { cycleStart = t; },
    isWiggling,
    tick(t) {
      if (resolved) return;
      const wigglingNow = isWiggling(t);
      if (lastWiggling === true && wigglingNow === false) {
        if (tapsThisPulse === 2) { holdArmed = true; onFeedback && onFeedback("hold-now"); }
        else if (tapsThisPulse > 0) fail("wrong-tap-count");
        tapsThisPulse = 0;
      }
      lastWiggling = wigglingNow;
      if (holdArmed && holdStartedAt !== null && (t - holdStartedAt) >= ATTIC_HOLD_REQUIRED) {
        resolved = true;
        onSuccess && onSuccess();
      }
    },
    pointerDown(t) {
      if (resolved) return;
      pointerDownAt = t;
      if (holdArmed) { holdStartedAt = t; onFeedback && onFeedback("holding"); return; }
      if (!isWiggling(t)) fail("tapped-during-pause");
    },
    pointerUp(t) {
      if (resolved) return;
      if (holdArmed && holdStartedAt !== null) {
        const held = t - holdStartedAt;
        fail(held < ATTIC_HOLD_REQUIRED ? "released-early" : "unexpected");
        pointerDownAt = null;
        return;
      }
      if (pointerDownAt === null) return;
      const pressLength = t - pointerDownAt;
      pointerDownAt = null;
      if (pressLength > ATTIC_TAP_MAX_DURATION) { fail("held-not-armed"); return; }
      if (isWiggling(t) || isWiggling(t - pressLength)) { tapsThisPulse++; onFeedback && onFeedback("tap-registered"); }
      else fail("tap-outside-pulse");
    }
  };
}

function startAtticDoorRhythm() {
  const door = document.getElementById("atticDoorVisual");
  if (door.dataset.rhythmStarted === "true") return;
  door.dataset.rhythmStarted = "true";

  const machine = createAtticRhythmMachine({
    onFeedback: (type) => {
      if (type === "tap-registered") {
        door.classList.add("ring-4", "ring-amber-300/60");
        setTimeout(() => door.classList.remove("ring-4", "ring-amber-300/60"), 150);
      }
      if (type === "hold-now") {
        door.classList.add("ring-4", "ring-emerald-400/70");
      }
      if (type === "holding") {
        door.classList.add("scale-95");
      }
    },
    onFail: () => {
      door.classList.remove("ring-4", "ring-emerald-400/70", "scale-95");
      showAtticDoorMessage("this door seems to be close, maybe it needs a little rhythm");
    },
    onSuccess: () => {
      door.classList.remove("ring-4", "ring-emerald-400/70", "scale-95");
      beginAtticFirstEntry();
    }
  });

  const startTime = performance.now();
  machine.start(startTime);

  setInterval(() => {
    const t = performance.now();
    machine.tick(t);
    door.classList.toggle("animate-[wiggle_0.5s_ease]", machine.isWiggling(t));
  }, 50);

  door.addEventListener("pointerdown", (e) => { e.preventDefault(); machine.pointerDown(performance.now()); });
  door.addEventListener("pointerup", (e) => { e.preventDefault(); machine.pointerUp(performance.now()); });
}

function showAtticDoorMessage(text) {
  const msg = document.getElementById("atticDoorMessage");
  if (!msg) return;
  msg.textContent = text;
  msg.classList.remove("hidden");
  clearTimeout(showAtticDoorMessage._t);
  showAtticDoorMessage._t = setTimeout(() => msg.classList.add("hidden"), 3000);
}


function spawnDustParticles(container) {
  for (let i = 0; i < 12; i++) {
    const dust = document.createElement("div");
    dust.className = "absolute w-1 h-1 bg-amber-200/40 rounded-full animate-[dustFloat_2s_ease-out_forwards]";
    dust.style.left = `${40 + Math.random() * 20}%`;
    dust.style.bottom = "20%";
    dust.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(dust);
    setTimeout(() => dust.remove(), 2500);
  }
}

// beginAtticFirstEntry() now lives in Attic/attic.js — kept out of this file
// so the Attic feature stays fully separated from the main script.

function toggleFavourite(id) {

    let memories = getMemories();

    const memory = memories.find(memory => memory.id === id);

    if (!memory) return;

    memory.favourite = !memory.favourite;

    setMemories(memories);

    loadMemories();

}


function selectCategory(category) {

    selectedCategory = category;

    loadMemories();

}

function toggleFavouritesFilter() {
    favouritesOnly = !favouritesOnly;
    const btn = document.getElementById("favouritesToggleBtn");
    if (favouritesOnly) {
        btn.classList.add("bg-cyan-500", "text-black", "border-cyan-500");
        btn.classList.remove("bg-zinc-900", "text-white", "border-zinc-700");
    } else {
        btn.classList.remove("bg-cyan-500", "text-black", "border-cyan-500");
        btn.classList.add("bg-zinc-900", "text-white", "border-zinc-700");
    }
    loadMemories();
}

function toggleMoreFilters() {
    const panel = document.getElementById("moreFiltersPanel");
    const arrow = document.getElementById("moreFiltersArrow");
    panel.classList.toggle("hidden");
    arrow.textContent = panel.classList.contains("hidden") ? "▸" : "▾";
}

function sendContactMessage() {

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !message) {
        showToast("Please fill in all fields.");
        return;
    }

    const subject = encodeURIComponent(`EchoVault Message from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);

    window.location.href = `mailto:echovault780@gmail.com?subject=${subject}&body=${body}`;

    showToast("📧 Opening your email app...");

}

function jumpToYear(year) {

    const target = document.getElementById(`year-${year}`);

    if (!target) return;

    target.open = true;

    target.scrollIntoView({ behavior: "smooth", block: "start" });

}

function clearDateFilter() {

    document.getElementById("dateFrom").value = "";
    document.getElementById("dateTo").value = "";

    loadMemories();

}

function closeModal() {
    document.getElementById("memoryModal").classList.add("hidden");
    document.getElementById("memoryModal").classList.remove("flex");
}

function closeMemoryModal(skipConfirm = false) {
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("description").value.trim();

    if (!skipConfirm && (title || desc)) {
        if (!confirm("Discard this memory? Anything you've typed will be lost.")) {
            return;
        }
    }

    document.getElementById("newMemoryModal").classList.add("hidden");
    document.getElementById("newMemoryModal").classList.remove("flex");
    document.getElementById("memoryForm").reset();
    editingMemoryId = null;
    editOriginalTime = null;
}



function updateDeveloperPanel() {

    document.getElementById("devFails").textContent =
        memoryChallengeFails;

    const isLocked = cooldownEnd > Date.now();

    document.getElementById("devCooldown").textContent =
        isLocked
            ? (cooldownEnd === Infinity ? "Permanent" : `${Math.ceil((cooldownEnd - Date.now()) / 60000)}m left`)
            : "None";
            

    document.getElementById("devLocked").textContent =
        isLocked
            ? "YES"
            : "NO";
}

// ===================================================
// IMPORT / EXPORT
// ===================================================
function exportMemories() {

    const memories = getMemories();

    if (memories.length === 0) {

        alert("There are no memories to export.");

        return;

    }

    const blob = new Blob(
        [JSON.stringify(memories, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "EchoVault_Backup.json";

    a.click();

    URL.revokeObjectURL(url);

    localStorage.setItem("echovault_hasExported", "true");

 }

async function exportPDF() {

    let memories = getMemories();

    // --- Filters ---
    const dateFromEl = document.getElementById("exportDateFrom");
    const dateToEl = document.getElementById("exportDateTo");
    const dateFrom = dateFromEl && dateFromEl.value ? new Date(dateFromEl.value) : null;
    const dateTo = dateToEl && dateToEl.value ? new Date(dateToEl.value) : null;

    if (dateFrom) memories = memories.filter(m => new Date(m.date) >= dateFrom);
    if (dateTo) {
        dateTo.setHours(23, 59, 59, 999);
        memories = memories.filter(m => new Date(m.date) <= dateTo);
    }

    const exportCategoryEl = document.getElementById("exportCategoryFilter");
    const exportCategory = exportCategoryEl ? exportCategoryEl.value : "All";
    if (exportCategory !== "All") {
        memories = memories.filter(m => m.category === exportCategory);
    }

    // --- Mode ---
    const modeInput = document.querySelector('input[name="pdfMode"]:checked');
    const mode = modeInput ? modeInput.value : "full"; // "full" | "showcase"

    if (mode === "showcase") {
        memories = memories.filter(m => m.favourite);
    }

    if (memories.length === 0) {
        showToast(mode === "showcase"
            ? "No favourited memories match those filters."
            : "No memories found matching those filters.");
        return;
    }

    // Sort oldest → newest for a book-like feel
    memories = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    const unlockedAchievements = (typeof userAchievements !== "undefined")
        ? userAchievements.filter(a => a.unlocked)
        : [];
    const totalAchievements = (typeof userAchievements !== "undefined")
        ? userAchievements.length
        : 0;

    const exportDateStr = new Date().toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
    });

    // ========== 1. COVER PAGE ==========
    doc.setFillColor(15, 15, 18);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFillColor(34, 211, 238);
    doc.rect(0, 0, pageWidth, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(mode === "showcase" ? "My EchoVault" : "EchoVault Archive", pageWidth / 2, 70, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(34, 211, 238);
    doc.text(mode === "showcase" ? "Showcase Edition" : "Full Memory Archive", pageWidth / 2, 82, { align: "center" });

    doc.setFillColor(30, 30, 36);
    doc.roundedRect(margin + 10, 110, contentWidth - 20, 60, 6, 6, "F");

    doc.setTextColor(161, 161, 170);
    doc.setFontSize(10);
    doc.text("MEMORIES", pageWidth / 2 - 40, 128, { align: "center" });
    doc.text("ACHIEVEMENTS", pageWidth / 2 + 40, 128, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(String(memories.length), pageWidth / 2 - 40, 148, { align: "center" });
    doc.text(`${unlockedAchievements.length}`, pageWidth / 2 + 40, 148, { align: "center" });

    if (memories.length > 0) {
        const oldest = new Date(memories[0].date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        const newest = new Date(memories[memories.length - 1].date).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        doc.setFontSize(11);
        doc.setTextColor(161, 161, 170);
        doc.text(`${oldest}  —  ${newest}`, pageWidth / 2, 190, { align: "center" });
    }

    doc.setFontSize(10);
    doc.setTextColor(113, 113, 122);
    doc.text("Private vault  •  Your memories never left your device", pageWidth / 2, pageHeight - 40, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Exported ${exportDateStr}`, pageWidth / 2, pageHeight - 28, { align: "center" });

    // ========== 2. ACHIEVEMENTS PAGE (Showcase only) ==========
    if (mode === "showcase" && unlockedAchievements.length > 0) {
        doc.addPage();
        doc.setFillColor(250, 250, 250);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        doc.setTextColor(20, 20, 20);
        doc.setFontSize(18);
        doc.text("Achievements Unlocked", margin, 28);

        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`${unlockedAchievements.length} of ${totalAchievements} total`, margin, 38);

        let ay = 52;
        const sorted = [...unlockedAchievements].sort((a, b) => new Date(a.unlockedAt) - new Date(b.unlockedAt));

        sorted.forEach((ach, i) => {
            if (ay > pageHeight - 25) {
                doc.addPage();
                doc.setFillColor(250, 250, 250);
                doc.rect(0, 0, pageWidth, pageHeight, "F");
                ay = 25;
            }

            const title = (ach.title || "").replace(/^[\p{Emoji}\s]+/u, "").trim() || ach.title;
            const dateStr = ach.unlockedAt
                ? new Date(ach.unlockedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "";

            doc.setFontSize(11);
            doc.setTextColor(30);
            doc.text(`${i + 1}.  ${title}`, margin, ay);

            if (dateStr) {
                doc.setFontSize(9);
                doc.setTextColor(140);
                doc.text(dateStr, pageWidth - margin, ay, { align: "right" });
            }
            ay += 9;
        });
    }

    // ========== 3. MEMORY PAGES ==========
    doc.addPage();
    let y = margin;
    let pageNum = mode === "showcase" ? 3 : 2;

    const addFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor(160);
        doc.text("EchoVault", margin, pageHeight - 10);
        doc.text(String(pageNum), pageWidth - margin, pageHeight - 10, { align: "right" });
    };

    addFooter();

    for (let i = 0; i < memories.length; i++) {
        const memory = memories[i];
        if (memory.locked) continue; // locked memories are excluded from PDF export entirely
        const title = memory.title || "Untitled";
        const dateStr = new Date(memory.date).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric"
        });
        const category = memory.category || "Uncategorised";
        const desc = memory.description || "";
        const lines = desc ? doc.splitTextToSize(desc, contentWidth) : [];
        const hasImage = !!memory.image;

        let blockHeight = 20 + (lines.length * 5.5) + 12;
        if (hasImage) blockHeight += 52;

        if (y + blockHeight > pageHeight - 25) {
            doc.addPage();
            pageNum++;
            y = margin;
            addFooter();
        }

// Title
doc.setFontSize(14);
doc.setTextColor(20);
doc.text(title, margin, y);
y += 7;

// Meta
doc.setFontSize(9);
doc.setTextColor(120);
let meta = dateStr + "  ·  " + category;
if (memory.favourite) meta += "  ·  ★ Favourite";
doc.text(meta, margin, y);
y += 8;

// Description
if (lines.length) {
    doc.setFontSize(10);
    doc.setTextColor(55);
    lines.forEach(line => {
        if (y > pageHeight - 30) {
            doc.addPage();
            pageNum++;
            y = margin;
            addFooter();
        }
        doc.text(line, margin, y);
        y += 5.4;
    });
    y += 4;
}

// Image
if (hasImage) {
    try {
        const format = memory.image.includes("image/png") ? "PNG" : "JPEG";
        const imgW = 85;
        const imgH = 58;
        if (y + imgH > pageHeight - 25) {
            doc.addPage();
            pageNum++;
            y = margin;
            addFooter();
        }
        doc.addImage(memory.image, format, margin, y, imgW, imgH);
        y += imgH + 7;
    } catch (e) { /* skip broken image */ }
}

if (memory.voice) {
    doc.setFontSize(8);
    doc.setTextColor(0, 150, 180);
    doc.text("Voice note attached (not included in PDF)", margin, y);
    y += 6;
}

// Divider
doc.setDrawColor(225);
doc.setLineWidth(0.4);
doc.line(margin, y, pageWidth - margin, y);
y += 14;
}

    const filePrefix = mode === "showcase" ? "EchoVault_Showcase" : "EchoVault_Archive";
doc.save(filePrefix + "_" + new Date().toISOString().slice(0, 10) + ".pdf");

    showToast(mode === "showcase" ? "✨ Showcase PDF exported!" : "📄 Archive PDF exported!");
}


function importMemories(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const importedMemories = JSON.parse(e.target.result);

            if (!Array.isArray(importedMemories)) {

                alert("❌ Invalid backup file.");

                return;

            }

            setMemories(importedMemories);

            loadMemories();

            localStorage.setItem("echovault_hasImported", "true");

            alert("✅ Memories imported successfully!");

        } catch {

            alert("❌ Could not read this file.");

        }

    };

    reader.readAsText(file);

    event.target.value = "";

}
function viewMemory(id) {

    const memories = getMemories();

    const memory = memories.find(m => m.id === id);

    if (!memory) return;

    if (memory.locked && !memoryLockUnlockedIds.has(memory.id)) {
        handleLockedCardTap(id);
        return;
    }

    document.getElementById("memoryViewerContent").innerHTML = `
    
        <div class="relative">

            ${memory.image ? `
                <img
                    src="${memory.image}"
                    onclick="openMemoryImageViewer(${memory.id}, 0)"
                    class="w-full aspect-[4/3] object-cover rounded-t-[2rem] cursor-pointer">

                <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"></div>
            ` : `
                <div class="w-full h-20 rounded-t-[2rem] bg-zinc-950"></div>
            `}

            <button
                onclick="closeMemoryViewer()"
                class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white text-2xl flex items-center justify-center hover:bg-black/70 active:bg-black/80 transition leading-none">
                &times;
            </button>

            <div class="${memory.image ? "absolute inset-x-0 bottom-0" : ""} p-6">

                ${(memory.images && memory.images.length > 1) ? `
                    <div class="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
                        ${memory.images.slice(1).map((img, i) => `
                            <img
                                src="${img}"
                                onclick="event.stopPropagation(); openMemoryImageViewer(${memory.id}, ${i + 1})"
                                class="w-16 h-16 rounded-xl object-cover flex-shrink-0 cursor-pointer border-2 border-zinc-700/60 hover:border-cyan-400 transition">
                        `).join("")}
                    </div>
                ` : ""}

                <div class="flex items-center gap-2 mb-3">
                    <span class="bg-zinc-800/80 text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur">
                        ${escapeHTML(memory.category) || "No Category"}
                    </span>
                    <span class="bg-zinc-800/80 text-zinc-300 text-xs px-3 py-1.5 rounded-full backdrop-blur">
                        ${new Date(memory.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </span>
                    
                </div>

                <h2 class="text-3xl font-bold text-white">
                    ${escapeHTML(memory.title)}
                </h2>

            </div>

        </div>

        <div class="p-6 pt-0">

            ${(memory.mood || memory.people || memory.place) ? `
                <div class="flex flex-wrap gap-2 mb-4">
                    ${memory.mood ? `<span class="bg-zinc-800 text-zinc-300 text-sm px-3 py-1.5 rounded-full">${getMoodLabel(memory.mood)}</span>` : ""}
                    ${memory.people ? `<span class="bg-zinc-800 text-zinc-300 text-sm px-3 py-1.5 rounded-full">👥 ${escapeHTML(memory.people)}</span>` : ""}
                    ${memory.place ? `<span class="bg-zinc-800 text-zinc-300 text-sm px-3 py-1.5 rounded-full">📍 ${escapeHTML(memory.place)}</span>` : ""}
                </div>
            ` : ""}

            ${memory.voice ? `
            
<div class="mt-2 mb-6">

    <p class="text-cyan-400 font-semibold mb-2">
        🎙 Voice Note
    </p>

    <audio controls class="w-full rounded-xl">
        <source src="${memory.voice}" type="audio/webm">
        Your browser does not support audio.
    </audio>

</div>
` : ""}

            <p class="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">${escapeHTML(memory.description)}</p>

            <div class="mt-6 text-3xl">
                ${memory.favourite ? "⭐ Favourite Memory" : ""}
            </div>

            ${(() => {
                const savedAchievements = JSON.parse(localStorage.getItem("echovault_achievements") || "[]");
                const triggered = savedAchievements.filter(a => a.unlocked && a.triggeredByMemoryId === memory.id);

                if (triggered.length === 0) return "";

                return `
                    <div class="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
                        <p class="text-cyan-400 font-semibold text-sm mb-1">
                            🏆 This memory unlocked:
                        </p>
                        ${triggered.map(a => `
                            <p class="text-white text-sm">${a.title}</p>
                        `).join("")}
                    </div>
                `;
            })()}

        </div>
    `;

    document.getElementById("memoryViewer").classList.remove("hidden");
}

function closeMemoryViewer() {

    document.getElementById("memoryViewer").classList.add("hidden");

}


let viewerImages = [];
let viewerIndex = 0;

function openImageViewer(images, startIndex = 0) {

    viewerImages = Array.isArray(images) ? images : [images];
    viewerIndex = startIndex;

    renderViewerImage();

    document.getElementById("imageViewer").classList.remove("hidden");
    document.getElementById("imageViewer").classList.add("flex");

}

function renderViewerImage() {

    document.getElementById("fullscreenImage").src = viewerImages[viewerIndex];

    const showNav = viewerImages.length > 1;

    document.getElementById("viewerPrevBtn").classList.toggle("hidden", !showNav);
    document.getElementById("viewerNextBtn").classList.toggle("hidden", !showNav);

    const counter = document.getElementById("viewerCounter");
    counter.classList.toggle("hidden", !showNav);
    if (showNav) {
        counter.textContent = `${viewerIndex + 1} / ${viewerImages.length}`;
    }

}

function viewerPrev(event) {
    if (event) event.stopPropagation();
    viewerIndex = (viewerIndex - 1 + viewerImages.length) % viewerImages.length;
    renderViewerImage();
}

function viewerNext(event) {
    if (event) event.stopPropagation();
    viewerIndex = (viewerIndex + 1) % viewerImages.length;
    renderViewerImage();
}

(function setupViewerSwipe() {
    let touchStartX = null;
    const viewer = document.getElementById("imageViewer");
    if (!viewer) return;

    viewer.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    });

    viewer.addEventListener("touchend", (e) => {
        if (touchStartX === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 50 && viewerImages.length > 1) {
            if (deltaX < 0) viewerNext(); else viewerPrev();
        }
        touchStartX = null;
    });
})();

function closeImageViewer() {

    document.getElementById("imageViewer").classList.remove("flex");
    document.getElementById("imageViewer").classList.add("hidden");

    document.getElementById("fullscreenImage").src = "";
    viewerImages = [];
    viewerIndex = 0;

}

function openMemoryImageViewer(memoryId, index) {
    const memory = getMemories().find(m => m.id === memoryId);
    if (!memory) return;
    const images = (memory.images && memory.images.length)
        ? memory.images
        : (memory.image ? [memory.image] : []);
    openImageViewer(images, index);
}



function showToast(message) {

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;

    toast.classList.remove("translate-x-[120%]");
    toast.classList.add("translate-x-0");

    setTimeout(() => {

        toast.classList.remove("translate-x-0");
        toast.classList.add("translate-x-[120%]");

    }, 3000);
}

let achievementToastTimer = null;

function showAchievementToast(achievement) {
    const toast = document.getElementById("achievementToast");
    const icon = document.getElementById("achievementToastIcon");
    const title = document.getElementById("achievementToastTitle");
    const desc = document.getElementById("achievementToastDesc");

    if (!toast) return;
    
    playUnlockSound();
    fireConfetti();

    const toastStyles = {
        Memory: "ach-toast-memory", Writing: "ach-toast-writing", Story: "ach-toast-story",
        Streak: "ach-toast-streak", Explorer: "ach-toast-explorer", Time: "ach-toast-time",
        Category: "ach-toast-category", Secret: "ach-toast-secret"
    };

    const colorClasses = toastStyles[achievement.category] || toastStyles.Memory;
    
    const isStory = achievement.category === "Story";

    toast.className =
        `fixed top-6 left-1/2 -translate-x-1/2 opacity-0 bg-zinc-900 border-2 ${colorClasses} text-white px-6 py-5 rounded-3xl shadow-2xl z-[999] flex items-start gap-4 max-w-sm ` +
        (isStory
            ? "-translate-y-[150%] transition-all duration-[900ms] ease-out"
            : "-translate-y-[150%] transition-all duration-500 ease-out");

    const labelStyles = {
        Memory: "text-cyan-300", Writing: "text-violet-300", Story: "text-amber-300",
        Streak: "text-orange-300", Explorer: "text-teal-300", Time: "text-indigo-300",
        Category: "text-emerald-300", Secret: "text-fuchsia-300"
    };
    document.getElementById("achievementToastLabel").className =
        `text-xs font-bold uppercase tracking-wider ${labelStyles[achievement.category] || labelStyles.Memory}`;

    const parts = achievement.title.split(" ");
    icon.textContent = parts[0];
    
    title.textContent = parts.slice(1).join(" ");
    desc.textContent = isStory && achievement.subtitle
        ? achievement.subtitle
        : achievement.description;

    const nameEl = document.getElementById("achievementToastName");
    const userName = getUserName();
    if (nameEl) {
        if (userName) {
            nameEl.textContent = `Nice one, ${userName}.`;
            nameEl.classList.remove("hidden");
        } else {
            nameEl.classList.add("hidden");
        }
    }
    
    // Force reflow so the transition actually plays from the reset state
    void toast.offsetWidth;

    toast.classList.remove("-translate-y-[150%]", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");

    if (isStory) {
        toast.classList.add("scale-100");
    }

    if (achievementToastTimer) {
        clearTimeout(achievementToastTimer);
    }

    achievementToastTimer = setTimeout(() => {
        dismissAchievementToast();
    }, isStory ? 11000 : 8000);
}


function dismissAchievementToast() {
    const toast = document.getElementById("achievementToast");
    if (!toast) return;

    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("-translate-y-[150%]", "opacity-0");

    if (achievementToastTimer) {
        clearTimeout(achievementToastTimer);
        achievementToastTimer = null;
    }
}

// ===================================================
// VOICE RECORDING
// ===================================================
    const startButton = document.getElementById("startRecording");
const stopButton = document.getElementById("stopRecording");
const audioPreview = document.getElementById("audioPreview");

if (startButton && stopButton && audioPreview) {

    startButton.addEventListener("click", async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            mediaRecorder = new MediaRecorder(stream);

            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

mediaRecorder.onstop = () => {

    recordedAudio = new Blob(audioChunks, {
        type: "audio/webm"
    });

    const reader = new FileReader();

    reader.onloadend = () => {

        recordedAudioURL = reader.result;

        audioPreview.src = recordedAudioURL;

        audioPreview.classList.remove("hidden");

    };

    reader.readAsDataURL(recordedAudio);

};
            mediaRecorder.start();
            const status = document.getElementById("recordingStatus");
const timer = document.getElementById("recordingTimer");

status.classList.remove("hidden");
timer.classList.remove("hidden");

recordingSeconds = 0;

timer.textContent = "00:00";

recordingInterval = setInterval(() => {

    recordingSeconds++;

    const minutes = String(Math.floor(recordingSeconds / 60)).padStart(2, "0");
    const seconds = String(recordingSeconds % 60).padStart(2, "0");

    timer.textContent = `${minutes}:${seconds}`;

}, 1000);

            startButton.disabled = true;
            stopButton.disabled = false;

            showToast("🎙 Recording started");

        } catch {

            showToast("❌ Microphone permission denied");
        }

    });

    stopButton.addEventListener("click", () => {

        mediaRecorder.stop();
        clearInterval(recordingInterval);

document.getElementById("recordingStatus").textContent =
"✅ Recording stopped";

setTimeout(() => {

    document.getElementById("recordingStatus").classList.add("hidden");

    document.getElementById("recordingTimer").classList.add("hidden");

    document.getElementById("recordingStatus").textContent =
    "🔴 Recording...";

}, 2000);

        startButton.disabled = false;
        stopButton.disabled = true;

        showToast("✅ Recording saved");

    });

}

function toggleVoicePlayback(id) {
    const audio = document.getElementById(`voiceAudio-${id}`);
    const icon = document.getElementById(`voicePlayIcon-${id}`);
    if (!audio) return;

    document.querySelectorAll("audio[id^='voiceAudio-']").forEach(a => {
        if (a !== audio && !a.paused) {
            a.pause();
            const otherId = a.id.replace("voiceAudio-", "");
            const otherIcon = document.getElementById(`voicePlayIcon-${otherId}`);
            if (otherIcon) otherIcon.textContent = "▶";
        }
    });

    if (audio.paused) {
        audio.play();
        icon.textContent = "⏸";
    } else {
        audio.pause();
        icon.textContent = "▶";
    }
}

function seekVoice(event, id) {
    event.stopPropagation();
    const audio = document.getElementById(`voiceAudio-${id}`);
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    if (audio.duration) audio.currentTime = percent * audio.duration;
}

function formatTime(seconds) {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

document.addEventListener("timeupdate", (e) => {
    if (e.target.tagName === "AUDIO" && e.target.id.startsWith("voiceAudio-")) {
        const id = e.target.id.replace("voiceAudio-", "");
        const progress = document.getElementById(`voiceProgress-${id}`);
        const timeLabel = document.getElementById(`voiceTime-${id}`);
        if (progress && e.target.duration) {
            progress.style.width = `${(e.target.currentTime / e.target.duration) * 100}%`;
        }
        if (timeLabel) {
            timeLabel.textContent = `${formatTime(e.target.currentTime)} / ${formatTime(e.target.duration)}`;
        }
    }
}, true);

document.addEventListener("ended", (e) => {
    if (e.target.tagName === "AUDIO" && e.target.id.startsWith("voiceAudio-")) {
        const id = e.target.id.replace("voiceAudio-", "");
        const icon = document.getElementById(`voicePlayIcon-${id}`);
        if (icon) icon.textContent = "▶";
    }
}, true);

document.addEventListener("loadedmetadata", (e) => {
    if (e.target.tagName === "AUDIO" && e.target.id.startsWith("voiceAudio-")) {
        const id = e.target.id.replace("voiceAudio-", "");
        const timeLabel = document.getElementById(`voiceTime-${id}`);
        if (timeLabel) {
            timeLabel.textContent = `0:00 / ${formatTime(e.target.duration)}`;
        }
    }
}, true);

// Initial load

// ================= PLAYFUL MODE =================
function togglePlayfulMode() {
    const isPlayful = document.body.classList.toggle('playful-mode');
    localStorage.setItem('echovault_playfulMode', isPlayful ? 'true' : 'false');
    updatePlayfulToggleUI(isPlayful);
    if (isPlayful) {
        showToast('🎨 Playful Mode ON! Everything is bubbly now! ✨');
        // confetti effect
        for(let i=0;i<20;i++){
            setTimeout(()=>{
                const confetti = document.createElement('div');
                confetti.textContent = ['🎉','✨','🌈','⭐','💖'][Math.floor(Math.random()*5)];
                confetti.style.position='fixed';
                confetti.style.left=Math.random()*100+'vw';
                confetti.style.top='-20px';
                confetti.style.fontSize='24px';
                confetti.style.pointerEvents='none';
                confetti.style.zIndex='9999';
                confetti.style.transition='transform 2s ease-out, opacity 2s';
                document.body.appendChild(confetti);
                setTimeout(()=>{
                    confetti.style.transform=`translateY(${window.innerHeight+100}px) rotate(${Math.random()*720}deg)`;
                    confetti.style.opacity='0';
                },50);
                setTimeout(()=>confetti.remove(),2100);
            }, i*80);
        }
    } else {
        showToast('🌙 Back to normal mode');
    }
}

function updatePlayfulToggleUI(isPlayful) {
    const toggle = document.getElementById('playfulModeToggle');
    const knob = document.getElementById('playfulToggleKnob');
    if (!toggle || !knob) return;
    if (isPlayful) {
        toggle.classList.remove('bg-zinc-700');
        toggle.classList.add('bg-pink-500');
        knob.style.left='33px';
        knob.textContent='🎨';
    } else {
        toggle.classList.add('bg-zinc-700');
        toggle.classList.remove('bg-pink-500');
        knob.style.left='4px';
        knob.textContent='🌙';
    }
}

// Load saved playful mode on startup
(function initPlayfulMode(){
    const saved = localStorage.getItem('echovault_playfulMode') === 'true';
    if (saved) {
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('playful-mode');
            updatePlayfulToggleUI(true);
        });
        // if DOM already loaded
        if (document.readyState !== 'loading') {
            document.body.classList.add('playful-mode');
            setTimeout(()=>updatePlayfulToggleUI(true),100);
        }
    }
})();


(async () => {
    // Show skeleton immediately on app load
    showSkeleton(true);
    
    await initMemoriesCache();
    
    // Load memories (which will handle showing/hiding skeleton)
    loadMemories();

    // Show Home and run its hooks by default
    showSection("home", document.querySelector(".nav-link"));
})();

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
if (menuButton && mobileMenu) {

    menuButton.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

    });

    document.querySelectorAll(".nav-link").forEach(link => {

        link.addEventListener("click", () => {

            mobileMenu.classList.add("hidden");
            
        });

    });
    
}


  function getUserName() {
    return localStorage.getItem("userName") || "";
}
   
// ===================================================
// VAULT SECURITY
// ===================================================
window.onload = () => {
    
 checkBackupReminder();
 
 
    const unlockButton = document.getElementById("unlockButton");
    const pinInput = document.getElementById("pinInput");
    const togglePin = document.getElementById("togglePin");

const lockScreen = document.getElementById("lockScreen");
    const createPinScreen = document.getElementById("createPinScreen");
    const pinIntroScreen = document.getElementById("pinIntroScreen");
    const nameCaptureScreen = document.getElementById("nameCaptureScreen");
    

    if (!vaultPIN) {

        lockScreen.classList.add("hidden");
        pinIntroScreen.classList.remove("hidden");
        pinIntroScreen.classList.add("flex");

        document.getElementById("pinIntroContinue").addEventListener("click", () => {

            pinIntroScreen.classList.add("hidden");
            pinIntroScreen.classList.remove("flex");

            createPinScreen.classList.remove("hidden");
            createPinScreen.classList.add("flex");

        });

        const createPinButton = document.getElementById("createPinButton");
        
        

        createPinButton.addEventListener("click", async () => {

            const newPin = document.getElementById("createPinInput").value.trim();
            const confirmPin = document.getElementById("createPinConfirmInput").value.trim();

            if (newPin.length !== 4 || isNaN(newPin)) {
                showToast("❌ PIN must be exactly 4 digits.");
                return;
            }

            if (newPin !== confirmPin) {
                showToast("❌ PINs do not match.");
                return;
            }

            const createdHash = await hashPIN(newPin);
            localStorage.setItem("vaultPIN", createdHash);
            localStorage.setItem("vaultCreatedDate", new Date().toISOString());
            

            vaultPIN = createdHash;

            showToast("✅ PIN created! Welcome to EchoVault.");

            createPinScreen.classList.add("hidden");
            createPinScreen.classList.remove("flex");

            nameCaptureScreen.classList.remove("hidden");
            nameCaptureScreen.classList.add("flex");

        });

        const nameCaptureButton = document.getElementById("nameCaptureButton");
        const nameCaptureSkip = document.getElementById("nameCaptureSkip");

        function finishNameCapture() {
            nameCaptureScreen.classList.add("hidden");
            nameCaptureScreen.classList.remove("flex");
        }

        nameCaptureButton.addEventListener("click", () => {

            const name = document.getElementById("nameCaptureInput").value.trim();

            if (name) {
                localStorage.setItem("userName", name);
                showToast(`✅ Welcome, ${name}!`);
            } else {
                showToast("Welcome to EchoVault!");
            }

            finishNameCapture();

        });

        nameCaptureSkip.addEventListener("click", finishNameCapture);
        
    }
    
// =============================
// Forgot PIN
// =============================

const forgotPinButton = document.getElementById("forgotPinButton");
const recoveryModal = document.getElementById("recoveryModal");
const cancelRecovery = document.getElementById("cancelRecovery");

if (forgotPinButton && recoveryModal && cancelRecovery) {

    forgotPinButton.addEventListener("click", () => {

        recoveryModal.classList.remove("hidden");
        recoveryModal.classList.add("flex");

        applyChallengeLockoutUI();

    });
    
    

    cancelRecovery.addEventListener("click", () => {

        recoveryModal.classList.remove("flex");
        recoveryModal.classList.add("hidden");

    });

}

    // Unlock button
let pinLockoutInterval = null;

    function applyPinLockoutUI() {

        if (pinCooldownEnd > Date.now()) {

            unlockButton.disabled = true;
            unlockButton.classList.add("opacity-50", "cursor-not-allowed");
            pinInput.disabled = true;

            document.getElementById("pinLockoutHelp").classList.remove("hidden");

            if (!pinLockoutInterval) {
                pinLockoutInterval = setInterval(() => {

                    if (pinCooldownEnd <= Date.now()) {
                        clearInterval(pinLockoutInterval);
                        pinLockoutInterval = null;
                        applyPinLockoutUI();
                        return;
                    }

                    unlockButton.textContent = formatCountdown(pinCooldownEnd - Date.now());

                }, 1000);
            }

            unlockButton.textContent = pinCooldownEnd === Infinity
                ? "🔒 Permanently locked"
                : formatCountdown(pinCooldownEnd - Date.now());

        } else {

            if (pinLockoutInterval) {
                clearInterval(pinLockoutInterval);
                pinLockoutInterval = null;
            }

            unlockButton.disabled = false;
            unlockButton.classList.remove("opacity-50", "cursor-not-allowed");
            pinInput.disabled = false;
            unlockButton.textContent = "🔓 Unlock Vault";

            document.getElementById("pinLockoutHelp").classList.add("hidden");

        }

    }
    
    if (unlockButton && pinInput) {

        applyPinLockoutUI();

        unlockButton.addEventListener("click", async () => {

            if (pinCooldownEnd > Date.now()) {

                if (pinCooldownEnd === Infinity) {
                    showToast("🔒 Vault permanently locked. Use Forgot PIN to recover.");
                } else {
                    const minutesLeft = Math.ceil((pinCooldownEnd - Date.now()) / 60000);
                    showToast(`🔒 Too many attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`);
                }
                return;

            }

            if (await checkPINMatch(pinInput.value.trim(), vaultPIN)) {
                

                document.getElementById("lockScreen").classList.add("hidden");
                showToast("🔓 Vault unlocked!");
                checkAndFireReminder();

                memoryChallengeFails = 0;
                cooldownEnd = 0;
                memoryChallengeLockoutTier = 0;

                pinFails = 0;
                pinCooldownEnd = 0;
                pinLockoutTier = 0;

                localStorage.setItem("memoryChallengeFails", 0);
                localStorage.setItem("memoryChallengeCooldownEnd", 0);
                localStorage.setItem("memoryChallengeLockoutTier", 0);

                localStorage.setItem("pinFails", 0);
                localStorage.setItem("pinCooldownEnd", 0);
                localStorage.setItem("pinLockoutTier", 0);

                updateDeveloperPanel();

            }

            else {

                pinFails++;
                localStorage.setItem("pinFails", pinFails);

                if (pinFails >= MAX_PIN_FAILS) {

                    const tierIndex = Math.min(pinLockoutTier, LOCKOUT_DURATIONS.length - 1);
                    const duration = LOCKOUT_DURATIONS[tierIndex];

                    pinCooldownEnd = duration === Infinity ? Infinity : Date.now() + duration;
                    localStorage.setItem("pinCooldownEnd", pinCooldownEnd === Infinity ? "Infinity" : pinCooldownEnd);

                    pinLockoutTier = Math.min(pinLockoutTier + 1, LOCKOUT_DURATIONS.length - 1);
                    localStorage.setItem("pinLockoutTier", pinLockoutTier);

                    pinFails = 0;
                    localStorage.setItem("pinFails", 0);

                    showToast(`🔒 Too many failed attempts. Locked ${formatLockoutDuration(duration)}.`);

                    applyPinLockoutUI();

                } else {

                    showToast(`❌ Incorrect PIN — Attempt ${pinFails}/${MAX_PIN_FAILS}`);

                }

                pinInput.value = "";
                pinInput.focus();

            }



        });

    }
    
    // Show / Hide PIN
 if (togglePin && pinInput) {

        const togglePinIcon = document.getElementById("togglePinIcon");

        togglePin.addEventListener("click", () => {

            if (pinInput.type === "password") {

                pinInput.type = "text";
                togglePinIcon.textContent = "🙈";

            } else {

                pinInput.type = "password";
                togglePinIcon.textContent = "👁";

            }

            togglePin.classList.add("bg-zinc-700");

            setTimeout(() => {
                togglePin.classList.remove("bg-zinc-700");
            }, 150);

        });

    }
    
      // =============================
// Recovery Key Viewer
// =============================

const recoveryInput = document.getElementById("recoveryKeyInput");
const viewRecoveryButton = document.getElementById("viewRecoveryKey");

if (recoveryInput && viewRecoveryButton) {

    recoveryInput.value = recoveryKey;

    viewRecoveryButton.addEventListener("click", () => {

        if (recoveryInput.type === "password") {

            recoveryInput.type = "text";
            viewRecoveryButton.textContent = "🙈";

        } else {

            recoveryInput.type = "password";
            viewRecoveryButton.textContent = "👁";

        }

    });

}
// =============================
// Copy Recovery Key
// =============================

const copyRecoveryButton =
    document.getElementById("copyRecoveryKey");

if (copyRecoveryButton && recoveryInput) {

    copyRecoveryButton.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(recoveryKey);

            showToast("📋 Recovery Key copied!");

        } catch {

            showToast("❌ Couldn't copy Recovery Key.");

        }

    });

}
// =============================
// Download Recovery Key
// =============================

const downloadRecoveryButton =
    document.getElementById("downloadRecoveryKey");

if (downloadRecoveryButton) {

    downloadRecoveryButton.addEventListener("click", () => {

        const content =
`EchoVault Recovery Key

Recovery Key:
${recoveryKey}

Keep this key somewhere safe.

Anyone with this key may be able to recover access to your EchoVault.

Generated by EchoVault.`;

        const blob = new Blob(
            [content],
            { type: "text/plain" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "EchoVault_Recovery_Key.txt";

        a.click();

        URL.revokeObjectURL(url);

        showToast("📄 Recovery Key downloaded!");

    });

}
// =============================
// Generate New Recovery Key
// =============================

const regenerateButton =
    document.getElementById("regenerateRecoveryKey");

if (regenerateButton && recoveryInput) {

    regenerateButton.addEventListener("click", () => {

        const confirmed = confirm(

            "⚠️ Generate a new Recovery Key?\n\nYour current Recovery Key will stop working."

        );

        if (!confirmed) return;

        recoveryKey = generateRecoveryKey();

        localStorage.setItem(
            "recoveryKey",
            recoveryKey
        );

        recoveryInput.value = recoveryKey;

        recoveryInput.type = "password";

        viewRecoveryButton.textContent = "👁";

        showToast("🔑 New Recovery Key generated!");

    });

}

    // Press Enter to unlock
    if (pinInput && unlockButton) {

        pinInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                unlockButton.click();

            }

        });

    }
}
// ----------------------------
// Recovery Verification
// ----------------------------

const recoverButton = document.getElementById("recoverVault");
// recoveryInput already exists


if (recoverButton && recoveryInput) {

    recoverButton.addEventListener("click", () => {

        const savedKey = localStorage.getItem("recoveryKey");

if (!savedKey) {

    showToast("❌ No recovery key found.");
    return;

}

if (recoveryInput.value.trim() === savedKey) {

    showToast("✅ Recovery Key Accepted!");

    document.getElementById("recoveryModal")
        .classList.add("hidden");
    document.getElementById("recoveryModal")
        .classList.remove("flex");

    document.getElementById("setNewPinModal")
        .classList.remove("hidden");
    document.getElementById("setNewPinModal")
        .classList.add("flex");

}


else {

    showToast("❌ Invalid Recovery Key");
    

           }

    });

}



    // ----------------------------
// Change Vault PIN
// ----------------------------

const changePinButton = document.getElementById("changePinButton");

if (changePinButton) {

    changePinButton.addEventListener("click", async () => {

        const currentPin = document.getElementById("currentPin").value.trim();
        const newPin = document.getElementById("newPin").value.trim();
        const confirmPin = document.getElementById("confirmPin").value.trim();

        const savedPin = localStorage.getItem("vaultPIN");

        if (!(await checkPINMatch(currentPin, savedPin))) {
            showToast("❌ Current PIN is incorrect.");
            return;
        }

        if (newPin.length !== 4 || isNaN(newPin)) {
            showToast("❌ New PIN must be exactly 4 digits.");
            return;
        }

        if (newPin !== confirmPin) {
            showToast("❌ New PINs do not match.");
            return;
        }

        const newHash = await hashPIN(newPin);
        localStorage.setItem("vaultPIN", newHash);

        vaultPIN = newHash; 

        showToast("✅ PIN changed successfully!");

        document.getElementById("currentPin").value = "";
        document.getElementById("newPin").value = "";
        document.getElementById("confirmPin").value = "";

    });

}

// ----------------------------
// Set New PIN (after Memory Challenge success)
// ----------------------------

const resetPinButton = document.getElementById("resetPinButton");

if (resetPinButton) {

    resetPinButton.addEventListener("click", async () => {

        const newPin = document.getElementById("resetPin").value.trim();
        const confirmPin = document.getElementById("confirmResetPin").value.trim();

        if (newPin.length !== 4 || isNaN(newPin)) {
            showToast("❌ New PIN must be exactly 4 digits.");
            return;
        }

        if (newPin !== confirmPin) {
            showToast("❌ New PINs do not match.");
            return;
        }

        const resetHash = await hashPIN(newPin);
        localStorage.setItem("vaultPIN", resetHash);

        vaultPIN = resetHash;

        memoryChallengeFails = 0;
        cooldownEnd = 0;
        memoryChallengeLockoutTier = 0;

        pinFails = 0;
        pinCooldownEnd = 0;
        pinLockoutTier = 0;

        localStorage.setItem("memoryChallengeFails", 0);
        localStorage.setItem("memoryChallengeCooldownEnd", 0);
        localStorage.setItem("memoryChallengeLockoutTier", 0);

        localStorage.setItem("pinFails", 0);
        localStorage.setItem("pinCooldownEnd", 0);
        localStorage.setItem("pinLockoutTier", 0);

        if (typeof updateDeveloperPanel === "function") updateDeveloperPanel();
        if (typeof applyPinLockoutUI === "function") applyPinLockoutUI();
        if (typeof applyChallengeLockoutUI === "function") applyChallengeLockoutUI();

        showToast("✅ PIN reset successfully! Vault unlocked.");

        document.getElementById("resetPin").value = "";
        document.getElementById("confirmResetPin").value = "";

        document.getElementById("setNewPinModal").classList.add("hidden");
        document.getElementById("setNewPinModal").classList.remove("flex");

        document.getElementById("lockScreen").classList.add("hidden");

    });

}


// =========================
// Start Memory Challenge
// =========================

document
const startChallengeButton = document.getElementById("startMemoryChallenge");
let challengeLockoutInterval = null;

const cancelChallengeButton = document.getElementById("cancelMemoryChallenge");

if (cancelChallengeButton) {

    cancelChallengeButton.addEventListener("click", () => {

        clearInterval(challengeInterval);

        challengeScore = 0;

        finishMemoryChallenge();

    });

}

function applyChallengeLockoutUI() {

    const helpText = document.getElementById("challengeLockoutHelp");

    if (cooldownEnd > Date.now()) {

        startChallengeButton.disabled = true;
        startChallengeButton.classList.add("opacity-50", "cursor-not-allowed");
        helpText.classList.remove("hidden");

        if (!challengeLockoutInterval) {
            challengeLockoutInterval = setInterval(() => {

                if (cooldownEnd <= Date.now()) {
                    clearInterval(challengeLockoutInterval);
                    challengeLockoutInterval = null;
                    applyChallengeLockoutUI();
                    return;
                }

                startChallengeButton.textContent = formatCountdown(cooldownEnd - Date.now());

            }, 1000);
        }

        startChallengeButton.textContent = cooldownEnd === Infinity
            ? "🔒 Permanently locked"
            : formatCountdown(cooldownEnd - Date.now());

    } else {

        if (challengeLockoutInterval) {
            clearInterval(challengeLockoutInterval);
            challengeLockoutInterval = null;
        }

        startChallengeButton.disabled = false;
        startChallengeButton.classList.remove("opacity-50", "cursor-not-allowed");
        startChallengeButton.textContent = "▶ Start Memory Challenge";
        helpText.classList.add("hidden");

    }

}

startChallengeButton.addEventListener("click", () => {

    if (!generateMemoryChallenge()) return;

    document
    .getElementById("recoveryModal")
    .classList.add("hidden");

    document
    .getElementById("memoryChallengeModal")
    .classList.remove("hidden");
    document
    .getElementById("memoryChallengeModal")
    .classList.add("flex");

    showChallengeQuestion();

});



function showChallengeQuestion() {

    const question = challengeQuestions[currentChallengeIndex];
    
    clearInterval(challengeInterval);

    document.getElementById("challengeQuestion").textContent =
        question.question;

    const challengeImage = document.getElementById("challengeQuestionImage");
    if (challengeImage) {
        if (question.image) {
            challengeImage.src = question.image;
            challengeImage.classList.remove("hidden");
        } else {
            challengeImage.classList.add("hidden");
        }
    }

    document.getElementById("challengeProgress").textContent =
        `${currentChallengeIndex + 1} / 5`;
        

    document.getElementById("challengeBar").style.width =
        `${((currentChallengeIndex + 1) / 5) * 100}%`;

    generateChallengeAnswers(question);
    
    startChallengeTimer();
}

    function timeUp() {

    showToast("⏰ Time's Up!");

    const question =
        challengeQuestions[currentChallengeIndex];

    const buttons =
        document.querySelectorAll("#challengeAnswers button");

    buttons.forEach(button => {

        button.disabled = true;

        button.classList.remove(
            "bg-cyan-500",
            "hover:bg-cyan-400",
            "bg-zinc-800"
        );

        if (button.textContent === question.correct) {

            button.classList.add(
                "bg-green-600",
                "text-white"
            );

} else {

            button.classList.add(
                "bg-zinc-800",
                "text-white"
            );

        }

    });

    const nextButton =
        document.getElementById("nextChallengeQuestion");

    nextButton.disabled = false;

    nextButton.classList.remove(
        "bg-zinc-700",
        "text-zinc-400",
        "cursor-not-allowed"
    );

    nextButton.classList.add(
        "bg-cyan-500",
        "hover:bg-cyan-400",
        "text-black"
    );

}


function generateChallengeAnswers(question) {

    const answersDiv =
        document.getElementById("challengeAnswers");

    answersDiv.innerHTML = "";

    question.options.forEach(option => {

        const button = document.createElement("button");

        button.className =
            "w-full bg-zinc-800 hover:bg-cyan-500 hover:text-black rounded-xl py-3 transition";

        button.textContent = option;

        button.onclick = () => checkChallengeAnswer(option);

        answersDiv.appendChild(button);

    });

}



function checkChallengeAnswer(answer) {

    const question =
        challengeQuestions[currentChallengeIndex];
        
        clearInterval(challengeInterval);
        


    // Disable all buttons
    const buttons =
        document.querySelectorAll("#challengeAnswers button");
        
     

buttons.forEach(button => {

    button.disabled = true;

    // Remove every previous color
button.classList.remove(
    "bg-cyan-500",
    "bg-green-600",
    "bg-red-600",
    "hover:bg-cyan-500",
    "hover:text-black"
);

    // Default color
    button.classList.add(
    "bg-zinc-800",
    "text-white",
    "cursor-not-allowed"
);

    // Correct answer
    if (button.textContent === question.correct) {

        

            button.classList.remove("bg-zinc-800");

            button.classList.add(
                "bg-green-600",
                "text-white"
            );

const nextButton =
    document.getElementById("nextChallengeQuestion");

nextButton.disabled = false;

nextButton.classList.remove(
    "bg-zinc-700",
    "text-zinc-400",
    "cursor-not-allowed"
);

nextButton.classList.add(
    "bg-cyan-500",
    "hover:bg-cyan-400",
    "text-black"
);
        }

        if (
            button.textContent === answer &&
            answer !== question.correct
        ) {

            button.classList.remove("bg-zinc-800");

            button.classList.add(
                "bg-red-600",
                "text-white"
            );

        }

    }
    
    
);

const nextButton =
        document.getElementById("nextChallengeQuestion");

    nextButton.disabled = false;

    nextButton.classList.remove(
        "bg-zinc-700",
        "text-zinc-400",
        "cursor-not-allowed"
    );

    nextButton.classList.add(
        "bg-cyan-500",
        "hover:bg-cyan-400",
        "text-black"
    );

    if (answer === question.correct) {

        challengeScore++;

        showToast("✅ Correct!");

    } else {

        showToast("❌ Wrong!");

    }
    
    

    

}

function finishMemoryChallenge() {

    document
        .getElementById("memoryChallengeModal")
        .classList.add("hidden");
    document
        .getElementById("memoryChallengeModal")
        .classList.remove("flex");

    if (challengeScore < 4) {
        document
            .getElementById("recoveryModal")
            .classList.remove("hidden");
        document
            .getElementById("recoveryModal")
            .classList.add("flex");
    }

    if (challengeScore >= 4) {

        showToast("🎉 Identity Verified!");

        memoryChallengeFails = 0;
        cooldownEnd = 0;
        memoryChallengeLockoutTier = 0;

        localStorage.setItem("memoryChallengeFails", 0);
        localStorage.setItem("memoryChallengeCooldownEnd", 0);
        localStorage.setItem("memoryChallengeLockoutTier", 0);

        updateDeveloperPanel();

        document
            .getElementById("setNewPinModal")
            .classList.remove("hidden");
        document
            .getElementById("setNewPinModal")
            .classList.add("flex");

    }

    else {

        memoryChallengeFails++;

        localStorage.setItem(
            "memoryChallengeFails",
            memoryChallengeFails
        );

        if (memoryChallengeFails >= MAX_CHALLENGE_FAILS) {

            const tierIndex = Math.min(memoryChallengeLockoutTier, LOCKOUT_DURATIONS.length - 1);
            const duration = LOCKOUT_DURATIONS[tierIndex];

            cooldownEnd = duration === Infinity ? Infinity : Date.now() + duration;
            localStorage.setItem("memoryChallengeCooldownEnd", cooldownEnd === Infinity ? "Infinity" : cooldownEnd);

            memoryChallengeLockoutTier = Math.min(memoryChallengeLockoutTier + 1, LOCKOUT_DURATIONS.length - 1);
            localStorage.setItem("memoryChallengeLockoutTier", memoryChallengeLockoutTier);

            memoryChallengeFails = 0;
            localStorage.setItem("memoryChallengeFails", 0);

            showToast(`🔒 Too many failed attempts. Locked ${formatLockoutDuration(duration)}.`);

} else {

            showToast(
                
                `❌ Failed (${challengeScore}/5) — Attempt ${memoryChallengeFails}/${MAX_CHALLENGE_FAILS}`
            );

        }

        updateDeveloperPanel();

        applyChallengeLockoutUI();

    }

}

        const nextChallengeButton =
        
    document.getElementById("nextChallengeQuestion");

if (nextChallengeButton) {

    nextChallengeButton.addEventListener("click", () => {

        currentChallengeIndex++;

        if (currentChallengeIndex >= challengeQuestions.length) {

            finishMemoryChallenge();
            return;

        }

        showChallengeQuestion();

        // Disable the button again
        nextChallengeButton.disabled = true;

        nextChallengeButton.classList.remove(
            "bg-cyan-500",
            "hover:bg-cyan-400",
            "text-black"
        );

        nextChallengeButton.classList.add(
            "bg-zinc-700",
            "text-zinc-400",
            "cursor-not-allowed"
        );
        
        document
.getElementById("developerPanel")
.classList.remove("hidden");

updateDeveloperPanel();

    });

}



let deleteAllMethod = "pin";

function openDeleteAllModal() {
    document.getElementById("deleteAllModal").classList.remove("hidden");
    document.getElementById("deleteAllStep1").classList.remove("hidden");
    document.getElementById("deleteAllStep2").classList.add("hidden");
}

function closeDeleteAllModal() {
    document.getElementById("deleteAllModal").classList.add("hidden");
    document.getElementById("deleteAllConfirmInput").value = "";
    document.getElementById("deleteAllError").classList.add("hidden");
    setDeleteAllMethod("pin");
}

function showDeleteAllStep2() {
    document.getElementById("deleteAllStep1").classList.add("hidden");
    document.getElementById("deleteAllStep2").classList.remove("hidden");
}

function setDeleteAllMethod(method) {

    deleteAllMethod = method;

    const input = document.getElementById("deleteAllConfirmInput");
    const pinTab = document.getElementById("deleteAllTabPin");
    const recoveryTab = document.getElementById("deleteAllTabRecovery");

    if (method === "pin") {
        input.placeholder = "Enter Vault PIN";
        pinTab.className = "bg-cyan-500 text-black rounded-xl py-2 font-semibold";
        recoveryTab.className = "bg-zinc-800 rounded-xl py-2";
    } else {
        input.placeholder = "Enter Recovery Key";
        recoveryTab.className = "bg-cyan-500 text-black rounded-xl py-2 font-semibold";
        pinTab.className = "bg-zinc-800 rounded-xl py-2";
    }

    input.value = "";
    document.getElementById("deleteAllError").classList.add("hidden");
}

async function confirmDeleteAll() {

    const entered = document.getElementById("deleteAllConfirmInput").value;
    const errorMsg = document.getElementById("deleteAllError");

    let valid = false;

    if (deleteAllMethod === "pin") {
        valid = await checkPINMatch(entered, localStorage.getItem("vaultPIN"));
    } else {
        valid = entered === localStorage.getItem("recoveryKey");
    }

    if (!valid) {
        errorMsg.classList.remove("hidden");
        return;
    }

    setMemories([]);
    localStorage.setItem("echovault_hasDeletedAll", "true");

    if (typeof resetAchievements === "function") {
        resetAchievements();
    }
    

    loadMemories();
    closeDeleteAllModal();
    showToast("🗑 All memories and achievements deleted.");

}

const builtInCategoryValues = ["Travel", "Family", "Growth", "Milestone", "Nature"];

function getCustomCategories() {
    return JSON.parse(localStorage.getItem("echovault_customCategories") || "[]");
}

function saveCustomCategories(list) {
    localStorage.setItem("echovault_customCategories", JSON.stringify(list));
}

function renderExportCategoryDropdown() {

    const select = document.getElementById("exportCategoryFilter");
    if (!select) return;

    const currentValue = select.value;
    const customCategories = getCustomCategories();

    let optionsHtml = `
        <option value="All">All Categories</option>
        <option value="Travel">Travel & Adventure</option>
        <option value="Family">Family & Loved Ones</option>
        <option value="Growth">Personal Growth</option>
        <option value="Milestone">Life Milestones</option>
        <option value="Nature">Nature & Serenity</option>
    `;

   customCategories.forEach(cat => {
        optionsHtml += `<option value="${cat}">${cat} (Custom)</option>`;
    });

    select.innerHTML = optionsHtml;
    select.value = currentValue || "All";

}

function renderCategoryDropdown() {

    const select = document.getElementById("category");
    if (!select) return;

    const currentValue = select.value;
    const customCategories = getCustomCategories();

    let optionsHtml = `
        <option value="">Select category...</option>
        <option value="Travel">Travel & Adventure</option>
        <option value="Family">Family & Loved Ones</option>
        <option value="Growth">Personal Growth</option>
        <option value="Milestone">Life Milestones</option>
        <option value="Nature">Nature & Serenity</option>
    `;

    customCategories.forEach(cat => {
        optionsHtml += `<option value="${cat}">${cat}</option>`;
    });

    select.innerHTML = optionsHtml;
    select.value = currentValue;

}

function openAddCategoryModal() {
    document.getElementById("addCategoryModal").classList.remove("hidden");
    document.getElementById("newCategoryInput").value = "";
    document.getElementById("addCategoryError").classList.add("hidden");
}

function closeAddCategoryModal() {
    document.getElementById("addCategoryModal").classList.add("hidden");
}

function confirmAddCategory() {

    const input = document.getElementById("newCategoryInput");
    const errorMsg = document.getElementById("addCategoryError");
    const newCategory = input.value.trim();

    if (!newCategory) return;

    const customCategories = getCustomCategories();
    const allExisting = [...builtInCategoryValues, ...customCategories];

    const isDuplicate = allExisting.some(
        cat => cat.toLowerCase() === newCategory.toLowerCase()
    );

    if (isDuplicate) {
        errorMsg.classList.remove("hidden");
        return;
    }

    customCategories.push(newCategory);
    saveCustomCategories(customCategories);

    renderCategoryDropdown();
    renderExportCategoryDropdown();
    document.getElementById("category").value = newCategory;

    closeAddCategoryModal();
    showToast(`✅ Category "${newCategory}" added.`);

}

renderCategoryDropdown();
renderExportCategoryDropdown();

function setFontSize(size) {

    document.body.setAttribute("data-font-size", size);
    localStorage.setItem("echovault_fontSize", size);

    updateFontSizeButtons(size);

}

// Android (and some other mobile) browsers block `new Notification()` outright and
// require a Service Worker's showNotification() instead. Registering this up front
// (even though it does nothing else) lets fireReminderNotification() use that path.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(err => {
    console.warn("[reminder] Service Worker registration failed:", err);
  });
}

function checkAndFireReminder() {
  const enabled = localStorage.getItem("reminderEnabled") === "true";
  if (!enabled) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  
  

  const reminderTime = localStorage.getItem("reminderTime") || "19:00";
  const [targetHour, targetMinute] = reminderTime.split(":").map(Number);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // "2026-08-20"

  const lastShown = localStorage.getItem("lastReminderShown");
  if (lastShown === todayStr) return; // already fired today

  // Build today's target time as a real Date for comparison
  const targetTime = new Date(now);
  targetTime.setHours(targetHour, targetMinute, 0, 0);

  if (now >= targetTime) {
    fireReminderNotification();
    localStorage.setItem("lastReminderShown", todayStr);
  }
}

async function fireReminderNotification() {
  const name = getUserName();
  const body = name
    ? `Hey ${name}, take a moment to preserve a memory today. 🕯️`
    : "Take a moment to preserve a memory today. 🕯️";
  const options = { body, icon: "/favicon.ico", tag: "echovault-daily-reminder" };

  // Prefer the Service Worker path whenever it's available — required on Android,
  // works fine on desktop too. Only fall back to the legacy constructor if that fails.
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("EchoVault", options);
      return;
    } catch (err) {
      console.warn("[reminder] Service Worker notification failed, falling back:", err);
    }
  }

  try {
    const notification = new Notification("EchoVault", options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn("[reminder] Notification could not be shown on this browser:", err);
  }
}

function setAccentColor(color) {

    document.body.setAttribute("data-accent", color);
    localStorage.setItem("echovault_accent", color);
    
    const accentsUsed = JSON.parse(localStorage.getItem("echovault_accentsUsed") || "[]");
    if (!accentsUsed.includes(color)) {
        accentsUsed.push(color);
        localStorage.setItem("echovault_accentsUsed", JSON.stringify(accentsUsed));
    }

    updateAccentButtons(color);

}

function updateAccentButtons(color) {

    const colors = ["cyan", "purple", "green", "pink", "orange"];

    colors.forEach(option => {

        const btn = document.getElementById(`accent${option.charAt(0).toUpperCase() + option.slice(1)}Btn`);

        if (!btn) return;

        btn.className = option === color
            ? "aspect-square rounded-2xl border-4 border-white transition"
            : "aspect-square rounded-2xl border-4 border-transparent transition";

    });

}

const savedAccent = localStorage.getItem("echovault_accent") || "cyan";
setAccentColor(savedAccent);

function updateFontSizeButtons(size) {

    ["small", "medium", "large"].forEach(option => {

        const btn = document.getElementById(`fontSize${option.charAt(0).toUpperCase() + option.slice(1)}Btn`);

        if (!btn) return;

        btn.className = option === size
            ? "bg-cyan-500 text-black font-semibold py-4 rounded-2xl transition"
            : "bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl transition";

    });

}

function initReminderSettings() {
  const enabled = localStorage.getItem("reminderEnabled") === "true";
  const time = localStorage.getItem("reminderTime") || "19:00";

  document.getElementById("reminderTimeInput").value = time;
  setReminderToggleUI(enabled);
}

function initNameSettings() {
  const input = document.getElementById("userNameInput");
  if (input) input.value = getUserName();
}
initNameSettings();

document.getElementById("saveNameButton").addEventListener("click", () => {
  const name = document.getElementById("userNameInput").value.trim();
  localStorage.setItem("userName", name);
  showToast(name ? `✅ Saved! Hi, ${name}.` : "Name cleared.");
});

function setReminderToggleUI(enabled) {
  const toggle = document.getElementById("reminderToggle");
  const dot = document.getElementById("reminderToggleDot");
  const timeRow = document.getElementById("reminderTimeRow");

  toggle.classList.toggle("bg-cyan-500", enabled);
  toggle.classList.toggle("bg-zinc-700", !enabled);
  dot.classList.toggle("translate-x-5", enabled);
  timeRow.classList.toggle("hidden", !enabled);
}

document.getElementById("reminderToggle").addEventListener("click", async () => {
  const currentlyEnabled = localStorage.getItem("reminderEnabled") === "true";

  if (!("Notification" in window)) {
    showToast("Notifications aren't supported in this browser", "error");
    return;
  }

  if (!currentlyEnabled) {
    // Turning ON
    if (Notification.permission === "granted") {
      localStorage.setItem("reminderEnabled", "true");
      setReminderToggleUI(true);
      showToast("Daily reminders enabled", "success");
    } else if (Notification.permission === "denied") {
      showToast("Notifications are blocked in your browser settings", "error");
    } else {
      showReminderIntro(); // first-time ask, modal handles setting reminderEnabled
      setReminderToggleUI(localStorage.getItem("reminderEnabled") === "true");
    }
  } else {
    // Turning OFF
    localStorage.setItem("reminderEnabled", "false");
    setReminderToggleUI(false);
    showToast("Daily reminders turned off", "info");
  }
});


document.getElementById("reminderTimeInput").addEventListener("change", (e) => {
  localStorage.setItem("reminderTime", e.target.value);
  showToast("Reminder time updated", "success");
});


function renderHomeRecentMemories() {
    const container = document.getElementById("homeRecentMemories");
    if (!container) return;

    const memories = getMemories().slice(0, 3);

    if (memories.length === 0) {
        container.innerHTML = `<p class="text-zinc-500 text-center py-6">No memories yet — create your first one above.</p>`;
        return;
    }

    container.innerHTML = memories.map(memory => `
        <div onclick="${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `handleLockedCardTap(${memory.id})` : `viewMemory(${memory.id})`}" class="cursor-pointer bg-zinc-900 border border-zinc-700 hover:border-cyan-500/60 rounded-3xl overflow-hidden transition-all">

        ${(memory.locked && !memoryLockUnlockedIds.has(memory.id)) ? `
            <div class="p-8 flex flex-col items-center justify-center text-center gap-2" style="filter: blur(6px); user-select: none;">
                <span class="text-3xl">🔒</span>
                <span class="text-zinc-500 text-sm">Locked memory</span>
            </div>
        ` : `

           ${memory.image ? `
                <div class="relative">
                    <img src="${memory.image}" alt="Memory Image" class="w-full aspect-[4/3] object-cover">
                    ${memory.images && memory.images.length > 1 ? `<span class="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">📷 ${memory.images.length}</span>` : ""}
                </div>
            ` : ""}
            

            <div class="p-5">
                <div class="flex items-center gap-2 mb-2">
                    ${memory.category ? `<span class="bg-zinc-800 text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full">${escapeHTML(memory.category)}</span>` : ""}
                    
                    ${memory.favourite ? `<span class="text-yellow-400 text-sm">⭐</span>` : ""}
                </div>
                <h3 class="text-white font-bold">${escapeHTML(memory.title)}</h3>
                <p class="text-zinc-400 text-sm mt-1">${escapeHTML(truncateText(memory.description))}</p>
                
            </div>
            `}
            
        </div>
    `).join("");
    
}

function updateHomeAchievementCount() {
    const el = document.getElementById("homeAchievementCount");
    if (el && typeof userAchievements !== "undefined") {
        el.textContent = `${Math.floor(userAchievements.length / 10) * 10}+`;
    }
}


function resetSettings() {

    const confirmed = confirm("Reset all settings back to default? This won't affect your memories or achievements.");

    if (!confirmed) return;

    localStorage.removeItem("echovault_fontSize");
    setFontSize("medium");

    showToast("↺ Settings reset to default.");

}



const savedFontSize = localStorage.getItem("echovault_fontSize") || "medium";
setFontSize(savedFontSize);

// Track first-ever app open (joinDate)
if (!localStorage.getItem("echovault_joinDate")) {
    localStorage.setItem("echovault_joinDate", new Date().toISOString());
}

// Track page visits
function trackPageVisit(sectionId) {
    const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
    visits[sectionId] = (visits[sectionId] || 0) + 1;
    localStorage.setItem("echovault_pageVisits", JSON.stringify(visits));
}

// Track streaks (persisted)
function updateStreakTracking() {
    const memories = getMemories();
    if (memories.length === 0) {
        localStorage.setItem("echovault_currentStreak", "0");
        localStorage.setItem("echovault_longestStreak", "0");
        return;
    }

    const uniqueDates = [...new Set(memories.map(m => new Date(m.date).toDateString()))]
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => a - b);

    let longestStreak = 1;
    let runningStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const diffDays = Math.round((uniqueDates[i] - uniqueDates[i - 1]) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            runningStreak++;
            longestStreak = Math.max(longestStreak, runningStreak);
        } else {
            runningStreak = 1;
        }
    }

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = new Date(today);
    const dateSet = new Set(uniqueDates.map(d => d.toDateString()));
    if (!dateSet.has(cursor.toDateString())) {
        cursor.setDate(cursor.getDate() - 1);
    }
    while (dateSet.has(cursor.toDateString())) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    localStorage.setItem("echovault_currentStreak", String(currentStreak));
    localStorage.setItem("echovault_longestStreak", String(longestStreak));
}


// ================= THEME SYSTEM =================
const ALL_THEMES = ['playful','doodle','ocean','retro','space','midnight','zen','glass','forest','editorial','minecraft','gta','roblox','dbz','jjk','lofi','onepiece','spiderverse','barbie','marvel','vaporwave','naruto','notebook','candy','horror','rainbow','facebook','noir','obsidian','champagne','graphite','charcoal','slate','walnut','carbon','onyxgold','navyauthority','espresso','concrete','monochrome','silk','velvet','linen','ember','umber','paper','basalt','whatsapp','youtube','default'];

function setThemeMode(mode) {
    ALL_THEMES.forEach(t => { if(t!=='default') document.body.classList.remove(t+'-mode'); });
    document.body.classList.remove('playful-mode');
    if(mode!=='default'){ document.body.classList.add(mode+'-mode'); if(mode==='playful') document.body.classList.add('playful-mode'); }
    localStorage.setItem('echovault_themeMode', mode);
    ALL_THEMES.forEach(m=>{
        const btn=document.getElementById('themeBtn-'+m);
        if(!btn) return;
        if(m===mode) btn.classList.add('border-cyan-500'); else btn.classList.remove('border-cyan-500');
    });
   const msgs={
  playful:'🌈 Playful Mode!',
  doodle:'📓 Doodle Mode!',
  ocean:'🌊 Ocean Mode!',
  retro:'🕹️ Arcade Mode!',
  space:'🚀 Space Mode!',
  midnight:'🌌 Midnight Luxe',
  zen:'🍃 Zen Mode',
  glass:'💎 Glass Mode',
  forest:'🌲 Forest Night',
  editorial:'📰 Editorial',
  minecraft:'⛏️ Minecraft',
  gta:'🚗 GTA Vice City',
  roblox:'🧱 Roblox',
  dbz:'🐉 Dragon Ball Z',
  jjk:'👁️ Jujutsu Kaisen',
  lofi:'☕ Cozy Lo-fi',
  onepiece:'🏴‍☠️ One Piece',
  spiderverse:'🕷️ Spider-Verse',
  barbie:'💖 Barbie',
  marvel:'🦸 Marvel',
  vaporwave:'🌸 Vaporwave',
  naruto:'🍥 Naruto Shippuden',
  notebook:'📓 Notebook Chalk',
  candy:'🍭 Candy World',
  horror:'😱 Horror Mode',
  rainbow:'🌈 Rainbow Mode',
  facebook:'📘 Facebook',
  noir:'🖤 Noir Elegance',
  obsidian:'🖤 Obsidian Luxe',
  champagne:'🥂 Champagne',
  graphite:'✏️ Graphite Studio',
  charcoal:'🌫️ Charcoal Smoke',
  slate:'🪨 Slate Heritage',
  walnut:'🪵 Walnut Executive',
  carbon:'🔩 Carbon Fiber',
  onyxgold:'👑 Onyx & Gold',
  navyauthority:'⚓ Deep Navy',
  espresso:'☕ Espresso Lounge',
  concrete:'🏢 Concrete Modern',
  monochrome:'📰 Monochrome',
  silk:'✨ Silk Noir',
  velvet:'🌌 Velvet Midnight',
  linen:'🧵 Linen Natural',
  ember:'🔥 Ember Glow',
  umber:'🌍 Umber Earth',
  paper:'📄 Paper Archive',
  basalt:'🗿 Basalt Stone',
  whatsapp:'💬 WhatsApp',
  youtube:'▶️ YouTube',
  default:'🌙 Default'
};

    if(typeof showToast==='function') showToast(msgs[mode]);
}
(function(){
    const saved=localStorage.getItem('echovault_themeMode')||'default';
    if(saved!=='default'){ document.body.classList.add(saved+'-mode'); if(saved==='playful') document.body.classList.add('playful-mode'); }
})();


// ===================================================
// OVERRIDE SEARCH INPUT WITH DEBOUNCE (Fixes lag)
// ===================================================

const searchInput = document.getElementById("searchInput");
if (searchInput) {
    // Remove the inline oninput handler (so it doesn't fire twice)
    searchInput.oninput = null;
    
    // Create a debounced version of loadMemories
    const debouncedSearch = debounce(loadMemories, 300);
    
    // Attach it as an event listener
    searchInput.addEventListener("input", debouncedSearch);
}

(async () => {
    await initMemoriesCache();
    loadMemories();
})();

    
    
    
// ===================================================
// ESCAPE KEY LISTENER (Closes all modals)
// ===================================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Check each modal and close it if it's visible
        
        const newMemoryModal = document.getElementById('newMemoryModal');
        if (newMemoryModal && !newMemoryModal.classList.contains('hidden')) {
            closeMemoryModal(true);
            return;
        }
        
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal && !deleteModal.classList.contains('hidden')) {
            closeDeleteModal();
            return;
        }
        
        const memoryModal = document.getElementById('memoryModal');
        if (memoryModal && !memoryModal.classList.contains('hidden')) {
            closeModal();
            return;
        }
        
        const deleteAllModal = document.getElementById('deleteAllModal');
        if (deleteAllModal && !deleteAllModal.classList.contains('hidden')) {
            closeDeleteAllModal();
            return;
        }
        
        const memoryChallengeModal = document.getElementById('memoryChallengeModal');
        if (memoryChallengeModal && !memoryChallengeModal.classList.contains('hidden')) {
            memoryChallengeModal.classList.add('hidden');
            memoryChallengeModal.classList.remove('flex');
            clearInterval(challengeInterval);
            return;
        }
        
        const funChallengeModal = document.getElementById('funChallengeModal');
        if (funChallengeModal && !funChallengeModal.classList.contains('hidden')) {
            closeFunChallenge();
            return;
        }
        
        const recoveryModal = document.getElementById('recoveryModal');
        if (recoveryModal && !recoveryModal.classList.contains('hidden')) {
            recoveryModal.classList.add('hidden');
            recoveryModal.classList.remove('flex');
            return;
        }
        
        const setNewPinModal = document.getElementById('setNewPinModal');
        if (setNewPinModal && !setNewPinModal.classList.contains('hidden')) {
            setNewPinModal.classList.add('hidden');
            setNewPinModal.classList.remove('flex');
            return;
        }
        
        const achievementPreviewModal = document.getElementById('achievementPreviewModal');
        if (achievementPreviewModal && !achievementPreviewModal.classList.contains('hidden')) {
            closeAchievementPreview();
            return;
        }
        
        const addCategoryModal = document.getElementById('addCategoryModal');
        if (addCategoryModal && !addCategoryModal.classList.contains('hidden')) {
            closeAddCategoryModal();
            return;
        }
        
        const imageViewer = document.getElementById('imageViewer');
        if (imageViewer && !imageViewer.classList.contains('hidden')) {
            closeImageViewer();
            return;
        }
        
        const memoryViewer = document.getElementById('memoryViewer');
        if (memoryViewer && !memoryViewer.classList.contains('hidden')) {
            closeMemoryViewer();
            return;
        }
    }
});    

// ===================================================
// DISABLE DOUBLE-CLICK ZOOM (Keep pinch-to-zoom)
// ===================================================

document.addEventListener('dblclick', function(e) {
    e.preventDefault();
}, { passive: false });


// ===================================================
// DAY 4: SKELETON LOADER CONTROL
// ===================================================

function showSkeleton(show) {
    const skeleton = document.getElementById('memoriesSkeleton');
    const memoriesList = document.getElementById('memoriesList');
    
    if (!skeleton || !memoriesList) return;
    
    if (show) {
        skeleton.classList.remove('hidden');
        memoriesList.classList.add('hidden');
    } else {
        skeleton.classList.add('hidden');
        memoriesList.classList.remove('hidden');
    }
}

// Override loadMemories to handle skeleton loading
const originalLoadMemories = loadMemories;

loadMemories = function() {
    // Show skeleton immediately
    showSkeleton(true);
    
    // Use requestAnimationFrame to let the skeleton render
    requestAnimationFrame(() => {
        // Call the original loadMemories function
        originalLoadMemories();
        
        // Hide skeleton after a minimum delay (200ms)
        // This prevents flashing if data loads instantly
        setTimeout(() => {
            showSkeleton(false);
        }, 200);
    });
};

// Also hide skeleton when memories are empty (no data)
function hideSkeletonOnEmpty() {
    const memories = getMemories();
    if (memories.length === 0) {
        showSkeleton(false);
    }
}

// Hook into the existing loadMemories flow
// After the original loadMemories runs, hide skeleton
const originalSetMemories = setMemories;
setMemories = function(memories) {
    originalSetMemories(memories);
    // If memories are loaded, hide skeleton
    if (memories && memories.length > 0) {
        setTimeout(() => showSkeleton(false), 100);
    } else {
        showSkeleton(false);
    }
};


function showTimelineSkeleton(show) {
    const skeleton = document.getElementById('timelineSkeleton');
    const list = document.getElementById('timelineList');
    if (!skeleton || !list) return;
    
    if (show) {
        skeleton.classList.remove('hidden');
        list.classList.add('hidden');
    } else {
        skeleton.classList.add('hidden');
        list.classList.remove('hidden');
    }
}













