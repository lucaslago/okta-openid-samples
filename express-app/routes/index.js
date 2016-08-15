const router = require('express').Router();

const checkUserAuth = require('../middlewares/checkUserAuth');

const homeCb= require('./callbacks/home');
const oauthCb = require('./callbacks/oktaAuth');
const unauthorizedCb = require('./callbacks/unauthorized');
const logoutCb = require('./callbacks/logout');

router.get('/401', unauthorizedCb);
router.post('/oauth/callback', oauthCb);
router.get('/', checkUserAuth, homeCb);
router.get('/logout', checkUserAuth, logoutCb);

module.exports = router;
