const router = require('express').Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { getStats, bulkUpload } = require('../controllers/adminController');

const upload = multer();

router.use(protect, authorize('admin'));
router.get('/stats', getStats);
router.post('/bulk-upload', upload.single('file'), bulkUpload);

module.exports = router;