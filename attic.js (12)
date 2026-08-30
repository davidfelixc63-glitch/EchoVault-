/*
  ATTIC.JS — logic specific to the Attic feature only.
  Loaded from the main index.html via:
    <script src="Attic/attic.js" defer></script>
  MUST be loaded AFTER script1.js (it uses showToast() etc. from the main file).

  SECTIONS IN THIS FILE (in order):
    1. FRAGMENT LOADER          — fetches Attic/attic.html into #atticRoot
    2. ATTIC MODE               — enter/exit, hides main EchoVault nav so the
                                   Attic feels like a separate space
    3. FIRST-ENTRY ENTRY POINT  — beginAtticFirstEntry(), called by script1.js's
                                   door-rhythm success handler
    4. AUDIO STUB               — playAtticSound(), swap in real files later
    5. REVEAL SEQUENCE          — dim -> door creak -> light flood -> dust
    6. CONGRATS + SETUP MODAL   — show/close/advance + save logic
    7. HUB + ROOM DOORS         — show hub, room-door clicks, placeholder modal,
                                   backToEchoVault()
    (Future room logic will be appended below as new sections, each clearly
    labeled the same way — paste new room JS at the bottom.)
*/

/* ============================================================ */
/* SECTION 1: FRAGMENT LOADER                                    */
/* ============================================================ */
let atticFragmentReady = false;

function loadAtticFragment() {
  // Create the root as a DIRECT CHILD OF <body> — deliberately NOT nested
  // inside the Showcase section (or any section). Sections in this app can
  // pick up a lingering CSS transform via their fade-in animation, and any
  // transform on an ancestor breaks position:fixed for everything inside
  // it. Keeping atticRoot outside all sections means the Attic's overlays/
  // modals/hub always fix correctly to the real screen, regardless of what
  // animation classes the rest of the site uses.
  let root = document.getElementById("atticRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "atticRoot";
    document.body.appendChild(root);
  }

  return fetch("Attic/attic.html")
    .then((res) => res.text())
    .then((html) => {
      root.innerHTML = html;
      wireAtticButtons();
      atticFragmentReady = true;
    })
    .catch((err) => {
      console.error("[attic] failed to load Attic/attic.html", err);
    });
}

// Load the fragment once, as soon as the main page is ready.
document.addEventListener("DOMContentLoaded", loadAtticFragment);

function wireAtticButtons() {
  document.getElementById("atticCongratsContinueBtn").addEventListener("click", advanceToAtticSetup);
  document.getElementById("atticSetupSaveBtn").addEventListener("click", saveAtticFirstEntrySetup);

  document.querySelectorAll(".attic-room-door").forEach((doorEl) => {
    doorEl.addEventListener("click", () => openAtticRoom(doorEl.dataset.room));
  });
  document.getElementById("atticPlaceholderCloseBtn").addEventListener("click", closeAtticRoomPlaceholder);
  document.getElementById("atticBackToEchoVaultBtn").addEventListener("click", backToEchoVault);

  initLibrarySwipe();
}

/* ============================================================ */
/* SECTION 2: ATTIC MODE (enter/exit — hides main EchoVault nav) */
/* ============================================================ */
// Entering Attic mode hides the main EchoVault nav (logo + hamburger + links)
// and locks background scroll, so the Attic feels like a separate space.
// The ONLY two ways in/out are: the door on Showcase (in), and the
// "Back to EchoVault" button on the hub (out).
function enterAtticMode() {
  document.body.classList.add("attic-active");
  startAtticHubMusic();
}

function exitAtticMode() {
  document.body.classList.remove("attic-active");
  if (atticFadeRafId) cancelAnimationFrame(atticFadeRafId);
  atticActiveAudio.pause();
  atticInactiveAudio.pause();
  atticCurrentTrackSrc = null;
}

function backToEchoVault() {
  hideAtticHub();
  exitAtticMode();
}

/* ============================================================ */
/* SECTION 3: FIRST-ENTRY ENTRY POINT                             */
/* ============================================================ */
function beginAtticFirstEntry() {
  if (!atticFragmentReady) {
    // Fragment somehow isn't in yet (slow network) — wait for it, then retry.
    loadAtticFragment().then(() => beginAtticFirstEntry());
    return;
  }

  // Beat 1: a quick confirmation right on the Showcase door itself —
  // NOT the full cinematic reveal. That plays after we've actually
  // "arrived" in the Attic (see enterAtticMode below).
  const doorVisual = document.getElementById("atticDoorVisual");
  if (doorVisual) {
    doorVisual.classList.add("attic-door-quick-open");
  }

  setTimeout(() => {
    if (doorVisual) doorVisual.classList.remove("attic-door-quick-open");
    enterAtticMode();
    playAtticSound("door-creak");
    runAtticRevealSequence(() => {
      showAtticCongratsModal();
    });
  }, 700);
}

/* ============================================================ */
/* SECTION 4: AUDIO STUB                                         */
/* ============================================================ */
// Real playback, routed through the dedicated SFX system (see ATTIC_SFX / playAtticSfx
// in the soundtrack section) — kept as a thin wrapper so the existing call site is untouched.
function playAtticSound(name) {
  playAtticSfx(name);
}

/* ============================================================ */
/* SECTION 5: REVEAL SEQUENCE                                    */
/* ============================================================ */
function runAtticRevealSequence(onDone) {
  const overlay = document.getElementById("atticRevealOverlay");
  const light = document.getElementById("atticRevealLight");
  const dustLayer = document.getElementById("atticRevealDust");
  const door = document.getElementById("atticRevealDoor");

  overlay.classList.remove("attic-hidden");
  door.classList.remove("attic-door-creak");
  light.classList.remove("attic-light-flood");
  void door.offsetWidth; // restart animation

  // Beat 1: darkness and silence
  setTimeout(() => {
    // Beat 2: door creaks open
    door.classList.add("attic-door-creak");
    playAtticSound("door-creak-open");

    // Beat 3: warm light floods in, dust rises
    setTimeout(() => {
      light.classList.add("attic-light-flood");
      playAtticSound("attic-ambient-swell");
      spawnAtticRevealDust(dustLayer);
    }, 500);

    // Beat 4: hold on the glow, then hand off to the congrats modal
    setTimeout(() => {
      overlay.classList.add("attic-hidden");
      light.classList.remove("attic-light-flood");
      dustLayer.innerHTML = "";
      onDone && onDone();
    }, 2600);
  }, 800);
}

function spawnAtticRevealDust(container) {
  for (let i = 0; i < 20; i++) {
    const dust = document.createElement("div");
    dust.className = "attic-dust-mote";
    dust.style.left = `${30 + Math.random() * 40}%`;
    dust.style.bottom = `${10 + Math.random() * 15}%`;
    dust.style.animationDelay = `${Math.random() * 1.2}s`;
    container.appendChild(dust);
  }
}

/* ============================================================ */
/* SECTION 6: CONGRATS + SETUP MODAL                              */
/* ============================================================ */
function showAtticCongratsModal() {
  const modal = document.getElementById("atticCongratsModal");
  document.getElementById("atticCongratsStage").classList.remove("attic-hidden");
  document.getElementById("atticSetupStage").classList.add("attic-hidden");
  modal.classList.remove("attic-hidden");
}

function closeAtticCongratsModal() {
  const modal = document.getElementById("atticCongratsModal");
  modal.classList.add("attic-hidden");
}

function advanceToAtticSetup() {
  document.getElementById("atticCongratsStage").classList.add("attic-hidden");
  document.getElementById("atticSetupStage").classList.remove("attic-hidden");
}

function showAtticSetupError(text) {
  const err = document.getElementById("atticSetupError");
  err.textContent = text;
  err.classList.remove("attic-hidden");
}

function saveAtticFirstEntrySetup() {
  const pw = document.getElementById("atticPasswordInput").value.trim();
  const pwConfirm = document.getElementById("atticPasswordConfirmInput").value.trim();
  const trigger = document.getElementById("atticFirstTriggerInput").value.trim();

  document.getElementById("atticSetupError").classList.add("attic-hidden");

  if (!pw || !pwConfirm) {
    showAtticSetupError("Enter your password twice to confirm it.");
    return;
  }
  if (/\d/.test(pw)) {
    showAtticSetupError("Words only — no numbers, please.");
    return;
  }
  if (pw !== pwConfirm) {
    showAtticSetupError("Those two don't match. Try again.");
    return;
  }
  if (!trigger) {
    showAtticSetupError("Give your first trigger a memory title to watch for.");
    return;
  }

  // TODO: replace with real hashing (mirror hashPIN()/checkPINMatch() pattern in script1.js)
  // once the Attic's own IndexedDB store exists — plaintext localStorage is a placeholder for now.
  localStorage.setItem("atticPassword", pw);
  localStorage.setItem("atticTrigger_secretMemoryTitle", trigger);
  localStorage.setItem("atticSetupComplete", "true");

  closeAtticCongratsModal();
  showToast("🔒 The Attic is sealed. Only you hold the words.", "success");
  showAtticHub();
}

/* ============================================================ */
/* SECTION 7: HUB + ROOM DOORS                                   */
/* ============================================================ */
// Rooms not built yet — flavor text shown in the placeholder modal.
// Delete a room's entry from this list once its real UI is built and
// wired in (see openAtticRoom below).
const ATTIC_ROOM_INFO = {
  arcade:      { icon: "🕹️", title: "Game Arcade",        text: "A couple of small games are being carved into the wall here. Not ready yet — check back soon." },
  riddles:        { icon: "❓", title: "Riddle Den",          text: "Something's whispering riddles in here, but it hasn't quite learned to speak yet." },
  founders:    { icon: "🏛️", title: "Founders Hall",       text: "A quiet hall honoring the earliest keepers of this place. Still being built." },
  music:       { icon: "🎵", title: "Music Corner",        text: "An old record player sits here, waiting for its first record." },
  puzzle:      { icon: "🧩", title: "Puzzle Workshop",      text: "Pieces are scattered across the workbench. The puzzle isn't ready to be solved yet." },
  timechamber: { icon: "⏳", title: "Time Chamber",         text: "A place to bury memories and write to your future self. The doors here are still being hung." },
  museum:      { icon: "🏺", title: "Dev Museum",           text: "A small exhibit about how the Attic itself came to be. Opening later." },
};

function showAtticHub() {
  document.getElementById("atticHubScreen").classList.remove("attic-hidden");
  returnToAtticHubMusic();
  document.getElementById("atticLibraryScreen").classList.add("attic-hidden");
  document.getElementById("atticLibraryCardScreen").classList.add("attic-hidden");
  document.getElementById("atticLibraryFavoritesScreen").classList.add("attic-hidden");
  document.getElementById("riddleDenCategoryScreen").classList.add("attic-hidden");
  document.getElementById("riddleCardScreen").classList.add("attic-hidden");
  document.getElementById("timeChamberScreen").classList.add("attic-hidden");
  document.getElementById("buryScreen").classList.add("attic-hidden");
  document.getElementById("sendScreen").classList.add("attic-hidden");
  document.getElementById("foundersHallScreen").classList.add("attic-hidden");
  document.getElementById("atticPuzzleHubScreen").classList.add("attic-hidden");
document.getElementById("atticPuzzleSizeScreen").classList.add("attic-hidden");
document.getElementById("atticPuzzleGameScreen").classList.add("attic-hidden");
document.getElementById("atticArcadeHubScreen").classList.add("attic-hidden");
document.getElementById("atticMemoryFallsScreen").classList.add("attic-hidden");
document.getElementById("atticEchoMatchHubScreen").classList.add("attic-hidden");
document.getElementById("atticEchoMatchGameScreen").classList.add("attic-hidden");
document.getElementById("atticWhackHubScreen").classList.add("attic-hidden");
document.getElementById("atticWhackGameScreen").classList.add("attic-hidden");
document.getElementById("atticStreakKeeperScreen").classList.add("attic-hidden");
document.getElementById("atticDevMuseumScreen").classList.add("attic-hidden");
document.getElementById("atticMusicCornerScreen").classList.add("attic-hidden");
document.getElementById("atticMemoryMazeScreen").classList.add("attic-hidden");
  document.getElementById("atticVaultGuardianScreen").classList.add("attic-hidden");
}


function hideAtticHub() {
  document.getElementById("atticHubScreen").classList.add("attic-hidden");
}

function openAtticRoom(roomKey) {
  enterAtticRoomMusic(roomKey);
  if (roomKey === "wonders") {
    hideAtticHub();
    openLibraryRoom();
    return;
  }
  if (roomKey === "riddles") {
    hideAtticHub();
    showRiddleDen();
    return;
  }
  if (roomKey === "timechamber") {
    hideAtticHub();
    showTimeChamber();
    return;
  }
  if (roomKey === "museum") {
  hideAtticHub();
  showDevMuseum();
  return;
}
if (roomKey === "music") {
  hideAtticHub();
  showMusicCorner();
  return;
}
  if (roomKey === "founders") {
    hideAtticHub();
    showFoundersHall();
    return;
  }
  if (roomKey === "arcade") {
  hideAtticHub();
  showArcadeHub();
  return;
}
if (roomKey === "puzzle") {
  hideAtticHub();
  showPuzzleHub();
  return;
}

  const info = ATTIC_ROOM_INFO[roomKey];
  if (!info) return;

  document.getElementById("atticPlaceholderIcon").textContent = info.icon;
  document.getElementById("atticPlaceholderTitle").textContent = info.title;
  document.getElementById("atticPlaceholderText").textContent = info.text;
  document.getElementById("atticRoomPlaceholderModal").classList.remove("attic-hidden");
}

function closeAtticRoomPlaceholder() {
  document.getElementById("atticRoomPlaceholderModal").classList.add("attic-hidden");
}

/* ============================================================ */
/* FUTURE SECTIONS GO BELOW THIS LINE (individual room logic, etc.) */
/* ============================================================ */

/* ============================================================ */
/* SECTION 8: LIBRARY OF WONDERS                                 */
/* ============================================================ */
// Data source: LIBRARY_CATEGORIES, loaded globally from Attic/library-data.js
// (script tag in index.html, before this file).

let libraryCurrentCategory = null;
let libraryQueue = [];      // shuffled, not-yet-seen-this-cycle fact indices for the open category
let libraryQueuePos = 0;
let libraryShareIndex = null; // index into favorites currently open in the share modal

// --- Screen navigation ---------------------------------------

function openLibraryRoom() {
  renderLibraryCategories();
  document.getElementById("atticLibraryScreen").classList.remove("attic-hidden");
}

function closeLibraryToHub() {
  document.getElementById("atticLibraryScreen").classList.add("attic-hidden");
  showAtticHub();
}

function openLibraryCategory(key) {
  libraryCurrentCategory = key;
  const cat = LIBRARY_CATEGORIES[key];
  document.getElementById("atticLibraryCardCategoryTitle").textContent = `${cat.icon} ${cat.name}`;
  buildLibraryQueue(key);
  document.getElementById("atticLibraryScreen").classList.add("attic-hidden");
  document.getElementById("atticLibraryCardScreen").classList.remove("attic-hidden");
  renderLibraryCard();
}

function closeLibraryCardScreen() {
  document.getElementById("atticLibraryCardScreen").classList.add("attic-hidden");
  document.getElementById("atticLibraryScreen").classList.remove("attic-hidden");
}

function openLibraryFavorites() {
  document.getElementById("atticLibraryScreen").classList.add("attic-hidden");
  renderLibraryFavorites();
  document.getElementById("atticLibraryFavoritesScreen").classList.remove("attic-hidden");
}

function closeLibraryFavorites() {
  document.getElementById("atticLibraryFavoritesScreen").classList.add("attic-hidden");
  document.getElementById("atticLibraryScreen").classList.remove("attic-hidden");
}

// --- Category grid ---------------------------------------------

function renderLibraryCategories() {
  const grid = document.getElementById("atticLibraryCategoryGrid");
  grid.innerHTML = "";
  Object.keys(LIBRARY_CATEGORIES).forEach((key) => {
    const cat = LIBRARY_CATEGORIES[key];
    const hasFacts = cat.facts.length > 0;

    const card = document.createElement("div");
    card.className = "attic-library-category-card" + (hasFacts ? "" : " attic-library-soon");
    if (hasFacts) card.addEventListener("click", () => openLibraryCategory(key));

    const icon = document.createElement("div");
    icon.className = "attic-library-category-icon";
    icon.textContent = cat.icon;

    const label = document.createElement("div");
    label.className = "attic-library-category-label";
    label.textContent = cat.name;

    const sub = document.createElement("div");
    sub.className = "attic-library-category-sub";
    sub.textContent = hasFacts ? `${cat.facts.length} facts` : "Coming soon";

    card.appendChild(icon);
    card.appendChild(label);
    card.appendChild(sub);
    grid.appendChild(card);
  });
}

// --- Seen-tracking + queue building ------------------------------
// Facts are shuffled and shown without repeats within a category until
// every fact has been seen once, then the "seen" list resets and
// reshuffles — so returning users don't see the same fact twice in a
// row but eventually cycle back through everything.

function buildLibraryQueue(key) {
  const cat = LIBRARY_CATEGORIES[key];
  const seenKey = `atticLibrarySeen_${key}`;
  let seen = [];
  try { seen = JSON.parse(localStorage.getItem(seenKey) || "[]"); } catch (e) { seen = []; }

  let unseen = cat.facts.map((_, i) => i).filter((i) => !seen.includes(i));

  if (unseen.length === 0) {
    localStorage.setItem(seenKey, JSON.stringify([]));
    unseen = cat.facts.map((_, i) => i);
    showToast("📚 You've seen every fact on this shelf — shuffled fresh for you.", "success");
  }

  // Fisher-Yates shuffle
  for (let i = unseen.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unseen[i], unseen[j]] = [unseen[j], unseen[i]];
  }

  libraryQueue = unseen;
  libraryQueuePos = 0;
}

function markCurrentFactSeen() {
  const seenKey = `atticLibrarySeen_${libraryCurrentCategory}`;
  let seen = [];
  try { seen = JSON.parse(localStorage.getItem(seenKey) || "[]"); } catch (e) { seen = []; }
  const factIndex = libraryQueue[libraryQueuePos];
  if (!seen.includes(factIndex)) {
    seen.push(factIndex);
    localStorage.setItem(seenKey, JSON.stringify(seen));
  }
}

// --- Card rendering + swipe/arrow navigation ----------------------

function renderLibraryCard() {
  const cat = LIBRARY_CATEGORIES[libraryCurrentCategory];
  const fact = cat.facts[libraryQueue[libraryQueuePos]];
  document.getElementById("atticLibraryFactText").textContent = fact.text;
  document.getElementById("atticLibraryFactSource").textContent = fact.source ? `— ${fact.source}` : "";
  document.getElementById("atticLibraryCardProgress").textContent = `${libraryQueuePos + 1} / ${libraryQueue.length}`;
  document.getElementById("atticLibraryPrevBtn").disabled = libraryQueuePos === 0;
  updateLibraryWhoaButtonState();
}

function animateLibraryCardTransition(direction, updateFn) {
  const card = document.getElementById("atticLibraryCard");
  card.style.setProperty("--swipe-dir", direction === "next" ? "-40px" : "40px");
  card.classList.add("attic-library-card-swiping");
  setTimeout(() => {
    updateFn();
    card.classList.remove("attic-library-card-swiping");
  }, 180);
}

function libraryShowNext() {
  markCurrentFactSeen();
  animateLibraryCardTransition("next", () => {
    if (libraryQueuePos < libraryQueue.length - 1) {
      libraryQueuePos++;
    } else {
      buildLibraryQueue(libraryCurrentCategory);
    }
    renderLibraryCard();
  });
}

function libraryShowPrev() {
  if (libraryQueuePos === 0) return;
  animateLibraryCardTransition("prev", () => {
    libraryQueuePos--;
    renderLibraryCard();
  });
}

function initLibrarySwipe() {
  const card = document.getElementById("atticLibraryCard");
  if (!card) return;
  let startX = null;
  card.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  card.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const diff = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) libraryShowNext(); else libraryShowPrev();
  }, { passive: true });
}

// --- Favorites ---------------------------------------------------

function getLibraryFavorites() {
  try { return JSON.parse(localStorage.getItem("atticLibraryFavorites") || "[]"); }
  catch (e) { return []; }
}

function setLibraryFavorites(favs) {
  localStorage.setItem("atticLibraryFavorites", JSON.stringify(favs));
}

function updateLibraryWhoaButtonState() {
  const cat = LIBRARY_CATEGORIES[libraryCurrentCategory];
  const fact = cat.facts[libraryQueue[libraryQueuePos]];
  const isFav = getLibraryFavorites().some((f) => f.category === libraryCurrentCategory && f.text === fact.text);
  const btn = document.getElementById("atticLibraryWhoaBtn");
  btn.classList.toggle("attic-library-whoa-active", isFav);
  btn.textContent = isFav ? "⭐ Saved" : "⭐ Whoa!";
}

function libraryToggleFavorite() {
  const cat = LIBRARY_CATEGORIES[libraryCurrentCategory];
  const fact = cat.facts[libraryQueue[libraryQueuePos]];
  const favs = getLibraryFavorites();
  const existingIdx = favs.findIndex((f) => f.category === libraryCurrentCategory && f.text === fact.text);

  if (existingIdx > -1) {
    favs.splice(existingIdx, 1);
    showToast("Removed from favorites", "info");
  } else {
    favs.push({
      category: libraryCurrentCategory,
      categoryName: cat.name,
      icon: cat.icon,
      text: fact.text,
      source: fact.source,
      caption: "",
    });
    showToast("⭐ Saved to favorites", "success");
  }
  setLibraryFavorites(favs);
  updateLibraryWhoaButtonState();
}

