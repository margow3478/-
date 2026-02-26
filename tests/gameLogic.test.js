import test from 'node:test';
import assert from 'node:assert/strict';
import { createField, isWin, openCell } from '../src/logic/gameLogic.js';
import { createGameState } from '../src/state/gameState.js';

function pseudoRandom(seed = 1) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

test('createField creates exact mine count for easy', () => {
  const field = createField('easy', pseudoRandom(42));
  const mines = field.flat().filter((cell) => cell.isMine).length;
  assert.equal(mines, 10);
});

test('openCell on mine sets lose status', () => {
  const game = createGameState('easy');
  game.field = createField('easy', pseudoRandom(777));
  const mine = game.field.flat().find((cell) => cell.isMine);
  openCell(game, mine.x, mine.y);
  assert.equal(game.status, 'lose');
});

test('isWin returns true when all non-mine cells are open', () => {
  const game = createGameState('easy');
  game.field = createField('easy', pseudoRandom(9));
  game.field.flat().forEach((cell) => {
    if (!cell.isMine) cell.isOpen = true;
  });
  assert.equal(isWin(game), true);
});
