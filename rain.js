// ====== Config / State ======
const btnToggle = document.getElementById('toggleRain');
const btnClear  = document.getElementById('clearRain');
const category  = document.getElementById('category');
const customInp = document.getElementById('customEmojis');
const intensity = document.getElementById('intensity');
const intensityVal = document.getElementById('intensityVal');
const sizeRange = document.getElementById('size');
const sizeVal   = document.getElementById('sizeVal');
const bgToggle  = document.getElementById('bgToggle');

let raining = false;
let spawnTimer = null;

// Built-in categories
const sets = {
  smiles:  ["😀","😄","😁","🤣","😂","🥳","😉","😊","😎","😍","🤩","😜"],
  animals: ["🐶","🐱","🐭","🐼","🐨","🦊","🐯","🐵","🦁","🐷","🐰","🦄"],
  food:    ["🍕","🍔","🍟","🌮","🍣","🍩","🍪","🍎","🍇","🍫","🍒","🥭"],
  love:    ["❤️","💖","💘","💕","💞","💓","💗","💝","💟","❣️","😘","🥰"],
  weather: ["☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","❄️","🌈","💧","⚡"],
  india:   ["🇮🇳","🪔","🎉","🥁","🎊","🧡","🤍","💚","🕌","🛕","🪘","🪅"]
};

// ====== Helpers ======
const rand = (min, max) => Math.random() * (max - min) + min;

// Parse custom emoji string to array (handles surrogate pairs)
function parseCustomEmojis(str){
  // Split by spaces if present; otherwise split by code points
  if (/\s/.test(str.trim())) {
    return str.split(/\s+/).filter(Boolean);
  }
  // Split into an array of Unicode code points
  return Array.from(str).filter(Boolean);
}

function currentSet(){
  if (category.value === 'custom') {
    const arr = parseCustomEmojis(customInp.value.trim());
    return arr.length ? arr : ["✨"]; // fallback
  }
  return sets[category.value] || sets.smiles;
}

function spawnEveryMs(){
  // Map intensity (5..90) to spawn interval (heavy rain -> faster)
  const val = Number(intensity.value); // higher means more emojis
  // 90 → ~60ms, 5 → ~400ms
  const ms = Math.round(500 - (val * 4.9));
  return Math.max(60, ms);
}

function makeEmoji(){
  const list = currentSet();
  const char = list[Math.floor(Math.random() * list.length)];

  const span = document.createElement('span');
  span.className = 'emoji';
  span.textContent = char;

  // random horizontal start
  span.style.left = `${rand(-10, 100)}vw`;
  // random size up to slider (min 1.0rem)
  const maxRem = Number(sizeRange.value);
  const sizeRem = rand(1.0, maxRem);
  span.style.fontSize = `${sizeRem}rem`;
  // random duration so they don't sync
  span.style.animationDuration = `${rand(2.2, 5.5)}s`;
  // slight horizontal drift via rotate already; add initial rotate
  span.style.transform = `translateY(-60px) rotate(${Math.floor(rand(-90,90))}deg)`;

  document.body.appendChild(span);

  // Cleanup after animation
  const killAfter = parseFloat(span.style.animationDuration) * 1000 + 300;
  setTimeout(() => span.remove(), killAfter);
}

function startRain(){
  if (raining) return;
  raining = true;
  btnToggle.textContent = '🛑 Stop Rain';
  scheduleSpawner();
}

function stopRain(){
  raining = false;
  btnToggle.textContent = '🌧️ Start Rain';
  if (spawnTimer) {
    clearTimeout(spawnTimer);
    spawnTimer = null;
  }
}

function scheduleSpawner(){
  if (!raining) return;
  makeEmoji();
  spawnTimer = setTimeout(scheduleSpawner, spawnEveryMs());
}

function clearScreen(){
  document.querySelectorAll('.emoji, .burst').forEach(el => el.remove());
}

// Emoji burst on click
function burstAt(x, y){
  const list = currentSet();
  const count = 14;
  for (let i=0;i<count;i++){
    const b = document.createElement('span');
    b.className = 'burst';
    b.textContent = list[Math.floor(Math.random()*list.length)];
    b.style.left = `${x}px`;
    b.style.top  = `${y}px`;
    const dx = rand(-220,220);
    const dy = rand(-180,220);
    b.style.setProperty('--dx', `${dx}px`);
    b.style.setProperty('--dy', `${dy}px`);
    b.style.fontSize = `${rand(1.2, Number(sizeRange.value))}rem`;
    document.body.appendChild(b);
    setTimeout(()=>b.remove(), 1000);
  }
}

// ====== Events ======
btnToggle.addEventListener('click', () => {
  raining ? stopRain() : startRain();
});

btnClear.addEventListener('click', clearScreen);

intensity.addEventListener('input', () => {
  intensityVal.textContent = intensity.value;
  // Reschedule with new intensity
  if (raining){
    clearTimeout(spawnTimer);
    scheduleSpawner();
  }
});

sizeRange.addEventListener('input', () => {
  sizeVal.textContent = `${Number(sizeRange.value).toFixed(1)}rem`;
});

category.addEventListener('change', () => {
  // no-op; set is read each spawn; but give a little burst feedback
  burstAt(innerWidth/2, 90);
});

customInp.addEventListener('input', () => {
  if (category.value !== 'custom') return;
  // quick preview burst
  if (customInp.value.trim().length) burstAt(innerWidth/2, 90);
});

bgToggle.addEventListener('change', (e) => {
  document.body.classList.toggle('rainbow', e.target.checked);
});

// Burst where user clicks
document.addEventListener('pointerdown', (e) => burstAt(e.clientX, e.clientY));

// Init displayed values
intensityVal.textContent = intensity.value;
sizeVal.textContent = `${Number(sizeRange.value).toFixed(1)}rem`;
