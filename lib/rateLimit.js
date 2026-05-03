const requestCounts = new Map();

export function rateLimit(ip, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, start: now };

  if (now - entry.start > windowMs) {
    // Reset window
    requestCounts.set(ip, { count: 1, start: now });
    return false; // not limited
  }

  if (entry.count >= limit) return true; // limited

  entry.count++;
  requestCounts.set(ip, entry);
  return false; // not limited
}
