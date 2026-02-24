const KEY = 'minesweeper_records_v1';

let inMemoryRecords = [];

function safeGetStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    localStorage.getItem(KEY);
    return localStorage;
  } catch {
    return null;
  }
}

export function loadRecords() {
  const storage = safeGetStorage();
  if (!storage) return [...inMemoryRecords];

  try {
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecord(record) {
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
