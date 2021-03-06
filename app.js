import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Debug from 'debug';
import express from 'express';
import compression from 'compression';
import logger from 'morgan';
import chalk from 'chalk';
// import favicon from 'serve-favicon';
import path from 'path';
import lessMiddleware from 'less-middleware';
import mongoose from 'mongoose';
import passport from 'passport';
import flash from 'flash';
import  expressStatusMonitor from 'express-status-monitor';
import expressValidator from 'express-validator';
/*Import Routes to make them Avaiable to App*/
import index from './routes/index';
import eventAPI from './routes/event';
import Events from './model/event';
import auth from './routes/auth';
//const dotenv = require('dotenv');
const passportConfig = require('./config/passport')
const MongoStore = require('connect-mongo')(session);

//dotenv.load({ path: '.env.example' });



const app = express();
const debug = Debug('sg-wdi-10-project-3-nodejs:app');
const server = require('http').Server(app);

/**
 *  Mongoose Connection.
 */

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/brace');
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
require('./seed');
/**
 * API keys and Passport configuration.
 */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

/* Why do we need this ? To connect mongodb by session? */

// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET,
//   store: new MongoStore({
//     url: process.env.MONGODB_URI || process.env.MONGOLAB_URI||'mongodb://localhost/brace',
//     autoReconnect: true,
//     clear_interval: 3600
//   })
// }));

/* Make passport available to app. Passport will update user session with user info on authentication */
app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
// // app.use(lusca.xframe('SAMEORIGIN'));
// // app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//       req.path !== '/login' &&
//       req.path !== '/signup' &&
//       !req.path.match(/^\/auth/) &&
//       !req.path.match(/\./)) {
//     req.session.returnTo = req.path;
//   } else if (req.user &&
//       req.path == '/account') {
//     req.session.returnTo = req.path;
//   }
//   next();
// });



/* routes are made available to app */

app.use('/', index);
app.use('/api', eventAPI);
app.use('/auth', auth);
// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// Handle uncaughtException
process.on('uncaughtException', (err) => {
  debug('Caught exception: %j', err);
  process.exit(1);
});


export default app;
