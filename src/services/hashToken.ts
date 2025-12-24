import { createHash } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha512')
    .update(token)
    .digest('hex');
}
