const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_emergency_use_only';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

module.exports = generateToken;
