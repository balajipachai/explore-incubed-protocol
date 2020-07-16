require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const redis = require('redis');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const swaggerUi = require('swagger-ui-express');
const winston = require('./config/winston');

const swaggerJSON = require('./config/swagger.json');

const customCssHideSwaggerHeader = '.swagger-ui .topbar { display: none !important }';

const mainRoute = require('./routes/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/dist/incubed-frontend')));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(
    swaggerJSON,
    null,
    null,
    customCssHideSwaggerHeader,
    null,
    null,
    "API's Documentation - Exploring INCUBED Protocol",
  ),
);

/**
 * Configuring the express session store
 * @param {String} secret This is the secret used to sign the session ID cookie
 * @param {String} key Cookie name defaulting to connect.land-records
 * @param {Object} cookie Cookie object
 * @param {Boolean} rolling Force a session identifier cookie to be set on every response
 * @param {Boolean} resave
 * @param {Boolean} saveUninitialized Forces a session that is "uninitialized" to be saved
 * to the store. A session is uninitialized when it is new but not modified.
 * @param {Object} store Memory store
 * @param {String} destroy Control the result of unsetting req.session
 */
app.use(
  expressSession({
    secret: '1bfT8SHARUSHIMAUQybalaviggC6DwQ',
    key: 'land-records',
    cookie: {
      secure: false, // cookie can be accessed over http
    },
    rolling: true,
    resave: true,
    saveUninitialized: false,
    store: new RedisStore({
      client: redis.createClient(process.env.REDIS_URL),
    }),
    unset: 'destroy',
  }),
);

// Prevent browser's back button feature such as after logout,
// the user should not be taken to the login screen after pressing the browser's back button
app.use((req, res, next) => {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
  );
  next();
});

app.use('/', mainRoute);

// catch 404 and forward to error handler
app.use((req, res) => {
  let err = {};
  err = new Error('Not Found');
  err.status = 404;
  res.json({
    status: err.status,
    msg: 'Page Not Found',
  });
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.json({
    status: err.status || 500,
    msg: 'error',
  });
});

// Send all requests to index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/dist/incubed-frontend/index.html`));
});
module.exports = app;
