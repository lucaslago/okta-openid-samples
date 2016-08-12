const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const routes = require('./routes');
const config = require('./config/app-config');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
  secret: config.SESSION_SECRET,
  resave: true,
  saveUninitialized: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

module.exports = app;
