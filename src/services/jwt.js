const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(user) {
  return jwt.sign({ userId: user.id}, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '30d',
  });
}

function generateRefreshToken(user, jti) {
  return jwt.sign({
    userId: user.id,
    jti
  }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
}

function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

function hashToken(token) {
  return crypto.createHash('sha512').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  hashToken
};