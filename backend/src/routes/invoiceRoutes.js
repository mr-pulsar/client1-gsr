const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createInvoice, getInvoices, registerInvoicePrint } = require('../controllers/invoiceController');

router.use(protect);
router.route('/').get(getInvoices).post(createInvoice);
router.post('/:id/print', registerInvoicePrint);

module.exports = router;