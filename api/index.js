const router = require('express').Router();
const user = require('./user');
const ticket = require('./ticket');
const transfer = require('./transfer');

router.use('/users', user);
router.use('/ticket', ticket);
router.use('/ticket/transfer', transfer);

module.exports = router;