import { createHash, timingSafeEqual } from 'node:crypto';

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

// MVP: простое хеширование (заменить на argon2/bcrypt в проде)
export function hashPassword(password: string) {
  return sha256(password);
}

export function verifyPassword(password: string, passwordHash: string) {
  const a = Buffer.from(sha256(password));
  const b = Buffer.from(passwordHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