function renderLibraryFavorites() {
  const favs = getLibraryFavorites();
  const list = document.getElementById("atticLibraryFavoritesList");
  const emptyEl = document.getElementById("atticLibraryFavoritesEmpty");
  list.innerHTML = "";

  if (favs.length === 0) {
    emptyEl.classList.remove("attic-hidden");
    return;
  }
  emptyEl.classList.add("attic-hidden");

  favs.forEach((fav, idx) => {
    const item = document.createElement("div");
    item.className = "attic-library-favorite-item";

    const text = document.createElement("p");
    text.className = "attic-library-favorite-text";
    text.textContent = `${fav.icon} ${fav.text}`;
    item.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "attic-library-favorite-actions";

    const shareBtn = document.createElement("button");
    shareBtn.className = "attic-library-favorite-share-btn";
    shareBtn.textContent = "📤 Share";
    shareBtn.addEventListener("click", () => openLibraryShareModal(idx));

    const removeBtn = document.createElement("button");
    removeBtn.className = "attic-library-favorite-remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeLibraryFavorite(idx));

    actions.appendChild(shareBtn);
    actions.appendChild(removeBtn);
    item.appendChild(actions);
    list.appendChild(item);
  });
}

function removeLibraryFavorite(idx) {
  const favs = getLibraryFavorites();
  favs.splice(idx, 1);
  setLibraryFavorites(favs);
  renderLibraryFavorites();
}

// --- Share card (canvas, same raw-Canvas-API approach as the
//     achievement share cards in achievements0.js — no library) -----

function openLibraryShareModal(idx) {
  libraryShareIndex = idx;
  const fav = getLibraryFavorites()[idx];
  document.getElementById("atticLibraryShareCaption").value = fav.caption || "";
  drawLibraryShareCanvas(fav, fav.caption || "");
  document.getElementById("atticLibraryShareModal").classList.remove("attic-hidden");
}

function closeLibraryShareModal() {
  document.getElementById("atticLibraryShareModal").classList.add("attic-hidden");
  libraryShareIndex = null;
}

function libraryUpdateShareCaption() {
  const favs = getLibraryFavorites();
  const fav = favs[libraryShareIndex];
  const caption = document.getElementById("atticLibraryShareCaption").value.trim();
  fav.caption = caption;
  setLibraryFavorites(favs);
  drawLibraryShareCanvas(fav, caption);
}

function drawLibraryShareCanvas(fav, caption) {
  const canvas = document.getElementById("atticLibraryShareCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#18181b");
  grad.addColorStop(1, "#1c130d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(217,119,6,0.5)";
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  ctx.textAlign = "center";

  ctx.font = "120px system-ui, sans-serif";
  ctx.fillText(fav.icon || "📖", W / 2, 220);

  ctx.fillStyle = "#fde68a";
  ctx.font = "bold 40px Georgia, serif";
  ctx.fillText("Library of Wonders", W / 2, 320);

  ctx.font = "28px Georgia, serif";
  ctx.fillStyle = "rgba(253,230,138,0.6)";
  ctx.fillText(fav.categoryName || "", W / 2, 365);

  ctx.fillStyle = "#fffbeb";
  ctx.font = "34px system-ui, sans-serif";
  wrapCanvasText(ctx, fav.text, W / 2, 460, W - 160, 46);

  if (caption) {
    ctx.fillStyle = "rgba(253,230,138,0.85)";
    ctx.font = "italic 30px Georgia, serif";
    wrapCanvasText(ctx, `"${caption}"`, W / 2, 780, W - 200, 40);
  }

  ctx.fillStyle = "rgba(253,230,138,0.4)";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText("EchoVault • The Attic", W / 2, H - 60);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, curY);
      line = words[i] + " ";
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

function libraryShareFavorite() {
  const canvas = document.getElementById("atticLibraryShareCanvas");
  canvas.toBlob((blob) => {
    if (!blob) return;
    const file = new File([blob], "echovault-attic-fact.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "A wonder from the Attic" }).catch(() => {});
    } else {
      const link = document.createElement("a");
      link.download = "echovault-attic-fact.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }, "image/png");
}






// --- Riddle progress storage (localStorage, same pattern as Library favorites above) ---

function getAllRiddleProgress() {
  try { return JSON.parse(localStorage.getItem("atticRiddleProgress") || "{}"); }
  catch (e) { return {}; }
}

function getRiddleProgress(riddleId) {
  const all = getAllRiddleProgress();
  return all[riddleId] || { id: riddleId, solved: false, attempts: 0, hintsUsed: 0, gaveUp: false, coinsEarned: 0 };
}

function saveRiddleProgress(progress) {
  const all = getAllRiddleProgress();
  all[progress.id] = progress;
  localStorage.setItem("atticRiddleProgress", JSON.stringify(all));
}

// --- Category screen ---
let currentRiddleCategory = null;
let currentRiddleQueue = [];
let currentRiddle = null;
let currentRiddleProgress = null;
let currentRiddleIndex = 0;

async function showRiddleDen() {
  document.getElementById("riddleCardScreen").classList.add("attic-hidden");
  document.getElementById("riddleDenCategoryScreen").classList.remove("attic-hidden");
  const list = document.getElementById("riddleCategoryList");
  list.innerHTML = "";

  for (const [key, config] of Object.entries(RIDDLE_CATEGORIES)) {
    const catRiddles = riddles.filter(r => r.category === key);
    const solvedCount = await countSolvedInCategory(catRiddles);
    const isEmpty = catRiddles.length === 0;

    const card = document.createElement("div");
    card.className = "riddle-category-card" + (isEmpty ? " locked" : "");
    card.innerHTML = `
      <span>${config.icon} ${config.name}</span>
      <span class="riddle-category-progress">${isEmpty ? "Coming soon" : `${solvedCount}/${catRiddles.length}`}</span>
    `;
    if (!isEmpty) card.onclick = () => openRiddleCategory(key);
    list.appendChild(card);
  }
}

async function countSolvedInCategory(catRiddles) {
  let count = 0;
  for (const r of catRiddles) {
    const p = await getRiddleProgress(r.id);
    if (p.solved) count++;
  }
  return count;
}

async function openRiddleCategory(categoryKey) {
  currentRiddleCategory = categoryKey;
  currentRiddleQueue = riddles.filter(r => r.category === categoryKey);
  currentRiddleIndex = 0;
  await loadNextRiddle();
  
  document.getElementById("riddleDenCategoryScreen").classList.add("attic-hidden");
  document.getElementById("riddleCardScreen").classList.remove("attic-hidden");
}

async function loadNextRiddle() {
  // walk the queue starting from currentRiddleIndex so Skip actually moves forward
  // instead of always re-landing on the first unsolved riddle
  const total = currentRiddleQueue.length;
  for (let i = 0; i < total; i++) {
    const idx = (currentRiddleIndex + i) % total;
    const r = currentRiddleQueue[idx];
    const p = await getRiddleProgress(r.id);
    if (!p.solved) {
      currentRiddleIndex = idx;
      currentRiddle = r;
      currentRiddleProgress = p;
      renderRiddleCard();
      return;
    }
  }
  // all solved
  document.getElementById("riddleCard").innerHTML = `<p>🎉 You've solved every riddle in this category!</p>`;
  updateRiddleProgressLabel();
}

function handleSkipRiddle() {
  if (!currentRiddleQueue.length) return;
  currentRiddleIndex = (currentRiddleIndex + 1) % currentRiddleQueue.length;
  loadNextRiddle();
}

function updateRiddleProgressLabel() {
  const solved = currentRiddleQueue.filter(r => r.id !== currentRiddle?.id).length; // simplified; refine if needed
  document.getElementById("riddleProgressLabel").textContent = RIDDLE_CATEGORIES[currentRiddleCategory].name;
}

function renderRiddleCard() {
  document.getElementById("riddleStory").textContent = currentRiddle.story || "";
  document.getElementById("riddleStory").style.display = currentRiddle.story ? "block" : "none";
  document.getElementById("riddlePrompt").textContent = currentRiddle.prompt;
  document.getElementById("riddleAnswerInput").value = "";
  document.getElementById("riddleFeedback").textContent = "";
  document.getElementById("riddleHints").innerHTML = "";
  document.getElementById("riddleHintBtn").classList.add("hidden");
  document.getElementById("riddleGiveUpBtn").classList.add("hidden");
  document.getElementById("riddleNextBtn").classList.add("hidden");
  document.getElementById("riddleSkipBtn").classList.remove("hidden");
  document.getElementById("riddleAnswerInput").disabled = false;
  
  document.getElementById("riddleSubmitBtn").disabled = false;
  updateRiddleProgressLabel();

  // re-render any hints already unlocked from a previous attempt on this riddle
  for (let i = 0; i < currentRiddleProgress.hintsUsed; i++) {
    appendHintToDOM(currentRiddle.hints[i]);
  }
}

function appendHintToDOM(text) {
  const div = document.createElement("div");
  div.className = "riddle-hint-text";
  div.textContent = "💡 " + text;
  document.getElementById("riddleHints").appendChild(div);
}

async function handleSubmitRiddleAnswer() {
  const input = document.getElementById("riddleAnswerInput").value;
  if (!input.trim()) return;

  const result = submitRiddleAnswer(currentRiddle, input, currentRiddleProgress);
  const feedback = document.getElementById("riddleFeedback");

  if (result.correct) {
    feedback.textContent = `✅ Correct! +${result.coinsEarned} Echo Coins`;
    feedback.className = "riddle-feedback correct";
    if (result.explanation) {
      document.getElementById("riddleStory").textContent += "\n\n" + result.explanation;
      document.getElementById("riddleStory").style.display = "block";
    }
    document.getElementById("riddleAnswerInput").disabled = true;
    document.getElementById("riddleSubmitBtn").disabled = true;
    document.getElementById("riddleHintBtn").classList.add("hidden");
    document.getElementById("riddleGiveUpBtn").classList.add("hidden");
    document.getElementById("riddleSkipBtn").classList.add("hidden");
    document.getElementById("riddleNextBtn").classList.remove("hidden");
    saveRiddleProgress(currentRiddleProgress);
  } else {
    
    feedback.textContent = "❌ Not quite — try again.";
    feedback.className = "riddle-feedback wrong";
    saveRiddleProgress(currentRiddleProgress);

    if (result.newHintAvailable) {
      document.getElementById("riddleHintBtn").classList.remove("hidden");
    }
    if (result.showReveal) {
      document.getElementById("riddleGiveUpBtn").classList.remove("hidden");
    }
  }
  document.getElementById("riddleAnswerInput").value = "";
}

function handleShowHint() {
  const nextHintIndex = currentRiddleProgress.hintsUsed;
  if (nextHintIndex >= currentRiddle.hints.length) return;
  appendHintToDOM(currentRiddle.hints[nextHintIndex]);
  currentRiddleProgress.hintsUsed++;
  saveRiddleProgress(currentRiddleProgress);
  document.getElementById("riddleHintBtn").classList.add("hidden");
}

function handleGiveUpRiddle() {
  const result = giveUpOnRiddle(currentRiddle, currentRiddleProgress);
  const feedback = document.getElementById("riddleFeedback");
  feedback.textContent = `The answer was: ${result.answer}`;
  feedback.className = "riddle-feedback wrong";
  if (result.explanation) {
    document.getElementById("riddleStory").textContent += "\n\n" + result.explanation;
    document.getElementById("riddleStory").style.display = "block";
  }
  document.getElementById("riddleAnswerInput").disabled = true;
  document.getElementById("riddleSubmitBtn").disabled = true;
  document.getElementById("riddleHintBtn").classList.add("hidden");
  document.getElementById("riddleGiveUpBtn").classList.add("hidden");
  document.getElementById("riddleSkipBtn").classList.add("hidden");
  document.getElementById("riddleNextBtn").classList.remove("hidden");
  saveRiddleProgress(currentRiddleProgress);
}










// --- Data model ---
// Buried memories: flag added directly to the memory object in the MAIN memories store
//   memory.buried = true, memory.buriedUntil = ISOdate, memory.farewellVoiceNote = blob/null
// Future messages: stored in the ATTIC's own DB, own object store "futureMessages"
//   { id, slotIndex, text, voiceNote, sendDate, arrivalDate, arrived: false }

function getDurationDate(code, customDateStr) {
  const now = new Date();
  if (code === "custom") return new Date(customDateStr);
  const map = { "1m": 1, "3m": 3, "6m": 6, "1y": 12 };
  now.setMonth(now.getMonth() + map[code]);
  return now;
}

// --- BURY A MEMORY ---
let buryTargetSlot = null, burySelectedMemoryId = null, buryDurationChoice = null, buryVoiceBlob = null;
let buryMode = "existing";

function setBuryMode(mode) {
  buryMode = mode;
  burySelectedMemoryId = null;
  document.getElementById("buryDurationSection").classList.add("hidden");
  document.getElementById("buryModeExistingBtn").classList.toggle("selected", mode === "existing");
  document.getElementById("buryModeNewBtn").classList.toggle("selected", mode === "new");
  document.getElementById("buryMemoryPicker").classList.toggle("hidden", mode !== "existing");
  document.getElementById("buryNewMemoryForm").classList.toggle("hidden", mode !== "new");
}

function useNewBuryMemory() {
  const title = document.getElementById("buryNewTitle").value.trim();
  if (!title) {
    alert("Give this memory a title before burying it.");
    return;
  }
  document.getElementById("buryDurationSection").classList.remove("hidden");
}

let buryMediaRecorder = null, buryRecordedChunks = [], buryMicStream = null;
let sendMediaRecorder = null, sendRecordedChunks = [], sendMicStream = null;

function deleteFutureMessage(id) {
  const all = getFutureMessages().filter(m => m.id !== id);
  localStorage.setItem("atticFutureMessages", JSON.stringify(all));
}

// --- Attic media store (IndexedDB) — voice notes for Bury/Send survive reloads here ---
let atticMediaDB = null;

function openAtticMediaDB() {
  return new Promise((resolve, reject) => {
    if (atticMediaDB) return resolve(atticMediaDB);
    const req = indexedDB.open("EchoVaultAtticMedia", 1);
    req.onupgradeneeded = () => { req.result.createObjectStore("voiceNotes"); };
    req.onsuccess = () => { atticMediaDB = req.result; resolve(atticMediaDB); };
    req.onerror = () => reject(req.error);
  });
}

async function saveVoiceNoteToDB(id, blob) {
  const db = await openAtticMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voiceNotes", "readwrite");
    tx.objectStore("voiceNotes").put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getVoiceNoteFromDB(id) {
  if (!id) return null;
  const db = await openAtticMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voiceNotes", "readonly");
    const req = tx.objectStore("voiceNotes").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteVoiceNoteFromDB(id) {
  if (!id) return;
  const db = await openAtticMediaDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voiceNotes", "readwrite");
    tx.objectStore("voiceNotes").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}



async function renderBurySlots() {
  const allMemories = await getMemories(); // existing app function
  const buried = allMemories.filter(m => m.buried);
  const grid = document.getElementById("burySlotGrid");
  grid.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const slotMemory = buried[i];
    const div = document.createElement("div");
    if (slotMemory) {
      const remaining = Math.max(0, new Date(slotMemory.buriedUntil) - new Date());
      const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
      div.className = "time-slot filled";
      div.innerHTML = `🪦 A memory rests here<div class="countdown">${daysLeft > 0 ? daysLeft + " days remaining" : "Ready to resurface"}</div><div class="slot-hint">tap to bring it back early</div>`;
      div.onclick = () => confirmDigUpEarly(slotMemory.id);
      
    } else {
      div.className = "time-slot";
      div.textContent = "+ Bury a memory";
      div.onclick = () => openBurySetup(i);
    }
    grid.appendChild(div);
  }
}

async function loadMemoryPickerList(containerId, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = "<p>Loading your memories…</p>";
  const allMemories = await getMemories();
  const available = allMemories.filter(m => !m.buried);

  if (available.length === 0) {
    container.innerHTML = "<p>No memories available to bury right now.</p>";
    return;
  }

  container.innerHTML = "";
  available
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .forEach(m => {
      const item = document.createElement("div");
      item.className = "memory-picker-item";
      const dateStr = m.date ? new Date(m.date).toLocaleDateString() : "";
      item.innerHTML = `
        <span class="memory-picker-title">${escapeHTML(m.title || "Untitled")}</span>
        <span class="memory-picker-date">${dateStr}</span>
      `;
      item.onclick = () => {
        container.querySelectorAll(".memory-picker-item").forEach(el => el.classList.remove("selected"));
        item.classList.add("selected");
        onSelect(m.id);
      };
      container.appendChild(item);
    });
}

function openBurySetup(slotIndex) {
  buryTargetSlot = slotIndex;
  burySelectedMemoryId = null;
  buryDurationChoice = null;
  buryVoiceBlob = null;
  document.getElementById("buryVoiceStatus").textContent = "";
  document.getElementById("buryVoicePreview").classList.add("hidden");
  document.getElementById("buryVoiceBtn").textContent = "🎙️ Record a farewell";
  document.getElementById("buryDurationSection").classList.add("hidden");
  document.getElementById("buryNewTitle").value = "";
  document.getElementById("buryNewDescription").value = "";
  setBuryMode("existing");
  loadMemoryPickerList("buryMemoryPicker", (memoryId) => {
    burySelectedMemoryId = memoryId;
    document.getElementById("buryDurationSection").classList.remove("hidden");
  });
  document.getElementById("burySetupModal").classList.remove("hidden");
}


function selectBuryDuration(code, btn) {
  buryDurationChoice = code;
  document.getElementById("buryCustomDate").classList.toggle("hidden", code !== "custom");
  document.querySelectorAll("#burySetupModal .duration-options button").forEach(b => b.classList.remove("selected"));
  if (btn) btn.classList.add("selected");
}


function stopAnyBuryRecording() {
  if (buryMediaRecorder && buryMediaRecorder.state === "recording") buryMediaRecorder.stop();
  if (buryMicStream) { buryMicStream.getTracks().forEach(t => t.stop()); buryMicStream = null; }
}

async function toggleFarewellRecording() {
  const btn = document.getElementById("buryVoiceBtn");
  const status = document.getElementById("buryVoiceStatus");
  const preview = document.getElementById("buryVoicePreview");

  if (buryMediaRecorder && buryMediaRecorder.state === "recording") {
    buryMediaRecorder.stop();
    return;
  }

  try {
    buryMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    buryRecordedChunks = [];
    buryMediaRecorder = new MediaRecorder(buryMicStream);
    buryMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) buryRecordedChunks.push(e.data); };
    buryMediaRecorder.onstop = () => {
      const blob = new Blob(buryRecordedChunks, { type: "audio/webm" });
      buryVoiceBlob = blob;
      preview.src = URL.createObjectURL(blob);
      preview.classList.remove("hidden");
      status.textContent = "Farewell recorded.";
      btn.textContent = "🎙️ Re-record farewell";
      if (buryMicStream) { buryMicStream.getTracks().forEach(t => t.stop()); buryMicStream = null; }
    };
    buryMediaRecorder.start();
    btn.textContent = "⏹ Stop recording";
    status.textContent = "🔴 Recording...";
  } catch (err) {
    status.textContent = "Couldn't access the microphone.";
  }
}

async function confirmBury() {
  if (!buryDurationChoice) return;
  if (buryMode === "existing" && !burySelectedMemoryId) return;
  const newTitle = document.getElementById("buryNewTitle").value.trim();
  if (buryMode === "new" && !newTitle) return;

  const customDate = document.getElementById("buryCustomDate").value;
  const unlockDate = getDurationDate(buryDurationChoice, customDate);

  let voiceNoteId = null;
  if (buryVoiceBlob) {
    voiceNoteId = `bury_voice_${Date.now()}`;
    await saveVoiceNoteToDB(voiceNoteId, buryVoiceBlob);
  }

  const memories = await getMemories();

  if (buryMode === "new") {
    memories.unshift({
      id: Date.now(),
      title: newTitle,
      category: "",
      description: document.getElementById("buryNewDescription").value.trim(),
      image: "",
      images: [],
      voice: null,
      date: new Date().toISOString(),
      favourite: false,
      tags: [],
      mood: "",
      people: "",
      place: "",
      buried: true,
      buriedUntil: unlockDate.toISOString(),
      farewellVoiceNote: voiceNoteId
    });
  } else {
    const memory = memories.find(m => m.id === burySelectedMemoryId);
    memory.buried = true;
    memory.buriedUntil = unlockDate.toISOString();
    memory.farewellVoiceNote = voiceNoteId;
  }

  await setMemories(memories);
  document.getElementById("burySetupModal").classList.add("hidden");
  renderBurySlots();
}


async function confirmDigUpEarly(memoryId) {
  if (!confirm("Bring this memory back early? It's still tender — take your time.")) return;
  await resurfaceMemory(memoryId);
  renderBurySlots();
}


async function resurfaceMemory(memoryId) {
  const memories = await getMemories();
  const memory = memories.find(m => m.id === memoryId);
  memory.buried = false;
  memory.buriedUntil = null;
  await setMemories(memories);
  await showTimeChamberReveal("resurface", memory);
}


// Run on every app load / Time Chamber entry — auto-resurface anything past its date
async function checkAndResurfaceBuriedMemories() {
  const memories = await getMemories();
  const dueForResurface = memories.filter(m => m.buried && new Date(m.buriedUntil) <= new Date());
  for (const m of dueForResurface) {
    await resurfaceMemory(m.id); // shows the reveal for each
  }
  if (dueForResurface.length > 0) renderBurySlots();
}


// --- SEND TO FUTURE ---
// Storage: localStorage, same pattern as riddle progress and Library favorites above.

function getFutureMessages() {
  try { return JSON.parse(localStorage.getItem("atticFutureMessages") || "[]"); }
  catch (e) { return []; }
}

function saveFutureMessage(msg) {
  const all = getFutureMessages();
  const idx = all.findIndex(m => m.id === msg.id);
  if (idx >= 0) all[idx] = msg; else all.push(msg);
  localStorage.setItem("atticFutureMessages", JSON.stringify(all));
}

let sendTargetSlot = null, sendDurationChoice = null, sendVoiceBlob = null;
let sendPhotoDataUrl = null;

function handleSendPhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 800;
      let width = image.width, height = image.height;
      if (width > height) {
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
      } else {
        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      sendPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const preview = document.getElementById("sendPhotoPreview");
      preview.src = sendPhotoDataUrl;
      preview.classList.remove("hidden");
      document.getElementById("sendPhotoPlaceholder").classList.add("hidden");
      document.getElementById("sendPhotoRemoveBtn").classList.remove("hidden");
    };
    image.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function removeSendPhoto(e) {
  e.stopPropagation();
  sendPhotoDataUrl = null;
  document.getElementById("sendPhotoInput").value = "";
  document.getElementById("sendPhotoPreview").classList.add("hidden");
  document.getElementById("sendPhotoPlaceholder").classList.remove("hidden");
  document.getElementById("sendPhotoRemoveBtn").classList.add("hidden");
}


async function renderSendSlots() {
  const allSent = await getFutureMessages();
  const grid = document.getElementById("sendSlotGrid");
  grid.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const msg = allSent.find(m => m.slotIndex === i && !m.arrived);
    const div = document.createElement("div");
    if (msg) {
      const remaining = Math.max(0, new Date(msg.arrivalDate) - new Date());
      const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
      div.className = "time-slot filled";
      div.innerHTML = `✉️ Sealed and on its way<div class="countdown">${daysLeft > 0 ? daysLeft + " days until it arrives" : "It has arrived"}</div><div class="slot-hint">tap to cancel and unsend</div>`;
      div.onclick = () => confirmCancelSend(msg.id);
    } else {
      div.className = "time-slot";
      div.textContent = "+ Send a message to your future self";
      div.onclick = () => openSendCompose(i);
    }
    grid.appendChild(div);
  }
}

async function confirmCancelSend(msgId) {
  if (!confirm("Unsend this message? It won't be delivered.")) return;
  deleteFutureMessage(msgId);
  renderSendSlots();
}

function closeBurySetup() {
  stopAnyBuryRecording();
  document.getElementById("burySetupModal").classList.add("hidden");
}

function closeSendCompose() {
  stopAnySendRecording();
  document.getElementById("sendComposeModal").classList.add("hidden");
}

function openSendCompose(slotIndex) {
  sendTargetSlot = slotIndex;
  sendDurationChoice = null;
  sendVoiceBlob = null;
  sendPhotoDataUrl = null;
  document.getElementById("sendMessageText").value = "";
  document.getElementById("sendVoiceStatus").textContent = "";
  document.getElementById("sendVoicePreview").classList.add("hidden");
  document.getElementById("sendVoiceBtn").textContent = "🎙️ Add a voice note (optional)";
  document.getElementById("sendPhotoInput").value = "";
  document.getElementById("sendPhotoPreview").classList.add("hidden");
  document.getElementById("sendPhotoPlaceholder").classList.remove("hidden");
  document.getElementById("sendPhotoRemoveBtn").classList.add("hidden");
  document.getElementById("sendComposeModal").classList.remove("hidden");
}



function selectSendDuration(code, btn) {
  sendDurationChoice = code;
  document.querySelectorAll("#sendComposeModal .duration-options button").forEach(b => b.classList.remove("selected"));
  if (btn) btn.classList.add("selected");
  document.getElementById("sendCustomDate").classList.toggle("hidden", code !== "custom");
}

function stopAnySendRecording() {
  if (sendMediaRecorder && sendMediaRecorder.state === "recording") sendMediaRecorder.stop();
  if (sendMicStream) { sendMicStream.getTracks().forEach(t => t.stop()); sendMicStream = null; }
}

async function toggleFutureVoiceRecording() {
  const btn = document.getElementById("sendVoiceBtn");
  const status = document.getElementById("sendVoiceStatus");
  const preview = document.getElementById("sendVoicePreview");

  if (sendMediaRecorder && sendMediaRecorder.state === "recording") {
    sendMediaRecorder.stop();
    return;
  }

  try {
    sendMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    sendRecordedChunks = [];
    sendMediaRecorder = new MediaRecorder(sendMicStream);
    sendMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) sendRecordedChunks.push(e.data); };
    sendMediaRecorder.onstop = () => {
      const blob = new Blob(sendRecordedChunks, { type: "audio/webm" });
      sendVoiceBlob = blob;
      preview.src = URL.createObjectURL(blob);
      preview.classList.remove("hidden");
      status.textContent = "Voice note recorded.";
      btn.textContent = "🎙️ Re-record voice note";
      if (sendMicStream) { sendMicStream.getTracks().forEach(t => t.stop()); sendMicStream = null; }
    };
    sendMediaRecorder.start();
    btn.textContent = "⏹ Stop recording";
    status.textContent = "🔴 Recording...";
  } catch (err) {
    status.textContent = "Couldn't access the microphone.";
  }
}

