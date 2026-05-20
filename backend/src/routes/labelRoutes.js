const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createLabel, getLabels, getLabelById, deleteLabel, registerPrint } = require('../controllers/labelController');

router.use(protect);
router.route('/').get(getLabels).post(createLabel);
router.route('/:id').get(getLabelById).delete(deleteLabel);
router.post('/:id/print', registerPrint);

module.exports = router;