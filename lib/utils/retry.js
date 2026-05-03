export async function withRetry(fn, retries = 2, delayMs = 5000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`Retrying in ${delayMs}ms... (attempt ${i + 1})`);
      await new Promise((res) => setTimeout(res, delayMs));
      delayMs *= 2; // exponential backoff
    }
  }
}
