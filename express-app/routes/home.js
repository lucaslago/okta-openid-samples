const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index', {user_email: req.session.user, title: 'Demo Express App'});
});

module.exports = router;
