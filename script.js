const board = document.getElementById("board");
const flipsLeftEl = document.getElementById("flips-left");
const cooldownEl = document.getElementById("cooldown");
const resetBtn = document.getElementById("resetBtn");

const REDIRECT_LINK = "https://t.me/+ZL5WOTuQwBFiNWRl"; // 🔗 Ganti link hadiahmu
const MAX_FLIPS = 3;
const COOLDOWN_TIME = 30; // detik
const TOTAL_CARDS = 9;

let flipsLeft = MAX_FLIPS;
let flipped = new Set();
let winIndex = null;
let locked = false;
let localSeed = null;

// 🔹 Seed unik dari kombinasi data lokal (tanpa API)
function fingerprintSeedLocal() {
  const ua = navigator.userAgent;
  const scr = `${screen.width}x${screen.height}`;
  const lang = navigator.language;
  const tzOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;
  const raw = `${ua}|${scr}|${lang}|${tzOffsetMs}`;
  return btoa(raw).slice(0, 24);
}

// 🔹 Random generator berbasis seed
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

// 🔹 Shuffle array berdasarkan seed unik
function shuffle(arr, seed) {
  const rand = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 🔹 Membuat papan kartu
function createBoard(seed) {
  const indices = shuffle([...Array(TOTAL_CARDS).keys()], seed);
  winIndex = indices[0];

  board.innerHTML = "";
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

// 🔹 Saat kartu diklik
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

  if (idx === winIndex) {
    setTimeout(() => {
      alert("🎉 Selamat! Kamu menemukan kartu yang benar!");
      window.location.href = REDIRECT_LINK;
    }, 700);
    return;
  }

  if (flipsLeft === 0) startCooldown();
}

// 🔹 Cooldown setelah 3x gagal
function startCooldown() {
  const until = Date.now() + COOLDOWN_TIME * 1000;
  localStorage.setItem("cooldown_until", until);
  locked = true;
  tickCooldown();
}

// 🔹 Timer cooldown
function tickCooldown() {
  const until = +localStorage.getItem("cooldown_until");
  const now = Date.now();
  if (now < until) {
    const s = Math.ceil((until - now) / 1000);
    cooldownEl.textContent = `Cooldown: ${s}s`;
    requestAnimationFrame(tickCooldown);
  } else {
    localStorage.removeItem("cooldown_until");
    cooldownEl.textContent = "";
    flipsLeft = MAX_FLIPS;
    flipped.clear();
    flipsLeftEl.textContent = flipsLeft;
    locked = false;
    createBoard(localSeed);
  }
}

// 🔹 Tombol reset
function resetGame() {
  flipped.clear();
  flipsLeft = MAX_FLIPS;
  flipsLeftEl.textContent = flipsLeft;
  locked = false;
  createBoard(localSeed);
}

// 🔹 Inisialisasi game
resetBtn.addEventListener("click", resetGame);
board.addEventListener("click", flipCard);

(() => {
  localSeed = fingerprintSeedLocal();
  createBoard(localSeed);
  tickCooldown();
})();