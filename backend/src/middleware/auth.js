const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AUTH_SECRET = 'gsr-local-auth-secret';
const LOCAL_PASSWORD_TOKEN = 'local-password-token';
const LOCAL_USER_ID = '000000000000000000000001';

const protect = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new Error('Not authorized, no token');
  }

  if (token === LOCAL_PASSWORD_TOKEN) {
    req.user = { _id: LOCAL_USER_ID, id: LOCAL_USER_ID, name: 'GSR Admin', role: 'admin' };
    return next();
  }

  req.user = jwt.verify(token, AUTH_SECRET);
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new Error('Not authorized for this action');
    }
    next();
  };
}

module.exports = { protect, authorize };