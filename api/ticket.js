const router = require('express').Router();
const ticket = require('../module/ticket');

router.route('/')
  .post( ticket.issueNewTicket )
  .get( ticket.getTicketList )
  .delete( ticket.deleteTicketList );

router.route('/:ticketId')
  .get( ticket.getTicketDetail )
  .delete( ticket.deleteTicket );

router.route('/user/:userId').get( ticket.getTicketListByUser );

module.exports = router;