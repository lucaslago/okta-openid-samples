const router = require('express').Router();

router.post('/', (req, res) => {
  console.log('Handle token validation here. Token: ', req.body);
});

module.exports = router;
