const router = require('express').Router();
const user = require('./user');
const ticket = require('./ticket');
const transfer = require('../module/transfer');

router.use('/users', user);
router.use('/ticket', ticket);

router.route('/ticket/transfer/new').post( transfer.issueNewTransfer );
router.route('/ticket/transfer/detail/:id').get( transfer.getTransferDetail );
router.route('/ticket/transfer/list').get( transfer.getTransferList );
router.route('/ticket/transfer/list').delete( transfer.deleteTransferList );
router.route('/ticket/transfer/apply').put( transfer.TransferApply );
router.route('/ticket/transfer/approval').put( transfer.TransferApproval );
// router.route('/ticket/transfer/receive').get( transfer.TransferReceive );

module.exports = router;