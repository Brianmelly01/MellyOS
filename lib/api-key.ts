import { randomBytes } from 'crypto'

/**
 * Generates a secure API key in the format: mly_<32 random hex chars>
 */
export function generateApiKey(): string {
  const random = randomBytes(24).toString('hex')
  return `mly_${random}`
}

/**
 * Masks an API key for display: mly_xxxx...xxxx
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return key
  return `${key.slice(0, 8)}${'•'.repeat(12)}${key.slice(-4)}`
}