async function confirmSendToFuture() {
  const text = document.getElementById("sendMessageText").value.trim();
  if (!text || !sendDurationChoice) return;
  const customDate = document.getElementById("sendCustomDate").value;
  const arrivalDate = getDurationDate(sendDurationChoice, customDate);

  let voiceNoteId = null;
  if (sendVoiceBlob) {
    voiceNoteId = `send_voice_${Date.now()}`;
    await saveVoiceNoteToDB(voiceNoteId, sendVoiceBlob);
  }

  await saveFutureMessage({
    id: `future_${Date.now()}`,
    slotIndex: sendTargetSlot,
    text,
    photo: sendPhotoDataUrl || null,
    voiceNote: voiceNoteId,
    sendDate: new Date().toISOString(),
    arrivalDate: arrivalDate.toISOString(),
    arrived: false
  });
  

  document.getElementById("sendComposeModal").classList.add("hidden");
  await showTimeChamberReveal("sent");
  renderSendSlots();
}


// Run on every app load / Time Chamber entry
async function checkArrivedFutureMessages() {
  const allSent = await getFutureMessages();
  const arrived = allSent.filter(m => !m.arrived && new Date(m.arrivalDate) <= new Date());
  for (const msg of arrived) {
   msg.arrived = true;
    await saveFutureMessage(msg);
    await showTimeChamberReveal("arrived", msg);
  }
  if (arrived.length > 0) renderSendSlots();
}


// --- Reveal / gesture display ---
async function showTimeChamberReveal(type, data) {
  const content = document.getElementById("timeChamberRevealContent");
  let voiceNoteId = null;

  if (type === "resurface") {
    voiceNoteId = data.farewellVoiceNote || null;
    content.innerHTML = `<div class="reveal-gesture">🌱</div><p>A memory has resurfaced.</p><p>${escapeHTML(data.title)}</p>`;
  } else if (type === "sent") {
    content.innerHTML = `<div class="reveal-gesture">✨</div><p>Your words are on their way.</p>`;
} else if (type === "arrived") {
    voiceNoteId = data.voiceNote || null;
    const photoHtml = data.photo ? `<img src="${data.photo}" class="reveal-photo">` : "";
    content.innerHTML = `<div class="reveal-gesture">🌅</div><p>A message from your past self has arrived.</p>${photoHtml}<p>${escapeHTML(data.text)}</p>`;
  }
  

  if (voiceNoteId) {
    const blob = await getVoiceNoteFromDB(voiceNoteId);
    if (blob) {
      const url = URL.createObjectURL(blob);
      content.innerHTML += `<audio controls class="reveal-voice-note" src="${url}"></audio>`;
    }
  }

  document.getElementById("timeChamberRevealModal").classList.remove("hidden");
}


function closeTimeChamberReveal() {
  document.getElementById("timeChamberRevealModal").classList.add("hidden");
}

function showTimeChamber() {
  document.getElementById("buryScreen").classList.add("attic-hidden");
  document.getElementById("sendScreen").classList.add("attic-hidden");
  document.getElementById("timeChamberScreen").classList.remove("attic-hidden");
  enterAtticRoomMusic("timechamber");
  checkAndResurfaceBuriedMemories();
  checkArrivedFutureMessages();
}
function openBuryScreen() {
  document.getElementById("timeChamberScreen").classList.add("attic-hidden");
  document.getElementById("buryScreen").classList.remove("attic-hidden");
  enterAtticSubscreenMusic("bury");
  renderBurySlots();
}
function openSendScreen() {
  document.getElementById("timeChamberScreen").classList.add("attic-hidden");
  document.getElementById("sendScreen").classList.remove("attic-hidden");
  enterAtticSubscreenMusic("send");
  renderSendSlots();
}


/* ============================================================ */
/* FOUNDERS HALL                                                 */
/* ============================================================ */

const BUILTIN_CATEGORIES = ["Work", "Nature", "Personal Growth", "Milestone", "Travel", "Family"];

function getVaultFoundedDate() {
  let founded = localStorage.getItem("vaultCreatedDate");
  if (!founded) {
    const memories = getMemories();
    if (memories.length > 0) {
      const earliest = memories.reduce((a, b) => new Date(a.date) < new Date(b.date) ? a : b);
      founded = earliest.date;
    } else {
      founded = new Date().toISOString();
    }
    localStorage.setItem("vaultCreatedDate", founded);
  }
  return founded;
}

function formatFounderDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function showFoundersHall() {
  document.getElementById("foundersHallScreen").classList.remove("attic-hidden");
  renderFoundersHall();
}

function renderFoundersHall() {
  const name = getUserName();
  document.getElementById("founderNameDisplay").textContent = name || "The Founder";
  document.getElementById("founderEstDate").textContent = `Est. ${formatFounderDate(getVaultFoundedDate())}`;

  const portraitData = localStorage.getItem("founderPortrait");
  const img = document.getElementById("founderPortraitImg");
  const placeholder = document.getElementById("founderPortraitPlaceholder");
  if (portraitData) {
    img.src = portraitData;
    img.classList.remove("attic-hidden");
    placeholder.classList.add("attic-hidden");
  } else {
    img.classList.add("attic-hidden");
    placeholder.classList.remove("attic-hidden");
  }

  const statement = localStorage.getItem("founderStatement");
  const statementDisplay = document.getElementById("founderStatementDisplay");
  if (statement) {
    statementDisplay.textContent = `"${statement}"`;
    statementDisplay.classList.remove("attic-hidden");
  } else {
    statementDisplay.classList.add("attic-hidden");
  }

  renderFounderLedger();
}

function handleFounderPortraitChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 400;
      let width = image.width, height = image.height;
      if (width > height) {
        if (width > maxSize) { height *= maxSize / width; width = maxSize; }
      } else {
        if (height > maxSize) { width *= maxSize / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      localStorage.setItem("founderPortrait", canvas.toDataURL("image/jpeg", 0.85));
      renderFoundersHall();
    };
    image.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function startFounderStatementEdit() {
  const input = document.getElementById("founderStatementInput");
  input.value = localStorage.getItem("founderStatement") || "";
  input.classList.remove("attic-hidden");
  document.getElementById("founderStatementDisplay").classList.add("attic-hidden");
  document.getElementById("founderStatementEditBtn").classList.add("attic-hidden");
  document.getElementById("founderStatementSaveBtn").classList.remove("attic-hidden");
}

function saveFounderStatement() {
  const input = document.getElementById("founderStatementInput");
  const value = input.value.trim();
  if (value) {
    localStorage.setItem("founderStatement", value);
  } else {
    localStorage.removeItem("founderStatement");
  }
  input.classList.add("attic-hidden");
  document.getElementById("founderStatementSaveBtn").classList.add("attic-hidden");
  document.getElementById("founderStatementEditBtn").classList.remove("attic-hidden");
  renderFoundersHall();
}

function findEarliestMemory(memories, predicate) {
  const matches = memories.filter(predicate);
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => new Date(a.date) < new Date(b.date) ? a : b);
}

function renderFounderLedger() {
  const memories = getMemories().slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const list = document.getElementById("founderLedgerList");
  list.innerHTML = "";

  const entries = [
    { label: "First memory ever saved", memory: memories[0] || null },
    { label: "First voice note", memory: findEarliestMemory(memories, m => !!m.voice) },
    { label: "First photo", memory: findEarliestMemory(memories, m => m.images && m.images.length > 0) },
    { label: "First custom category", memory: findEarliestMemory(memories, m => m.category && !BUILTIN_CATEGORIES.includes(m.category)) },
    { label: "First favorited memory", memory: findEarliestMemory(memories, m => m.favourite) },
    { label: "First mood tagged", memory: findEarliestMemory(memories, m => !!m.mood) },
    { label: "First person tagged", memory: findEarliestMemory(memories, m => m.people && m.people.trim().length > 0) }
  ];

  entries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "founder-ledger-entry" + (entry.memory ? "" : " founder-ledger-entry-empty");
    if (entry.memory) {
      row.innerHTML = `
        <span class="founder-ledger-label">${entry.label}</span>
        <span class="founder-ledger-value">${escapeHTML(entry.memory.title || "Untitled")} — ${formatFounderDate(entry.memory.date)}</span>
      `;
      row.onclick = () => viewMemory(entry.memory.id);
    } else {
      row.innerHTML = `
        <span class="founder-ledger-label">${entry.label}</span>
        <span class="founder-ledger-value founder-ledger-pending">Not yet</span>
      `;
    }
    list.appendChild(row);
  });
}

function generateFounderShareCard() {
  const accent = "#f472b6";
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  bgGradient.addColorStop(0, "#18181b");
  bgGradient.addColorStop(1, "#09090b");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1080, 1080);

  const glow = ctx.createRadialGradient(540, 340, 20, 540, 340, 380);
  glow.addColorStop(0, accent + "55");
  glow.addColorStop(0.4, accent + "22");
  glow.addColorStop(1, accent + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  roundRect(ctx, 36, 36, 1008, 1008, 48);
  ctx.stroke();
  ctx.strokeStyle = accent + "44";
  ctx.lineWidth = 2;
  roundRect(ctx, 48, 48, 984, 984, 40);
  ctx.stroke();

  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillStyle = accent;
  ctx.textAlign = "center";
  ctx.fillText("FOUNDER'S PLAQUE", 540, 130);

  function drawRest() {
    const name = getUserName() || "The Founder";
    ctx.font = "700 62px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 540, 560);

    ctx.font = "600 32px system-ui, sans-serif";
    ctx.fillStyle = accent;
    ctx.fillText(`Est. ${formatFounderDate(getVaultFoundedDate())}`, 540, 610);

    const statement = localStorage.getItem("founderStatement");
    if (statement) {
      ctx.font = "italic 30px system-ui, sans-serif";
      ctx.fillStyle = "#a1a1aa";
      wrapText(ctx, `"${statement}"`, 540, 700, 780, 44);
    }

    ctx.font = "700 32px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("EchoVault", 540, 930);
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("Founders Hall • Local only", 540, 975);

    shareFounderCanvas(canvas);
  }

  const portraitData = localStorage.getItem("founderPortrait");
  if (portraitData) {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 340, 140, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 400, 200, 280, 280);
      ctx.restore();
      drawRest();
    };
    img.src = portraitData;
  } else {
    ctx.font = "150px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("🏛️", 540, 400);
    drawRest();
  }
}

function shareFounderCanvas(canvas) {
  canvas.toBlob(async (blob) => {
    const file = new File([blob], "founders-plaque.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "My Founder's Plaque" });
        return;
      } catch (e) { /* fall through to download */ }
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "founders-plaque.png";
    link.click();
  }, "image/png");
}

/* ============================================================ */
/* SECTION: PUZZLE WORKSHOP — paste at the bottom of attic.js    */
/* ============================================================ */

/* ---------- Built-in packs (canvas-generated, no external assets) ---------- */
const PUZZLE_PACKS = [
  { id: "amber",  name: "Amber Glow",   colors: ["#f59e0b", "#78350f", "#fde68a"] },
  { id: "violet", name: "Violet Dusk",  colors: ["#8b5cf6", "#2e1065", "#c4b5fd"] },
  { id: "ocean",  name: "Deep Ocean",   colors: ["#0ea5e9", "#0c4a6e", "#7dd3fc"] },
  { id: "forest", name: "Forest Moss",  colors: ["#22c55e", "#14532d", "#bbf7d0"] },
];
const PUZZLE_VARIANTS_PER_PACK = 5;
const puzzleArtCache = {}; // "packId_variant" -> dataURL, generated once then reused

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Each variant uses a structurally different composition (not just the same
// blobs shuffled around) so the 5 images in a pack actually look distinct.
const PUZZLE_ART_STYLES = [
  drawRadialBurst,
  drawDiagonalStripes,
  drawBokehCircles,
  drawConcentricRings,
  drawWaveBands,
];

function generatePuzzleArt(packId, variant) {
  const cacheKey = `${packId}_${variant}`;
  if (puzzleArtCache[cacheKey]) return puzzleArtCache[cacheKey];

  const pack = PUZZLE_PACKS.find(p => p.id === packId);
  const rand = seededRandom(packId.charCodeAt(0) * 1000 + variant * 37);
  const size = 600;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const styleFn = PUZZLE_ART_STYLES[variant % PUZZLE_ART_STYLES.length];
  styleFn(ctx, size, pack.colors, rand);

  const dataUrl = canvas.toDataURL("image/png");
  puzzleArtCache[cacheKey] = dataUrl;
  return dataUrl;
}

function drawRadialBurst(ctx, size, colors) {
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, size, size);
  const rays = 16;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + Math.PI / rays;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.arc(size / 2, size / 2, size, a0, a1);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? colors[0] : colors[2];
    ctx.globalAlpha = 0.55;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawDiagonalStripes(ctx, size, colors) {
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, size, size);
  const stripeW = size / 10;
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 4);
  ctx.translate(-size / 2, -size / 2);
  for (let x = -size; x < size * 2; x += stripeW * 2) {
    ctx.fillStyle = colors[0];
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, -size, stripeW, size * 3);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawBokehCircles(ctx, size, colors, rand) {
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 10; i++) {
    const cx = rand() * size, cy = rand() * size, r = 30 + rand() * 140;
    ctx.beginPath();
    ctx.fillStyle = colors[i % 2 === 0 ? 0 : 2];
    ctx.globalAlpha = 0.18 + rand() * 0.2;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawConcentricRings(ctx, size, colors) {
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, size, size);
  const rings = 8;
  for (let i = rings; i > 0; i--) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (i / rings) * size * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? colors[0] : colors[2];
    ctx.globalAlpha = 0.5;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawWaveBands(ctx, size, colors) {
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, size, size);
  const bands = 6;
  for (let b = 0; b < bands; b++) {
    ctx.beginPath();
    ctx.moveTo(0, (b / bands) * size);
    for (let x = 0; x <= size; x += 20) {
      const y = (b / bands) * size + Math.sin((x / size) * Math.PI * 2 + b) * (size / (bands * 2));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fillStyle = b % 2 === 0 ? colors[0] : colors[2];
    ctx.globalAlpha = 0.35;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ---------- Progress storage (one-time coin payout per image+size) ---------- */
function getAllPuzzleProgress() {
  try { return JSON.parse(localStorage.getItem("atticPuzzleProgress") || "{}"); }
  catch (e) { return {}; }
}
function savePuzzleProgress(all) {
  localStorage.setItem("atticPuzzleProgress", JSON.stringify(all));
}
function puzzleComboKey(imageId, size) {
  return `${imageId}_${size}x${size}`;
}

/* ---------- State ---------- */
let puzzleSourceMode = "photos"; // "photos" | "packs"
let puzzleActivePack = PUZZLE_PACKS[0].id;
let puzzleSelectedImageId = null;
let puzzleSelectedImageSrc = null;

let puzzleSize = 3;
let puzzleBoard = [];       // array length size*size, values are tile ids 1..(n*n-1), null = blank
let puzzleBlankIndex = 0;
let puzzleMoveHistory = []; // stack of slot indices swapped with blank, for Undo
let puzzleMoveCount = 0;
let puzzleHintsUsed = 0;
let puzzleStartTime = null;
let puzzleTimerInterval = null;
let puzzleSolved = false;

/* ---------- Screen 1: hub / picker ---------- */
function showPuzzleHub() {
  document.getElementById("atticPuzzleHubScreen").classList.remove("attic-hidden");
  setPuzzleSource(puzzleSourceMode);
}

function backToPuzzleHub() {
  document.getElementById("atticPuzzleSizeScreen").classList.add("attic-hidden");
  document.getElementById("atticPuzzleHubScreen").classList.remove("attic-hidden");
}

function setPuzzleSource(mode) {
  puzzleSourceMode = mode;
  document.getElementById("puzzleSourcePhotosBtn").classList.toggle("active", mode === "photos");
  document.getElementById("puzzleSourcePacksBtn").classList.toggle("active", mode === "packs");
  document.getElementById("puzzlePackPills").classList.toggle("attic-hidden", mode !== "packs");

  if (mode === "photos") {
    renderPuzzlePhotoGrid();
  } else {
    renderPuzzlePackPills();
    renderPuzzlePackGrid();
  }
}

async function renderPuzzlePhotoGrid() {
  const grid = document.getElementById("puzzleImageGrid");
  grid.innerHTML = "<p class='puzzle-empty-note'>Loading your photos…</p>";
  const allMemories = await getMemories();
  const withPhotos = allMemories.filter(m => (m.image || (m.images && m.images.length > 0)) && !m.buried);

  if (withPhotos.length === 0) {
    grid.innerHTML = "<p class='puzzle-empty-note'>No photo memories yet — add one, or try a Built-in Pack instead.</p>";
    return;
  }

  grid.innerHTML = "";
  withPhotos
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .forEach(m => {
      // Newer memories have a full `images` array; older ones (pre-dating multi-photo
      // support) only ever got `image` set. Fall back so neither gets dropped.
      const photos = (m.images && m.images.length > 0) ? m.images : [m.image];
      photos.forEach((src, photoIndex) => {
        const thumb = document.createElement("div");
        thumb.className = "puzzle-image-thumb";
        thumb.style.backgroundImage = `url(${src})`;
        thumb.onclick = () => selectPuzzleImage(`photo_${m.id}_${photoIndex}`, src);
        grid.appendChild(thumb);
      });
    });
}

function renderPuzzlePackPills() {
  const wrap = document.getElementById("puzzlePackPills");
  wrap.innerHTML = "";
  PUZZLE_PACKS.forEach(pack => {
    const pill = document.createElement("button");
    pill.className = "puzzle-pack-pill" + (pack.id === puzzleActivePack ? " active" : "");
    pill.textContent = pack.name;
    pill.onclick = () => { puzzleActivePack = pack.id; renderPuzzlePackPills(); renderPuzzlePackGrid(); };
    wrap.appendChild(pill);
  });
}

function renderPuzzlePackGrid() {
  const grid = document.getElementById("puzzleImageGrid");
  grid.innerHTML = "";
  for (let v = 0; v < PUZZLE_VARIANTS_PER_PACK; v++) {
    const src = generatePuzzleArt(puzzleActivePack, v);
    const thumb = document.createElement("div");
    thumb.className = "puzzle-image-thumb";
    thumb.style.backgroundImage = `url(${src})`;
    thumb.onclick = () => selectPuzzleImage(`pack_${puzzleActivePack}_${v}`, src);
    grid.appendChild(thumb);
  }
}

// Crops to a centered square on an offscreen canvas so the board (which uses
// background-size percentages, not object-fit) always matches the same
// framing the thumbnail/preview showed — no more stretched non-square photos.
function squareCropImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const outSize = 600;
      const canvas = document.createElement("canvas");
      canvas.width = outSize;
      canvas.height = outSize;
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, outSize, outSize);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve(src); // fall back to original if it fails to load
    img.src = src;
  });
}

