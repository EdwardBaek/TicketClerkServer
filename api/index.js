const router = require('express').Router();
const user = require('./user');
const ticket = require('./ticket');
const transfer = require('./transfer');

router.use('/users', user);
router.use('/tickets', ticket);
router.use('/transfer', transfer);

module.exports = router;