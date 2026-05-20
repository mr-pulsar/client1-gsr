const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_PASSWORD = 'GSR123!';
const ALLOWED_NAME = 'GSR Admin';
const AUTH_SECRET = process.env.JWT_SECRET || 'gsr-local-auth-secret';
const LOCAL_USER_ID = '000000000000000000000001';

function signToken(userId) {
  return jwt.sign({ id: userId }, AUTH_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const register = asyncHandler(async (req, res) => {
  res.status(405);
  throw new Error('Registration is disabled');
});

const login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (String(password || '') !== ALLOWED_PASSWORD) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    token: signToken(LOCAL_USER_ID),
    user: { id: LOCAL_USER_ID, _id: LOCAL_USER_ID, name: ALLOWED_NAME, role: 'admin' },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, me };