async function selectPuzzleImage(imageId, imageSrc) {
  puzzleSelectedImageId = imageId;
  document.getElementById("atticPuzzleHubScreen").classList.add("attic-hidden");
  document.getElementById("atticPuzzleSizeScreen").classList.remove("attic-hidden");

  document.getElementById("puzzleSizePreviewImg").src = imageSrc; // show right away, uncropped
  puzzleSelectedImageSrc = await squareCropImage(imageSrc);        // then swap to the exact square version the board will use
  document.getElementById("puzzleSizePreviewImg").src = puzzleSelectedImageSrc;
}

/* ---------- Screen 3: the puzzle ---------- */
function startPuzzleGame(size) {
  puzzleSize = size;
  puzzleMoveCount = 0;
  puzzleHintsUsed = 0;
  puzzleMoveHistory = [];
  puzzleSolved = false;

  puzzleBoard = buildShuffledBoard(size);
  puzzleBlankIndex = puzzleBoard.indexOf(null);

  document.getElementById("atticPuzzleSizeScreen").classList.add("attic-hidden");
  document.getElementById("atticPuzzleGameScreen").classList.remove("attic-hidden");
  document.getElementById("puzzleResultBanner").classList.add("attic-hidden");
  document.getElementById("puzzlePeekOverlay").style.backgroundImage = `url(${puzzleSelectedImageSrc})`;

  renderPuzzleBoard();
  updatePuzzleControlsState();
  startPuzzleTimer();
}

function buildShuffledBoard(size) {
  const total = size * size;
  const solved = [];
  for (let i = 1; i < total; i++) solved.push(i);
  solved.push(null); // blank last

  const board = solved.slice();
  let blank = total - 1;
  let lastSwap = -1;
  const walkLength = 80 + size * size * 15;

  for (let step = 0; step < walkLength; step++) {
    const neighbors = getNeighborIndices(blank, size).filter(n => n !== lastSwap);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [board[blank], board[pick]] = [board[pick], board[blank]];
    lastSwap = blank;
    blank = pick;
  }
  return board;
}

function getNeighborIndices(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const out = [];
  if (row > 0) out.push(index - size);
  if (row < size - 1) out.push(index + size);
  if (col > 0) out.push(index - 1);
  if (col < size - 1) out.push(index + 1);
  return out;
}

function renderPuzzleBoard() {
  const board = document.getElementById("puzzleBoard");
  board.style.gridTemplateColumns = `repeat(${puzzleSize}, 1fr)`;
  board.innerHTML = "";

  puzzleBoard.forEach((tileId, slotIndex) => {
    const cell = document.createElement("div");
    if (tileId === null) {
      cell.className = "puzzle-tile puzzle-tile-blank";
    } else {
      cell.className = "puzzle-tile";
      const originalIndex = tileId - 1; // tile 1 belongs at index 0, etc.
      const oRow = Math.floor(originalIndex / puzzleSize);
      const oCol = originalIndex % puzzleSize;
      cell.style.backgroundImage = `url(${puzzleSelectedImageSrc})`;
      cell.style.backgroundSize = `${puzzleSize * 100}% ${puzzleSize * 100}%`;
      cell.style.backgroundPosition =
        `${(oCol / (puzzleSize - 1)) * 100}% ${(oRow / (puzzleSize - 1)) * 100}%`;
      cell.onclick = () => handlePuzzleTileClick(slotIndex);
    }
    board.appendChild(cell);
  });
}

function handlePuzzleTileClick(slotIndex) {
  if (puzzleSolved) return;
  const neighbors = getNeighborIndices(puzzleBlankIndex, puzzleSize);
  if (!neighbors.includes(slotIndex)) return; // not adjacent to blank, no-op

  swapPuzzleTiles(slotIndex);
  puzzleMoveHistory.push(slotIndex);
  puzzleMoveCount++;
  updatePuzzleControlsState();
  renderPuzzleBoard();
  checkPuzzleWin();
}

function swapPuzzleTiles(slotIndex) {
  [puzzleBoard[puzzleBlankIndex], puzzleBoard[slotIndex]] = [puzzleBoard[slotIndex], puzzleBoard[puzzleBlankIndex]];
  puzzleBlankIndex = slotIndex;
}

function handlePuzzleUndo() {
  if (puzzleSolved || puzzleMoveHistory.length === 0) return;
  const lastSlot = puzzleMoveHistory.pop(); // swap is its own inverse
  swapPuzzleTiles(lastSlot);
  puzzleMoveCount++;
  updatePuzzleControlsState();
  renderPuzzleBoard();
}

function handlePuzzleRestart() {
  startPuzzleGame(puzzleSize);
}

function handlePuzzleNewGame() {
  stopPuzzleTimer();
  document.getElementById("atticPuzzleGameScreen").classList.add("attic-hidden");
  backToPuzzleHub();
}

function handlePuzzleHint() {
  if (puzzleSolved) return;
  const neighbors = getNeighborIndices(puzzleBlankIndex, puzzleSize);
  let bestSlot = neighbors[0];
  let bestScore = Infinity;

  neighbors.forEach(n => {
    const trial = puzzleBoard.slice();
    [trial[puzzleBlankIndex], trial[n]] = [trial[n], trial[puzzleBlankIndex]];
    const score = totalManhattanDistance(trial);
    if (score < bestScore) { bestScore = score; bestSlot = n; }
  });

  swapPuzzleTiles(bestSlot);
  puzzleMoveHistory.push(bestSlot);
  puzzleMoveCount++;
  puzzleHintsUsed++;
  updatePuzzleControlsState();
  renderPuzzleBoard();
  checkPuzzleWin();
}

function totalManhattanDistance(board) {
  let total = 0;
  board.forEach((tileId, slotIndex) => {
    if (tileId === null) return;
    const originalIndex = tileId - 1;
    const curRow = Math.floor(slotIndex / puzzleSize), curCol = slotIndex % puzzleSize;
    const oRow = Math.floor(originalIndex / puzzleSize), oCol = originalIndex % puzzleSize;
    total += Math.abs(curRow - oRow) + Math.abs(curCol - oCol);
  });
  return total;
}

function showPuzzlePeek(e) {
  if (e) e.preventDefault();
  document.getElementById("puzzlePeekOverlay").classList.remove("attic-hidden");
}
function hidePuzzlePeek(e) {
  if (e) e.preventDefault();
  document.getElementById("puzzlePeekOverlay").classList.add("attic-hidden");
}

function updatePuzzleControlsState() {
  document.getElementById("puzzleMoveCount").textContent = `Moves: ${puzzleMoveCount}`;
  document.getElementById("puzzleUndoBtn").disabled = puzzleMoveHistory.length === 0;
}

function startPuzzleTimer() {
  stopPuzzleTimer();
  puzzleStartTime = Date.now();
  document.getElementById("puzzleTimer").textContent = "0:00";
  puzzleTimerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - puzzleStartTime) / 1000);
    const m = Math.floor(secs / 60), s = secs % 60;
    document.getElementById("puzzleTimer").textContent = `${m}:${String(s).padStart(2, "0")}`;
  }, 1000);
}
function stopPuzzleTimer() {
  if (puzzleTimerInterval) clearInterval(puzzleTimerInterval);
  puzzleTimerInterval = null;
}

function checkPuzzleWin() {
  const isSolved = puzzleBoard.every((tileId, i) => (i === puzzleBoard.length - 1 ? tileId === null : tileId === i + 1));
  if (!isSolved) return;

  puzzleSolved = true;
  stopPuzzleTimer();

  const key = puzzleComboKey(puzzleSelectedImageId, puzzleSize);
  const all = getAllPuzzleProgress();
  const banner = document.getElementById("puzzleResultBanner");
  banner.classList.remove("attic-hidden");

  if (all[key]) {
    banner.textContent = `🧩 Solved again! (already rewarded — free replay)`;
  } else {
    const base = { 3: 20, 4: 40, 5: 70, 6: 110 }[puzzleSize];
    const reduction = Math.min(puzzleHintsUsed * 0.15, 0.8);
    const coins = Math.max(Math.round(base * (1 - reduction)), Math.round(base * 0.2));
    all[key] = { imageId: puzzleSelectedImageId, size: puzzleSize, coinsEarned: coins, hintsUsed: puzzleHintsUsed, moves: puzzleMoveCount };
    savePuzzleProgress(all);
    banner.textContent = `🧩 Solved! +${coins} Echo Coins`;
  }
}


/* ============================================================ */
/* SECTION: GAME ARCADE — paste at the bottom of attic.js        */
/* ============================================================ */

function showArcadeHub() {
  document.getElementById("atticArcadeHubScreen").classList.remove("attic-hidden");
  enterAtticRoomMusic("arcade");
}

/* ---------- Memory Falls: word lists (every length verified) ---------- */
const MF_WORD_LISTS = {
  1: ["I", "a"],
  2: ["is", "at", "to", "in", "on", "of", "or", "an", "as", "by", "do", "go", "he", "if", "it", "me", "my", "no", "so", "up", "us", "we", "am", "be", "hi", "ok"],
  3: ["cat", "dog", "sun", "run", "big", "red", "sky", "joy", "cup", "hat", "map", "key", "ice", "bug", "fox", "owl", "bee", "toy", "box", "jam"],
  4: ["love", "time", "hope", "book", "tree", "star", "moon", "fire", "wind", "rain", "song", "door", "road", "gold", "blue", "fish", "bird", "cake", "lamp", "gift"],
  5: ["smile", "dream", "light", "peace", "music", "photo", "voice", "happy", "today", "place", "world", "story", "spark", "cloud", "beach", "field", "dance", "laugh", "quiet", "frame"],
  6: ["memory", "future", "moment", "garden", "flower", "silver", "summer", "winter", "autumn", "forest", "planet", "castle", "bridge", "canvas", "mirror", "shadow", "rocket", "puzzle", "harbor", "little", "people"],
  7: ["journey", "evening", "harmony", "emotion", "picture", "freedom", "holiday", "rainbow", "thunder", "morning", "vintage", "crystal", "echoing", "blanket", "whisper", "glimpse", "reunion", "perfect"],
};

// Level config: word length, how many correct words clear the level, and fall speed (px/sec).
const MF_LEVELS = [
  { length: 1, wordsToAdvance: 5, speed: 40 },
  { length: 2, wordsToAdvance: 5, speed: 55 },
  { length: 3, wordsToAdvance: 6, speed: 75 },
  { length: 4, wordsToAdvance: 5, speed: 75 },  // no increase from L3, by design
  { length: 5, wordsToAdvance: 6, speed: 95 },
  { length: 6, wordsToAdvance: 6, speed: 115 },
  { length: 7, wordsToAdvance: Infinity, speed: 135 }, // endgame: never "advances" past this, speed climbs instead
];

const MF_MAX_LIVES = 5;
const MF_COMBO_TARGET = 5;           // consecutive fast+correct words needed for a bonus life
const MF_MS_PER_CHAR_TARGET = 300;   // comfortable-typist pace used to judge "fast"
const MF_ENDGAME_SPEED_STEP = 5;     // px/sec added periodically once at level 7
const MF_ENDGAME_SPEED_INTERVAL_MS = 10000;
const MF_ENDGAME_2WORD_SPEED = 170;  // speed thresholds that unlock overlapping words
const MF_ENDGAME_3WORD_SPEED = 220;

let mfState = null; // set fresh each run by beginMemoryFallsRun()

function startMemoryFalls() {
  document.getElementById("atticArcadeHubScreen").classList.add("attic-hidden");
  document.getElementById("atticMemoryFallsScreen").classList.remove("attic-hidden");
  document.getElementById("mfStartOverlay").classList.remove("attic-hidden");
  document.getElementById("mfGameOverOverlay").classList.add("attic-hidden");
  enterAtticSubscreenMusic("memoryFalls");
  document.getElementById("mfGameArea").addEventListener("click", () => {
     document.getElementById("mfHiddenInput").focus();
   });
}

function exitMemoryFalls() {
  stopMemoryFallsRun();
  document.getElementById("atticMemoryFallsScreen").classList.add("attic-hidden");
  document.getElementById("mfHiddenInput").removeEventListener("input", handleMemoryFallsInput);
  showArcadeHub();
}

function beginMemoryFallsRun() {
  document.getElementById("mfStartOverlay").classList.add("attic-hidden");
  document.getElementById("mfGameOverOverlay").classList.add("attic-hidden");
  document.getElementById("mfGameArea").querySelectorAll(".mf-word").forEach(el => el.remove());

  mfState = {
    levelIndex: 0,
    wordsClearedThisLevel: 0,
    lives: 3,
    combo: 0,
    totalCorrect: 0,
    startTime: Date.now(),
    endgameSpeedBonus: 0,
    activeWords: [],   // { el, word, typedCount, spawnTime, missTimer }
    usedWordsThisLevel: new Set(),
    running: true,
    endgameInterval: null,
  };

  updateMfHud();
  document.getElementById("mfHiddenInput").addEventListener("input", handleMemoryFallsInput);
  document.getElementById("mfHiddenInput").focus();
  startMfTimer();
  spawnMfWord();
}

function stopMemoryFallsRun() {
  if (!mfState) return;
  mfState.running = false;
  if (mfState.endgameInterval) clearInterval(mfState.endgameInterval);
  if (mfState.timerInterval) clearInterval(mfState.timerInterval);
  mfState.activeWords.forEach(w => { if (w.missTimeout) clearTimeout(w.missTimeout); });
}

function startMfTimer() {
  mfState.timerInterval = setInterval(() => {
    if (!mfState || !mfState.running) return;
    const secs = Math.floor((Date.now() - mfState.startTime) / 1000);
    const m = Math.floor(secs / 60), s = secs % 60;
    document.getElementById("mfTimer").textContent = `${m}:${String(s).padStart(2, "0")}`;
  }, 1000);
}

function currentMfLevel() {
  return MF_LEVELS[mfState.levelIndex];
}

function currentMfSpeed() {
  return currentMfLevel().speed + mfState.endgameSpeedBonus;
}

function isMfEndgame() {
  return mfState.levelIndex === MF_LEVELS.length - 1;
}

function maxConcurrentMfWords() {
  if (!isMfEndgame()) return 1;
  const speed = currentMfSpeed();
  if (speed >= MF_ENDGAME_3WORD_SPEED) return 3;
  if (speed >= MF_ENDGAME_2WORD_SPEED) return 2;
  return 1;
}

function pickMfWord() {
  const length = currentMfLevel().length;
  const pool = MF_WORD_LISTS[length];
  // Avoid immediate repeats where the pool allows it.
  const available = pool.filter(w => !mfState.usedWordsThisLevel.has(w));
  const choices = available.length > 0 ? available : pool;
  const word = choices[Math.floor(Math.random() * choices.length)];
  mfState.usedWordsThisLevel.add(word);
  if (mfState.usedWordsThisLevel.size >= pool.length) mfState.usedWordsThisLevel.clear();
  return word;
}

function spawnMfWord() {
  if (!mfState || !mfState.running) return;
  if (mfState.activeWords.length >= maxConcurrentMfWords()) return;

  const gameArea = document.getElementById("mfGameArea");
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const word = pickMfWord();
  const speed = currentMfSpeed();
  const fallDurationSec = areaHeight / speed;

  // Pick an x position; when multiple words can be on screen, spread them across lanes.
  const laneCount = maxConcurrentMfWords();
  const laneIndex = mfState.activeWords.length % laneCount;
  const laneWidth = areaWidth / laneCount;
  const x = laneWidth * laneIndex + laneWidth / 2;

  const el = document.createElement("div");
  el.className = "mf-word";
  el.style.left = `${x}px`;
  el.innerHTML = word.split("").map(ch => `<span class="mf-letter">${ch}</span>`).join("");
  gameArea.appendChild(el);

  const wordObj = { el, word, typedCount: 0, spawnTime: Date.now() };
  mfState.activeWords.push(wordObj);

  // Force layout, then trigger the CSS transition to the bottom.
  requestAnimationFrame(() => {
    el.style.transitionDuration = `${fallDurationSec}s`;
    el.style.top = `${areaHeight - el.offsetHeight}px`;
  });

  wordObj.missTimeout = setTimeout(() => handleMfWordMissed(wordObj), fallDurationSec * 1000);

  // Try to spawn another concurrent word (only actually spawns if endgame allows it and there's room).
  if (mfState.activeWords.length < maxConcurrentMfWords()) {
    setTimeout(spawnMfWord, 600);
  }
}

function handleMfWordMissed(wordObj) {
  if (!mfState || !mfState.running) return;
  removeMfActiveWord(wordObj);
  wordObj.el.remove();
  mfState.combo = 0;
  loseMfLife();
}

function loseMfLife() {
  mfState.lives--;
  updateMfHud();
  if (mfState.lives <= 0) {
    endMemoryFallsRun();
  } else {
    spawnMfWord();
  }
}

function removeMfActiveWord(wordObj) {
  mfState.activeWords = mfState.activeWords.filter(w => w !== wordObj);
}

function findMfLockedWord() {
  return mfState.activeWords.find(w => w.typedCount > 0) || null;
}

function handleMemoryFallsInput(e) {
  const input = e.target;
  const value = input.value;
  input.value = ""; // always clear immediately — no backspacing needed between letters or words

  if (!mfState || !mfState.running || value.length === 0) return;
  const typedChar = value.slice(-1).toLowerCase();
  if (!/[a-z]/.test(typedChar)) return;

  let target = findMfLockedWord();
  if (!target) {
    const candidates = mfState.activeWords
      .filter(w => w.word[0].toLowerCase() === typedChar)
      .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
    target = candidates[0];
  }
  if (!target) return;

  const nextChar = target.word[target.typedCount].toLowerCase();
  if (typedChar !== nextChar) return;

  target.typedCount++;
  target.el.classList.add("mf-word-locked");
  target.el.querySelectorAll(".mf-letter")[target.typedCount - 1].classList.add("mf-letter-typed");

  if (target.typedCount === target.word.length) {
    completeMfWord(target);
  }
}


function completeMfWord(wordObj) {
  clearTimeout(wordObj.missTimeout);
  removeMfActiveWord(wordObj);

  const elapsedMs = Date.now() - wordObj.spawnTime;
  const targetMs = wordObj.word.length * MF_MS_PER_CHAR_TARGET;
  const wasFast = elapsedMs <= targetMs;

  wordObj.el.classList.add("mf-explode");
  setTimeout(() => wordObj.el.remove(), 300);

  mfState.totalCorrect++;
  mfState.wordsClearedThisLevel++;

  if (wasFast) {
    mfState.combo++;
    if (mfState.combo >= MF_COMBO_TARGET) {
      mfState.combo = 0;
      if (mfState.lives < MF_MAX_LIVES) {
        mfState.lives++;
        showMfBanner("⚡ +1 Life!");
      }
    }
  } else {
    mfState.combo = 0;
  }

  checkMfLevelAdvance();
  updateMfHud();
  spawnMfWord();
}

function checkMfLevelAdvance() {
  const level = currentMfLevel();
  if (isMfEndgame()) return; // level 7 never "advances" — see endgame ramp instead
  if (mfState.wordsClearedThisLevel < level.wordsToAdvance) return;

  mfState.levelIndex++;
  mfState.wordsClearedThisLevel = 0;
  mfState.usedWordsThisLevel.clear();
  showMfBanner(`Level ${mfState.levelIndex + 1}!`);

  if (isMfEndgame()) startMfEndgameRamp();
}

function startMfEndgameRamp() {
  mfState.endgameInterval = setInterval(() => {
    if (!mfState || !mfState.running) return;
    mfState.endgameSpeedBonus += MF_ENDGAME_SPEED_STEP;
    updateMfHud();
  }, MF_ENDGAME_SPEED_INTERVAL_MS);
}

function showMfBanner(text) {
  const banner = document.getElementById("mfLevelUpBanner");
  banner.textContent = text;
  banner.classList.remove("attic-hidden");
  banner.classList.remove("mf-level-up-banner"); // restart animation
  void banner.offsetWidth; // force reflow so the animation replays
  banner.classList.add("mf-level-up-banner");
  setTimeout(() => banner.classList.add("attic-hidden"), 1200);
}

function updateMfHud() {
  document.getElementById("mfLives").textContent = "🕯️".repeat(mfState.lives);
  document.getElementById("mfLevel").textContent = `Level ${mfState.levelIndex + 1}`;

  const speed = currentMfSpeed();
  const maxSpeed = MF_LEVELS[MF_LEVELS.length - 1].speed + MF_ENDGAME_SPEED_STEP * 20; // reasonable ceiling for the bar
  const pct = Math.min((speed / maxSpeed) * 100, 100);
  document.getElementById("mfSpeedMeterFill").style.width = `${pct}%`;
}

