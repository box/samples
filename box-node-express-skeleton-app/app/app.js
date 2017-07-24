"use strict";
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const SessionCache = require('connect-redis')(session);
const CacheService = require('./cache-service/cacheService');
const config = require('config');

const passport = require('passport');
const strategy = require('./identity-service/passport-strategies/auth0-strategy');

const Auth0Config = config.get('Auth0Config');

let webapp = require('./app-web/routes/index');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app-web', 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app-web', 'public')));

app.use(session({
	secret: Auth0Config.sessionSecret,
	resave: true,
	saveUninitialized: true,
	store: new SessionCache({ client: new CacheService().getCacheClient() })
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', webapp);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.render('pages/error', {
			title: "Error...",
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.render('pages/error', {
		title: "Error...",
		message: err.message,
		error: {}
	});
});


module.exports = app;
