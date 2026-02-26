export function renderBoard(game, boardEl) {
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

export function renderRecords(records, targetEl) {
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

export function setStatus(text, statusEl) {
  statusEl.textContent = text;
}
