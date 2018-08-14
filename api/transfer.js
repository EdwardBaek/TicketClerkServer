const router = require('express').Router();
const transfer = require('../module/transfer');

router.route('/new').post( transfer.issueNewTransfer );
router.route('/detail/:id').get( transfer.getTransferDetail );

router.route('/list').get( transfer.getTransferList );
router.route('/list').delete( transfer.deleteTransferList );

router.route('/apply').put( transfer.TransferApply );
router.route('/approval').put( transfer.TransferApproval );
// router.route('/ticket/transfer/receive').get( transfer.TransferReceive );

module.exports = router;