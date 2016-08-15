module.exports = (req, res) => {
  res.render('home', {user: req.session.user, title: 'Okta Auth Example'});
};
