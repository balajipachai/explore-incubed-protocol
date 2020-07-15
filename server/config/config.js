const config = {
  mysql: {
    type: 'tcp',
    port: '3306',
    host: 'localhost',
    protocol: 'http',
    timeout: '180000',
    database: 'dbName',
    user: 'dbUser',
    password: 'dbPassword'
  }
};

module.exports = config;
