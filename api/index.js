const router = require('express').Router();
const user = require('./user');
const ticket = require('../module/ticket');
const transfer = require('../module/transfer');

router.use('/users', user);

// TODO: /ticket/new -> /ticket
router.route('/ticket/new').post( ticket.issueNewTicket );
router.route('/ticket').delete( ticket.deleteTicket );
router.route('/ticket/list').get( ticket.getTicketList );
router.route('/ticket/list').delete( ticket.deleteTicketList );
// TODO: /ticket/list/:userId -> /ticket/list/user/:userId
router.route('/ticket/list/:userId').get( ticket.getTicketListByUser );

router.route('/ticket/detail/:id').get( ticket.getTicketDetail );

router.route('/ticket/transfer/new').post( transfer.issueNewTransfer );
router.route('/ticket/transfer/detail/:id').get( transfer.getTransferDetail );
router.route('/ticket/transfer/list').get( transfer.getTransferList );
router.route('/ticket/transfer/list').delete( transfer.deleteTransferList );
router.route('/ticket/transfer/apply').put( transfer.TransferApply );
router.route('/ticket/transfer/approval').put( transfer.TransferApproval );
// router.route('/ticket/transfer/receive').get( transfer.TransferReceive );

module.exports = router;