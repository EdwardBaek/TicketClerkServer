const router = require('express').Router();
const user = require('../module/user');

router.route('/').get( user.getUserList );

module.exports = router;