function endMemoryFallsRun() {
  stopMemoryFallsRun();
  document.getElementById("mfHiddenInput").removeEventListener("input", handleMemoryFallsInput);
  mfState.activeWords.forEach(w => w.el.remove());

  const secs = Math.floor((Date.now() - mfState.startTime) / 1000);

  const arcadeProgress = getArcadeProgress();
  let coinsLine = "";
  if (!arcadeProgress.memoryFalls) {
    const coins = 10 + mfState.levelIndex * 3;
    arcadeProgress.memoryFalls = { coinsEarned: coins };
    saveArcadeProgress(arcadeProgress);
    coinsLine = ` · +${coins} Echo Coins`;
  }

  document.getElementById("mfFinalStats").textContent =
    `Reached Level ${mfState.levelIndex + 1} · ${mfState.totalCorrect} words typed · ${secs}s survived` + coinsLine;
  document.getElementById("mfGameOverOverlay").classList.remove("attic-hidden");
}



/* ============================================================ */
/* SECTION: ECHO MATCH — paste at the bottom of attic.js         */
/* ============================================================ */

// Fallback content used to top up the deck when the vault doesn't have enough
// unique photos yet — guarantees the game always works regardless of vault size.
const EM_FALLBACK_PAIRS = [
  { icon: "📷", label: "Photo" }, { icon: "🎵", label: "Voice" }, { icon: "⭐", label: "Favorite" },
  { icon: "📅", label: "Date" }, { icon: "💭", label: "Memory" }, { icon: "🌙", label: "Night" },
  { icon: "☀️", label: "Day" }, { icon: "🌊", label: "Ocean" }, { icon: "🌲", label: "Forest" },
  { icon: "🔑", label: "Key" }, { icon: "💡", label: "Idea" }, { icon: "🎯", label: "Goal" },
  { icon: "🕯️", label: "Candle" }, { icon: "📖", label: "Story" }, { icon: "💌", label: "Letter" },
  { icon: "🏔️", label: "Mountain" }, { icon: "🌸", label: "Bloom" }, { icon: "⚡", label: "Spark" },
];

let emState = null;

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildEchoMatchDeck(gridSize) {
  const pairsNeeded = (gridSize * gridSize) / 2;
  const allMemories = await getMemories();

  const photoPool = [];
  allMemories.filter(m => !m.buried).forEach(m => {
    const photos = (m.images && m.images.length > 0) ? m.images : (m.image ? [m.image] : []);
    photos.forEach(src => photoPool.push(src));
  });

  const shuffledPhotos = shuffleArray(photoPool).slice(0, pairsNeeded);
  const cards = shuffledPhotos.map((src, i) => ({ pairId: `photo_${i}`, type: "photo", content: src }));

  if (cards.length < pairsNeeded) {
    const remaining = pairsNeeded - cards.length;
    shuffleArray(EM_FALLBACK_PAIRS).slice(0, remaining).forEach((p, i) => {
      cards.push({ pairId: `icon_${i}`, type: "icon", content: p });
    });
  }

  // Duplicate every card to make pairs, then shuffle the full deck.
  const deck = shuffleArray(cards.concat(cards).map((c, i) => ({ ...c, cellId: i })));
  return deck;
}

async function startEchoMatch(gridSize) {
  document.getElementById("atticEchoMatchHubScreen").classList.add("attic-hidden");
  document.getElementById("atticEchoMatchGameScreen").classList.remove("attic-hidden");
  document.getElementById("emWinOverlay").classList.add("attic-hidden");
  enterAtticSubscreenMusic("echoMatch");

  const deck = await buildEchoMatchDeck(gridSize);

  emState = {
    gridSize,
    deck,
    flippedCells: [],
    matchedCount: 0,
    moves: 0,
    startTime: Date.now(),
    busy: false,
  };

  renderEchoMatchGrid();
  updateEmHud();
  startEmTimer();
}

function exitEchoMatch() {
  if (emState && emState.timerInterval) clearInterval(emState.timerInterval);
  document.getElementById("atticEchoMatchGameScreen").classList.add("attic-hidden");
  showArcadeHub();
}

function startEmTimer() {
  emState.timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - emState.startTime) / 1000);
    const m = Math.floor(secs / 60), s = secs % 60;
    document.getElementById("emTimer").textContent = `${m}:${String(s).padStart(2, "0")}`;
  }, 1000);
}

function emBestKey(gridSize) {
  return `echoMatchBest_${gridSize}x${gridSize}`;
}

function renderEchoMatchGrid() {
  const grid = document.getElementById("emGrid");
  grid.style.gridTemplateColumns = `repeat(${emState.gridSize}, 1fr)`;
  grid.innerHTML = "";

  emState.deck.forEach(card => {
    const cell = document.createElement("div");
    cell.className = "em-card";
    cell.dataset.cellId = card.cellId;

    const frontInner = card.type === "photo"
      ? `<img src="${card.content}" alt="">`
      : `<span class="em-card-front-icon">${card.content.icon}</span><span class="em-card-front-label">${card.content.label}</span>`;

    cell.innerHTML = `
      <div class="em-card-inner">
        <div class="em-card-face em-card-back">🕯️</div>
        <div class="em-card-face em-card-front">${frontInner}</div>
      </div>
    `;
    cell.onclick = () => handleEmCardClick(card.cellId);
    grid.appendChild(cell);
  });

  const best = localStorage.getItem(emBestKey(emState.gridSize));
  document.getElementById("emBest").textContent = best ? `Best: ${JSON.parse(best).moves} moves` : "";
}

function handleEmCardClick(cellId) {
  if (emState.busy) return;
  const cellEl = document.querySelector(`.em-card[data-cell-id="${cellId}"]`);
  if (cellEl.classList.contains("flipped") || cellEl.classList.contains("matched")) return;
  if (emState.flippedCells.length >= 2) return;

  cellEl.classList.add("flipped");
  emState.flippedCells.push(cellId);

  if (emState.flippedCells.length === 2) {
    emState.moves++;
    updateEmHud();
    emState.busy = true;
    setTimeout(checkEmMatch, 500);
  }
}

function checkEmMatch() {
  const [idA, idB] = emState.flippedCells;
  const cardA = emState.deck.find(c => c.cellId === idA);
  const cardB = emState.deck.find(c => c.cellId === idB);
  const elA = document.querySelector(`.em-card[data-cell-id="${idA}"]`);
  const elB = document.querySelector(`.em-card[data-cell-id="${idB}"]`);

  if (cardA.pairId === cardB.pairId) {
    elA.classList.add("matched");
    elB.classList.add("matched");
    emState.matchedCount++;
    playEmMatchSound();
    if (emState.matchedCount === emState.deck.length / 2) {
      endEchoMatchWin();
    }
  } else {
    elA.classList.remove("flipped");
    elB.classList.remove("flipped");
  }

  emState.flippedCells = [];
  emState.busy = false;
}

function playEmMatchSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function updateEmHud() {
  document.getElementById("emMoves").textContent = `Moves: ${emState.moves}`;
}

function endEchoMatchWin() {
  clearInterval(emState.timerInterval);
  const secs = Math.floor((Date.now() - emState.startTime) / 1000);

  const key = emBestKey(emState.gridSize);
  const prevBest = JSON.parse(localStorage.getItem(key) || "null");
  const isNewBest = !prevBest || emState.moves < prevBest.moves;
  if (isNewBest) localStorage.setItem(key, JSON.stringify({ moves: emState.moves, seconds: secs }));

  const arcadeKey = `echoMatch_${emState.gridSize}`;
  const arcadeProgress = getArcadeProgress();
  let coinsLine = "";
  if (!arcadeProgress[arcadeKey]) {
    const coins = emState.gridSize === 6 ? 40 : 20;
    arcadeProgress[arcadeKey] = { coinsEarned: coins };
    saveArcadeProgress(arcadeProgress);
    coinsLine = ` · +${coins} Echo Coins`;
  }

  document.getElementById("emFinalStats").textContent =
    `${emState.moves} moves · ${secs}s` + (isNewBest ? " · New Best! 🏆" : "") + coinsLine;
  document.getElementById("emWinOverlay").classList.remove("attic-hidden");
}


/* ============================================================ */
/* SECTION: MEMORY WHACK-A-MOLE — paste at the bottom of attic.js */
/* ============================================================ */

const WM_HOLE_COUNT = 9;
const WM_ROUND_SECONDS = 30;
const WM_TARGET_HIT_SCORE = 10;
const WM_DECOY_HIT_PENALTY = 5;
const WM_TARGET_SPAWN_CHANCE = 0.55;

let wmTargetMode = "favourite"; // "favourite" | "category"
let wmSelectedCategory = null;
let wmState = null;

async function showWhackHub() {
  const allMemories = await getMemories();
  const categories = [...new Set(allMemories.filter(m => m.category && !m.buried).map(m => m.category))];
  const select = document.getElementById("wmCategorySelect");
  select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
  wmSelectedCategory = categories[0] || null;
  select.onchange = (e) => { wmSelectedCategory = e.target.value; validateWhackStart(); };

  document.getElementById("atticWhackHubScreen").classList.remove("attic-hidden");
  await validateWhackStart();
}

function setWhackTargetMode(mode) {
  wmTargetMode = mode;
  document.getElementById("wmTargetFavBtn").classList.toggle("active", mode === "favourite");
  document.getElementById("wmTargetCatBtn").classList.toggle("active", mode === "category");
  document.getElementById("wmCategorySelect").classList.toggle("attic-hidden", mode !== "category");
  validateWhackStart();
}

async function getWhackPools() {
  const allMemories = await getMemories();
  const active = allMemories.filter(m => !m.buried);
  const matchesTarget = (m) => wmTargetMode === "favourite" ? !!m.favourite : m.category === wmSelectedCategory;
  return {
    targetPool: active.filter(matchesTarget),
    decoyPool: active.filter(m => !matchesTarget(m)),
  };
}

async function validateWhackStart() {
  const { targetPool } = await getWhackPools();
  const note = document.getElementById("wmNotEnoughNote");
  const startBtn = document.getElementById("wmStartBtn");
  if (targetPool.length < 3) {
    note.textContent = wmTargetMode === "favourite"
      ? "You need at least 3 favourited memories to play this mode."
      : "That category needs at least 3 memories to play this mode.";
    note.classList.remove("attic-hidden");
    startBtn.disabled = true;
  } else {
    note.classList.add("attic-hidden");
    startBtn.disabled = false;
  }
}

async function startWhackAMole() {
  const { targetPool, decoyPool } = await getWhackPools();
  document.getElementById("atticWhackHubScreen").classList.add("attic-hidden");
  document.getElementById("atticWhackGameScreen").classList.remove("attic-hidden");
  document.getElementById("wmResultOverlay").classList.add("attic-hidden");
  enterAtticSubscreenMusic("whackAMole");

  const grid = document.getElementById("wmGrid");
  grid.innerHTML = "";
  for (let i = 0; i < WM_HOLE_COUNT; i++) {
    const hole = document.createElement("div");
    hole.className = "wm-hole";
    hole.dataset.holeIndex = i;
    grid.appendChild(hole);
  }

  wmState = {
    targetPool,
    decoyPool: decoyPool.length > 0 ? decoyPool : targetPool, // fallback if literally everything matches the target
    score: 0,
    secondsLeft: WM_ROUND_SECONDS,
    occupiedHoles: new Set(),
    running: true,
    spawnDelay: 1000,
  };

  const bestKey = `whackBest_${wmTargetMode}_${wmTargetMode === "category" ? wmSelectedCategory : ""}`;
  const best = localStorage.getItem(bestKey);
  document.getElementById("wmBest").textContent = best ? `Best: ${best}` : "";
  wmState.bestKey = bestKey;

  updateWmHud();
  wmState.countdownInterval = setInterval(() => tickWhackCountdown(), 1000);
  scheduleWmSpawn();
}

function tickWhackCountdown() {
  wmState.secondsLeft--;
  updateWmHud();
  if (wmState.secondsLeft <= 0) endWhackAMole();
}

function scheduleWmSpawn() {
  if (!wmState || !wmState.running) return;
  setTimeout(() => {
    spawnWmCard();
    // Round speeds up gradually as time passes.
    wmState.spawnDelay = Math.max(500, wmState.spawnDelay - 15);
    scheduleWmSpawn();
  }, wmState.spawnDelay);
}

function spawnWmCard() {
  if (!wmState || !wmState.running) return;
  const freeHoles = [...Array(WM_HOLE_COUNT).keys()].filter(i => !wmState.occupiedHoles.has(i));
  if (freeHoles.length === 0) return;
  const holeIndex = freeHoles[Math.floor(Math.random() * freeHoles.length)];

  const isTarget = Math.random() < WM_TARGET_SPAWN_CHANCE;
  const pool = isTarget ? wmState.targetPool : wmState.decoyPool;
  const memory = pool[Math.floor(Math.random() * pool.length)];
  const photo = memory.image || (memory.images && memory.images[0]);

  wmState.occupiedHoles.add(holeIndex);
  const hole = document.querySelector(`.wm-hole[data-hole-index="${holeIndex}"]`);
  const card = document.createElement("div");
  card.className = "wm-card" + (isTarget ? " wm-target" : "");
  card.innerHTML = photo
    ? `<img src="${photo}" alt="">`
    : `<span class="wm-card-label">${escapeHTML(memory.title || "Untitled")}</span>`;

  card.onclick = () => handleWmCardHit(card, holeIndex, isTarget);
  hole.appendChild(card);
  requestAnimationFrame(() => card.classList.add("wm-visible"));

  const visibleMs = Math.max(600, 1100 - (WM_ROUND_SECONDS - wmState.secondsLeft) * 10);
  wmState.occupiedHoles.add(holeIndex);
  setTimeout(() => removeWmCard(card, holeIndex), visibleMs);
}

function removeWmCard(card, holeIndex) {
  if (!card.isConnected) return;
  card.remove();
  wmState.occupiedHoles.delete(holeIndex);
}

function handleWmCardHit(card, holeIndex, isTarget) {
  if (!wmState || !wmState.running) return;
  wmState.score += isTarget ? WM_TARGET_HIT_SCORE : -WM_DECOY_HIT_PENALTY;
  wmState.score = Math.max(0, wmState.score);
  updateWmHud();
  removeWmCard(card, holeIndex);
}

function updateWmHud() {
  document.getElementById("wmScore").textContent = `Score: ${wmState.score}`;
  document.getElementById("wmTimeLeft").textContent = `${wmState.secondsLeft}s`;
}

function endWhackAMole() {
  wmState.running = false;
  clearInterval(wmState.countdownInterval);
  document.querySelectorAll(".wm-card").forEach(c => c.remove());

  const prevBest = Number(localStorage.getItem(wmState.bestKey) || 0);
  const isNewBest = wmState.score > prevBest;
  if (isNewBest) localStorage.setItem(wmState.bestKey, String(wmState.score));

  const arcadeKey = `whackAMole_${wmState.bestKey}`;
  const arcadeProgress = getArcadeProgress();
  let coinsLine = "";
  if (!arcadeProgress[arcadeKey]) {
    arcadeProgress[arcadeKey] = { coinsEarned: 15 };
    saveArcadeProgress(arcadeProgress);
    coinsLine = " · +15 Echo Coins";
  }

  document.getElementById("wmFinalStats").textContent =
    `Score: ${wmState.score}` + (isNewBest ? " · New Best! 🏆" : "") + coinsLine;
  document.getElementById("wmResultOverlay").classList.remove("attic-hidden");
}


function exitWhackAMole() {
  if (wmState) { wmState.running = false; clearInterval(wmState.countdownInterval); }
  document.getElementById("atticWhackGameScreen").classList.add("attic-hidden");
  showArcadeHub();
}

/* ============================================================ */
/* SECTION: MEMORY MAZE — paste at the bottom of attic.js */
/* ============================================================ */

const MM_STARTING_SPRITE = "🕯️";
const MM_LEVELS = [
  { size: 8,  memoriesNeeded: 4,  monsters: 0, timeBonus: 40, evolution: "🔥", coins: 15 },
  { size: 12, memoriesNeeded: 6,  monsters: 0, timeBonus: 45, evolution: "🏮", coins: 25 },
  { size: 16, memoriesNeeded: 8,  monsters: 1, timeBonus: 55, evolution: "🔦", coins: 35 },
  { size: 20, memoriesNeeded: 10, monsters: 2, timeBonus: 65, evolution: "💡", coins: 50 },
  { size: 24, memoriesNeeded: 12, monsters: 3, timeBonus: 80, evolution: "⭐", coins: 70 },
];
const MM_STARTING_TIME = 90;
const MM_STARTING_LIVES = 3;
const MM_MONSTER_TICK_MS = 450;

let mmState = null;
let mmTimerInterval = null;
let mmMonsterInterval = null;

function startMemoryMaze() {
  document.getElementById("atticArcadeHubScreen").classList.add("attic-hidden");
  document.getElementById("atticMemoryMazeScreen").classList.remove("attic-hidden");
  document.getElementById("mmGameOverOverlay").classList.add("attic-hidden");
  document.getElementById("mmLevelUpOverlay").classList.add("attic-hidden");
  beginMemoryMazeRun();
  window.addEventListener("keydown", mmHandleKeydown);
}


function exitMemoryMaze() {
  stopMemoryMazeRun();
  window.removeEventListener("keydown", mmHandleKeydown);
  document.getElementById("atticMemoryMazeScreen").classList.add("attic-hidden");
  showArcadeHub();
}

function stopMemoryMazeRun() {
  clearInterval(mmTimerInterval);
  clearInterval(mmMonsterInterval);
}

function beginMemoryMazeRun() {
  mmState = {
    levelIndex: 0,
    sprite: MM_STARTING_SPRITE,
    lives: MM_STARTING_LIVES,
    timeLeft: MM_STARTING_TIME,
    collected: 0,
    maze: null,
    cellSize: 0,
    player: { r: 0, c: 0 },
    startCell: { r: 0, c: 0 },
    exitCell: { r: 0, c: 0 },
    icons: [],
    monsters: [],
  };
  mmLoadLevel(0);
  mmTimerInterval = setInterval(mmTickTimer, 1000);
  mmMonsterInterval = setInterval(mmTickMonsters, MM_MONSTER_TICK_MS);
}

function mmLoadLevel(index) {
  const level = MM_LEVELS[index];
  mmState.levelIndex = index;
  mmState.maze = mmGenerateMaze(level.size);
  mmState.startCell = { r: 0, c: 0 };
  mmState.exitCell = { r: level.size - 1, c: level.size - 1 };
  mmState.player = { r: 0, c: 0 };
  mmState.collected = 0;
  mmState.icons = mmPlaceRandomCells(level.size, level.memoriesNeeded, [mmState.startCell, mmState.exitCell]);
  mmState.monsters = mmPlaceRandomCells(
    level.size, level.monsters, [mmState.startCell, mmState.exitCell, ...mmState.icons]
  ).map(cell => ({ r: cell.r, c: cell.c }));

  const maxCanvasPx = 420;
  mmState.cellSize = Math.max(10, Math.floor(maxCanvasPx / level.size));

  document.getElementById("mmLevelNum").textContent = index + 1;
  document.getElementById("mmNeeded").textContent = level.memoriesNeeded;
  document.getElementById("mmCollected").textContent = 0;
  document.getElementById("mmLives").textContent = mmState.lives;
  document.getElementById("mmTimer").textContent = mmState.timeLeft;
  document.getElementById("mmSpriteDisplay").textContent = mmState.sprite;

  mmRender();
}

// --- Maze generation: recursive backtracker ---
function mmGenerateMaze(size) {
  const cells = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      row.push({ N: true, E: true, S: true, W: true, visited: false });
    }
    cells.push(row);
  }
  const stack = [{ r: 0, c: 0 }];
  cells[0][0].visited = true;

  const dirs = [
    { name: "N", dr: -1, dc: 0, opp: "S" },
    { name: "E", dr: 0, dc: 1, opp: "W" },
    { name: "S", dr: 1, dc: 0, opp: "N" },
    { name: "W", dr: 0, dc: -1, opp: "E" },
  ];

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const neighbors = [];
    for (const d of dirs) {
      const nr = cur.r + d.dr, nc = cur.c + d.dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !cells[nr][nc].visited) {
        neighbors.push({ r: nr, c: nc, dir: d });
      }
    }
    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }
    const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
    cells[cur.r][cur.c][chosen.dir.name] = false;
    cells[chosen.r][chosen.c][chosen.dir.opp] = false;
    cells[chosen.r][chosen.c].visited = true;
    stack.push({ r: chosen.r, c: chosen.c });
  }
  return { size, cells };
}

function mmPlaceRandomCells(size, count, avoid) {
  const avoidSet = new Set(avoid.map(a => `${a.r},${a.c}`));
  const picked = [];
  let attempts = 0;
  while (picked.length < count && attempts < count * 50) {
    attempts++;
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    const key = `${r},${c}`;
    if (avoidSet.has(key)) continue;
    if (picked.some(p => p.r === r && p.c === c)) continue;
    picked.push({ r, c });
  }
  return picked;
}

// --- Movement ---
function mmHandleKeydown(e) {
  const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
  if (map[e.key]) {
    e.preventDefault();
    mmMove(map[e.key]);
  }
}

function mmMove(dir) {
  if (!mmState) return;
  const dirMap = {
    up: { wall: "N", dr: -1, dc: 0 },
    down: { wall: "S", dr: 1, dc: 0 },
    left: { wall: "W", dr: 0, dc: -1 },
    right: { wall: "E", dr: 0, dc: 1 },
  };
  const d = dirMap[dir];
  const cell = mmState.maze.cells[mmState.player.r][mmState.player.c];
  if (cell[d.wall]) return; // wall blocks movement

  mmState.player.r += d.dr;
  mmState.player.c += d.dc;

  // Pickup check
  const iconIdx = mmState.icons.findIndex(i => i.r === mmState.player.r && i.c === mmState.player.c);
  if (iconIdx !== -1) {
    mmState.icons.splice(iconIdx, 1);
    mmState.collected++;
    document.getElementById("mmCollected").textContent = mmState.collected;
  }

  mmCheckMonsterCollision();
  mmCheckLevelClear();
  mmRender();
}

