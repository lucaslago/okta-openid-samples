module.exports = (req, res) => {
  res.render('index', {user_email: req.session.user, title: 'Okta Example'});
};
