// ================================
// 🎯 Tebak Kartu Berhadiah (v2)
// Posisi kartu "menang" ditentukan oleh detik lokal user
// Animasi flip + cooldown + reset ulang
// ================================

const board = document.getElementById("board");
const flipsLeftEl = document.getElementById("flips-left");
const cooldownEl = document.getElementById("cooldown");
const resetBtn = document.getElementById("resetBtn");

const REDIRECT_LINK = "https://t.me/+ZL5WOTuQwBFiNWRl"; // ganti sesuai link hadiahmu
const MAX_FLIPS = 3;
const COOLDOWN_TIME = 30; // detik
const TOTAL_CARDS = 9;

let flipsLeft = MAX_FLIPS;
let flipped = new Set();
let winIndex = null;
let locked = false;

// ================================
// 🔹 Posisi kartu menang berdasarkan detik lokal
// ================================
function getWinIndexFromSeconds() {
  const now = new Date();
  const sec = now.getSeconds();
  const mapped = sec % 10;
  // detik 1→pos1, 2→pos2, ..., 9→pos9, 0→pos9
  return mapped === 0 ? 8 : mapped - 1;
}

// ================================
// 🔹 Membuat papan kartu (3x3)
// ================================
function createBoard() {
  board.innerHTML = "";
  winIndex = getWinIndexFromSeconds();
  console.log("🎯 Posisi kartu menang:", winIndex + 1);

  for (let i = 0; i < TOTAL_CARDS; i++) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.index = i;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">
          <img src="assets/card-back.png" width="100%" height="100%">
        </div>
        <div class="card-face card-front">
          <img src="assets/${i === winIndex ? "card-win.png" : `card-lose${(i % 8) + 1}.png`}" width="100%" height="100%">
        </div>
      </div>
    `;

    board.appendChild(card);
  }
}

// ================================
// 🔹 Ketika kartu diklik
// ================================
function flipCard(e) {
  if (locked) return;
  const card = e.target.closest(".card");
  if (!card) return;

  const idx = +card.dataset.index;
  if (flipped.has(idx)) return;
  if (flipsLeft <= 0) return;

  card.classList.add("flipped");
  flipped.add(idx);
  flipsLeft--;
  flipsLeftEl.textContent = flipsLeft;

  // Menang
  if (idx === winIndex) {
    setTimeout(() => {
      alert("🎉 Selamat! Kamu menemukan kartu yang benar!");
      window.location.href = REDIRECT_LINK;
    }, 700);
    return;
  }

  // Jika sudah 3x salah
  if (flipsLeft === 0) startCooldown();
}

// ================================
// 🔹 Cooldown 30 detik
// ================================
function startCooldown() {
  const until = Date.now() + COOLDOWN_TIME * 1000;
  localStorage.setItem("cooldown_until", until);
  locked = true;
  tickCooldown();
}

// ================================
// 🔹 Timer Cooldown
// ================================
function tickCooldown() {
  const until = +localStorage.getItem("cooldown_until");
  const now = Date.now();
  if (now < until) {
    const s = Math.ceil((until - now) / 1000);
    cooldownEl.textContent = `⏳ Cooldown: ${s}s`;
    requestAnimationFrame(tickCooldown);
  } else {
    localStorage.removeItem("cooldown_until");
    cooldownEl.textContent = "";
    flipsLeft = MAX_FLIPS;
    flipped.clear();
    flipsLeftEl.textContent = flipsLeft;
    locked = false;
    createBoard();
  }
}

// ================================
// 🔹 Tombol reset (ulangi dari awal)
// ================================
function resetGame() {
  flipped.clear();
  flipsLeft = MAX_FLIPS;
  flipsLeftEl.textContent = flipsLeft;
  locked = false;
  createBoard();
}

// ================================
// 🔹 Inisialisasi
// ================================
resetBtn.addEventListener("click", resetGame);
board.addEventListener("click", flipCard);

(() => {
  createBoard();
  tickCooldown();
})();
