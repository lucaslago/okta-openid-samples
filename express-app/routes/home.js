const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index', {title: 'Demo'});
});

module.exports = router;
