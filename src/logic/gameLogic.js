import { DIFFICULTIES } from '../state/gameState.js';

function createCell(x, y) {
  return { x, y, isMine: false, isOpen: false, isFlagged: false, minesAround: 0 };
}

export function createField(difficulty, random = Math.random) {
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  const field = Array.from({ length: rows }, (_, x) => Array.from({ length: cols }, (_, y) => createCell(x, y)));

  let placed = 0;
  while (placed < mines) {
    const x = Math.floor(random() * rows);
    const y = Math.floor(random() * cols);
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

export function neighbors(field, x, y) {
  const result = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (field[nx]?.[ny]) result.push(field[nx][ny]);
    }
  }
  return result;
}

function floodOpen(field, x, y) {
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const cell = field[cx]?.[cy];
    if (!cell || cell.isOpen || cell.isFlagged) continue;
    cell.isOpen = true;
    if (cell.minesAround === 0 && !cell.isMine) {
      neighbors(field, cx, cy).forEach((n) => {
        if (!n.isOpen && !n.isMine) stack.push([n.x, n.y]);
      });
    }
  }
}

export function openCell(game, x, y) {
  if (game.status !== 'playing') return;
  const cell = game.field[x]?.[y];
  if (!cell || cell.isFlagged || cell.isOpen) return;

  if (cell.isMine) {
    cell.isOpen = true;
    game.status = 'lose';
    game.field.flat().forEach((c) => {
      if (c.isMine) c.isOpen = true;
    });
    return;
  }

  floodOpen(game.field, x, y);
  if (isWin(game)) game.status = 'win';
}

export function toggleFlag(game, x, y) {
  if (game.status !== 'playing') return;
  const cell = game.field[x]?.[y];
  if (!cell || cell.isOpen) return;
  cell.isFlagged = !cell.isFlagged;
}

export function isWin(game) {
  return game.field.flat().every((cell) => (cell.isMine ? true : cell.isOpen));
}
