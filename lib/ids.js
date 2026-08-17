// Simple dependency-free unique id generator (timestamp + random suffix).
// Not cryptographically unique, but sufficient for local pill/time entry ids.
export function generateId() {
  const timePart = Date.now().toString(36);
  const randPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}-${randPart}`;
}
