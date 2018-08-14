const router = require('express').Router();
const ticket = require('../module/ticket');

// TODO: /ticket/new -> /ticket
router.route('/new').post( ticket.issueNewTicket );
router.route('/').delete( ticket.deleteTicket );

router.route('/list').get( ticket.getTicketList );
router.route('/list').delete( ticket.deleteTicketList );

// TODO: /ticket/list/:userId -> /ticket/list/user/:userId
router.route('/list/:userId').get( ticket.getTicketListByUser );

router.route('/detail/:id').get( ticket.getTicketDetail );

module.exports = router;