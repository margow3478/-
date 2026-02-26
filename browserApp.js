(function () {
  const DIFFICULTIES = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 },
  };

  const KEY = 'minesweeper_records_v1';
  let inMemoryRecords = [];

  function createGameState(difficulty) {
    return {
      difficulty: difficulty || 'easy',
      status: 'playing',
      time: 0,
      startedAt: null,
      field: [],
    };
  }

  function createCell(x, y) {
    return { x, y, isMine: false, isOpen: false, isFlagged: false, minesAround: 0 };
  }

  function neighbors(field, x, y) {
    const result = [];
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (field[nx] && field[nx][ny]) result.push(field[nx][ny]);
      }
    }
    return result;
  }

  function createField(difficulty) {
    const config = DIFFICULTIES[difficulty] || DIFFICULTIES.easy;
    const rows = config.rows;
    const cols = config.cols;
    const mines = config.mines;

    const field = Array.from({ length: rows }, (_, x) =>
      Array.from({ length: cols }, (_, y) => createCell(x, y))
    );

    let placed = 0;
    while (placed < mines) {
      const x = Math.floor(Math.random() * rows);
      const y = Math.floor(Math.random() * cols);
      if (!field[x][y].isMine) {
        field[x][y].isMine = true;
        placed += 1;
      }
    }

    for (let x = 0; x < rows; x += 1) {
      for (let y = 0; y < cols; y += 1) {
        field[x][y].minesAround = neighbors(field, x, y).filter((c) => c.isMine).length;
      }
    }

    return field;
  }

  function floodOpen(field, x, y) {
    const stack = [[x, y]];
    while (stack.length) {
      const current = stack.pop();
      const cx = current[0];
      const cy = current[1];
      const cell = field[cx] && field[cx][cy];
      if (!cell || cell.isOpen || cell.isFlagged) continue;
      cell.isOpen = true;
      if (cell.minesAround === 0 && !cell.isMine) {
        neighbors(field, cx, cy).forEach((n) => {
          if (!n.isOpen && !n.isMine) stack.push([n.x, n.y]);
        });
      }
    }
  }

  function isWin(game) {
    return game.field.flat().every((cell) => (cell.isMine ? true : cell.isOpen));
  }

  function openCell(game, x, y) {
    if (game.status !== 'playing') return;
    const cell = game.field[x] && game.field[x][y];
    if (!cell || cell.isFlagged || cell.isOpen) return;

    if (cell.isMine) {
      game.status = 'lose';
      game.field.flat().forEach((c) => {
        if (c.isMine) c.isOpen = true;
      });
      return;
    }

    floodOpen(game.field, x, y);
    if (isWin(game)) game.status = 'win';
  }

  function toggleFlag(game, x, y) {
    if (game.status !== 'playing') return;
    const cell = game.field[x] && game.field[x][y];
    if (!cell || cell.isOpen) return;
    cell.isFlagged = !cell.isFlagged;
  }

  function safeGetStorage() {
    try {
      if (typeof localStorage === 'undefined') return null;
      localStorage.getItem(KEY);
      return localStorage;
    } catch {
      return null;
    }
  }

  function loadRecords() {
    const storage = safeGetStorage();
    if (!storage) return inMemoryRecords.slice();
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveRecord(record) {
    const records = loadRecords();
    records.push(record);
    records.sort((a, b) => a.time - b.time);
    const top = records.slice(0, 10);

    const storage = safeGetStorage();
    if (storage) {
      try {
        storage.setItem(KEY, JSON.stringify(top));
      } catch {
        inMemoryRecords = top;
      }
    } else {
      inMemoryRecords = top;
    }

    return top;
  }

  function renderBoard(game, boardEl) {
    if (!game.field.length) return;
    const rows = game.field.length;
    const cols = game.field[0].length;
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardEl.innerHTML = '';

    for (let x = 0; x < rows; x += 1) {
      for (let y = 0; y < cols; y += 1) {
        const cell = game.field[x][y];
        const btn = document.createElement('button');
        btn.className = 'cell';
        btn.dataset.x = String(x);
        btn.dataset.y = String(y);

        if (cell.isOpen) {
          btn.classList.add('open');
          if (cell.isMine) {
            btn.textContent = '💣';
            btn.classList.add('mine');
          } else if (cell.minesAround > 0) {
            btn.textContent = String(cell.minesAround);
          }
        } else if (cell.isFlagged) {
          btn.textContent = '🚩';
          btn.classList.add('flagged');
        }

        boardEl.appendChild(btn);
      }
    }
  }

  function renderRecords(records, targetEl) {
    targetEl.innerHTML = '';
    if (!records.length) {
      const li = document.createElement('li');
      li.textContent = 'Пока нет рекордов';
      targetEl.appendChild(li);
      return;
    }

    records.forEach((r) => {
      const li = document.createElement('li');
      li.textContent = `${r.playerName} — ${r.time} сек (${r.difficulty})`;
      targetEl.appendChild(li);
    });
  }

  function setStatus(game, statusEl) {
    if (game.status === 'playing') statusEl.textContent = 'Играется';
    if (game.status === 'win') statusEl.textContent = 'Победа 🎉';
    if (game.status === 'lose') statusEl.textContent = 'Поражение 💥';
  }

  function bootstrap() {
    const boardEl = document.getElementById('board');
    const timerEl = document.getElementById('timer');
    const statusEl = document.getElementById('status');
    const recordsEl = document.getElementById('records-list');
    const difficultyEl = document.getElementById('difficulty');
    const newGameEl = document.getElementById('new-game');

    if (!boardEl || !timerEl || !statusEl || !recordsEl || !difficultyEl || !newGameEl) return;

    let game = createGameState(difficultyEl.value);
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

    function startGame() {
      stopTimer();
      game = createGameState(difficultyEl.value);
      game.field = createField(game.difficulty);
      timerEl.textContent = '0';
      setStatus(game, statusEl);
      renderBoard(game, boardEl);
      startTimer();
    }

    boardEl.addEventListener('click', (e) => {
      const target = e.target.closest('.cell');
      if (!target) return;
      openCell(game, Number(target.dataset.x), Number(target.dataset.y));
      renderBoard(game, boardEl);
      setStatus(game, statusEl);
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

    startGame();
    renderRecords(loadRecords(), recordsEl);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
