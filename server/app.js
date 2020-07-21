require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./config/winston');


const mainRoute = require('./routes/index');
const nodeRegDataRoute = require('./routes/nodeRegistryData');
const logger = require('./config/winston');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/dist/incubed-frontend')));
app.use(cors());

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
app.use('/noderegistrydata', nodeRegDataRoute);

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
  logger.info(err);
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