function mmCheckLevelClear() {
  const level = MM_LEVELS[mmState.levelIndex];
  const atExit = mmState.player.r === mmState.exitCell.r && mmState.player.c === mmState.exitCell.c;
  if (atExit && mmState.collected >= level.memoriesNeeded) {
    mmAwardLevelCoins(mmState.levelIndex);
    if (mmState.levelIndex >= MM_LEVELS.length - 1) {
      mmEndRun(true);
      return;
    }
    mmState.timeLeft += level.timeBonus;
    mmState.sprite = level.evolution;
    document.getElementById("mmSpriteDisplay").textContent = mmState.sprite;
    document.getElementById("mmTimer").textContent = mmState.timeLeft;
    mmShowLevelUp(level.evolution);
    mmLoadLevel(mmState.levelIndex + 1);
  }
}

function mmShowLevelUp(sprite) {
  document.getElementById("mmLevelUpSprite").textContent = sprite;
  document.getElementById("mmLevelUpText").textContent = "Onward, deeper into the Attic...";
  const overlay = document.getElementById("mmLevelUpOverlay");
  overlay.classList.remove("attic-hidden");
  setTimeout(() => overlay.classList.add("attic-hidden"), 1200);
}

// --- Monsters ---
function mmTickMonsters() {
  if (!mmState) return;
  const level = MM_LEVELS[mmState.levelIndex];
  if (level.monsters === 0) return;

  mmState.monsters.forEach(monster => {
    const nextStep = mmBfsNextStep(mmState.maze, monster, mmState.player);
    if (nextStep) {
      monster.r = nextStep.r;
      monster.c = nextStep.c;
    }
  });
  mmCheckMonsterCollision();
  mmRender();
}

function mmBfsNextStep(maze, from, to) {
  const size = maze.size;
  const visited = new Set([`${from.r},${from.c}`]);
  const queue = [{ r: from.r, c: from.c, path: [] }];
  const dirs = [
    { wall: "N", dr: -1, dc: 0 },
    { wall: "E", dr: 0, dc: 1 },
    { wall: "S", dr: 1, dc: 0 },
    { wall: "W", dr: 0, dc: -1 },
  ];

  while (queue.length) {
    const cur = queue.shift();
    if (cur.r === to.r && cur.c === to.c) {
      return cur.path[0] || from;
    }
    const cell = maze.cells[cur.r][cur.c];
    for (const d of dirs) {
      if (cell[d.wall]) continue;
      const nr = cur.r + d.dr, nc = cur.c + d.dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || visited.has(key)) continue;
      visited.add(key);
      queue.push({ r: nr, c: nc, path: [...cur.path, { r: nr, c: nc }] });
    }
  }
  return null;
}

function mmCheckMonsterCollision() {
  const hit = mmState.monsters.some(m => m.r === mmState.player.r && m.c === mmState.player.c);
  if (hit) mmLoseLife();
}

function mmLoseLife() {
  mmState.lives--;
  document.getElementById("mmLives").textContent = mmState.lives;
  if (mmState.lives <= 0) {
    mmEndRun(false);
    return;
  }
  // Respawn at level start, icons/collected count stay as-is
  mmState.player = { r: mmState.startCell.r, c: mmState.startCell.c };
  mmRender();
}

// --- Timer ---
function mmTickTimer() {
  if (!mmState) return;
  mmState.timeLeft--;
  document.getElementById("mmTimer").textContent = Math.max(0, mmState.timeLeft);
  if (mmState.timeLeft <= 0) mmEndRun(false);
}

// --- Coins ---
function mmAwardLevelCoins(levelIndex) {
  const arcadeKey = `memoryMaze_${levelIndex + 1}`;
  const arcadeProgress = getArcadeProgress();
  if (!arcadeProgress[arcadeKey]) {
    arcadeProgress[arcadeKey] = { coinsEarned: MM_LEVELS[levelIndex].coins };
    saveArcadeProgress(arcadeProgress);
  }
}

// --- End of run ---
function mmEndRun(wonAll) {
  stopMemoryMazeRun();
  const title = wonAll ? "The Maze Yields! 🏆" : "Run Over";
  const stats = wonAll
    ? `You reached the final form ${mmState.sprite} and cleared all 5 levels!`
    : `Reached Level ${mmState.levelIndex + 1} as ${mmState.sprite}.`;
  document.getElementById("mmGameOverTitle").textContent = title;
  document.getElementById("mmGameOverStats").textContent = stats;
  document.getElementById("mmGameOverOverlay").classList.remove("attic-hidden");
}

// --- Rendering ---
function mmRender() {
  const canvas = document.getElementById("mmCanvas");
  const { maze, cellSize, player, icons, monsters, exitCell } = mmState;
  canvas.width = maze.size * cellSize;
  canvas.height = maze.size * cellSize;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#8a5a2b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let r = 0; r < maze.size; r++) {
    for (let c = 0; c < maze.size; c++) {
      const cell = maze.cells[r][c];
      const x = c * cellSize, y = r * cellSize;
      if (cell.N) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
      if (cell.W) { ctx.moveTo(x, y); ctx.lineTo(x, y + cellSize); }
      if (r === maze.size - 1 && cell.S) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x + cellSize, y + cellSize); }
      if (c === maze.size - 1 && cell.E) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
    }
  }
  ctx.stroke();

  const fontSize = Math.max(10, cellSize - 4);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("🚪", exitCell.c * cellSize + cellSize / 2, exitCell.r * cellSize + cellSize / 2);
  icons.forEach(i => ctx.fillText("🧠", i.c * cellSize + cellSize / 2, i.r * cellSize + cellSize / 2));
  monsters.forEach(m => ctx.fillText("👻", m.c * cellSize + cellSize / 2, m.r * cellSize + cellSize / 2));
  ctx.fillText(mmState.sprite, player.c * cellSize + cellSize / 2, player.r * cellSize + cellSize / 2);
}


/* ============================================================ */
/* SECTION: STREAK KEEPER — paste at the bottom of attic.js      */
/* ============================================================ */

const SK_GROUND_Y_RATIO = 0.75;   // ground line as a fraction of canvas height
const SK_GRAVITY = 0.6;
const SK_JUMP_VELOCITY = -10.5;
const SK_SEGMENT_WIDTH = 40;
const SK_GAP_CHANCE = 0.22;
const SK_MAX_GAP_SEGMENTS = 2;    // widest a single gap can be, so it's always jumpable
const SK_START_SPEED = 3;
const SK_MAX_SPEED = 8;
const SK_SPEED_RAMP_PER_SEC = 0.05;
const SK_ORB_SCORE = 5;
const SK_DISTANCE_PER_FRAME_METERS = 0.05;
const SK_OBSTACLE_WIDTH = 14;
const SK_OBSTACLE_HEIGHTS = [28, 42, 56]; // taller ones need a fuller jump to clear
const SK_OBSTACLE_CHANCE = 0.3;

let skCtx = null;
let skCanvas = null;
let skState = null;
let skRafId = null;

function showArcadeStreakKeeper() {
  document.getElementById("atticArcadeHubScreen").classList.add("attic-hidden");
  document.getElementById("atticStreakKeeperScreen").classList.remove("attic-hidden");
  document.getElementById("skStartOverlay").classList.remove("attic-hidden");
  document.getElementById("skGameOverOverlay").classList.add("attic-hidden");
  enterAtticSubscreenMusic("streakKeeper");

  skCanvas = document.getElementById("skCanvas");
  const wrap = document.getElementById("skGameWrap");
  skCanvas.width = wrap.clientWidth;
  skCanvas.height = wrap.clientHeight;
  skCtx = skCanvas.getContext("2d");

  skCanvas.addEventListener("click", handleSkJumpInput);
  document.addEventListener("keydown", handleSkKeydown);
}

function exitStreakKeeper() {
  stopStreakKeeperRun();
  if (skCanvas) skCanvas.removeEventListener("click", handleSkJumpInput);
  document.removeEventListener("keydown", handleSkKeydown);
  document.getElementById("atticStreakKeeperScreen").classList.add("attic-hidden");
  showArcadeHub();
}

function handleSkKeydown(e) {
  if (e.code === "Space") { e.preventDefault(); handleSkJumpInput(); }
}

function handleSkJumpInput() {
  if (!skState || !skState.running) return;
  if (skState.player.onGround) {
    skState.player.vy = SK_JUMP_VELOCITY;
    skState.player.onGround = false;
  }
}

const SK_EVOLUTION_STAGES = [
  { distance: 0,    sprite: "🔥" },
  { distance: 250,  sprite: "🕯️" },
  { distance: 500,  sprite: "🏮" },
  { distance: 800,  sprite: "🔦" },
  { distance: 1200, sprite: "💡" },
  { distance: 1700, sprite: "⭐" },
];

function beginStreakKeeperRun() {
  document.getElementById("skStartOverlay").classList.add("attic-hidden");
  document.getElementById("skGameOverOverlay").classList.add("attic-hidden");

  const groundY = skCanvas.height * SK_GROUND_Y_RATIO;
  skState = {
    running: true,
    speed: SK_START_SPEED,
    groundY,
    segments: [],      // { x, solid }
    orbs: [],          // { x, y, collected }
    obstacles: [],     // { x, height, passed }
    player: { x: skCanvas.width * 0.25, y: groundY - 18, prevY: groundY - 18, vy: 0, size: 16, onGround: true },
    scrollX: 0,
    distance: 0,
    score: 0,
    startTime: Date.now(),
    evolutionStage: 0,
    sprite: SK_EVOLUTION_STAGES[0].sprite,
  };

  // Pre-fill the ground with solid segments so the run starts safely.
  let x = 0;
  while (x < skCanvas.width + SK_SEGMENT_WIDTH * 4) {
    skState.segments.push({ x, solid: true });
    x += SK_SEGMENT_WIDTH;
  }

  updateSkHud();
  skRafId = requestAnimationFrame(skGameLoop);
}

function stopStreakKeeperRun() {
  if (skState) skState.running = false;
  if (skRafId) cancelAnimationFrame(skRafId);
}

function skGameLoop() {
  if (!skState || !skState.running) return;

  const elapsedSec = (Date.now() - skState.startTime) / 1000;
  skState.speed = Math.min(SK_MAX_SPEED, SK_START_SPEED + elapsedSec * SK_SPEED_RAMP_PER_SEC);

  // Scroll world left.
  skState.segments.forEach(s => s.x -= skState.speed);
  skState.orbs.forEach(o => o.x -= skState.speed);
  skState.obstacles.forEach(o => o.x -= skState.speed);
  skState.segments = skState.segments.filter(s => s.x > -SK_SEGMENT_WIDTH);
  skState.orbs = skState.orbs.filter(o => o.x > -20 && !o.collected);
  skState.obstacles = skState.obstacles.filter(o => o.x > -SK_OBSTACLE_WIDTH);

  // Spawn new segments/orbs at the right edge.
  const rightmost = skState.segments.length > 0 ? skState.segments[skState.segments.length - 1].x : 0;
  if (rightmost < skCanvas.width + SK_SEGMENT_WIDTH * 3) {
    spawnSkSegmentRun();
  }

  // Player physics.
  const p = skState.player;
  p.prevY = p.y;
  p.vy += SK_GRAVITY;
  p.y += p.vy;

  const feetY = p.y + p.size;
  const prevFeetY = p.prevY + p.size;
  const groundLineY = skState.groundY;

  // Only attempt a landing on the exact frame the player's feet cross the ground line while
  // falling — checking "is ground solid right now" on every frame is what let a newly-scrolled-in
  // solid segment silently catch the player mid-fall at high speed.
  if (p.vy >= 0 && prevFeetY <= groundLineY && feetY >= groundLineY) {
    if (isSkGroundSolidAt(p.x)) {
      p.y = groundLineY - p.size;
      p.vy = 0;
      p.onGround = true;
    } else {
      p.onGround = false; // genuinely falling through a gap now — no more landing checks until game over
    }
  } else if (feetY < groundLineY) {
    p.onGround = false;
  }

  // Fell through a gap = game over.
  if (p.y > skCanvas.height + 40) {
    endStreakKeeperRun();
    return;
  }

  // Raised-block collision: hitting one without jumping high enough ends the run immediately.
  for (const obs of skState.obstacles) {
    if (obs.passed) continue;
    const playerRight = p.x + p.size;
    const obsRight = obs.x + SK_OBSTACLE_WIDTH;
    const horizontalOverlap = playerRight > obs.x && p.x < obsRight;
    if (horizontalOverlap) {
      const topOfObstacle = skState.groundY - obs.height;
      if (feetY > topOfObstacle) {
        endStreakKeeperRun();
        return;
      }
    }
    if (obsRight < p.x) obs.passed = true;
  }

  // Orb collection.
  skState.orbs.forEach(o => {
    if (o.collected) return;
    const dx = (p.x + p.size / 2) - o.x;
    const dy = (p.y + p.size / 2) - o.y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      o.collected = true;
      skState.score += SK_ORB_SCORE;
    }
  });

  skState.distance += skState.speed * SK_DISTANCE_PER_FRAME_METERS;
  skCheckEvolution();
  updateSkHud();
  drawSkFrame();

  skRafId = requestAnimationFrame(skGameLoop);
}

function spawnSkSegmentRun() {
  const lastX = skState.segments.length > 0
    ? skState.segments[skState.segments.length - 1].x + SK_SEGMENT_WIDTH
    : skCanvas.width;

  const makeGap = Math.random() < SK_GAP_CHANCE;
  const gapLength = makeGap ? 1 + Math.floor(Math.random() * SK_MAX_GAP_SEGMENTS) : 0;

  for (let i = 0; i < 6; i++) {
    const solid = !(makeGap && i < gapLength);
    skState.segments.push({ x: lastX + i * SK_SEGMENT_WIDTH, solid });
  }

  // Occasionally place a collectible orb above the ground in this run.
  if (Math.random() < 0.4) {
    skState.orbs.push({
      x: lastX + 2 * SK_SEGMENT_WIDTH,
      y: skState.groundY - 55 - Math.random() * 30,
      collected: false,
    });
  }

  // Occasionally place a raised block that must be jumped over — only on a fully solid run,
  // never straddling a gap, so it's always fair.
  if (!makeGap && Math.random() < SK_OBSTACLE_CHANCE) {
    const height = SK_OBSTACLE_HEIGHTS[Math.floor(Math.random() * SK_OBSTACLE_HEIGHTS.length)];
    skState.obstacles.push({ x: lastX + 3 * SK_SEGMENT_WIDTH, height, passed: false });
  }
}

function isSkGroundSolidAt(x) {
  const seg = skState.segments.find(s => x >= s.x && x < s.x + SK_SEGMENT_WIDTH);
  return seg ? seg.solid : false;
}

