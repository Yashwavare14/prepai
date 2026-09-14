import crypto from "crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generates a cryptographically random, uppercase alphanumeric UID of specified length (default 6).
 * Example: '7B3X9K', 'M4K8P2'
 *
 * @param {number} [length=6]
 * @returns {string}
 */
export function generateQuestionUid(length = 6) {
  const bytes = crypto.randomBytes(length);
  let uid = "";
  for (let i = 0; i < length; i++) {
    uid += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return uid;
}
