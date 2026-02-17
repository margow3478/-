import { createField, openCell, toggleFlag } from './src/logic/gameLogic.js';
import { createGameState } from './src/state/gameState.js';
import { loadRecords, saveRecord } from './src/storage/recordsStorage.js';
import { renderBoard, renderRecords, setStatus } from './src/ui/render.js';

const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const recordsEl = document.getElementById('records-list');
const difficultyEl = document.getElementById('difficulty');
const newGameEl = document.getElementById('new-game');

let game = createGameState();
let timerId = null;

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  stopTimer();
  game.startedAt = Date.now();
  timerId = setInterval(() => {
    game.time = Math.floor((Date.now() - game.startedAt) / 1000);
    timerEl.textContent = String(game.time);
  }, 200);
}

function syncStatus() {
  if (game.status === 'playing') setStatus('Играется', statusEl);
  if (game.status === 'win') setStatus('Победа 🎉', statusEl);
  if (game.status === 'lose') setStatus('Поражение 💥', statusEl);
}

function startGame() {
  stopTimer();
  game = createGameState(difficultyEl.value);
  game.field = createField(game.difficulty);
  timerEl.textContent = '0';
  syncStatus();
  renderBoard(game, boardEl);
  startTimer();
}

boardEl.addEventListener('click', (e) => {
  const target = e.target.closest('.cell');
  if (!target) return;
  openCell(game, Number(target.dataset.x), Number(target.dataset.y));
  renderBoard(game, boardEl);
  syncStatus();
  if (game.status !== 'playing') {
    stopTimer();
    if (game.status === 'win') {
      const playerName = prompt('Ваше имя для рекорда?', 'Игрок') || 'Игрок';
      const records = saveRecord({
        playerName,
        time: game.time,
        difficulty: game.difficulty,
        date: new Date().toISOString(),
      });
      renderRecords(records, recordsEl);
    }
  }
});

boardEl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const target = e.target.closest('.cell');
  if (!target) return;
  toggleFlag(game, Number(target.dataset.x), Number(target.dataset.y));
  renderBoard(game, boardEl);
});

newGameEl.addEventListener('click', startGame);
difficultyEl.addEventListener('change', startGame);

renderRecords(loadRecords(), recordsEl);
startGame();
