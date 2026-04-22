// Base58 alphabet — no 0, O, l, I to avoid SMS confusion
const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const TOKEN_LENGTH = 5;

export function generateToken(): string {
  let token = '';
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    token += BASE58[byte % BASE58.length];
  }
  return token;
}

export function tokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d;
}
