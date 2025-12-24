import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface UserPayload {
  id: number | string;
  username: string;
  roles?: string[] | string;
}

export function generateAccessToken(user: UserPayload): string {
  return jwt.sign(
    {
      userId: user.id,
      name: user.username,
      roles: user.roles,
    },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: '30d',
    }
  );
}

export function generateRefreshToken(
  user: UserPayload,
  jti: string
): string {
  return jwt.sign(
    {
      userId: user.id,
      name: user.username,
      roles: user.roles,
      jti,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: '30d',
    }
  );
}

export function generateTokens(
  user: UserPayload,
  jti: string
): { accessToken: string; refreshToken: string } {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha512').update(token).digest('hex');
}
