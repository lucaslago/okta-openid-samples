const express = require('express');
const querystring = require('querystring');
const config = require('../config/app-config');

module.exports = (req, res, next) => {
  if(req.session.user) {
    next();
  } else {
    const params = querystring.stringify({
      redirect_uri: config.OKTA_REDIRECT_URI,
      client_id: config.OKTA_CLIENT_ID,
      response_type: 'id_token',
      response_mode: 'form_post',
      scope: 'openid email groups',
      state: 'example state'
    });
    const authEndpoint = `${config.OKTA_BASE_URL}/oauth2/v1/authorize?${params}`;
    res.redirect(authEndpoint);
  }
};