function drawSkFrame() {
  const ctx = skCtx;
  ctx.clearRect(0, 0, skCanvas.width, skCanvas.height);

  // Ground segments.
  skState.segments.forEach(s => {
    if (!s.solid) return;
    ctx.fillStyle = "#3a1e12";
    ctx.fillRect(s.x, skState.groundY, SK_SEGMENT_WIDTH + 1, skCanvas.height - skState.groundY);
    ctx.fillStyle = "#fb923c";
    ctx.fillRect(s.x, skState.groundY, SK_SEGMENT_WIDTH + 1, 3);
  });

  // Orbs.
  skState.orbs.forEach(o => {
    if (o.collected) return;
    ctx.beginPath();
    ctx.fillStyle = "#a78bfa";
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 8;
    ctx.arc(o.x, o.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Raised-block obstacles.
  skState.obstacles.forEach(o => {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(o.x, skState.groundY - o.height, SK_OBSTACLE_WIDTH, o.height);
  });

  // Player (evolving sprite).
  const p = skState.player;
  ctx.font = `${p.size * 1.6}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.fillText(skState.sprite, p.x, p.y + p.size / 2);
}

function updateSkHud() {
  document.getElementById("skDistance").textContent = `${Math.floor(skState.distance)}m`;
  document.getElementById("skScore").textContent = `Score: ${skState.score}`;
}

function skCheckEvolution() {
  const nextStage = skState.evolutionStage + 1;
  if (nextStage >= SK_EVOLUTION_STAGES.length) return;
  if (skState.distance >= SK_EVOLUTION_STAGES[nextStage].distance) {
    skState.evolutionStage = nextStage;
    skState.sprite = SK_EVOLUTION_STAGES[nextStage].sprite;
    skShowEvolutionPulse();
  }
}

function skShowEvolutionPulse() {
  const banner = document.getElementById("skEvolveBanner");
  if (!banner) return;
  banner.textContent = `${skState.sprite} Evolved!`;
  banner.classList.remove("attic-hidden");
  banner.classList.remove("sk-evolve-pulse");
  void banner.offsetWidth; // restart animation
  banner.classList.add("sk-evolve-pulse");
  setTimeout(() => banner.classList.add("attic-hidden"), 1000);
}

function endStreakKeeperRun() {
  skState.running = false;
  cancelAnimationFrame(skRafId);

  const prevBest = Number(localStorage.getItem("streakKeeperBestDistance") || 0);
  const distanceRounded = Math.floor(skState.distance);
  const isNewBest = distanceRounded > prevBest;
  if (isNewBest) localStorage.setItem("streakKeeperBestDistance", String(distanceRounded));

  const currentStreak = Number(localStorage.getItem("currentStreak") || 0); // best-effort read; harmless if key differs
  let streakLine = "";
  if (currentStreak > 0) {
    streakLine = distanceRounded >= currentStreak
      ? ` · You outran your ${currentStreak}-day streak! 🔥`
      : ` · Your real streak is ${currentStreak} days — beat it next run!`;
  }

  const arcadeProgress = getArcadeProgress();
  let coinsLine = "";
  if (!arcadeProgress.streakKeeper) {
    arcadeProgress.streakKeeper = { coinsEarned: 15 };
    saveArcadeProgress(arcadeProgress);
    coinsLine = " · +15 Echo Coins";
  }

  document.getElementById("skFinalStats").textContent =
    `${distanceRounded}m · Score: ${skState.score}` + (isNewBest ? " · New Best! 🏆" : "") + streakLine + coinsLine;
  document.getElementById("skGameOverOverlay").classList.remove("attic-hidden");
}



/* ============================================================ */
/* SECTION: DEV MUSEUM — paste at the bottom of attic.js         */
/* ============================================================ */

const MUSEUM_TIMELINE = [
  { phase: "Foundation", desc: "Core memory CRUD, PIN lock, categories." },
  { phase: "Growth", desc: "Timeline view, search & filters, favorites, voice notes." },
  { phase: "Recognition", desc: "Achievement System — 79 achievements across 8 categories." },
  { phase: "Depth", desc: "Multi-photo support, photo compression, Dashboard insights." },
  { phase: "Personalization", desc: "Theme system, name capture, daily reminders." },
  { phase: "The Attic", desc: "Library of Wonders, Riddle Den, Time Chamber, Founders Hall, Puzzle Workshop, Game Arcade, Dev Museum." },
];

const MUSEUM_BUGS = [
  { title: "The great position:fixed leak", desc: "A lingering transform on ancestors from .fade-in broke position:fixed for both the Attic and the achievement modal." },
  { title: "PIN comparison bypass", desc: "Change PIN and Delete-All-via-PIN compared raw entered PINs directly against the stored hash instead of using checkPINMatch()." },
  { title: "The Settings leak", desc: "A Settings HTML nesting bug leaked Backup/Security/Recovery cards onto every single page." },
  { title: "Achievement amnesia", desc: "loadAchievements() wasn't re-syncing static fields onto already-saved progress, so new categories silently failed to appear." },
  { title: "The duplicate declaration", desc: "A re-pasted Puzzle Workshop block under an unremoved old copy broke parsing of the entire attic.js file with a single duplicate `const`." },
  { title: "The momentum recatch", desc: "Streak Keeper's landing check re-triggered every frame instead of only on the crossing frame — at high speed, gaps became impossible to fail." },
];

// A mix of always-visible ones (about the app) and click-to-reveal ones (little dev trivia).
const MUSEUM_SECRETS = [
  { id: "secret_riddles", label: "🎁 The Riddle Den has hint tiers — using more hints reduces your Echo Coins.", revealText: null },
  { id: "secret_solvable", label: "🎁 Every puzzle & word game is built to guarantee it's solvable — no impossible boards.", revealText: null },
  { id: "secret_candles", label: "🕯️ Why candles?", revealText: "Lives, reminders, and vault icons all use the candle motif — something small that keeps burning, on purpose." },
  { id: "secret_coins", label: "🪙 Are Echo Coins real?", revealText: "Not yet — they're cosmetic for now. A real spendable economy is still just an idea." },
  { id: "secret_local", label: "🔒 Where does your data live?", revealText: "Nowhere but this device. No account, no cloud, no server — that's a deliberate choice, not a missing feature." },
];

const MUSEUM_FIRST_VISIT_COINS = 15;
const MUSEUM_SECRET_COINS = 3;

function getMuseumProgress() {
  try { return JSON.parse(localStorage.getItem("atticMuseumProgress") || "{}"); }
  catch (e) { return {}; }
}


// --- Arcade progress storage (localStorage, same pattern as Riddle/Puzzle progress) ---
function getArcadeProgress() {
  try { return JSON.parse(localStorage.getItem("atticArcadeProgress") || "{}"); }
  catch (e) { return {}; }
}
function saveArcadeProgress(all) {
  localStorage.setItem("atticArcadeProgress", JSON.stringify(all));
}


/* ============================================================ */
/* SECTION: ATTIC CURRENCY WALLET */
/* ============================================================ */

function getAtticBalance() {
  let total = 0;

  // Riddle Den — keyed object, one entry per riddle
  const riddleProgress = Object.values(JSON.parse(localStorage.getItem("atticRiddleProgress") || "{}"));
  riddleProgress.forEach(r => { total += r.coinsEarned || 0; });

  // Puzzle Workshop — keyed object, one entry per image+size combo
  const puzzleProgress = Object.values(JSON.parse(localStorage.getItem("atticPuzzleProgress") || "{}"));
  puzzleProgress.forEach(p => { total += p.coinsEarned || 0; });

  // Dev Museum — single flat object, not keyed
  const museumProgress = JSON.parse(localStorage.getItem("atticMuseumProgress") || "{}");
  total += museumProgress.coinsFromFirstVisit || 0;
  total += museumProgress.coinsFromSecrets || 0;

  // Arcade — one entry per game/mode/grid-size combo
  const arcadeProgress = Object.values(JSON.parse(localStorage.getItem("atticArcadeProgress") || "{}"));
  arcadeProgress.forEach(a => { total += a.coinsEarned || 0; });
  

  return total;
}

function getAtticSpent() {
  return parseInt(localStorage.getItem("atticCurrencySpent") || "0", 10);
}

function getAtticAvailable() {
  return getAtticBalance() - getAtticSpent();
}

function canAffordAttic(amount) {
  return getAtticAvailable() >= amount;
}

function spendAttic(amount) {
  if (!canAffordAttic(amount)) return false;
  localStorage.setItem("atticCurrencySpent", String(getAtticSpent() + amount));
  return true;
}



function saveMuseumProgress(p) {
  localStorage.setItem("atticMuseumProgress", JSON.stringify(p));
}

async function showDevMuseum() {
  document.getElementById("atticDevMuseumScreen").classList.remove("attic-hidden");
  renderMuseumTimeline();
  await renderMuseumStats();
  renderMuseumBugWall();
  renderMuseumSecrets();
  handleMuseumFirstVisit();
}

function renderMuseumTimeline() {
  const wrap = document.getElementById("museumTimeline");
  wrap.innerHTML = MUSEUM_TIMELINE.map(item => `
    <div class="museum-timeline-item">
      <div class="museum-timeline-phase">${item.phase}</div>
      <div class="museum-timeline-desc">${item.desc}</div>
    </div>
  `).join("");
}

async function renderMuseumStats() {
  const memories = (await getMemories()).filter(m => !m.buried);
  const totalMemories = memories.length;
  const totalWords = memories.reduce((sum, m) => sum + ((m.description || "").trim().split(/\s+/).filter(Boolean).length), 0);
  const totalPhotos = memories.reduce((sum, m) => sum + ((m.images && m.images.length) || (m.image ? 1 : 0)), 0);
  const totalFavourites = memories.filter(m => m.favourite).length;

  const riddleProgress = Object.values(JSON.parse(localStorage.getItem("atticRiddleProgress") || "{}"));
  const riddlesSolved = riddleProgress.filter(r => r.solved).length;

  const puzzleProgress = Object.values(JSON.parse(localStorage.getItem("atticPuzzleProgress") || "{}"));
  const puzzlesSolved = puzzleProgress.length;

  const stats = [
    { value: totalMemories, label: "Memories Preserved" },
    { value: totalWords.toLocaleString(), label: "Words Written" },
    { value: totalPhotos, label: "Photos Stored" },
    { value: totalFavourites, label: "Favourites" },
    { value: riddlesSolved, label: "Riddles Solved" },
    { value: puzzlesSolved, label: "Puzzles Completed" },
  ];

  document.getElementById("museumStats").innerHTML = stats.map(s => `
    <div class="museum-stat-card">
      <div class="museum-stat-value">${s.value}</div>
      <div class="museum-stat-label">${s.label}</div>
    </div>
  `).join("");
}

function renderMuseumBugWall() {
  document.getElementById("museumBugWall").innerHTML = MUSEUM_BUGS.map(b => `
    <div class="museum-bug-item"><strong>${b.title}</strong> — ${b.desc}</div>
  `).join("");
}

function renderMuseumSecrets() {
  const progress = getMuseumProgress();
  const revealed = progress.revealedSecrets || [];

  document.getElementById("museumSecrets").innerHTML = MUSEUM_SECRETS.map(s => {
    const isRevealable = !!s.revealText;
    const isRevealed = !isRevealable || revealed.includes(s.id);
    const displayText = isRevealed ? (s.revealText || s.label) : "🔒 Tap to reveal";
    return `
      <div class="museum-secret-card ${isRevealed ? "revealed" : ""}" onclick="handleMuseumSecretTap('${s.id}')">
        <span class="${isRevealed ? "" : "museum-secret-locked-label"}">${isRevealed ? (s.revealText ? s.label + " — " + s.revealText : s.label) : displayText}</span>
      </div>
    `;
  }).join("");
}

function handleMuseumSecretTap(secretId) {
  const secret = MUSEUM_SECRETS.find(s => s.id === secretId);
  if (!secret || !secret.revealText) return; // always-visible ones aren't tappable rewards

  const progress = getMuseumProgress();
  progress.revealedSecrets = progress.revealedSecrets || [];
  if (progress.revealedSecrets.includes(secretId)) return; // already claimed

  progress.revealedSecrets.push(secretId);
  progress.coinsFromSecrets = (progress.coinsFromSecrets || 0) + MUSEUM_SECRET_COINS;
  saveMuseumProgress(progress);
  renderMuseumSecrets();
  showToast(`🎉 +${MUSEUM_SECRET_COINS} Echo Coins`);
}

function handleMuseumFirstVisit() {
  const progress = getMuseumProgress();
  if (progress.firstVisitClaimed) return;
  progress.firstVisitClaimed = true;
  progress.coinsFromFirstVisit = MUSEUM_FIRST_VISIT_COINS;
  saveMuseumProgress(progress);
  showToast(`🏛️ Welcome to the Dev Museum! +${MUSEUM_FIRST_VISIT_COINS} Echo Coins`);
}




/* ============================================================ */
/* SECTION: ATTIC SOUNDTRACK SYSTEM — paste at the bottom of attic.js */
/* ============================================================ */

const ATTIC_AUDIO_BASE = "Attic/audio/";
const ATTIC_HUB_TRACKS = [
  `${ATTIC_AUDIO_BASE}hub-1.mp3`,
  `${ATTIC_AUDIO_BASE}hub-2.mp3`,
  `${ATTIC_AUDIO_BASE}hub-3.mp3`,
  `${ATTIC_AUDIO_BASE}hub-4.mp3`,
  `${ATTIC_AUDIO_BASE}hub-5.mp3`,
];
// "music" (Music Corner) deliberately has no ambient track — see note in chat.
const ATTIC_ROOM_TRACKS = {
  wonders: `${ATTIC_AUDIO_BASE}room-wonders.mp3`,
  riddles: `${ATTIC_AUDIO_BASE}room-riddles.mp3`,
  timechamber: `${ATTIC_AUDIO_BASE}room-timechamber.mp3`, // Time Chamber's own hub screen only — Bury/Send have their own, see below
  founders: `${ATTIC_AUDIO_BASE}room-founders.mp3`,
  puzzle: `${ATTIC_AUDIO_BASE}room-puzzle.mp3`,
  arcade: `${ATTIC_AUDIO_BASE}room-arcade.mp3`, // the Arcade's own game-selection hub only — each game has its own, see below
  museum: `${ATTIC_AUDIO_BASE}room-museum.mp3`,
};

// Sub-screens that get their own track instead of inheriting their parent room's.
const ATTIC_SUBSCREEN_TRACKS = {
  bury: `${ATTIC_AUDIO_BASE}timechamber-bury.mp3`,
  send: `${ATTIC_AUDIO_BASE}timechamber-send.mp3`,
  memoryFalls: `${ATTIC_AUDIO_BASE}game-memoryfalls.mp3`,
  echoMatch: `${ATTIC_AUDIO_BASE}game-echomatch.mp3`,
  whackAMole: `${ATTIC_AUDIO_BASE}game-whackamole.mp3`,
  streakKeeper: `${ATTIC_AUDIO_BASE}game-streakkeeper.mp3`,
};

// One-shot sound effects — a completely separate system from the looping crossfade
// tracks above. These play once and don't touch atticActiveAudio/atticInactiveAudio.
const ATTIC_SFX = {
  "door-creak": `${ATTIC_AUDIO_BASE}sfx-door-creak.mp3`,
};

const ATTIC_DEFAULT_VOLUME = 0.45;
const ATTIC_FADE_MS = 900;

let atticUserVolume = parseFloat(localStorage.getItem("atticMusicVolume"));
if (isNaN(atticUserVolume)) atticUserVolume = ATTIC_DEFAULT_VOLUME;

// Two audio elements so we can crossfade between them — one always fading out
// while the other fades in, instead of a hard cut.
const atticAudioA = new Audio();
const atticAudioB = new Audio();
[atticAudioA, atticAudioB].forEach(a => { a.loop = true; a.volume = 0; });

let atticActiveAudio = atticAudioA;
let atticInactiveAudio = atticAudioB;
let atticCurrentTrackSrc = null;
let atticMuted = localStorage.getItem("atticMusicMuted") === "true";
let atticFadeRafId = null;

function getAtticSelectedHubTrack() {
  const saved = localStorage.getItem("atticSelectedHubTrack");
  if (saved && ATTIC_HUB_TRACKS.includes(saved)) return saved;
  return ATTIC_HUB_TRACKS[Math.floor(Math.random() * ATTIC_HUB_TRACKS.length)];
}

function crossfadeAtticTrack(src) {
  if (!src) return;
  const alreadyPlayingThis = src === atticCurrentTrackSrc && !atticActiveAudio.paused;
  if (alreadyPlayingThis) return;
  atticCurrentTrackSrc = src;
  if (atticFadeRafId) cancelAnimationFrame(atticFadeRafId);

  const outgoing = atticActiveAudio;
  const incoming = atticInactiveAudio;

  incoming.src = src;
  incoming.volume = 0;
  incoming.currentTime = 0;
  if (!atticMuted) {
    // Autoplay can be blocked (e.g. this call happening outside a "fresh enough"
    // user gesture). If so, this fails silently and the play/pause button will
    // correctly show ▶️ afterward — tapping it directly always works, since a
    // direct tap is unambiguously a real gesture.
    incoming.play().catch(() => {}).finally(updateAtticControlButtons);
  }

  const startTime = performance.now();
  const targetVol = atticMuted ? 0 : atticUserVolume;
  const outgoingStartVol = outgoing.volume;

  function step(now) {
    const t = Math.max(0, Math.min((now - startTime) / ATTIC_FADE_MS, 1));
    outgoing.volume = outgoingStartVol * (1 - t);
    incoming.volume = targetVol * t;
    if (t < 1) {
      atticFadeRafId = requestAnimationFrame(step);
    } else {
      outgoing.pause();
      atticActiveAudio = incoming;
      atticInactiveAudio = outgoing;
      updateAtticDiscHighlight();
      updateAtticControlButtons();
    }
  }
  atticFadeRafId = requestAnimationFrame(step);
}

function startAtticHubMusic() {
  renderAtticHubDiscs();
  crossfadeAtticTrack(getAtticSelectedHubTrack());
  updateAtticControlButtons();
}

function selectAtticHubTrack(src) {
  localStorage.setItem("atticSelectedHubTrack", src);
  crossfadeAtticTrack(src);
}

function enterAtticRoomMusic(roomKey) {
  const src = ATTIC_ROOM_TRACKS[roomKey];
  if (!src) return; // Music Corner (or any room without a track) — leave whatever's playing as-is
  crossfadeAtticTrack(src);
}

function enterAtticSubscreenMusic(subscreenKey) {
  const src = ATTIC_SUBSCREEN_TRACKS[subscreenKey];
  if (!src) return;
  crossfadeAtticTrack(src);
}

function playAtticSfx(name) {
  const src = ATTIC_SFX[name];
  if (!src) return;
  const sfx = new Audio(src); // separate one-off element — never touches the looping crossfade tracks
  sfx.volume = 0.6;
  sfx.play().catch(() => {});
}

function returnToAtticHubMusic() {
  crossfadeAtticTrack(getAtticSelectedHubTrack());
}

function toggleAtticMusicMute() {
  atticMuted = !atticMuted;
  localStorage.setItem("atticMusicMuted", String(atticMuted));
  applyAtticVolumeNow();
  updateAtticControlButtons();
}

function toggleAtticMusicPlayPause() {
  if (atticActiveAudio.paused) {
    atticActiveAudio.play().catch(() => {});
  } else {
    atticActiveAudio.pause();
  }
  updateAtticControlButtons();
}

function setAtticMusicVolume(sliderValue) {
  atticUserVolume = Math.max(0, Math.min(Number(sliderValue) / 100, 1));
  localStorage.setItem("atticMusicVolume", String(atticUserVolume));
  if (atticUserVolume > 0 && atticMuted) {
    atticMuted = false; // moving the slider up out of mute feels more natural than staying silent
    localStorage.setItem("atticMusicMuted", "false");
  }
  applyAtticVolumeNow();
  updateAtticControlButtons();
}

function applyAtticVolumeNow() {
  if (atticFadeRafId) cancelAnimationFrame(atticFadeRafId); // don't fight an in-progress fade
  atticActiveAudio.volume = atticMuted ? 0 : atticUserVolume;
}

function updateAtticControlButtons() {
  const muteBtn = document.getElementById("atticMusicMuteBtn");
  if (muteBtn) muteBtn.textContent = atticMuted ? "🔇" : "🔊";

  const playPauseBtn = document.getElementById("atticMusicPlayPauseBtn");
  if (playPauseBtn) playPauseBtn.textContent = atticActiveAudio.paused ? "▶️" : "⏸️";

  const slider = document.getElementById("atticMusicVolumeSlider");
  if (slider) slider.value = Math.round(atticUserVolume * 100);
}

function renderAtticHubDiscs() {
  const row = document.getElementById("atticHubDiscRow");
  if (!row) return;
  row.innerHTML = ATTIC_HUB_TRACKS.map(src => `
    <div class="attic-disc" data-src="${src}" onclick="selectAtticHubTrack('${src}')"></div>
  `).join("");
  updateAtticDiscHighlight();
}

function updateAtticDiscHighlight() {
  document.querySelectorAll(".attic-disc").forEach(el => {
    el.classList.toggle("attic-disc-active", el.dataset.src === atticCurrentTrackSrc);
  });
}

/* ============================================================ */
/* SECTION: MUSIC CORNER — paste at the bottom of attic.js       */
/* ============================================================ */

let mcTracks = [];
let mcCurrentIndex = -1;
let mcAudioEl = null;
let mcAudioCtx = null;
let mcAnalyser = null;
let mcVisualizerRafId = null;
let mcWasHubPlayingBeforeTrack = false;

async function showMusicCorner() {
  document.getElementById("atticMusicCornerScreen").classList.remove("attic-hidden");
  await loadMixtapeTracks();
  renderMixtapeTrackList();
  setupMixtapeAudioIfNeeded();
  renderImportSection();
}


/* ============================================================ */
/* SECTION: MUSIC CORNER — TRACK IMPORT */
/* ============================================================ */

const IMPORTABLE_TRACKS = [
  { id: "hub-1", label: "Hub Ambient I", price: 150 },
  { id: "hub-2", label: "Hub Ambient II", price: 150 },
  { id: "hub-3", label: "Hub Ambient III", price: 150 },
  { id: "hub-4", label: "Hub Ambient IV", price: 150 },
  { id: "hub-5", label: "Hub Ambient V", price: 150 },
  { id: "room-wonders", label: "Library of Wonders Theme", price: 150 },
  { id: "room-riddles", label: "Riddle Den Theme", price: 150 },
  { id: "room-timechamber", label: "Time Chamber Theme", price: 150 },
  { id: "room-founders", label: "Founders Hall Theme", price: 150 },
  { id: "room-puzzle", label: "Puzzle Workshop Theme", price: 150 },
  { id: "room-arcade", label: "Game Arcade Theme", price: 150 },
  { id: "room-museum", label: "Dev Museum Theme", price: 150 },
  { id: "timechamber-bury", label: "Bury a Memory Theme", price: 150 },
  { id: "timechamber-send", label: "Send to Future Theme", price: 150 },
  { id: "game-memoryfalls", label: "Memory Falls Theme", price: 150 },
  { id: "game-echomatch", label: "Echo Match Theme", price: 150 },
  { id: "game-whackamole", label: "Whack-a-Mole Theme", price: 150 },
  { id: "game-streakkeeper", label: "Streak Keeper Theme", price: 150 },
];

function getImportedTracks() {
  try { return JSON.parse(localStorage.getItem("atticImportedTracks") || "[]"); }
  catch (e) { return []; }
}

function saveImportedTracks(list) {
  localStorage.setItem("atticImportedTracks", JSON.stringify(list));
}

function renderImportSection() {
  document.getElementById("mcImportBalance").textContent = getAtticAvailable();

  const owned = getImportedTracks();
  const container = document.getElementById("mcImportTrackList");
  container.innerHTML = IMPORTABLE_TRACKS.map(t => {
    const isOwned = owned.includes(t.id);
    const canAfford = canAffordAttic(t.price);
    let actionHtml;
    if (isOwned) {
      actionHtml = `<span class="mc-import-owned">✅ Imported</span>`;
    } else {
      actionHtml = `<button class="mc-import-btn" ${canAfford ? "" : "disabled"} onclick="handleImportTrack('${t.id}')">${t.price} 🪙</button>`;
    }
    return `<div class="mc-import-row"><span>${t.label}</span>${actionHtml}</div>`;
  }).join("");
}

function handleImportTrack(trackId) {
  const track = IMPORTABLE_TRACKS.find(t => t.id === trackId);
  if (!track) return;
  const owned = getImportedTracks();
  if (owned.includes(trackId)) return;

  if (!spendAttic(track.price)) {
    showToast("Not enough Attic Currency yet.", "error");
    return;
  }

  owned.push(trackId);
  saveImportedTracks(owned);
  showToast(`🎵 "${track.label}" imported!`, "success");
  renderImportSection();
}


function exitMusicCorner() {
  pauseMixtapeTrack();
  document.getElementById("atticMusicCornerScreen").classList.add("attic-hidden");
  showAtticHub();
}

async function loadMixtapeTracks() {
  const allMemories = await getMemories();
  mcTracks = allMemories
    .filter(m => m.voice && !m.buried)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderMixtapeTrackList() {
  const list = document.getElementById("mcTrackList");
  if (mcTracks.length === 0) {
    list.innerHTML = "<p class='mc-empty-note'>No voice notes in your vault yet — record one on a memory to see it here.</p>";
    return;
  }
  list.innerHTML = mcTracks.map((m, i) => `
    <div class="mc-track-row ${i === mcCurrentIndex ? "mc-track-active" : ""}" onclick="playMixtapeTrack(${i})">
      <span class="mc-track-title">${escapeHTML(m.title || "Untitled")}</span>
      <span class="mc-track-date">${new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
    </div>
  `).join("");
}

// The AnalyserNode graph can only be built once per <audio> element — build it
// once, lazily, and just swap .src on subsequent track changes.
function setupMixtapeAudioIfNeeded() {
  if (mcAudioEl) return;
  mcAudioEl = new Audio();
  mcAudioEl.addEventListener("ended", playNextMixtapeTrack);

  mcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = mcAudioCtx.createMediaElementSource(mcAudioEl);
  mcAnalyser = mcAudioCtx.createAnalyser();
  mcAnalyser.fftSize = 128;
  source.connect(mcAnalyser);
  mcAnalyser.connect(mcAudioCtx.destination);
}

function playMixtapeTrack(index) {
  if (index < 0 || index >= mcTracks.length) return;
  mcCurrentIndex = index;
  const track = mcTracks[index];

  setupMixtapeAudioIfNeeded();
  duckAtticAmbientForMixtape();

  mcAudioEl.src = track.voice;
  mcAudioEl.play().catch(() => {});
  if (mcAudioCtx.state === "suspended") mcAudioCtx.resume();

  document.getElementById("mcNowPlaying").textContent = `Now playing: ${track.title || "Untitled"}`;
  document.getElementById("mcPlayPauseBtn").textContent = "⏸️";
  renderMixtapeTrackList();
  startMixtapeVisualizer();
}

function toggleMixtapePlayPause() {
  if (!mcAudioEl || mcCurrentIndex === -1) {
    if (mcTracks.length > 0) playMixtapeTrack(0);
    return;
  }
  if (mcAudioEl.paused) {
    mcAudioEl.play().catch(() => {});
    duckAtticAmbientForMixtape();
    startMixtapeVisualizer();
  } else {
    pauseMixtapeTrack();
  }
  document.getElementById("mcPlayPauseBtn").textContent = mcAudioEl.paused ? "▶️" : "⏸️";
}

function pauseMixtapeTrack() {
  if (mcAudioEl) mcAudioEl.pause();
  restoreAtticAmbientAfterMixtape();
  if (document.getElementById("mcPlayPauseBtn")) {
    document.getElementById("mcPlayPauseBtn").textContent = "▶️";
  }
}

function playNextMixtapeTrack() {
  if (mcTracks.length === 0) return;
  playMixtapeTrack((mcCurrentIndex + 1) % mcTracks.length);
}
function playPrevMixtapeTrack() {
  if (mcTracks.length === 0) return;
  playMixtapeTrack((mcCurrentIndex - 1 + mcTracks.length) % mcTracks.length);
}

// Music Corner has no ambient track of its own, so whatever hub track is
// already playing keeps going underneath the room — pause it while an actual
// voice note is playing so they don't clash, resume it when playback stops.
function duckAtticAmbientForMixtape() {
  if (!atticActiveAudio.paused) {
    mcWasHubPlayingBeforeTrack = true;
    atticActiveAudio.pause();
  }
}
function restoreAtticAmbientAfterMixtape() {
  if (mcWasHubPlayingBeforeTrack) {
    atticActiveAudio.play().catch(() => {});
    mcWasHubPlayingBeforeTrack = false;
  }
}

function startMixtapeVisualizer() {
  if (mcVisualizerRafId) cancelAnimationFrame(mcVisualizerRafId);
  const canvas = document.getElementById("mcVisualizerCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const bufferLength = mcAnalyser.frequencyBinCount;
  const data = new Uint8Array(bufferLength);

  function draw() {
    if (!mcAudioEl || mcAudioEl.paused) return; // stop the loop naturally when paused
    mcVisualizerRafId = requestAnimationFrame(draw);
    mcAnalyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (data[i] / 255) * canvas.height;
      const hue = 25 + (i / bufferLength) * 20; // warm amber-to-red range
      ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    }
  }
  draw();
}

/* ============================================================ */
/* SECTION: VAULT GUARDIAN — paste at the bottom of attic.js */
/* ============================================================ */

const VG_LANES = 5;
const VG_TOWER_ROW_HEIGHT = 46;

const VG_TOWER_TYPES = {
  frame:  { name: "Photo Frame", icon: "🖼️", cost: 20, range: 90,  damage: 8,  fireRateMs: 600,  splash: 0,  hp: 40 },
  candle: { name: "Candle",      icon: "🕯️", cost: 35, range: 70,  damage: 5,  fireRateMs: 900,  splash: 40, hp: 55 },
  locket: { name: "Locket",      icon: "🔒", cost: 55, range: 140, damage: 20, fireRateMs: 1400, splash: 0,  hp: 70 },
};

const VG_ABILITIES = {
  sparkPing:    { name: "Spark Ping",        icon: "✨", tier: "common",    cost: 15, effect: "slowAll",    duration: 3000, slowFactor: 0.4 },
  fireBlast:    { name: "Streak Fire Blast", icon: "🔥", tier: "rare",      cost: 40, effect: "aoeDamage",  damage: 25 },
  securityWall: { name: "Security Wall",     icon: "🛡️", tier: "rare",      cost: 30, effect: "wall",       duration: 8000 },
  timeCandle:   { name: "Time Candle",       icon: "⏳", tier: "legendary", cost: 70, effect: "freezeAll",  duration: 4000 },
  memorySurge:  { name: "Memory Surge",      icon: "⚡", tier: "legendary", cost: 65, effect: "buffTowers", duration: 6000, damageMultiplier: 1.8, fireRateMultiplier: 0.6 },
};

// baseArmor: starting % damage reduction. hpGrowth: per-wave compounding HP multiplier (distinct per type).
const VG_ENEMY_TYPES = {
  fader:  { name: "Fader",  icon: "🌫️", baseHp: 10, hpGrowth: 1.24, speed: 0.9,  reward: 4,  livesLost: 1, baseArmor: 0,   melee: true,  meleeDps: 18 },
  blur:   { name: "Blur",   icon: "👻", baseHp: 9,  hpGrowth: 1.13, speed: 2.4,  reward: 6,  livesLost: 1, baseArmor: 0,   ghost: true },
  eraser: { name: "Eraser", icon: "🕳️", baseHp: 50, hpGrowth: 1.16, speed: 0.55, reward: 12, livesLost: 2, baseArmor: 0.1, shooter: true, teleports: true },
};

const VG_WAVE_MILESTONES = [1, 3, 5, 8, 12, 16, 20];
const VG_WAVE_MILESTONE_COINS = [10, 20, 35, 55, 80, 110, 150];
const VG_STARTING_CURRENCY = 100;
const VG_STARTING_LIVES = 10;

let vgState = null;
let vgRafId = null;
let vgLaneWidth = 0;
let vgLaneLength = 0; // px an enemy travels from spawn to the tower row

function startVaultGuardian() {
  document.getElementById("atticArcadeHubScreen").classList.add("attic-hidden");
  document.getElementById("atticVaultGuardianScreen").classList.remove("attic-hidden");
  document.getElementById("vgStartOverlay").classList.remove("attic-hidden");
  document.getElementById("vgGameOverOverlay").classList.add("attic-hidden");
  enterAtticSubscreenMusic("vaultGuardian");
  vgRenderShop();
  document.getElementById("vgCanvas").addEventListener("click", vgHandleCanvasClick);
}

function exitVaultGuardian() {
  vgStopRun();
  document.getElementById("atticVaultGuardianScreen").classList.add("attic-hidden");
  showArcadeHub();
}

function vgStopRun() {
  if (vgState) vgState.running = false;
  if (vgRafId) cancelAnimationFrame(vgRafId);
}

function beginVaultGuardianRun() {
  document.getElementById("vgStartOverlay").classList.add("attic-hidden");
  document.getElementById("vgGameOverOverlay").classList.add("attic-hidden");

  const canvas = document.getElementById("vgCanvas");
  const wrap = canvas.parentElement;
  canvas.width = Math.min(480, wrap.clientWidth || 480);
  canvas.height = canvas.width * 0.75;
  vgLaneWidth = canvas.width / VG_LANES;
  vgLaneLength = canvas.height - VG_TOWER_ROW_HEIGHT;

  vgState = {
    running: true,
    wave: 0,
    lives: VG_STARTING_LIVES,
    currency: VG_STARTING_CURRENCY,
    towers: {},        // laneIndex -> { type, lastFired, disabledUntil, fadedThisWave, hp, maxHp }
    enemies: [],        // { type, lane, hp, maxHp, dist, isBoss, ... }
    inBuildPhase: true,
    selectedBuildTool: null,
    buffUntil: 0,
    buffMultipliers: { damage: 1, fireRate: 1 },
    wallUntil: 0,
    spawnQueue: [],      // array of batches, each batch an array of enemy entries
    spawnTimer: 0,
  };

  vgUpdateHud();
  vgRenderShop();
  document.getElementById("vgStartWaveBtn").classList.remove("attic-hidden");
  document.getElementById("vgStartWaveBtn").textContent = "Start Wave 1";
  vgRafId = requestAnimationFrame(vgGameLoop);
}

// --- Shop UI ---
function vgRenderShop() {
  const towerBtns = document.getElementById("vgTowerButtons");
  const abilityBtns = document.getElementById("vgAbilityButtons");
  if (!towerBtns || !abilityBtns) return;

  towerBtns.innerHTML = Object.entries(VG_TOWER_TYPES).map(([key, t]) => `
    <button class="vg-shop-btn" id="vgTowerBtn_${key}" onclick="vgSelectBuildTool('${key}')">
      ${t.icon} ${t.name}<span class="vg-cost">${t.cost}💰</span>
    </button>
  `).join("");

  abilityBtns.innerHTML = Object.entries(VG_ABILITIES).map(([key, a]) => `
    <button class="vg-shop-btn" id="vgAbilityBtn_${key}" onclick="vgUseAbility('${key}')">
      ${a.icon} ${a.name}<span class="vg-cost">${a.cost}💰</span>
    </button>
  `).join("");
}

function vgSelectBuildTool(key) {
  if (!vgState) return;
  vgState.selectedBuildTool = key;
  document.querySelectorAll(".vg-shop-btn").forEach(b => b.classList.remove("vg-selected"));
  const btn = document.getElementById(`vgTowerBtn_${key}`);
  if (btn) btn.classList.add("vg-selected");
}

// Abilities: instant, global — hits every enemy in every lane on tap.
function vgUseAbility(key) {
  if (!vgState) return;
  const ability = VG_ABILITIES[key];
  if (vgState.currency < ability.cost) return;
  vgState.currency -= ability.cost;

  if (ability.effect === "slowAll") {
    vgState.enemies.forEach(e => e.slowedUntil = Date.now() + ability.duration);
  } else if (ability.effect === "freezeAll") {
    vgState.enemies.forEach(e => e.frozenUntil = Date.now() + ability.duration);
  } else if (ability.effect === "aoeDamage") {
    vgState.enemies.forEach(e => {
      if (e.ghost && e.intangibleUntil > Date.now()) return; // intangible dodges damage
      e.hp -= ability.damage * (1 - e.armor);
    });
  } else if (ability.effect === "wall") {
    vgState.wallUntil = Date.now() + ability.duration;
  } else if (ability.effect === "buffTowers") {
    vgState.buffUntil = Date.now() + ability.duration;
    vgState.buffMultipliers = { damage: ability.damageMultiplier, fireRate: ability.fireRateMultiplier };
  }
  vgUpdateHud();
}

// --- Canvas click: place a tower in the clicked lane's bottom slot ---
function vgHandleCanvasClick(evt) {
  if (!vgState || !vgState.selectedBuildTool) return;
  const canvas = document.getElementById("vgCanvas");
  const rect = canvas.getBoundingClientRect();
  const clickX = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (evt.clientY - rect.top) * (canvas.height / rect.height);
  if (clickY < vgLaneLength - 20) return; // only near the tower row

  const lane = Math.floor(clickX / vgLaneWidth);
  if (lane < 0 || lane >= VG_LANES) return;

  const towerType = vgState.selectedBuildTool;
  const type = VG_TOWER_TYPES[towerType];
  const existing = vgState.towers[lane];

  if (existing) {
    // Tapping an occupied slot sells the current tower (half refund) and replaces it —
    // fixes disabled/faded towers being permanently stuck.
    const refund = Math.round(VG_TOWER_TYPES[existing.type].cost * 0.5);
    if (vgState.currency + refund < type.cost) return;
    vgState.currency += refund;
  }
  if (vgState.currency < type.cost) return;

  vgState.currency -= type.cost;
  vgState.towers[lane] = { type: towerType, lastFired: 0, disabledUntil: 0, fadedThisWave: false, hp: type.hp, maxHp: type.hp };
  vgUpdateHud();
}


// --- Wave management ---
function vgGetWaveEnemyList(waveNum) {
  const batches = [];
  const totalCount = Math.min(40, 5 + Math.floor(waveNum * 1.6));
  const batchSize = Math.min(5, 1 + Math.floor(waveNum / 3));
  let remaining = totalCount;
  while (remaining > 0) {
    const size = Math.min(batchSize, remaining);
    const batch = [];
    for (let i = 0; i < size; i++) {
      let type = "fader";
      if (waveNum >= 5 && Math.random() < 0.25) type = "eraser";
      else if (waveNum >= 3 && Math.random() < 0.35) type = "blur";
      batch.push({ type, isBoss: false, lane: Math.floor(Math.random() * VG_LANES) });
    }
    batches.push(batch);
    remaining -= size;
  }
  if (waveNum % 5 === 0) {
    batches.push([{ type: "eraser", isBoss: true, lane: Math.floor(Math.random() * VG_LANES) }]);
  }
  return batches;
}

function vgStartNextWave() {
  if (!vgState || !vgState.inBuildPhase) return;
  vgState.wave++;
  vgState.inBuildPhase = false;
  vgState.spawnQueue = vgGetWaveEnemyList(vgState.wave);
  vgState.spawnTimer = 0;
  document.getElementById("vgStartWaveBtn").classList.add("attic-hidden");

vgState.currency += 15 + vgState.wave * 4; // wave-start stipend, scales with difficulty
  Object.values(vgState.towers).forEach(t => t.fadedThisWave = false);
  Object.values(vgState.towers).forEach(t => t.fadedThisWave = false);
  const laneKeys = Object.keys(vgState.towers);
  if (vgState.wave >= 4 && laneKeys.length > 0) {
    const pick = vgState.towers[laneKeys[Math.floor(Math.random() * laneKeys.length)]];
    pick.fadedThisWave = true;
  }

  vgUpdateHud();
  vgAwardWaveMilestone(vgState.wave);
}

function vgAwardWaveMilestone(waveNum) {
  const idx = VG_WAVE_MILESTONES.indexOf(waveNum);
  if (idx === -1) return;
  const arcadeKey = `vaultGuardian_${waveNum}`;
  const arcadeProgress = getArcadeProgress();
  if (!arcadeProgress[arcadeKey]) {
    arcadeProgress[arcadeKey] = { coinsEarned: VG_WAVE_MILESTONE_COINS[idx] };
    saveArcadeProgress(arcadeProgress);
  }
}

function vgSpawnEnemy(entry) {
  const def = VG_ENEMY_TYPES[entry.type];
  const hpMult = Math.pow(def.hpGrowth, vgState.wave);
  const speedMult = 1 + Math.min(vgState.wave, 20) * 0.02;
  const bossMult = entry.isBoss ? 3 : 1;
  const armor = Math.min(0.6, def.baseArmor + vgState.wave * 0.012);
  vgState.enemies.push({
    type: entry.type,
    lane: entry.lane,
    isBoss: entry.isBoss,
    hp: def.baseHp * hpMult * bossMult,
    maxHp: def.baseHp * hpMult * bossMult,
    speed: def.speed * speedMult,
    armor,
    dist: 0,
    slowedUntil: 0,
    frozenUntil: 0,
    intangibleUntil: 0,
    nextIntangibleAt: entry.type === "blur" ? Date.now() + 3000 + Math.random() * 1500 : 0,
    attackReadyAt: 0,
    nextTeleportAt: entry.type === "eraser" ? Date.now() + 4000 + Math.random() * 2000 : 0,
    meleeing: false,
  });
}

// --- Main loop ---
function vgGameLoop() {
  if (!vgState || !vgState.running) return;
  const now = Date.now();
  const wallActive = vgState.wallUntil > now;

  if (!vgState.inBuildPhase && vgState.spawnQueue.length > 0) {
    vgState.spawnTimer -= 16;
    if (vgState.spawnTimer <= 0) {
      vgState.spawnQueue.shift().forEach(entry => vgSpawnEnemy(entry));
      vgState.spawnTimer = 650;
    }
  }

  vgState.enemies.forEach(e => {
    if (e.frozenUntil > now || e.meleeing) return;

    // Blur intangibility toggle.
    if (e.ghost && now >= e.nextIntangibleAt && e.intangibleUntil <= now) {
      e.intangibleUntil = now + 1200;
      e.nextIntangibleAt = now + 4000 + Math.random() * 1500;
    }

    // Eraser random forward teleport, own lane only.
    if (e.type === "eraser" && now >= e.nextTeleportAt) {
      e.dist = Math.min(vgLaneLength - 1, e.dist + vgLaneLength * 0.35);
      e.nextTeleportAt = now + 5000 + Math.random() * 2000;
    }

    let speed = e.speed;
    if (e.slowedUntil > now) speed *= (1 - VG_ABILITIES.sparkPing.slowFactor);
    e.dist += speed;
  });

// Enemies reaching the tower row.
  vgState.enemies.forEach(e => {
    if (e.dist < vgLaneLength || e.meleeing) return;
    const tower = vgState.towers[e.lane];

    if (e.melee && tower && !wallActive) {
      e.meleeing = true; // stop and attack the tower instead of breaching
      e.dist = vgLaneLength;
    } else if (wallActive) {
      e.dist = vgLaneLength; // held at the wall, can't breach
    } else {
      vgState.lives -= VG_ENEMY_TYPES[e.type].livesLost * (e.isBoss ? 2 : 1);
      e.breached = true;
      e.hp = 0;
    }
  });

  // Melee attacks on towers.
  vgState.enemies.forEach(e => {
    if (!e.meleeing) return;
    const tower = vgState.towers[e.lane];
    if (!tower || wallActive) { e.meleeing = false; return; }
    if ((e.attackReadyAt || 0) > now) return;
    tower.hp -= VG_ENEMY_TYPES[e.type].meleeDps * 0.5;
    e.attackReadyAt = now + 500;
    if (tower.hp <= 0) {
      delete vgState.towers[e.lane];
      vgState.lives -= 1; // tower falls, a small breach cost
      e.meleeing = false;
    }
  });

  // Remove dead enemies, award currency (only for kills, not breaches).
  vgState.enemies.forEach(e => {
    if (e.hp <= 0 && !e.breached && !e.rewarded) {
      const waveRewardMult = 1 + vgState.wave * 0.08; // kills pay more as waves climb
      vgState.currency += VG_ENEMY_TYPES[e.type].reward * (e.isBoss ? 3 : 1) * waveRewardMult;
      e.rewarded = true;
    }
  });
  vgState.enemies = vgState.enemies.filter(e => (e.hp > 0 || e.meleeing) && !e.breached);
  
  

  // Tower firing: own lane first, fall back to adjacent lanes if own lane is clear.
  const buffActive = vgState.buffUntil > now;
  const dmgMult = buffActive ? vgState.buffMultipliers.damage : 1;
  const rateMult = buffActive ? vgState.buffMultipliers.fireRate : 1;

  Object.entries(vgState.towers).forEach(([laneStr, tower]) => {
    const lane = parseInt(laneStr, 10);
    if (tower.disabledUntil > now || tower.fadedThisWave) return;
    const type = VG_TOWER_TYPES[tower.type];
    if (now - tower.lastFired < type.fireRateMs * rateMult) return;

    let target = vgFindLaneTarget(lane, type.range);
    if (!target) target = vgFindLaneTarget(lane - 1, type.range) || vgFindLaneTarget(lane + 1, type.range);
    if (!target) return;
    if (target.ghost && target.intangibleUntil > now) return; // can't hit intangible Blur

    target.hp -= type.damage * dmgMult * (1 - target.armor);
    if (type.splash > 0) {
      vgState.enemies.forEach(other => {
        if (other === target || other.lane !== target.lane) return;
        if (Math.abs(other.dist - target.dist) <= type.splash) {
          if (other.ghost && other.intangibleUntil > now) return;
          other.hp -= type.damage * dmgMult * 0.5 * (1 - other.armor);
        }
      });
    }
    tower.lastFired = now;
  });

  // Eraser projectile: disables the tower in its own lane.
  vgState.enemies.forEach(e => {
    if (!VG_ENEMY_TYPES[e.type].shooter || wallActive) return;
    if ((e.attackReadyAt || 0) > now) return;
    const tower = vgState.towers[e.lane];
    if (tower && Math.abs(vgLaneLength - e.dist) < 100) {
      tower.disabledUntil = now + 2500;
      e.attackReadyAt = now + 2000;
    }
  });

  if (!vgState.inBuildPhase && vgState.spawnQueue.length === 0 && vgState.enemies.length === 0) {
    vgState.inBuildPhase = true;
    const btn = document.getElementById("vgStartWaveBtn");
    btn.textContent = `Start Wave ${vgState.wave + 1}`;
    btn.classList.remove("attic-hidden");
  }

  if (vgState.lives <= 0) { vgEndRun(); return; }

  vgUpdateHud();
  vgRender();
  vgRafId = requestAnimationFrame(vgGameLoop);
}

function vgFindLaneTarget(lane, range) {
  if (lane < 0 || lane >= VG_LANES) return null;
  let best = null, bestDist = -1;
  vgState.enemies.forEach(e => {
    if (e.lane !== lane) return;
    if (vgLaneLength - e.dist > range) return; // out of range from the tower row
    if (e.dist > bestDist) { best = e; bestDist = e.dist; }
  });
  return best;
}

function vgUpdateHud() {
  document.getElementById("vgWaveNum").textContent = vgState.wave;
  document.getElementById("vgLives").textContent = Math.max(0, vgState.lives);
  document.getElementById("vgCurrency").textContent = vgState.currency;
  Object.keys(VG_TOWER_TYPES).forEach(key => {
    const btn = document.getElementById(`vgTowerBtn_${key}`);
    if (btn) btn.disabled = vgState.currency < VG_TOWER_TYPES[key].cost;
  });
  Object.keys(VG_ABILITIES).forEach(key => {
    const btn = document.getElementById(`vgAbilityBtn_${key}`);
    if (btn) btn.disabled = vgState.currency < VG_ABILITIES[key].cost;
  });
}

function vgEndRun() {
  vgStopRun();
  document.getElementById("vgGameOverStats").textContent = `You held the vault through Wave ${vgState.wave}.`;
  document.getElementById("vgGameOverOverlay").classList.remove("attic-hidden");
}

// --- Rendering ---
function vgRender() {
  const canvas = document.getElementById("vgCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Night-pasture backdrop.
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#1a1330");
  grad.addColorStop(1, "#0b0810");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lane dividers.
  ctx.strokeStyle = "rgba(124, 91, 166, 0.35)";
  ctx.lineWidth = 1;
  for (let i = 1; i < VG_LANES; i++) {
    ctx.beginPath();
    ctx.moveTo(i * vgLaneWidth, 0);
    ctx.lineTo(i * vgLaneWidth, vgLaneLength);
    ctx.stroke();
  }

  // Tower row line + mausoleum.
  ctx.strokeStyle = "#7c5ba6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, vgLaneLength);
  ctx.lineTo(canvas.width, vgLaneLength);
  ctx.stroke();

  ctx.font = "22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏚️", canvas.width / 2, vgLaneLength + VG_TOWER_ROW_HEIGHT / 2);

  // Towers + empty slots.
  for (let lane = 0; lane < VG_LANES; lane++) {
    const cx = lane * vgLaneWidth + vgLaneWidth / 2;
    const cy = vgLaneLength + VG_TOWER_ROW_HEIGHT / 2;
    const tower = vgState.towers[lane];
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.strokeStyle = tower ? "#f0c419" : "#4a3866";
    ctx.stroke();
    if (tower) {
      const type = VG_TOWER_TYPES[tower.type];
      const isDisabled = tower.disabledUntil > Date.now() || tower.fadedThisWave;
      ctx.globalAlpha = isDisabled ? 0.4 : 1;
      ctx.font = "18px sans-serif";
      ctx.fillText(type.icon, cx, cy);
      ctx.globalAlpha = 1;
      // Tower HP bar.
      const barW = 26;
      ctx.fillStyle = "#3a2a4a";
      ctx.fillRect(cx - barW / 2, cy + 16, barW, 3);
      ctx.fillStyle = "#5fd05f";
      ctx.fillRect(cx - barW / 2, cy + 16, barW * (tower.hp / tower.maxHp), 3);
    }
  }

  // Enemies.
  ctx.font = "18px sans-serif";
  vgState.enemies.forEach(e => {
    const cx = e.lane * vgLaneWidth + vgLaneWidth / 2;
    const cy = e.dist;
    const intangible = e.ghost && e.intangibleUntil > Date.now();
    ctx.globalAlpha = intangible ? 0.35 : 1;
    ctx.fillText(VG_ENEMY_TYPES[e.type].icon, cx, cy);
    ctx.globalAlpha = 1;
    const barW = 20;
    ctx.fillStyle = "#3a2a4a";
    ctx.fillRect(cx - barW / 2, cy - 18, barW, 3);
    ctx.fillStyle = "#e04848";
    ctx.fillRect(cx - barW / 2, cy - 18, barW * (e.hp / e.maxHp), 3);
  });

  // Security Wall — visible barrier across every lane.
  if (vgState.wallUntil > Date.now()) {
    ctx.fillStyle = "rgba(124, 200, 240, 0.35)";
    ctx.fillRect(0, vgLaneLength - 8, canvas.width, 8);
    ctx.font = "14px sans-serif";
    for (let lane = 0; lane < VG_LANES; lane++) {
      ctx.fillText("🛡️", lane * vgLaneWidth + vgLaneWidth / 2, vgLaneLength - 14);
    }
  }
}
