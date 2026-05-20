const router = require('express').Router();
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post(
  '/register',
  [body('password').isLength({ min: 1 })],
  register,
);
router.post('/login', [body('password').notEmpty()], login);
router.get('/me', protect, me);

module.exports = router;