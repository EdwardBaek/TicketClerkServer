const router = require('express').Router();
const transfer = require('../module/transfer');

router.route('/').get( transfer.getTransferList );
router.route('/').post( transfer.issueNewTransfer );
router.route('/').delete( transfer.deleteTransferList );

router.route('/:id').get( transfer.getTransferDetail );

router.route('/apply').put( transfer.TransferApply );
router.route('/approval').put( transfer.TransferApproval );
// router.route('/receive').get( transfer.TransferReceive );

module.exports = router;