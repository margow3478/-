const KEY = 'minesweeper_records_v1';

export function loadRecords() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecord(record) {
  const records = loadRecords();
  records.push(record);
  records.sort((a, b) => a.time - b.time);
  const top = records.slice(0, 10);
  localStorage.setItem(KEY, JSON.stringify(top));
  return top;
}
