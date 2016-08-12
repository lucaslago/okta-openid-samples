const router = require('express').Router();

const checkUserAuth = require('../middlewares/checkUserAuth');

const home = require('./home');
const oauthCallback = require('./oauthCallback');

router.get('/', checkUserAuth, home);
router.use('/oauth/callback', oauthCallback);

module.exports = router;
