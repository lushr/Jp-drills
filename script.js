const deckFile = 'level1.json';

let deck = [];
let order = [];
let currentIndex = 0;
let currentCard = null;

const englishPrompt = document.getElementById('englishPrompt');
const japaneseAnswer = document.getElementById('japaneseAnswer');
const answerCard = document.getElementById('answerCard');
const revealButton = document.getElementById('revealButton');
const nextButton = document.getElementById('nextButton');
const resetButton = document.getElementById('resetButton');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const chipRow = document.getElementById('chipRow');
const noteText = document.getElementById('noteText');
const speakButton = document.getElementById('speakButton');
const voiceNote = document.getElementById('voiceNote');
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let japaneseVoice = null;
function updateJapaneseVoice() {
  if (!speechSupported) return;
  const voices = speechSynthesis.getVoices();
  japaneseVoice = voices.find(v => v.lang.toLowerCase() === 'ja-jp') || voices.find(v => v.lang.toLowerCase().startsWith('ja')) || null;
}
if (speechSupported) {
  updateJapaneseVoice();
  speechSynthesis.addEventListener?.('voiceschanged', updateJapaneseVoice);
}
function stopSpeech() { if (speechSupported) speechSynthesis.cancel(); }
speakButton.addEventListener('click', () => {
  if (!speechSupported || !currentCard?.pronunciationApproved) return;
  stopSpeech();
  updateJapaneseVoice();
  const utterance = new SpeechSynthesisUtterance(currentCard.japanese);
  utterance.lang = 'ja-JP';
  if (japaneseVoice) utterance.voice = japaneseVoice;
  utterance.rate = 0.85;
  speechSynthesis.speak(utterance);
});

async function loadDeck() {
  try {
    const response = await fetch(deckFile);
    if (!response.ok) throw new Error('Could not load deck.');
    deck = await response.json();
    shuffleDeck();
    showCard();
  } catch (error) {
    englishPrompt.textContent = 'Could not load level1.json. Check the file is in the same folder as index.html.';
    revealButton.classList.add('hidden');
  }
}

function shuffleDeck() {
  order = [...Array(deck.length).keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  currentIndex = 0;
}

function showCard() {
  stopSpeech();
  if (currentIndex >= order.length) {
    shuffleDeck();
  }

  currentCard = deck[order[currentIndex]];
  englishPrompt.textContent = currentCard.english;
  japaneseAnswer.textContent = currentCard.japanese;
  noteText.textContent = currentCard.note || '';
  const canSpeak = !!currentCard.pronunciationApproved && speechSupported;
  speakButton.classList.toggle('hidden', !canSpeak);
  voiceNote.classList.toggle('hidden', !canSpeak);
  answerCard.classList.add('hidden');
  revealButton.classList.remove('hidden');
  renderChips(currentCard.tags || []);
  updateProgress();
}

function renderChips(tags) {
  chipRow.innerHTML = '';
  tags.forEach((tag, index) => {
    const chip = document.createElement('span');
    chip.className = `chip ${['pink', 'blue', 'yellow'][index % 3]}`;
    chip.innerHTML = `<i class="bi ${tag.icon}"></i> ${tag.label}`;
    chipRow.appendChild(chip);
  });
}

function updateProgress() {
  const seen = Math.min(currentIndex + 1, deck.length);
  progressText.textContent = `${seen} / ${deck.length}`;
  progressBar.style.width = `${(seen / deck.length) * 100}%`;
}

revealButton.addEventListener('click', () => {
  answerCard.classList.remove('hidden');
  revealButton.classList.add('hidden');
});

nextButton.addEventListener('click', () => {
  currentIndex += 1;
  showCard();
});

resetButton.addEventListener('click', () => {
  shuffleDeck();
  showCard();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  });
}

loadDeck();
