const router = require('express').Router();
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const config = require('../../config/app-config');

module.exports = (req, res) => {
  const token = req.body.id_token;
  try {
    const dirtyToken = jwt.decode(token, { complete: true});
    const pemEncodedKey = jwkToPem(config.OKTA_PUBLIC_KEYS);
    const verifiedToken = jwt.verify(token, pemEncodedKey, { algorithms: ['RS256']});
    req.session.user = verifiedToken.email;
    res.redirect('/');
  } catch(err) {
    res.redirect('/401');
  }
};

