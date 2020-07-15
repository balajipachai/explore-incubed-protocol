const appRoot = require('app-root-path');
const winston = require('winston');

// Defines the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/blockchains_assignment.log`,
    handleExceptions: true,
    format: winston.format.prettyPrint(),
    maxsize: 512000000, // 500 MB
    maxFiles: 10,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    format: winston.format.cli(),
  },
};

// Instantiates a new Winston Logger with the settings defined above
// eslint-disable-next-line new-cap
const logger = new winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Creates a stream object with a 'write' function that will be used by morgan
logger.stream = {
  // eslint-disable-next-line no-unused-vars
  write(message, encoding) {
    // uses the 'info' log level so the output will be picked by both transports (file, console)
    logger.info(message);
  },
};

module.exports = logger;
